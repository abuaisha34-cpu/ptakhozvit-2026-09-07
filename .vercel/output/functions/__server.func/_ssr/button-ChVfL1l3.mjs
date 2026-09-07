import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-ChVfL1l3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-[0_6px_16px_rgb(47_154_76_/_0.22)] hover:opacity-92",
			secondary: "bg-surface-2 text-fg border border-border hover:border-border-strong",
			ghost: "text-muted hover:text-fg hover:bg-surface-2",
			danger: "bg-bad/15 text-bad border border-bad/30 hover:bg-bad/25"
		},
		size: {
			default: "h-11 rounded-[12px] px-4 text-sm",
			sm: "h-9 rounded-[10px] px-3 text-sm",
			lg: "h-12 rounded-[14px] px-5 text-base",
			icon: "size-11 rounded-[12px]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, type = "button", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	type,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
//#endregion
export { Button as t };
