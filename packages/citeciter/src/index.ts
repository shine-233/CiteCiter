import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-commands'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent, SessionId, TurnEndReason } from '@deepseek-ai/dsh-session'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller'
import { buildPrompt } from './client/prompt.ts'
import type { CiteSelection } from './client/types.ts'

export const name = '@kirkchinese/dsh-citeciter'
export const inject = ['connection', 'sessionController', 'commands']
export const EXPLAIN_PATH = '/api/citeciter.explain'

interface ConnectionService {
  readonly fetch: {
    register(route: {
      readonly path: string
      readonly methods: readonly 'POST'[]
      readonly fetch: (request: Request) => Promise<Response>
    }): () => Promise<void>
  }
}

interface ExplainRequest {
  readonly sourceSessionId: SessionId
  readonly atSeq: number
  readonly selection: CiteSelection
}

interface ExplainResponse {
  readonly childId: SessionId
  readonly answerText: string
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status })
}

function parseSelection(value: unknown): CiteSelection {
  if (typeof value !== 'object' || value === null) throw new Error('selection must be an object')
  const record = value as Record<string, unknown>
  if (typeof record['text'] !== 'string' || record['text'].trim() === '') throw new Error('selection.text is required')
  if (record['kind'] !== 'assistant-step') throw new Error('selection.kind must be assistant-step')
  if (typeof record['anchorKey'] !== 'string' || record['anchorKey'] === '') throw new Error('selection.anchorKey is required')
  if (typeof record['x'] !== 'number' || !Number.isFinite(record['x'])
    || typeof record['y'] !== 'number' || !Number.isFinite(record['y'])) {
    throw new Error('selection coordinates must be finite numbers')
  }
  return {
    text: record['text'].trim(),
    kind: 'assistant-step',
    anchorKey: record['anchorKey'],
    x: record['x'],
    y: record['y'],
  }
}

function parseRequest(value: unknown): ExplainRequest {
  if (typeof value !== 'object' || value === null) throw new Error('request body must be an object')
  const record = value as Record<string, unknown>
  if (typeof record['sourceSessionId'] !== 'string' || record['sourceSessionId'] === '') {
    throw new Error('sourceSessionId is required')
  }
  if (!Number.isSafeInteger(record['atSeq']) || (record['atSeq'] as number) < 0) {
    throw new Error('atSeq must be a non-negative safe integer')
  }
  return {
    sourceSessionId: record['sourceSessionId'] as SessionId,
    atSeq: record['atSeq'] as number,
    selection: parseSelection(record['selection']),
  }
}

function assistantText(events: readonly SessionEvent[], afterSeq: number): string {
  const messages = events.filter((event) => event.seq > afterSeq && event.type === 'assistant/message')
  const last = messages.at(-1)
  if (last?.type !== 'assistant/message') return ''
  return last.data.message.content
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    .map(block => block.text)
    .join('')
}

export function turnEndError(reason: TurnEndReason): Error | undefined {
  if (reason.kind !== 'error') return undefined
  const suffix = reason.error.code === '' ? '' : ` [${reason.error.code}]`
  return new Error(`${reason.error.message}${suffix}`)
}

function waitForTurn(ctx: Context, agent: Agent, afterSeq: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      disposeEvent()
      signal.removeEventListener('abort', onAbort)
      if (error === undefined) resolve()
      else reject(error)
    }
    const onAbort = () => {
      try { ctx.sessionController.cancel({ sessionId: agent.id }) } catch {}
      finish(signal.reason instanceof Error ? signal.reason : new Error('CiteCiter explanation cancelled'))
    }
    const disposeEvent = ctx.on('session/event', (session, event) => {
      if (session !== agent.session || event.seq <= afterSeq || event.type !== 'turn/end') return
      finish(turnEndError(event.data.reason))
    }, { global: true })
    signal.addEventListener('abort', onAbort, { once: true })
    if (signal.aborted) onAbort()
  })
}

async function explain(ctx: Context, input: ExplainRequest, signal: AbortSignal): Promise<ExplainResponse> {
  const fork = await ctx.sessionController.fork({
    sessionId: input.sourceSessionId,
    atSeq: input.atSeq,
  })
  const resolved = await ctx.sessionController.resolveAgent(fork.sessionId)
  if ('error' in resolved) throw resolved.error
  const agent = resolved.agent
  const permission = await ctx.commands.execute(agent, '/permission read-only', [], signal)
  if (permission === undefined) throw new Error('read-only switch failed: permission command was not recognized')
  if (permission.result.kind === 'error') throw new Error(`read-only switch failed: ${permission.result.text}`)

  const afterSeq = agent.session.events.at(-1)?.seq ?? -1
  const turn = waitForTurn(ctx, agent, afterSeq, signal)
  try {
    await ctx.sessionController.prompt({
      requestId: `citeciter-${globalThis.crypto.randomUUID()}` as SessionRequestId,
      sessionId: fork.sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: buildPrompt(input.selection) }],
    }, signal)
    await turn
  } catch (error) {
    try { ctx.sessionController.cancel({ sessionId: fork.sessionId }) } catch {}
    throw error
  }
  const answerText = assistantText(agent.session.events, afterSeq)
  if (answerText === '') throw new Error('explanation turn settled without assistant text')
  return { childId: fork.sessionId, answerText }
}

export function apply(ctx: Context): void {
  const connection = Reflect.get(ctx, 'connection') as ConnectionService
  connection.fetch.register({
    path: EXPLAIN_PATH,
    methods: ['POST'],
    fetch: async (request) => {
      try {
        const input = parseRequest(await request.json())
        return json(await explain(ctx, input, request.signal))
      } catch (error) {
        if (request.signal.aborted) return json({ error: 'CiteCiter explanation cancelled' }, 499)
        const message = error instanceof Error ? error.message : String(error)
        return json({ error: message }, 500)
      }
    },
  })
}
