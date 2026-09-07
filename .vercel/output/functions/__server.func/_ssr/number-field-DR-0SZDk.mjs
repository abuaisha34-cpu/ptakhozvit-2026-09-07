import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Label } from "./input-x1ihG6i4.mjs";
import { N as Delete, S as Plus, w as Minus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/number-field-DR-0SZDk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseVal(raw) {
	const n = Number(String(raw).replace(",", "."));
	return Number.isFinite(n) ? n : 0;
}
function formatVal(n, decimals) {
	if (decimals <= 0) return String(Math.round(n));
	return n.toFixed(decimals).replace(/\.?0+$/, "");
}
function NumberField({ label, value, onChange, unit, hint, min = 0, max = 1e6, step = 1, decimals = 0, required, forecast, onApplyForecast }) {
	const [pad, setPad] = (0, import_react.useState)(false);
	const holdRef = (0, import_react.useRef)(null);
	const delayRef = (0, import_react.useRef)(null);
	const applyDelta = (0, import_react.useCallback)((dir) => {
		const current = value === "" ? 0 : parseVal(value);
		onChange(formatVal(Math.min(max, Math.max(min, current + dir * step)), decimals));
	}, [
		decimals,
		max,
		min,
		onChange,
		step,
		value
	]);
	const stopHold = (0, import_react.useCallback)(() => {
		if (holdRef.current) window.clearInterval(holdRef.current);
		if (delayRef.current) window.clearTimeout(delayRef.current);
		holdRef.current = null;
		delayRef.current = null;
	}, []);
	const startHold = (dir) => {
		applyDelta(dir);
		delayRef.current = window.setTimeout(() => {
			holdRef.current = window.setInterval(() => applyDelta(dir), 70);
		}, 380);
	};
	(0, import_react.useEffect)(() => () => stopHold(), [stopHold]);
	(0, import_react.useEffect)(() => {
		if (!pad) return;
		const onKey = (e) => {
			if (e.key === "Escape") setPad(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [pad]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-14 items-stretch overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Менше",
					className: "grid w-12 shrink-0 place-items-center text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.98] md:w-14",
					onPointerDown: () => startHold(-1),
					onPointerUp: stopHold,
					onPointerLeave: stopHold,
					onPointerCancel: stopHold,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
						className: "size-5",
						strokeWidth: 1.75
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex min-w-0 flex-1 flex-col items-center justify-center px-1",
					onClick: () => setPad(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-full truncate text-center font-display text-2xl tabular-nums leading-none tracking-tight text-fg",
						children: value === "" ? "—" : value
					}), unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 text-[11px] text-subtle",
						children: unit
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Більше",
					className: "grid w-12 shrink-0 place-items-center text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.98] md:w-14",
					onPointerDown: () => startHold(1),
					onPointerUp: stopHold,
					onPointerLeave: stopHold,
					onPointerCancel: stopHold,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-5",
						strokeWidth: 1.75
					})
				})
			]
		}),
		hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-subtle",
			children: hint
		}) : null,
		forecast && onApplyForecast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "mt-1 text-[11px] font-medium text-primary",
			onClick: onApplyForecast,
			children: [
				"Прогноз ",
				forecast,
				" · підставити"
			]
		}) : null,
		pad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
			label,
			unit,
			value,
			required,
			decimals,
			min,
			max,
			forecast,
			onChange,
			onClose: () => setPad(false)
		}) : null
	] });
}
function Keypad({ label, unit, value, required, decimals, min, max, forecast, onChange, onClose }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	function push(ch) {
		setDraft((prev) => {
			if (ch === "." && (decimals <= 0 || prev.includes("."))) return prev;
			if (prev === "0" && ch !== ".") return ch;
			if (prev === "" && ch === ".") return "0.";
			const next = `${prev}${ch}`;
			const [int, frac = ""] = next.split(".");
			if (frac.length > decimals) return prev;
			if (int.length > 7) return prev;
			return next;
		});
	}
	function backspace() {
		setDraft((prev) => prev.slice(0, -1));
	}
	function confirm() {
		if (draft === "" && required) return;
		if (draft === "") {
			onChange("");
			onClose();
			return;
		}
		onChange(formatVal(Math.min(max, Math.max(min, parseVal(draft))), decimals));
		onClose();
	}
	const keys = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		decimals > 0 ? "." : "",
		"0",
		"del"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-fg/25",
			"aria-label": "Закрити",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm rounded-t-[28px] bg-surface p-5 shadow-[var(--shadow-border-hover)] sm:rounded-[28px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-display text-5xl tabular-nums tracking-tight text-fg",
					children: [draft === "" ? "0" : draft, unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 font-sans text-base text-subtle",
						children: unit
					}) : null]
				}),
				forecast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-3 h-11 w-full rounded-[14px] bg-primary/10 text-sm font-medium text-primary",
					onClick: () => setDraft(forecast.replace(",", ".")),
					children: [
						"Прогноз кросу ",
						forecast,
						unit ? ` ${unit}` : ""
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 grid grid-cols-3 gap-2",
					children: keys.map((k, i) => {
						if (!k) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `empty-${i}`);
						if (k === "del") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-14 place-items-center rounded-[16px] bg-surface-2 text-fg transition-transform duration-150 active:scale-[0.98]",
							onClick: backspace,
							"aria-label": "Стерти",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, {
								className: "size-5",
								strokeWidth: 1.75
							})
						}, "del");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-14 rounded-[16px] bg-bg text-xl tabular-nums text-fg transition-transform duration-150 active:scale-[0.98]",
							onClick: () => push(k),
							children: k === "." ? "," : k
						}, k);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 h-12 w-full rounded-[16px] bg-primary text-sm font-medium text-primary-fg",
					onClick: confirm,
					children: "Готово"
				})
			]
		})]
	});
}
//#endregion
export { NumberField as t };
