import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { CiteSelection } from './types.ts';
export type ExplainPhase = 'idle' | 'creating' | 'ready' | 'running' | 'settled' | 'error';
export interface ExplainSnapshot {
    phase: ExplainPhase;
    childId: SessionId | null;
    selection: CiteSelection | null;
    answerText: string | null;
    error: string | null;
}
export interface ExplainSource {
    readonly sessionId: SessionId;
    readonly atSeq: number;
}
export interface ExplainResult {
    readonly childId: SessionId;
    readonly answerText: string;
}
export interface ExplainTransport {
    explain(source: ExplainSource, selection: CiteSelection, signal: AbortSignal): Promise<ExplainResult>;
}
export interface ExplainFace {
    getSnapshot(): ExplainSnapshot;
    subscribe(listener: () => void): () => void;
    start(selection: CiteSelection): Promise<void>;
    stop(): Promise<void>;
    dispose(): Promise<void>;
}
/** The Host owns the hidden fork and its history; the browser never stages it. */
export declare function createExplainerController(resolveSource: (selection: CiteSelection) => ExplainSource, transport: ExplainTransport, store: SnapshotStore<ExplainSnapshot>): ExplainFace;
