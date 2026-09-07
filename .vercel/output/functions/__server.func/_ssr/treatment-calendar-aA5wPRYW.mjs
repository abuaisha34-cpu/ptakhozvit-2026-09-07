import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, y as todayISO } from "./org-DsT_3HSb.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { t as Input } from "./input-x1ihG6i4.mjs";
import { i as newTreatmentEvent, r as defaultTreatmentCalendar } from "./treatments-CsIFZeLW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/treatment-calendar-aA5wPRYW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TreatmentCalendarCard({ title, hint, items, canEdit, ageDays, flockMode, onSave }) {
	const [rows, setRows] = (0, import_react.useState)(items);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	function patch(id, part) {
		setRows((prev) => prev.map((r) => r.id === id ? {
			...r,
			...part
		} : r));
		setMsg(null);
	}
	async function save() {
		if (!onSave) return;
		setBusy(true);
		setErr(null);
		try {
			await onSave(rows.filter((r) => r.name.trim()));
			setMsg("Календар збережено");
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Не збережено");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: hint
		}),
		canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2",
			children: [
				rows.map((r) => {
					const reached = ageDays != null && ageDays >= r.day;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 rounded-[14px] bg-bg px-3 py-2 sm:grid-cols-[4.5rem_1fr_auto_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								max: 80,
								value: r.day,
								"aria-label": "Доба",
								onChange: (e) => patch(r.id, { day: Number(e.target.value) })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: r.name,
								"aria-label": "Обробка",
								onChange: (e) => patch(r.id, { name: e.target.value })
							}),
							flockMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: r.done,
									onChange: (e) => patch(r.id, {
										done: e.target.checked,
										doneDate: e.target.checked ? r.doneDate || todayISO() : null
									})
								}), "Зроблено"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-subtle",
								children: reached ? "термін" : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "ghost",
								onClick: () => setRows((p) => p.filter((x) => x.id !== r.id)),
								children: "Прибрати"
							})
						]
					}, r.id);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "secondary",
							onClick: () => setRows((p) => [...p, newTreatmentEvent({ day: (p.at(-1)?.day ?? 0) + 7 })]),
							children: "Додати обробку"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: () => setRows(defaultTreatmentCalendar()),
							children: "Типовий графік"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							disabled: busy,
							onClick: () => void save(),
							children: busy ? "…" : "Зберегти календар"
						})
					]
				}),
				err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-bad",
					children: err
				}) : null,
				msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ok",
					children: msg
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2 text-sm",
			children: rows.map((v) => {
				const reached = ageDays != null && ageDays >= v.day;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn(v.done ? "text-ok" : reached ? "text-muted" : "text-fg"),
						children: [
							"Доба ",
							v.day,
							" · ",
							v.name,
							v.notes ? ` — ${v.notes}` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: v.done ? `зроблено${v.doneDate ? ` ${v.doneDate}` : ""}` : reached ? "термін минув" : "заплановано"
					})]
				}, v.id);
			})
		})
	] });
}
//#endregion
export { TreatmentCalendarCard as t };
