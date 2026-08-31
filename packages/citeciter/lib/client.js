window.__ModuleLoader__.load({
	id: "@kirkchinese/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:src\client\components\CiteCiter.module.css.mjs
		const css = ".-GREHa_menu{z-index:9999;max-width:min(520px,100vw - 32px);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l1,#ddd);box-shadow:var(--dsw-shadow-lv2,0 8px 24px #0000001f);pointer-events:auto;border-radius:10px;align-items:center;gap:8px;padding:8px 10px;display:flex;position:fixed}.-GREHa_menuPreview{text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.-GREHa_menuButton{color:#fff;cursor:pointer;background:var(--dsw-static-deepseek-500,#4d6bfe);border:none;border-radius:8px;flex:none;padding:4px 10px;font-size:13px;line-height:18px}.-GREHa_panel{flex-direction:column;height:100%;padding:12px;display:flex;overflow-y:auto}.-GREHa_panelHeader{flex:none;justify-content:space-between;align-items:center;display:flex}.-GREHa_panelTitle{font-size:14px;font-weight:500}.-GREHa_closeButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary,#555);cursor:pointer;background:0 0;border:none;border-radius:999px;font-size:18px;line-height:1}.-GREHa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.-GREHa_panelBody{flex-direction:column;gap:12px;padding-top:12px;display:flex}.-GREHa_panelHint{color:var(--dsw-alias-label-tertiary,#888);font-size:13px;line-height:20px}.-GREHa_quote{overflow-wrap:anywhere;background:var(--dsw-specific-bubble,#f5f5f5);border-radius:8px;margin:0;padding:8px 12px;font-size:14px;line-height:22px}.-GREHa_meta{color:var(--dsw-alias-label-secondary,#666);grid-template-columns:auto 1fr;gap:4px 12px;margin:0;font-size:12px;line-height:18px;display:grid}.-GREHa_meta dt{color:var(--dsw-alias-label-tertiary,#999)}.-GREHa_meta dd{overflow-wrap:anywhere;min-width:0;margin:0}.-GREHa_panelNote{color:var(--dsw-alias-label-tertiary,#999);font-size:12px;line-height:18px}.-GREHa_panelError{color:var(--dsw-alias-state-error-primary,#d53f3f);overflow-wrap:anywhere;font-size:12px;line-height:18px}.-GREHa_panelAnswer{overflow-wrap:anywhere}.-GREHa_richAnswer{flex-direction:column;gap:12px;display:flex}.-GREHa_richFigure{border:1px solid var(--dsw-alias-border-l1,#ddd);background:var(--dsw-alias-bg-module,#fff);border-radius:8px;margin:0;overflow:hidden}.-GREHa_richSvg{object-fit:contain;width:100%;min-height:96px;max-height:360px;display:block}.-GREHa_richHtml{background:var(--dsw-alias-bg-module,#fff);border:0;width:100%;min-height:180px;display:block}.-GREHa_panelActions{align-items:center;gap:8px;display:flex}.-GREHa_actionButton{color:var(--dsw-alias-label-primary,#222);cursor:pointer;background:var(--dsw-alias-interactive-bg-hover-solid,#eee);border:none;border-radius:8px;padding:4px 12px;font-size:13px;line-height:20px}";
		const tagId = "@kirkchinese/dsh-citeciter/CiteCiter.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@kirkchinese/dsh-citeciter";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CiteCiter_module_css_default = {
			"actionButton": "-GREHa_actionButton",
			"closeButton": "-GREHa_closeButton",
			"menu": "-GREHa_menu",
			"menuButton": "-GREHa_menuButton",
			"menuPreview": "-GREHa_menuPreview",
			"meta": "-GREHa_meta",
			"panel": "-GREHa_panel",
			"panelActions": "-GREHa_panelActions",
			"panelAnswer": "-GREHa_panelAnswer",
			"panelBody": "-GREHa_panelBody",
			"panelError": "-GREHa_panelError",
			"panelHeader": "-GREHa_panelHeader",
			"panelHint": "-GREHa_panelHint",
			"panelNote": "-GREHa_panelNote",
			"panelTitle": "-GREHa_panelTitle",
			"quote": "-GREHa_quote",
			"richAnswer": "-GREHa_richAnswer",
			"richFigure": "-GREHa_richFigure",
			"richHtml": "-GREHa_richHtml",
			"richSvg": "-GREHa_richSvg"
		};
		//#endregion
		//#region lib/types/client/components/SelectionMenu.js
		const PREVIEW_LIMIT = 64;
		/**
		* Render the floating `Citer!` menu in the shell overlay.
		* @param props - shared selection bus and panel opener.
		* @returns menu element while a valid selection exists, otherwise null.
		*/
		function SelectionMenu({ bus, openPanel }) {
			const [selection, setSelection] = (0, react.useState)(() => bus.getMenuSelection());
			(0, react.useEffect)(() => bus.subscribe(() => {
				setSelection(bus.getMenuSelection());
			}), [bus]);
			if (selection === null) return null;
			const preview = selection.text.length > PREVIEW_LIMIT ? `${selection.text.slice(0, PREVIEW_LIMIT)}…` : selection.text;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CiteCiter_module_css_default.menu,
				"data-citeciter-menu": true,
				style: {
					left: selection.x,
					top: selection.y
				},
				role: "menu",
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: CiteCiter_module_css_default.menuPreview,
					title: selection.text,
					children: preview
				}), (0, react_jsx_runtime.jsx)("button", {
					className: CiteCiter_module_css_default.menuButton,
					type: "button",
					role: "menuitem",
					onClick: () => {
						openPanel(selection);
						bus.setMenuSelection(null);
					},
					children: "Citer!"
				})]
			});
		}
		//#endregion
		//#region lib/types/client/answer.js
		/**
		* Read visible text from one assistant-step payload without retaining its live node.
		* @param data - assistant-step payload from the conversation snapshot.
		* @returns visible text and status, or null when no displayable answer exists.
		*/
		function readAssistantAnswer(data) {
			if (data === null || typeof data !== "object") return null;
			const record = data;
			if (record.status !== "running" && record.status !== "settled" && record.status !== "interrupted") return null;
			let text = "";
			for (const block of record.blocks ?? []) {
				if (typeof block !== "object" || block === null) continue;
				const candidate = block;
				if (candidate.kind === "text" && typeof candidate.text === "string") text += candidate.text;
			}
			return text === "" ? null : {
				status: record.status,
				text
			};
		}
		//#endregion
		//#region lib/types/client/explainer-controller.js
		/** The Host owns the hidden fork and its history; the browser never stages it. */
		function createExplainerController(resolveSource, transport, store) {
			let disposed = false;
			let active = null;
			let queue = Promise.resolve();
			const update = (mutator) => {
				if (!disposed) store.update(mutator);
			};
			const fail = (error) => {
				update((draft) => {
					draft.phase = "error";
					draft.error = error instanceof Error ? error.message : String(error);
				});
			};
			const stop = async () => {
				const operation = active;
				if (operation === null) return;
				operation.abort.abort();
				await operation.done.catch(() => {});
				if (!disposed) update((draft) => {
					draft.phase = "ready";
					draft.error = null;
				});
			};
			const run = async (selection) => {
				if (disposed) return;
				update((draft) => {
					draft.phase = "creating";
					draft.childId = null;
					draft.selection = selection;
					draft.answerText = null;
					draft.error = null;
				});
				let source;
				try {
					source = resolveSource(selection);
				} catch (error) {
					fail(error);
					return;
				}
				const abort = new AbortController();
				const done = (async () => {
					update((draft) => {
						draft.phase = "running";
					});
					const result = await transport.explain(source, selection, abort.signal);
					if (disposed || abort.signal.aborted) return;
					update((draft) => {
						draft.phase = "settled";
						draft.childId = result.childId;
						draft.answerText = result.answerText;
						draft.error = null;
					});
				})();
				active = {
					abort,
					done
				};
				try {
					await done;
				} catch (error) {
					if (!abort.signal.aborted) fail(error);
				} finally {
					if (active?.done === done) active = null;
				}
			};
			const start = (selection) => {
				if (disposed) return Promise.resolve();
				active?.abort.abort();
				const task = queue.then(() => run(selection));
				queue = task.catch(() => {});
				return task;
			};
			const dispose = async () => {
				if (disposed) return;
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
				dispose
			};
		}
		//#endregion
		//#region lib/types/client/explainer.js
		const EMPTY = {
			phase: "idle",
			childId: null,
			selection: null,
			answerText: null,
			error: null
		};
		const EXPLAIN_PATH = "/api/citeciter.explain";
		function hostBase() {
			const origin = globalThis.location?.origin;
			return origin !== void 0 && origin !== "null" ? origin : "http://dsh.internal";
		}
		const httpExplainTransport = { async explain(source, selection, signal) {
			const response = await fetch(new URL(EXPLAIN_PATH, hostBase()), {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sourceSessionId: source.sessionId,
					atSeq: source.atSeq,
					selection
				}),
				signal
			});
			const payload = await response.json().catch(() => null);
			if (!response.ok) {
				const message = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string" ? payload.error : `CiteCiter Host request failed: HTTP ${String(response.status)}`;
				throw new Error(message);
			}
			if (typeof payload !== "object" || payload === null || !("childId" in payload) || typeof payload.childId !== "string" || !("answerText" in payload) || typeof payload.answerText !== "string") throw new Error("CiteCiter Host returned an invalid explanation response");
			return {
				childId: payload.childId,
				answerText: payload.answerText
			};
		} };
		function sourceResolver(sessions, uiConversation) {
			return (selection) => {
				const current = sessions.list.getSnapshot().current;
				if (current === void 0) throw new Error("no current session");
				const binding = sessions.binding(current);
				if (binding === void 0) throw new Error(`current session "${current}" is not locally addressable`);
				const node = uiConversation.binding(binding).target("chat").getSnapshot()?.nodes.get(selection.anchorKey);
				if (node === void 0 || node.kind !== "assistant-step") throw new Error("selected assistant context is no longer available");
				const answer = readAssistantAnswer(node.data);
				if (answer === null || answer.status === "running") throw new Error("selected assistant response is not complete");
				if (node.location.kind !== "step" || node.location.turn.status !== "closed") throw new Error("selected assistant turn is not complete");
				return {
					sessionId: current,
					atSeq: node.anchorSeq
				};
			};
		}
		function createExplainer(sessions, uiConversation, transport = httpExplainTransport) {
			return createExplainerController(sourceResolver(sessions, uiConversation), transport, (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(EMPTY));
		}
		//#endregion
		//#region lib/types/client/rich-content.js
		const MAX_RICH_SOURCE_LENGTH = 2e5;
		const RICH_FENCE = /^```(?<kind>svg|html)[ \t]*\r?\n(?<source>[\s\S]*?)^```[ \t]*$/gimu;
		const HTML_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:";
		/**
		* Split complete safe rich fences from Markdown while preserving all prose.
		* @param text - current assistant response text.
		* @returns ordered Markdown and isolated rich-preview segments.
		*/
		function splitRichContent(text) {
			const segments = [];
			let cursor = 0;
			for (const match of text.matchAll(RICH_FENCE)) {
				const index = match.index ?? 0;
				if (index > cursor) pushMarkdown(segments, text.slice(cursor, index));
				const wholeFence = match[0];
				const kind = match.groups?.kind?.toLowerCase();
				const source = match.groups?.source ?? "";
				if (kind === "svg" && isSafeSvg(source)) {
					const normalized = source.trim();
					segments.push({
						kind: "svg",
						source: normalized,
						dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`
					});
				} else if (kind === "html" && isPreviewableHtml(source)) segments.push({
					kind: "html",
					document: isolatedHtmlDocument(source.trim())
				});
				else pushMarkdown(segments, wholeFence);
				cursor = index + wholeFence.length;
			}
			if (cursor < text.length || segments.length === 0) pushMarkdown(segments, text.slice(cursor));
			return segments;
		}
		/**
		* Check whether SVG markup is self-contained and non-active.
		* @param source - SVG fence body.
		* @returns whether the source may be rendered as an inert image preview.
		*/
		function isSafeSvg(source) {
			const svg = source.trim();
			if (svg.length === 0 || svg.length > MAX_RICH_SOURCE_LENGTH) return false;
			if (!/^<svg(?:\s|>)/iu.test(svg) || !/<\/svg\s*>$/iu.test(svg)) return false;
			if (/<\/?(?:script|foreignobject|iframe|object|embed|audio|video|canvas)\b/iu.test(svg)) return false;
			if (/\son[a-z][a-z0-9:_-]*\s*=/iu.test(svg)) return false;
			if (/\b(?:href|xlink:href)\s*=/iu.test(svg)) return false;
			if (/\b(?:javascript|vbscript)\s*:/iu.test(svg)) return false;
			if (/url\(\s*(?:['"]?\s*)?(?!#)/iu.test(svg)) return false;
			return true;
		}
		/**
		* Build a network-free, script-free iframe document for an HTML fence.
		* @param source - HTML fence body.
		* @returns complete iframe `srcDoc` markup with restrictive CSP metadata.
		*/
		function isolatedHtmlDocument(source) {
			return [
				"<!doctype html><html><head>",
				`<meta http-equiv="Content-Security-Policy" content="${HTML_CSP}">`,
				"<meta name=\"referrer\" content=\"no-referrer\">",
				"<style>html{color-scheme:light dark}body{margin:0;padding:12px;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}</style>",
				"</head><body>",
				source,
				"</body></html>"
			].join("");
		}
		function isPreviewableHtml(source) {
			return source.trim().length > 0 && source.length <= MAX_RICH_SOURCE_LENGTH;
		}
		function pushMarkdown(segments, text) {
			if (text !== "") segments.push({
				kind: "markdown",
				text
			});
		}
		//#endregion
		//#region lib/types/client/components/RichAnswer.js
		/**
		* Render model Markdown plus safe SVG and sandboxed HTML fence previews.
		* @param props - response text and streaming flag.
		* @returns isolated rich-answer element.
		*/
		function RichAnswer({ text, streaming }) {
			const segments = (0, react.useMemo)(() => splitRichContent(text), [text]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: CiteCiter_module_css_default.richAnswer,
				"data-citeciter-answer": true,
				children: segments.map((segment, index) => {
					const key = `${segment.kind}:${index}`;
					if (segment.kind === "svg") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-svg": true,
						children: (0, react_jsx_runtime.jsx)("img", {
							className: CiteCiter_module_css_default.richSvg,
							src: segment.dataUrl,
							alt: "CiteCiter SVG explanation"
						})
					}, key);
					if (segment.kind === "html") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-html": true,
						children: (0, react_jsx_runtime.jsx)("iframe", {
							className: CiteCiter_module_css_default.richHtml,
							title: "CiteCiter HTML explanation",
							sandbox: "",
							referrerPolicy: "no-referrer",
							srcDoc: segment.document
						})
					}, key);
					return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: segment.text,
						streaming,
						labels: {
							code: {
								copyLabel: "复制代码",
								copiedLabel: "已复制"
							},
							footnotes: "脚注"
						}
					}, key);
				})
			});
		}
		//#endregion
		//#region lib/types/client/components/CitePanel.js
		const PHASE_LABEL = {
			idle: "空闲",
			creating: "正在创建解释会话…",
			ready: "解释会话已就绪",
			running: "正在解释…",
			settled: "解释完成",
			error: "解释失败"
		};
		/**
		* Render the right details-column explanation panel.
		* @param props - selection state, close action, and explainer face.
		* @returns panel element with current status and response.
		*/
		function CitePanel({ bus, close, explainer }) {
			const subscribeBus = (0, react.useCallback)((onStoreChange) => bus.subscribe(onStoreChange), [bus]);
			const subscribeExplainer = (0, react.useCallback)((onStoreChange) => explainer.subscribe(onStoreChange), [explainer]);
			const selection = (0, react.useSyncExternalStore)(subscribeBus, () => bus.getPanelSelection());
			const snapshot = (0, react.useSyncExternalStore)(subscribeExplainer, () => explainer.getSnapshot());
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CiteCiter_module_css_default.panel,
				"data-citeciter-panel": true,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: CiteCiter_module_css_default.panelHeader,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: CiteCiter_module_css_default.panelTitle,
						children: "CiteCiter"
					}), (0, react_jsx_runtime.jsx)("button", {
						className: CiteCiter_module_css_default.closeButton,
						type: "button",
						"aria-label": "Close",
						onClick: close,
						children: "×"
					})]
				}), selection === null && snapshot.selection === null ? (0, react_jsx_runtime.jsx)("p", {
					className: CiteCiter_module_css_default.panelHint,
					children: "选中助手回复中的一段文字，右键选择 Citer!。"
				}) : (0, react_jsx_runtime.jsxs)("div", {
					className: CiteCiter_module_css_default.panelBody,
					children: [
						(0, react_jsx_runtime.jsx)("blockquote", {
							className: CiteCiter_module_css_default.quote,
							children: (selection ?? snapshot.selection)?.text
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: CiteCiter_module_css_default.meta,
							children: [
								(0, react_jsx_runtime.jsx)("dt", { children: "anchor" }),
								(0, react_jsx_runtime.jsx)("dd", { children: (selection ?? snapshot.selection)?.anchorKey }),
								(0, react_jsx_runtime.jsx)("dt", { children: "child" }),
								(0, react_jsx_runtime.jsx)("dd", { children: snapshot.childId ?? "—" }),
								(0, react_jsx_runtime.jsx)("dt", { children: "status" }),
								(0, react_jsx_runtime.jsx)("dd", { children: PHASE_LABEL[snapshot.phase] })
							]
						}),
						snapshot.error !== null && (0, react_jsx_runtime.jsx)("p", {
							className: CiteCiter_module_css_default.panelError,
							"data-citeciter-error": true,
							children: snapshot.error
						}),
						snapshot.answerText !== null && snapshot.answerText !== "" && (0, react_jsx_runtime.jsx)("div", {
							className: CiteCiter_module_css_default.panelAnswer,
							children: (0, react_jsx_runtime.jsx)(RichAnswer, {
								text: snapshot.answerText,
								streaming: snapshot.phase === "running"
							})
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: CiteCiter_module_css_default.panelActions,
							children: [snapshot.phase === "running" && (0, react_jsx_runtime.jsx)("button", {
								className: CiteCiter_module_css_default.actionButton,
								type: "button",
								onClick: () => {
									explainer.stop();
								},
								children: "停止"
							}), (0, react_jsx_runtime.jsx)("span", {
								className: CiteCiter_module_css_default.panelNote,
								children: "解释会话独立运行，不写入主会话。"
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/selection.js
		/**
		* Resolve the current DOM selection into a CiteSelection.
		* Returns null for collapsed or empty selections, selections outside a
		* conversation flow node, and selections outside an assistant step.
		* @param event - context-menu event whose pointer position anchors the menu.
		* @returns validated selection metadata, or null when CiteCiter should ignore it.
		*/
		function readSelection(event) {
			const selection = window.getSelection();
			if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null;
			const text = selection.toString().trim();
			if (text === "") return null;
			const start = selection.getRangeAt(0).commonAncestorContainer;
			const flow = (start.nodeType === Node.ELEMENT_NODE ? start : start.parentElement)?.closest("[data-chat-flow-kind]");
			if (flow === null || flow === void 0) return null;
			const kind = flow.dataset.chatFlowKind;
			const anchorKey = flow.dataset.chatAnchorKey;
			if (kind !== "assistant-step" || anchorKey === void 0 || anchorKey === "") return null;
			return {
				text,
				kind,
				anchorKey,
				x: event.clientX,
				y: event.clientY
			};
		}
		//#endregion
		//#region lib/types/client/types.js
		/** Observable selection state shared by the overlay and details panel. */
		var CiteBus = class {
			reportListenerError;
			menuSelection = null;
			panelSelection = null;
			listeners = /* @__PURE__ */ new Set();
			/** @param reportListenerError - isolates and reports one failed subscriber. */
			constructor(reportListenerError) {
				this.reportListenerError = reportListenerError;
			}
			/** @returns current context-menu selection, or null while hidden. */
			getMenuSelection() {
				return this.menuSelection;
			}
			/** @returns selection currently explained in the details panel. */
			getPanelSelection() {
				return this.panelSelection;
			}
			/** @param selection - next context-menu selection, or null to hide it. */
			setMenuSelection(selection) {
				if (this.menuSelection === selection) return;
				this.menuSelection = selection;
				this.notify();
			}
			/** @param selection - next details-panel selection, or null when closed. */
			setPanelSelection(selection) {
				if (this.panelSelection === selection) return;
				this.panelSelection = selection;
				this.notify();
			}
			/**
			* Subscribe to either selection value.
			* @param listener - callback invoked after a value changes.
			* @returns disposer for this subscription.
			*/
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			notify() {
				for (const listener of [...this.listeners]) try {
					listener();
				} catch (error) {
					this.reportListenerError(error);
				}
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Cordis identity for the CiteCiter browser plugin. */
		const name = "@kirkchinese/dsh-citeciter";
		/** Hard dependencies whose appearance activates the browser fiber. */
		const inject = [
			"layout",
			"slots",
			"sessions",
			"uiConversation"
		];
		/**
		* Register the selection listener, overlay entry, and details-panel lifecycle.
		* @param ctx - Cordis browser context with layout, slots, and sessions services.
		*/
		function apply(ctx) {
			const { layout } = ctx;
			const sessions = Reflect.get(ctx, "sessions");
			const slots = Reflect.get(ctx, "slots");
			const uiConversation = Reflect.get(ctx, "uiConversation");
			const bus = new CiteBus((error) => ctx.logger.warn("citeciter selection listener failed", error));
			const explainer = createExplainer(sessions, uiConversation);
			let detailsInjectController = null;
			let detailsDisposer = null;
			let panelOpen = false;
			ctx.effect(() => {
				const onContextMenu = (event) => {
					const selection = readSelection(event);
					if (selection === null) return;
					event.preventDefault();
					bus.setMenuSelection(selection);
				};
				const onPointerDown = (event) => {
					const target = event.target;
					if (!(target instanceof Element) || target.closest("[data-citeciter-menu]") === null) bus.setMenuSelection(null);
				};
				document.addEventListener("contextmenu", onContextMenu);
				document.addEventListener("pointerdown", onPointerDown);
				return () => {
					document.removeEventListener("contextmenu", onContextMenu);
					document.removeEventListener("pointerdown", onPointerDown);
				};
			});
			const openPanel = (selection) => {
				bus.setPanelSelection(selection);
				panelOpen = true;
				layout.openDetails();
				if (detailsInjectController === null) detailsInjectController = slots.inject("details", () => {
					detailsDisposer = slots.register({
						name: "details",
						priority: Number.MIN_SAFE_INTEGER,
						inject: () => ({
							bus,
							close: closePanel,
							explainer
						})
					}, CitePanel);
					return () => {
						detailsDisposer?.();
						detailsDisposer = null;
					};
				});
				explainer.start(selection);
			};
			const closePanel = () => {
				const wasOpen = panelOpen;
				panelOpen = false;
				detailsDisposer?.();
				detailsDisposer = null;
				detailsInjectController?.();
				detailsInjectController = null;
				bus.setPanelSelection(null);
				if (wasOpen) layout.closeDetails();
			};
			ctx.effect(() => async () => {
				closePanel();
				await explainer.dispose();
			}, "citeciter: explainer lifecycle");
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "citeciter.menu",
				inject: () => ({
					bus,
					openPanel
				})
			}, SelectionMenu));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
