import assert from 'node:assert/strict'
import test from 'node:test'
import { turnEndError } from '../lib/types/index.js'
import { readAssistantAnswer } from '../lib/types/client/answer.js'
import { createExplainerController } from '../lib/types/client/explainer-controller.js'

const selection = (anchorKey = '14:assistant-step2:1', text = 'Riemann curvature tensor') => ({
  text,
  kind: 'assistant-step',
  anchorKey,
  x: 1,
  y: 2,
})

function createStore() {
  let snapshot = {
    phase: 'idle',
    childId: null,
    selection: null,
    answerText: null,
    error: null,
  }
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(mutator) {
      const next = { ...snapshot }
      mutator(next)
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
    set(next) {
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
  }
}

function createExplainer(resolveSource, explain) {
  return createExplainerController(resolveSource, { explain }, createStore())
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('Host preserves a structured DSH turn failure for the client', () => {
  const error = turnEndError({
    kind: 'error',
    error: {
      message: 'no API key for provider route "deepseek-official"',
      code: 'MISSING_CREDENTIAL',
    },
  })

  assert.equal(error?.message, 'no API key for provider route "deepseek-official" [MISSING_CREDENTIAL]')
  assert.equal(turnEndError({ kind: 'completed' }), undefined)
})

test('explainer reads newly streamed assistant text before settlement', () => {
  assert.deepEqual(readAssistantAnswer({
    status: 'running',
    blocks: [
      { kind: 'reasoning', text: 'hidden chain' },
      { kind: 'text', text: 'A curvature measure' },
      { kind: 'text', text: ' of a manifold.' },
    ],
  }), {
    status: 'running',
    text: 'A curvature measure of a manifold.',
  })
})

test('explainer recognizes settled and interrupted output but ignores empty/non-assistant data', () => {
  assert.deepEqual(readAssistantAnswer({ status: 'settled', blocks: [{ kind: 'text', text: 'Done' }] }), {
    status: 'settled',
    text: 'Done',
  })
  assert.deepEqual(readAssistantAnswer({ status: 'interrupted', blocks: [{ kind: 'text', text: 'Partial' }] }), {
    status: 'interrupted',
    text: 'Partial',
  })
  assert.equal(readAssistantAnswer({ status: 'running', blocks: [{ kind: 'reasoning', text: 'only reasoning' }] }), null)
  assert.equal(readAssistantAnswer({ status: 'unknown', blocks: [{ kind: 'text', text: 'ignore' }] }), null)
})

test('a successful Host explanation publishes the child and complete answer', async () => {
  const calls = []
  const explainer = createExplainer(
    () => ({ sessionId: 'parent-a', atSeq: 42 }),
    async (source, picked, signal) => {
      calls.push({ source, picked, signal })
      return { childId: 'child-1', answerText: 'A curvature measure.' }
    },
  )

  await explainer.start(selection())

  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].source, { sessionId: 'parent-a', atSeq: 42 })
  assert.equal(calls[0].picked.text, 'Riemann curvature tensor')
  assert.equal(explainer.getSnapshot().phase, 'settled')
  assert.equal(explainer.getSnapshot().childId, 'child-1')
  assert.equal(explainer.getSnapshot().answerText, 'A curvature measure.')
})

test('source validation failure prevents any Host request', async () => {
  let calls = 0
  const explainer = createExplainer(
    () => { throw new Error('selected assistant turn is not complete') },
    async () => {
      calls++
      return { childId: 'never', answerText: 'never' }
    },
  )

  await explainer.start(selection())

  assert.equal(calls, 0)
  assert.equal(explainer.getSnapshot().phase, 'error')
  assert.match(explainer.getSnapshot().error, /turn is not complete/)
})

test('Host errors are surfaced without a false settled answer', async () => {
  const explainer = createExplainer(
    () => ({ sessionId: 'parent-a', atSeq: 42 }),
    async () => { throw new Error('read-only switch failed: permission command was not recognized') },
  )

  await explainer.start(selection())

  assert.equal(explainer.getSnapshot().phase, 'error')
  assert.equal(explainer.getSnapshot().answerText, null)
  assert.match(explainer.getSnapshot().error, /permission command was not recognized/)
})

test('a newer selection aborts the old Host request before it starts', async () => {
  const first = deferred()
  const calls = []
  const explainer = createExplainer(
    picked => ({ sessionId: 'parent-a', atSeq: picked.anchorKey.endsWith('2:1') ? 42 : 70 }),
    (source, picked, signal) => {
      calls.push({ source, picked, signal })
      if (calls.length === 1) {
        signal.addEventListener('abort', () => first.reject(signal.reason), { once: true })
        return first.promise
      }
      return Promise.resolve({ childId: 'child-2', answerText: 'second answer' })
    },
  )

  const firstStart = explainer.start(selection())
  await Promise.resolve()
  const secondStart = explainer.start(selection('14:assistant-step4:1', 'Ricci contraction'))
  await Promise.all([firstStart, secondStart])

  assert.equal(calls.length, 2)
  assert.equal(calls[0].signal.aborted, true)
  assert.equal(calls[1].source.atSeq, 70)
  assert.equal(explainer.getSnapshot().answerText, 'second answer')
})

test('stop aborts the active Host request and waits for quiescence', async () => {
  const gate = deferred()
  let signal
  const explainer = createExplainer(
    () => ({ sessionId: 'parent-a', atSeq: 42 }),
    (_source, _picked, activeSignal) => {
      signal = activeSignal
      activeSignal.addEventListener('abort', () => gate.resolve({ childId: 'cancelled', answerText: '' }), { once: true })
      return gate.promise
    },
  )
  const started = explainer.start(selection())
  await Promise.resolve()

  await explainer.stop()
  await started

  assert.equal(signal.aborted, true)
  assert.equal(explainer.getSnapshot().phase, 'ready')
  assert.equal(explainer.getSnapshot().answerText, null)
})

test('dispose aborts the request and ignores its late result', async () => {
  const gate = deferred()
  let signal
  const explainer = createExplainer(
    () => ({ sessionId: 'parent-a', atSeq: 42 }),
    (_source, _picked, activeSignal) => {
      signal = activeSignal
      activeSignal.addEventListener('abort', () => gate.resolve({ childId: 'late', answerText: 'late answer' }), { once: true })
      return gate.promise
    },
  )
  const started = explainer.start(selection())
  await Promise.resolve()

  await explainer.dispose()
  await started

  assert.equal(signal.aborted, true)
  assert.equal(explainer.getSnapshot().answerText, null)
})
