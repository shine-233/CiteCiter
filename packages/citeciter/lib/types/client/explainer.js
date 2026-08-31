import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
import { readAssistantAnswer } from "./answer.js";
import { createExplainerController, } from "./explainer-controller.js";
const EMPTY = {
    phase: 'idle',
    childId: null,
    selection: null,
    answerText: null,
    error: null,
};
export const EXPLAIN_PATH = '/api/citeciter.explain';
function hostBase() {
    const origin = globalThis.location?.origin;
    return origin !== undefined && origin !== 'null' ? origin : 'http://dsh.internal';
}
export const httpExplainTransport = {
    async explain(source, selection, signal) {
        const response = await fetch(new URL(EXPLAIN_PATH, hostBase()), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                sourceSessionId: source.sessionId,
                atSeq: source.atSeq,
                selection,
            }),
            signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const message = typeof payload === 'object' && payload !== null && 'error' in payload
                && typeof payload.error === 'string'
                ? payload.error
                : `CiteCiter Host request failed: HTTP ${String(response.status)}`;
            throw new Error(message);
        }
        if (typeof payload !== 'object' || payload === null
            || !('childId' in payload) || typeof payload.childId !== 'string'
            || !('answerText' in payload) || typeof payload.answerText !== 'string') {
            throw new Error('CiteCiter Host returned an invalid explanation response');
        }
        return { childId: payload.childId, answerText: payload.answerText };
    },
};
export function sourceResolver(sessions, uiConversation) {
    return (selection) => {
        const current = sessions.list.getSnapshot().current;
        if (current === undefined)
            throw new Error('no current session');
        const binding = sessions.binding(current);
        if (binding === undefined)
            throw new Error(`current session "${current}" is not locally addressable`);
        const chat = uiConversation.binding(binding).target('chat').getSnapshot();
        const node = chat?.nodes.get(selection.anchorKey);
        if (node === undefined || node.kind !== 'assistant-step') {
            throw new Error('selected assistant context is no longer available');
        }
        const answer = readAssistantAnswer(node.data);
        if (answer === null || answer.status === 'running') {
            throw new Error('selected assistant response is not complete');
        }
        if (node.location.kind !== 'step' || node.location.turn.status !== 'closed') {
            throw new Error('selected assistant turn is not complete');
        }
        return { sessionId: current, atSeq: node.anchorSeq };
    };
}
export function createExplainer(sessions, uiConversation, transport = httpExplainTransport) {
    return createExplainerController(sourceResolver(sessions, uiConversation), transport, createSnapshotStore(EMPTY));
}
