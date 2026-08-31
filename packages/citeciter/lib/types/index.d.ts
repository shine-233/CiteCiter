import type { Context } from '@deepseek-ai/cordis';
import type { TurnEndReason } from '@deepseek-ai/dsh-session';
export declare const name = "@kirkchinese/dsh-citeciter";
export declare const inject: string[];
export declare const EXPLAIN_PATH = "/api/citeciter.explain";
export declare function turnEndError(reason: TurnEndReason): Error | undefined;
export declare function apply(ctx: Context): void;
