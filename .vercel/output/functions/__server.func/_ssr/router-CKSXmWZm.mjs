import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as __exportAll } from "./ssr.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { h as num, p as isSheetsTokenFormat, t as addDaysISO, y as todayISO } from "./org-DsT_3HSb.mjs";
import { l as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as getSql } from "./db-CZOlgmpB.mjs";
import { t as auth } from "./server-CpLwKTbo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CKSXmWZm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isStaleChunk(error) {
	const msg = error instanceof Error ? error.message : String(error ?? "");
	return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i.test(msg);
}
function AppErrorComponent({ error }) {
	const stale = isStaleChunk(error);
	(0, import_react.useEffect)(() => {
		if (!stale || typeof window === "undefined") return;
		const key = "ptz-chunk-reload";
		if (sessionStorage.getItem(key) === "1") return;
		sessionStorage.setItem(key, "1");
		window.location.reload();
	}, [stale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-bad",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xl font-medium",
				children: stale ? "Потрібно оновити додаток" : "Щось пішло не так"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm text-muted",
				children: stale ? "Це стара копія на телефоні. Відкрийте ptakhozvit.com.ua і додайте на головний екран знову." : error.message || "Оновіть сторінку і спробуйте ще раз."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-fg",
				onClick: () => {
					window.location.href = "https://ptakhozvit.com.ua/";
				},
				children: "Відкрити ПтахоЗвіт"
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/** After a deploy, a cached PWA still asks for old hashed JS. Reload once. */
function StaleChunkReload() {
	(0, import_react.useEffect)(() => {
		const key = "ptz-chunk-reload";
		const reloadOnce = () => {
			if (sessionStorage.getItem(key) === "1") return;
			sessionStorage.setItem(key, "1");
			window.location.reload();
		};
		const onVite = (event) => {
			event.preventDefault();
			reloadOnce();
		};
		window.addEventListener("vite:preloadError", onVite);
		window.addEventListener("unhandledrejection", (event) => {
			const msg = String(event.reason?.message ?? event.reason ?? "");
			if (/dynamically imported module|Loading chunk/i.test(msg)) reloadOnce();
		});
		return () => window.removeEventListener("vite:preloadError", onVite);
	}, []);
	return null;
}
var styles_default = "/assets/styles-CEmx7FSB.css";
var APP_NAME = "ПтахоЗвіт";
var APP_URL = "https://ptakhozvit.com.ua";
var Route$21 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#f6fbf2"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "description",
				content: "Щоденна звітність бройлера по фабриках і пташниках: відхилення від норми кросу, падіж, корм, прогнози посадки."
			},
			{
				property: "og:url",
				content: APP_URL
			},
			{
				property: "og:site_name",
				content: APP_NAME
			}
		],
		links: [
			{
				rel: "canonical",
				href: APP_URL
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "stylesheet",
				href: styles_default
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "uk",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaleChunkReload, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$18 = () => import("./routes-DQV2g_js.mjs");
var Route$20 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./account-BC-vOzlr.mjs");
var Route$19 = createFileRoute("/account")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./cost-WqzXfd2A.mjs");
var Route$18 = createFileRoute("/cost")({
	component: lazyRouteComponent($$splitComponentImporter$16, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$15 = () => import("./demo-BmNibbm9.mjs");
var Route$17 = createFileRoute("/demo")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./feed-CtNqWYxf.mjs");
var Route$16 = createFileRoute("/feed")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$13 = () => import("./forecasts-COskEqP0.mjs");
var Route$15 = createFileRoute("/forecasts")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./guide-D-DzM0hv.mjs");
var Route$14 = createFileRoute("/guide")({
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$11 = () => import("./holdings-CGnWeriy.mjs");
var Route$13 = createFileRoute("/holdings")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./journal-Bo8jyiA6.mjs");
var Route$12 = createFileRoute("/journal")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$9 = () => import("./login-B7vYH25r.mjs");
var Route$11 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./period-4Jf02GBV.mjs");
var Route$10 = createFileRoute("/period")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./report-ZlH3cBCg.mjs");
var Route$9 = createFileRoute("/report")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	validateSearch: (search) => {
		const house = Number(search.house);
		const date = typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : void 0;
		const out = {};
		if (Number.isFinite(house) && house > 0) out.house = house;
		if (date) out.date = date;
		return out;
	}
});
var $$splitComponentImporter$6 = () => import("./settings-B5q5iRcY.mjs");
var Route$8 = createFileRoute("/settings")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$5 = () => import("./team-TJly_CKx.mjs");
var Route$7 = createFileRoute("/team")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	validateSearch: (search) => {
		const org = Number(search.org);
		return { org: Number.isFinite(org) && org > 0 ? org : void 0 };
	}
});
var $$splitComponentImporter$4 = () => import("./tools-BLewwkkt.mjs");
var Route$6 = createFileRoute("/tools")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./holdings.index-CkMfW8Pw.mjs");
var Route$5 = createFileRoute("/holdings/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./holdings._orgId-BuNcT51g.mjs");
var Route$4 = createFileRoute("/holdings/$orgId")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./houses._houseId-B2_kZwIU.mjs");
var Route$3 = createFileRoute("/houses/$houseId")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	validateSearch: (search) => {
		const flock = Number(search.flock);
		return { flock: Number.isFinite(flock) && flock > 0 ? flock : void 0 };
	}
});
var $$splitComponentImporter = () => import("./sites._siteId-BykeEOM8.mjs");
var Route$2 = createFileRoute("/sites/$siteId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
function tsvCell(value) {
	if (value == null || value === "") return "";
	return String(value).replaceAll("	", " ").replaceAll("\r", " ").replaceAll("\n", " ");
}
function toTsv(columns, rows, title, subtitle) {
	const lines = [];
	if (title) lines.push(tsvCell(title));
	if (subtitle) lines.push(tsvCell(subtitle));
	if (title || subtitle) lines.push("");
	lines.push(columns.map(tsvCell).join("	"));
	for (const row of rows) lines.push(row.map(tsvCell).join("	"));
	return `${lines.join("\n")}\n`;
}
async function orgBySheetsToken(sql, token) {
	if (!isSheetsTokenFormat(token)) return null;
	return (await sql.query("select id, name from organizations where sheets_token = $1", [token]))[0] ?? null;
}
async function buildSheetsTsv(sql, org, kind, from, to) {
	if (kind === "today") {
		const today = todayISO();
		const rows = await sql.query(`select s.name as site_name, h.name as house_name,
              f.code as flock_code, f.breed,
              r.report_date, r.age_days, r.head_end, r.avg_weight_g,
              r.mortality, r.culled, r.feed_kg, r.water_l, r.notes
         from houses h
         join sites s on s.id = h.site_id
         left join flocks f on f.house_id = h.id and f.status = 'active'
         left join daily_reports r
           on r.flock_id = f.id and r.report_date = $2
        where s.org_id = $1
        order by s.sort_order, h.sort_order`, [org.id, today]);
		return {
			filename: `ptahozvit-zvedennya-${today}.tsv`,
			body: toTsv([
				"Фабрика",
				"Пташник",
				"Посадка",
				"Крос",
				"Дата звіту",
				"Доба",
				"Поголівʼя",
				"Маса, г",
				"Падіж",
				"Вибраковка",
				"Корм, кг",
				"Вода, л"
			], rows.map((r) => [
				r.site_name,
				r.house_name,
				r.flock_code,
				r.breed,
				r.report_date,
				r.age_days,
				r.head_end,
				r.avg_weight_g,
				r.mortality,
				r.culled,
				r.feed_kg == null ? "" : num(r.feed_kg),
				r.water_l == null ? "" : num(r.water_l)
			]), org.name, `Зведення · ${today}`)
		};
	}
	const rows = await sql.query(`select r.report_date, s.name as site_name, h.name as house_name,
            r.age_days, r.mortality, r.culled, r.head_end, r.avg_weight_g,
            r.feed_kg, r.water_l, r.notes
       from daily_reports r
       join flocks f on f.id = r.flock_id
       join houses h on h.id = f.house_id
       join sites s on s.id = f.site_id
      where s.org_id = $1
        and r.report_date between $2 and $3
      order by r.report_date, s.sort_order, h.sort_order`, [
		org.id,
		from,
		to
	]);
	return {
		filename: `ptahozvit-${from}-${to}.tsv`,
		body: toTsv([
			"Дата",
			"Фабрика",
			"Пташник",
			"Доба",
			"Падіж",
			"Вибраковка",
			"Поголівʼя",
			"Маса, г",
			"Корм, кг",
			"Вода, л"
		], rows.map((r) => [
			r.report_date,
			r.site_name,
			r.house_name,
			r.age_days,
			r.mortality,
			r.culled,
			r.head_end,
			r.avg_weight_g,
			num(r.feed_kg),
			r.water_l == null ? "" : num(r.water_l)
		]), org.name, `Щоденні звіти · ${from} — ${to}`)
	};
}
function defaultPeriod() {
	const to = todayISO();
	return {
		from: addDaysISO(to, -14),
		to
	};
}
function parseKind(raw) {
	return raw === "period" ? "period" : "today";
}
function dateOr(raw, fallback) {
	return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}
async function handleGet(request, token) {
	const url = new URL(request.url);
	const kind = parseKind(url.searchParams.get("kind"));
	const range = defaultPeriod();
	const from = dateOr(url.searchParams.get("from"), range.from);
	const to = dateOr(url.searchParams.get("to"), range.to);
	const sql = await getSql();
	const org = await orgBySheetsToken(sql, token);
	if (!org) return new Response("Недійсне посилання", {
		status: 404,
		headers: { "content-type": "text/plain; charset=utf-8" }
	});
	const file = await buildSheetsTsv(sql, org, kind, from, to);
	return new Response(`\uFEFF${file.body}`, {
		status: 200,
		headers: {
			"content-type": "text/tab-separated-values; charset=utf-8",
			"content-disposition": `inline; filename="${file.filename}"`,
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=120"
		}
	});
}
var Route = createFileRoute("/api/sheets/$token")({ server: { handlers: {
	GET: ({ request, params }) => handleGet(request, params.token),
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: {
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "GET, OPTIONS"
		}
	})
} } });
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var AccountRoute = Route$19.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$21
});
var CostRoute = Route$18.update({
	id: "/cost",
	path: "/cost",
	getParentRoute: () => Route$21
});
var DemoRoute = Route$17.update({
	id: "/demo",
	path: "/demo",
	getParentRoute: () => Route$21
});
var FeedRoute = Route$16.update({
	id: "/feed",
	path: "/feed",
	getParentRoute: () => Route$21
});
var ForecastsRoute = Route$15.update({
	id: "/forecasts",
	path: "/forecasts",
	getParentRoute: () => Route$21
});
var GuideRoute = Route$14.update({
	id: "/guide",
	path: "/guide",
	getParentRoute: () => Route$21
});
var HoldingsRoute = Route$13.update({
	id: "/holdings",
	path: "/holdings",
	getParentRoute: () => Route$21
});
var JournalRoute = Route$12.update({
	id: "/journal",
	path: "/journal",
	getParentRoute: () => Route$21
});
var LoginRoute = Route$11.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$21
});
var PeriodRoute = Route$10.update({
	id: "/period",
	path: "/period",
	getParentRoute: () => Route$21
});
var ReportRoute = Route$9.update({
	id: "/report",
	path: "/report",
	getParentRoute: () => Route$21
});
var SettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$21
});
var TeamRoute = Route$7.update({
	id: "/team",
	path: "/team",
	getParentRoute: () => Route$21
});
var ToolsRoute = Route$6.update({
	id: "/tools",
	path: "/tools",
	getParentRoute: () => Route$21
});
var HoldingsIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => HoldingsRoute
});
var HoldingsOrgIdRoute = Route$4.update({
	id: "/$orgId",
	path: "/$orgId",
	getParentRoute: () => HoldingsRoute
});
var HousesHouseIdRoute = Route$3.update({
	id: "/houses/$houseId",
	path: "/houses/$houseId",
	getParentRoute: () => Route$21
});
var SitesSiteIdRoute = Route$2.update({
	id: "/sites/$siteId",
	path: "/sites/$siteId",
	getParentRoute: () => Route$21
});
var ApiAuthSplatRoute = Route$1.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$21
});
var ApiSheetsTokenRoute = Route.update({
	id: "/api/sheets/$token",
	path: "/api/sheets/$token",
	getParentRoute: () => Route$21
});
var HoldingsRouteChildren = {
	HoldingsOrgIdRoute,
	HoldingsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AccountRoute,
	CostRoute,
	DemoRoute,
	FeedRoute,
	ForecastsRoute,
	GuideRoute,
	HoldingsRoute: HoldingsRoute._addFileChildren(HoldingsRouteChildren),
	JournalRoute,
	LoginRoute,
	PeriodRoute,
	ReportRoute,
	SettingsRoute,
	TeamRoute,
	ToolsRoute,
	HousesHouseIdRoute,
	SitesSiteIdRoute,
	ApiAuthSplatRoute,
	ApiSheetsTokenRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$4 as a, Route$9 as c, Route$16 as d, Route$18 as f, Route$3 as i, Route$12 as l, toTsv as n, Route$7 as o, Route$2 as r, Route$8 as s, router_exports as t, Route$14 as u };
