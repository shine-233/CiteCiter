import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { UiConversation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import { readAssistantAnswer } from './answer.ts'
import {
  createExplainerController,
  type ExplainFace,
  type ExplainResult,
  type ExplainSource,
  type ExplainTransport,
} from './explainer-controller.ts'
import type { CiteSelection } from './types.ts'

export type {
  ExplainFace,
  ExplainPhase,
  ExplainResult,
  ExplainSnapshot,
  ExplainSource,
  ExplainTransport,
} from './explainer-controller.ts'

const EMPTY = {
  phase: 'idle' as const,
  childId: null,
  selection: null,
  answerText: null,
  error: null,
}

export const EXPLAIN_PATH = '/api/citeciter.explain'

function hostBase(): string {
  const origin = globalThis.location?.origin
  return origin !== undefined && origin !== 'null' ? origin : 'http://dsh.internal'
}

export const httpExplainTransport: ExplainTransport = {
  async explain(source, selection, signal): Promise<ExplainResult> {
    const response = await fetch(new URL(EXPLAIN_PATH, hostBase()), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sourceSessionId: source.sessionId,
        atSeq: source.atSeq,
        selection,
      }),
      signal,
    })
    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const message = typeof payload === 'object' && payload !== null && 'error' in payload
        && typeof payload.error === 'string'
        ? payload.error
        : `CiteCiter Host request failed: HTTP ${String(response.status)}`
      throw new Error(message)
    }
    if (typeof payload !== 'object' || payload === null
      || !('childId' in payload) || typeof payload.childId !== 'string'
      || !('answerText' in payload) || typeof payload.answerText !== 'string') {
      throw new Error('CiteCiter Host returned an invalid explanation response')
    }
    return { childId: payload.childId as ExplainResult['childId'], answerText: payload.answerText }
  },
}

export function sourceResolver(sessions: ISessions, uiConversation: UiConversation) {
  return (selection: CiteSelection): ExplainSource => {
    const current = sessions.list.getSnapshot().current
    if (current === undefined) throw new Error('no current session')
    const binding = sessions.binding(current)
    if (binding === undefined) throw new Error(`current session "${current}" is not locally addressable`)
    const chat = uiConversation.binding(binding).target('chat').getSnapshot() as ChatSnapshot | undefined
    const node = chat?.nodes.get(selection.anchorKey)
    if (node === undefined || node.kind !== 'assistant-step') {
      throw new Error('selected assistant context is no longer available')
    }
    const answer = readAssistantAnswer(node.data)
    if (answer === null || answer.status === 'running') {
      throw new Error('selected assistant response is not complete')
    }
    if (node.location.kind !== 'step' || node.location.turn.status !== 'closed') {
      throw new Error('selected assistant turn is not complete')
    }
    return { sessionId: current, atSeq: node.anchorSeq }
  }
}

export function createExplainer(
  sessions: ISessions,
  uiConversation: UiConversation,
  transport: ExplainTransport = httpExplainTransport,
): ExplainFace {
  return createExplainerController(
    sourceResolver(sessions, uiConversation),
    transport,
    createSnapshotStore(EMPTY),
  )
}
