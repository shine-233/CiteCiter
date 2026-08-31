import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { UiConversation } from '@deepseek-ai/dsh-client-ui-conversation/client';
import { type ExplainFace, type ExplainSource, type ExplainTransport } from './explainer-controller.ts';
import type { CiteSelection } from './types.ts';
export type { ExplainFace, ExplainPhase, ExplainResult, ExplainSnapshot, ExplainSource, ExplainTransport, } from './explainer-controller.ts';
export declare const EXPLAIN_PATH = "/api/citeciter.explain";
export declare const httpExplainTransport: ExplainTransport;
export declare function sourceResolver(sessions: ISessions, uiConversation: UiConversation): (selection: CiteSelection) => ExplainSource;
export declare function createExplainer(sessions: ISessions, uiConversation: UiConversation, transport?: ExplainTransport): ExplainFace;
