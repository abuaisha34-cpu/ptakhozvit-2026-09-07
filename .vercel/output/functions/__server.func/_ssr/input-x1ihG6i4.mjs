import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-x1ihG6i4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	suppressHydrationWarning: true,
	className: cn("h-12 w-full rounded-[14px] bg-surface px-3.5 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle outline-none transition-[box-shadow] duration-150", "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30", className),
	...props
}));
Input.displayName = "Input";
var Textarea = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("min-h-24 w-full rounded-[16px] bg-surface px-3.5 py-2.5 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle outline-none transition-[box-shadow] duration-150", "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30", className),
	...props
}));
Textarea.displayName = "Textarea";
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-12 w-full appearance-none rounded-[14px] bg-surface px-3.5 text-sm text-fg shadow-[var(--shadow-border)]", "outline-none transition-[box-shadow] duration-150", "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30", className),
		...props,
		children
	});
}
//#endregion
export { Textarea as i, Label as n, Select as r, Input as t };
