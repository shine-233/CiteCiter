//#region lib/types/client/prompt.js
/**
* Build the explanation prompt recorded into the forked child session.
* @param selection - quoted assistant text and its parent-log anchor.
* @returns model-visible prompt text.
*/
function buildPrompt(selection) {
	return [
		"你是 CiteCiter 解释器。只解释下面引用的内容，不执行任务、不修改任何文件，不要请求提升沙箱权限。",
		`[引用自主会话 anchor=${selection.anchorKey}]`,
		"<<<",
		selection.text,
		">>>",
		"要求：先给一句话直觉解释，再展开原理。数学用 $...$；代码使用带语言围栏；如需图，输出一个 ```svg 围栏（不要 script/foreignObject）。不要输出与引用无关的内容。"
	].join("\n\n");
}
//#endregion
//#region lib/types/index.js
const name = "@kirkchinese/dsh-citeciter";
const inject = [
	"connection",
	"sessionController",
	"commands"
];
const EXPLAIN_PATH = "/api/citeciter.explain";
function json(value, status = 200) {
	return Response.json(value, { status });
}
function parseSelection(value) {
	if (typeof value !== "object" || value === null) throw new Error("selection must be an object");
	const record = value;
	if (typeof record["text"] !== "string" || record["text"].trim() === "") throw new Error("selection.text is required");
	if (record["kind"] !== "assistant-step") throw new Error("selection.kind must be assistant-step");
	if (typeof record["anchorKey"] !== "string" || record["anchorKey"] === "") throw new Error("selection.anchorKey is required");
	if (typeof record["x"] !== "number" || !Number.isFinite(record["x"]) || typeof record["y"] !== "number" || !Number.isFinite(record["y"])) throw new Error("selection coordinates must be finite numbers");
	return {
		text: record["text"].trim(),
		kind: "assistant-step",
		anchorKey: record["anchorKey"],
		x: record["x"],
		y: record["y"]
	};
}
function parseRequest(value) {
	if (typeof value !== "object" || value === null) throw new Error("request body must be an object");
	const record = value;
	if (typeof record["sourceSessionId"] !== "string" || record["sourceSessionId"] === "") throw new Error("sourceSessionId is required");
	if (!Number.isSafeInteger(record["atSeq"]) || record["atSeq"] < 0) throw new Error("atSeq must be a non-negative safe integer");
	return {
		sourceSessionId: record["sourceSessionId"],
		atSeq: record["atSeq"],
		selection: parseSelection(record["selection"])
	};
}
function assistantText(events, afterSeq) {
	const last = events.filter((event) => event.seq > afterSeq && event.type === "assistant/message").at(-1);
	if (last?.type !== "assistant/message") return "";
	return last.data.message.content.filter((block) => block.type === "text").map((block) => block.text).join("");
}
function turnEndError(reason) {
	if (reason.kind !== "error") return void 0;
	const suffix = reason.error.code === "" ? "" : ` [${reason.error.code}]`;
	return /* @__PURE__ */ new Error(`${reason.error.message}${suffix}`);
}
function waitForTurn(ctx, agent, afterSeq, signal) {
	return new Promise((resolve, reject) => {
		let settled = false;
		const finish = (error) => {
			if (settled) return;
			settled = true;
			disposeEvent();
			signal.removeEventListener("abort", onAbort);
			if (error === void 0) resolve();
			else reject(error);
		};
		const onAbort = () => {
			try {
				ctx.sessionController.cancel({ sessionId: agent.id });
			} catch {}
			finish(signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("CiteCiter explanation cancelled"));
		};
		const disposeEvent = ctx.on("session/event", (session, event) => {
			if (session !== agent.session || event.seq <= afterSeq || event.type !== "turn/end") return;
			finish(turnEndError(event.data.reason));
		}, { global: true });
		signal.addEventListener("abort", onAbort, { once: true });
		if (signal.aborted) onAbort();
	});
}
async function explain(ctx, input, signal) {
	const fork = await ctx.sessionController.fork({
		sessionId: input.sourceSessionId,
		atSeq: input.atSeq
	});
	const resolved = await ctx.sessionController.resolveAgent(fork.sessionId);
	if ("error" in resolved) throw resolved.error;
	const agent = resolved.agent;
	const permission = await ctx.commands.execute(agent, "/permission read-only", [], signal);
	if (permission === void 0) throw new Error("read-only switch failed: permission command was not recognized");
	if (permission.result.kind === "error") throw new Error(`read-only switch failed: ${permission.result.text}`);
	const afterSeq = agent.session.events.at(-1)?.seq ?? -1;
	const turn = waitForTurn(ctx, agent, afterSeq, signal);
	try {
		await ctx.sessionController.prompt({
			requestId: `citeciter-${globalThis.crypto.randomUUID()}`,
			sessionId: fork.sessionId,
			mode: "queue",
			content: [{
				type: "text",
				text: buildPrompt(input.selection)
			}]
		}, signal);
		await turn;
	} catch (error) {
		try {
			ctx.sessionController.cancel({ sessionId: fork.sessionId });
		} catch {}
		throw error;
	}
	const answerText = assistantText(agent.session.events, afterSeq);
	if (answerText === "") throw new Error("explanation turn settled without assistant text");
	return {
		childId: fork.sessionId,
		answerText
	};
}
function apply(ctx) {
	Reflect.get(ctx, "connection").fetch.register({
		path: EXPLAIN_PATH,
		methods: ["POST"],
		fetch: async (request) => {
			try {
				return json(await explain(ctx, parseRequest(await request.json()), request.signal));
			} catch (error) {
				if (request.signal.aborted) return json({ error: "CiteCiter explanation cancelled" }, 499);
				return json({ error: error instanceof Error ? error.message : String(error) }, 500);
			}
		}
	});
}
//#endregion
export { EXPLAIN_PATH, apply, inject, name, turnEndError };
