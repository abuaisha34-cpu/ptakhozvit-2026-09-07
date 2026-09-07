import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-3aZJP2Zh.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-[24px] bg-surface p-5 shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: cn("font-display text-lg font-medium tracking-tight text-fg", className),
		...props
	});
}
//#endregion
export { CardTitle as n, Card as t };
