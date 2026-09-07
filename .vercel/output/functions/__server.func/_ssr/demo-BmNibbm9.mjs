import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-BzrKyXF3.mjs";
import { n as Wordmark, r as useCurrentUserState } from "./brand-CvpLANUL.mjs";
import { p as enterDemo } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-BmNibbm9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function startDemoSession() {
	await enterDemo();
}
function DemoPage() {
	const { isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const started = (0, import_react.useRef)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (isPending || started.current) return;
		started.current = true;
		startDemoSession().then(() => navigate({ to: "/" })).catch((err) => {
			setError(err instanceof Error ? err.message : "Не вдалося відкрити демо");
		});
	}, [isPending, navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-8 font-display text-3xl font-medium tracking-tight",
				children: "Демо-ферма"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-3 max-w-md text-sm text-muted",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
					children: "На вхід"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => window.location.reload(),
					children: "Ще раз"
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Відкриваємо навчальну ферму з живими звітами…"
			})
		] })
	});
}
//#endregion
export { DemoPage as component };
