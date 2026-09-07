import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-BzrKyXF3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-CvpLANUL.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Stable fallback user, used ONLY when auth is disabled
* (`VITE_AUTH_ENABLED=false`, the shipped default). With auth on, the sandbox
* live preview does real sign-in via the baked preview client. Its id is
* `"dev-user"` — the SAME id `verify.server.ts` returns server-side — so per-user
* rows written in that mode belong to one consistent owner.
*/
var DEV_USER = {
	id: "dev-user",
	displayName: "Dev User",
	primaryEmail: "dev@example.com",
	profileImageUrl: null,
	isDevFallback: true
};
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return {
		user: DEV_USER,
		isPending: false
	};
}
function Mark({ className = "size-8" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "1.5",
				y: "1.5",
				width: "29",
				height: "29",
				rx: "9",
				className: "fill-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "6.5",
				width: "16",
				height: "19",
				rx: "2.5",
				className: "fill-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "13.2",
				y: "4.8",
				width: "5.6",
				height: "3.2",
				rx: "1.2",
				className: "fill-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M11.2 20.4c.2-3.2 2.1-5.6 4.8-5.8 1.9-.1 3.4 1 4.2 2.6.5 1 .6 2.2.4 3.3l-.2 1.2H11.4l-.2-1.3z",
				className: "fill-primary",
				opacity: "0.92"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.6 16.2c.7-.15 1.5.2 1.8.9",
				className: "stroke-primary-fg",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "20.7",
				cy: "16.05",
				r: "0.7",
				className: "fill-[#e24b3a]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.2 22.4h7.6",
				className: "stroke-accent",
				strokeWidth: "1.4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12.2 12.2h5.4M12.2 14.4h4.2",
				className: "stroke-primary/35",
				strokeWidth: "1.2",
				strokeLinecap: "round"
			})
		]
	});
}
function BroilerField({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 360 120",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M0 88h360",
				className: "stroke-border-strong",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 88V58l28-18 28 18v30",
				className: "stroke-fg/40",
				strokeWidth: "1.4",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M32 88v-16h28v16",
				className: "stroke-primary",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M92 88V52l36-22 36 22v36",
				className: "stroke-fg/55",
				strokeWidth: "1.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M112 88V64h32v24",
				className: "stroke-primary",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M188 88V60l26-16 26 16v28",
				className: "stroke-fg/40",
				strokeWidth: "1.4",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M202 88v-14h24v14",
				className: "stroke-primary",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "78",
				cy: "96",
				r: "3.2",
				className: "fill-primary/70"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "168",
				cy: "98",
				r: "4",
				className: "fill-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "248",
				cy: "96",
				r: "3",
				className: "fill-primary/50"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M280 88V62l22-14 22 14v26",
				className: "stroke-fg/35",
				strokeWidth: "1.3",
				strokeLinejoin: "round"
			})
		]
	});
}
function Wordmark({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-display text-[17px] font-semibold tracking-tight text-fg",
				children: "ПтахоЗвіт"
			}), !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-[11px] tracking-wide text-muted",
				children: "Бройлер · фабрики · пташники"
			}) : null]
		})]
	});
}
//#endregion
export { Wordmark as n, useCurrentUserState as r, BroilerField as t };
