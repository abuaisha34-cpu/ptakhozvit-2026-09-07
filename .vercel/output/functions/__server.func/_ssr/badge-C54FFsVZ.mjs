import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-C54FFsVZ.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide", "bg-surface-2 text-muted", className),
		...props
	});
}
function StatusBadge({ status }) {
	const m = {
		ok: {
			label: "Норма",
			className: "bg-ok/12 text-ok",
			dot: "bg-ok"
		},
		watch: {
			label: "Нагляд",
			className: "bg-watch/12 text-watch",
			dot: "bg-watch"
		},
		warn: {
			label: "Увага",
			className: "bg-warn/12 text-warn",
			dot: "bg-warn"
		},
		critical: {
			label: "Критично",
			className: "bg-bad/12 text-bad",
			dot: "bg-bad"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		className: m.className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mr-1.5 size-1.5 rounded-full", m.dot) }), m.label]
	});
}
//#endregion
export { StatusBadge as t };
