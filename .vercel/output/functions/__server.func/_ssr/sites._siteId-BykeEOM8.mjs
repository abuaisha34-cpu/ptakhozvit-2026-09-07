import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as isPlatformAdmin } from "./roles-BISHNnDi.mjs";
import { A as getSiteDetail } from "./fns-aaDGwzaQ.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { r as Route$2 } from "./router-CKSXmWZm.mjs";
import { r as FactorySummary } from "./factory-summary-BngOe8MX.mjs";
import { i as dashboardWorkbook, r as ExportButtons } from "./export-buttons-cZRyvjVd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sites._siteId-BykeEOM8.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { siteId } = Route$2.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryView, { siteId: Number(siteId) }) });
}
function FactoryView({ siteId }) {
	const { data, error, loading } = useAsync(() => getSiteDetail({ data: { siteId } }), [siteId]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [isPlatformAdmin(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/holdings/$orgId",
				params: { orgId: String(data.factory.site.orgId) },
				className: "text-xs text-muted hover:text-fg",
				children: "← Господарство"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-xs text-muted hover:text-fg",
				children: "← Усі фабрики"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButtons, { spec: dashboardWorkbook([data.factory], {
				today: data.today,
				orgName: data.profile.orgName
			}) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorySummary, {
			factory: data.factory,
			thresholds: data.thresholds,
			housesVariant: "cards",
			headingLevel: "h1"
		})]
	});
}
//#endregion
export { Page as component };
