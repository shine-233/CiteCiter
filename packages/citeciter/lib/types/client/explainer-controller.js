/** The Host owns the hidden fork and its history; the browser never stages it. */
export function createExplainerController(resolveSource, transport, store) {
    let disposed = false;
    let active = null;
    let queue = Promise.resolve();
    const update = (mutator) => {
        if (!disposed)
            store.update(mutator);
    };
    const fail = (error) => {
        update((draft) => {
            draft.phase = 'error';
            draft.error = error instanceof Error ? error.message : String(error);
        });
    };
    const stop = async () => {
        const operation = active;
        if (operation === null)
            return;
        operation.abort.abort();
        await operation.done.catch(() => { });
        if (!disposed) {
            update((draft) => {
                draft.phase = 'ready';
                draft.error = null;
            });
        }
    };
    const run = async (selection) => {
        if (disposed)
            return;
        update((draft) => {
            draft.phase = 'creating';
            draft.childId = null;
            draft.selection = selection;
            draft.answerText = null;
            draft.error = null;
        });
        let source;
        try {
            source = resolveSource(selection);
        }
        catch (error) {
            fail(error);
            return;
        }
        const abort = new AbortController();
        const done = (async () => {
            update((draft) => { draft.phase = 'running'; });
            const result = await transport.explain(source, selection, abort.signal);
            if (disposed || abort.signal.aborted)
                return;
            update((draft) => {
                draft.phase = 'settled';
                draft.childId = result.childId;
                draft.answerText = result.answerText;
                draft.error = null;
            });
        })();
        active = { abort, done };
        try {
            await done;
        }
        catch (error) {
            if (!abort.signal.aborted)
                fail(error);
        }
        finally {
            if (active?.done === done)
                active = null;
        }
    };
    const start = (selection) => {
        if (disposed)
            return Promise.resolve();
        active?.abort.abort();
        const task = queue.then(() => run(selection));
        queue = task.catch(() => { });
        return task;
    };
    const dispose = async () => {
        if (disposed)
            return;
        disposed = true;
        const operation = active;
        operation?.abort.abort();
        await Promise.allSettled([queue, operation?.done ?? Promise.resolve()]);
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        start,
        stop,
        dispose,
    };
}
