import { buildPrompt } from "./client/prompt.js";
export const name = '@kirkchinese/dsh-citeciter';
export const inject = ['connection', 'sessionController', 'commands'];
export const EXPLAIN_PATH = '/api/citeciter.explain';
function json(value, status = 200) {
    return Response.json(value, { status });
}
function parseSelection(value) {
    if (typeof value !== 'object' || value === null)
        throw new Error('selection must be an object');
    const record = value;
    if (typeof record['text'] !== 'string' || record['text'].trim() === '')
        throw new Error('selection.text is required');
    if (record['kind'] !== 'assistant-step')
        throw new Error('selection.kind must be assistant-step');
    if (typeof record['anchorKey'] !== 'string' || record['anchorKey'] === '')
        throw new Error('selection.anchorKey is required');
    if (typeof record['x'] !== 'number' || !Number.isFinite(record['x'])
        || typeof record['y'] !== 'number' || !Number.isFinite(record['y'])) {
        throw new Error('selection coordinates must be finite numbers');
    }
    return {
        text: record['text'].trim(),
        kind: 'assistant-step',
        anchorKey: record['anchorKey'],
        x: record['x'],
        y: record['y'],
    };
}
function parseRequest(value) {
    if (typeof value !== 'object' || value === null)
        throw new Error('request body must be an object');
    const record = value;
    if (typeof record['sourceSessionId'] !== 'string' || record['sourceSessionId'] === '') {
        throw new Error('sourceSessionId is required');
    }
    if (!Number.isSafeInteger(record['atSeq']) || record['atSeq'] < 0) {
        throw new Error('atSeq must be a non-negative safe integer');
    }
    return {
        sourceSessionId: record['sourceSessionId'],
        atSeq: record['atSeq'],
        selection: parseSelection(record['selection']),
    };
}
function assistantText(events, afterSeq) {
    const messages = events.filter((event) => event.seq > afterSeq && event.type === 'assistant/message');
    const last = messages.at(-1);
    if (last?.type !== 'assistant/message')
        return '';
    return last.data.message.content
        .filter((block) => block.type === 'text')
        .map(block => block.text)
        .join('');
}
export function turnEndError(reason) {
    if (reason.kind !== 'error')
        return undefined;
    const suffix = reason.error.code === '' ? '' : ` [${reason.error.code}]`;
    return new Error(`${reason.error.message}${suffix}`);
}
function waitForTurn(ctx, agent, afterSeq, signal) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error) => {
            if (settled)
                return;
            settled = true;
            disposeEvent();
            signal.removeEventListener('abort', onAbort);
            if (error === undefined)
                resolve();
            else
                reject(error);
        };
        const onAbort = () => {
            try {
                ctx.sessionController.cancel({ sessionId: agent.id });
            }
            catch { }
            finish(signal.reason instanceof Error ? signal.reason : new Error('CiteCiter explanation cancelled'));
        };
        const disposeEvent = ctx.on('session/event', (session, event) => {
            if (session !== agent.session || event.seq <= afterSeq || event.type !== 'turn/end')
                return;
            finish(turnEndError(event.data.reason));
        }, { global: true });
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted)
            onAbort();
    });
}
async function explain(ctx, input, signal) {
    const fork = await ctx.sessionController.fork({
        sessionId: input.sourceSessionId,
        atSeq: input.atSeq,
    });
    const resolved = await ctx.sessionController.resolveAgent(fork.sessionId);
    if ('error' in resolved)
        throw resolved.error;
    const agent = resolved.agent;
    const permission = await ctx.commands.execute(agent, '/permission read-only', [], signal);
    if (permission === undefined)
        throw new Error('read-only switch failed: permission command was not recognized');
    if (permission.result.kind === 'error')
        throw new Error(`read-only switch failed: ${permission.result.text}`);
    const afterSeq = agent.session.events.at(-1)?.seq ?? -1;
    const turn = waitForTurn(ctx, agent, afterSeq, signal);
    try {
        await ctx.sessionController.prompt({
            requestId: `citeciter-${globalThis.crypto.randomUUID()}`,
            sessionId: fork.sessionId,
            mode: 'queue',
            content: [{ type: 'text', text: buildPrompt(input.selection) }],
        }, signal);
        await turn;
    }
    catch (error) {
        try {
            ctx.sessionController.cancel({ sessionId: fork.sessionId });
        }
        catch { }
        throw error;
    }
    const answerText = assistantText(agent.session.events, afterSeq);
    if (answerText === '')
        throw new Error('explanation turn settled without assistant text');
    return { childId: fork.sessionId, answerText };
}
export function apply(ctx) {
    const connection = Reflect.get(ctx, 'connection');
    connection.fetch.register({
        path: EXPLAIN_PATH,
        methods: ['POST'],
        fetch: async (request) => {
            try {
                const input = parseRequest(await request.json());
                return json(await explain(ctx, input, request.signal));
            }
            catch (error) {
                if (request.signal.aborted)
                    return json({ error: 'CiteCiter explanation cancelled' }, 499);
                const message = error instanceof Error ? error.message : String(error);
                return json({ error: message }, 500);
            }
        },
    });
}
