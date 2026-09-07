import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, d as useRouterState, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as canManageFlocks, d as isDemoUser, f as isPlatformAdmin, h as staffLabel, o as canManageOps } from "./roles-BISHNnDi.mjs";
import { n as signOut } from "./client-BzrKyXF3.mjs";
import { n as cn } from "./org-DsT_3HSb.mjs";
import { n as Wordmark, r as useCurrentUserState } from "./brand-CvpLANUL.mjs";
import { C as getNotifications, M as joinOrganization, N as markAllNotificationsRead, P as markNotificationRead, S as getMe } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, t as Input } from "./input-x1ihG6i4.mjs";
import { B as ChevronDown, C as Package, D as LayoutDashboard, E as LayoutGrid, G as Bell, H as ChartColumn, T as Menu, U as Building2, W as BookOpen, _ as Share, a as Wallet, b as Scale, c as UserPlus, g as Smartphone, i as Wheat, n as Wrench, o as Users, p as Sun, s as UserRound, t as X, u as TrendingUp, v as Settings2, x as Ruler, y as ScrollText, z as ClipboardList } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-BufNlwdv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
var NAV_GROUPS = [
	{
		id: "work",
		label: "Робота"
	},
	{
		id: "tools",
		label: "Інструменти"
	},
	{
		id: "economy",
		label: "Економіка"
	},
	{
		id: "farm",
		label: "Господарство"
	}
];
var NAV_ITEMS = [
	{
		to: "/",
		label: "Сьогодні",
		access: "org",
		group: "work"
	},
	{
		to: "/report",
		label: "Звіт",
		access: "org",
		group: "work"
	},
	{
		to: "/journal",
		label: "Журнал",
		access: "org",
		group: "work"
	},
	{
		to: "/tools",
		label: "Усі інструменти",
		access: "org",
		group: "tools"
	},
	{
		to: "/tools",
		hash: "light",
		label: "Освітлення",
		access: "org",
		group: "tools"
	},
	{
		to: "/tools",
		hash: "premix",
		label: "Премікс",
		access: "org",
		group: "tools"
	},
	{
		to: "/tools",
		hash: "place",
		label: "Посадка",
		access: "org",
		group: "tools"
	},
	{
		to: "/tools",
		hash: "norm",
		label: "Норма кросу",
		access: "org",
		group: "tools"
	},
	{
		to: "/feed",
		label: "Корм",
		access: "org",
		group: "tools"
	},
	{
		to: "/guide",
		label: "Довідник",
		access: "org",
		group: "tools"
	},
	{
		to: "/cost",
		label: "Собівартість",
		access: "org",
		group: "economy"
	},
	{
		to: "/forecasts",
		label: "Прогнози",
		access: "org",
		group: "economy"
	},
	{
		to: "/period",
		label: "Період",
		access: "org",
		group: "economy"
	},
	{
		to: "/holdings",
		label: "Господарства",
		access: "owner",
		group: "farm"
	},
	{
		to: "/settings",
		label: "Посадки",
		access: "flocks",
		group: "farm"
	},
	{
		to: "/team",
		label: "Команда",
		access: "ops",
		group: "farm"
	}
];
function navItemKey(item) {
	return item.hash ? `${item.to}#${item.hash}` : item.to;
}
function navItemVisible(item, profile) {
	if (item.access === "owner") return isPlatformAdmin(profile);
	if (!profile.orgId && isPlatformAdmin(profile)) return false;
	if (item.access === "ops") return canManageOps(profile);
	if (item.access === "flocks") return canManageFlocks(profile);
	return Boolean(profile.orgId) || isPlatformAdmin(profile);
}
function navItemActive(item, pathname, hash) {
	const h = hash.replace(/^#/, "");
	if (item.to === "/") return pathname === "/" && !item.hash;
	if (item.hash) return pathname === item.to && h === item.hash;
	if (item.to === "/tools") return pathname === "/tools" && !h;
	return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
function groupsFor(profile) {
	return NAV_GROUPS.map((g) => ({
		...g,
		items: NAV_ITEMS.filter((n) => n.group === g.id && navItemVisible(n, profile))
	})).filter((g) => g.items.length > 0);
}
function isStandalone() {
	if (typeof window === "undefined") return false;
	const mq = window.matchMedia("(display-mode: standalone)").matches;
	const ios = "standalone" in window.navigator && Boolean(window.navigator.standalone);
	return mq || ios;
}
function isIos() {
	if (typeof navigator === "undefined") return false;
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}
function useInstallApp() {
	const [standalone, setStandalone] = (0, import_react.useState)(false);
	const [ios, setIos] = (0, import_react.useState)(false);
	const [deferred, setDeferred] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setStandalone(isStandalone());
		setIos(isIos());
		function onBip(e) {
			e.preventDefault();
			setDeferred(e);
		}
		function onInstalled() {
			setDeferred(null);
			setDone(true);
			setStandalone(true);
		}
		window.addEventListener("beforeinstallprompt", onBip);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onBip);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);
	async function install() {
		if (!deferred) return false;
		await deferred.prompt();
		const choice = await deferred.userChoice;
		setDeferred(null);
		if (choice.outcome === "accepted") {
			setDone(true);
			setStandalone(true);
			return true;
		}
		return false;
	}
	return {
		standalone,
		ios,
		canPrompt: Boolean(deferred),
		done,
		install
	};
}
function InstallCard({ className }) {
	const { standalone, ios, canPrompt, done, install } = useInstallApp();
	if (standalone || done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Програма на телефоні" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "ПтахоЗвіт уже відкритий як програма. Усі розділи ті самі, що на компʼютері."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary/12 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
					className: "size-5",
					strokeWidth: 1.9
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Поставити на телефон" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Це не окремий магазин додатків — той самий сайт стає програмою на екрані. Звіти, корм, довідник і прогнози працюють офлайн-іконкою, вхід зберігається."
					}),
					canPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: () => void install(),
						children: "Встановити ПтахоЗвіт"
					}) : ios ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 list-decimal space-y-1 pl-4 text-sm text-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Натисніть ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {
									className: "mx-0.5 inline size-3.5",
									strokeWidth: 2
								}),
								" Поділитися в Safari"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Оберіть «На екран Домашній»" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Підтвердіть «Додати»" })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "У Chrome або Edge: меню браузера → «Встановити додаток» / «Додати на головний екран»."
					})
				]
			})]
		})
	});
}
function InstallBanner({ onOpenMore }) {
	const { standalone, canPrompt, install, ios } = useInstallApp();
	const [hidden, setHidden] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (standalone) return;
		try {
			if (localStorage.getItem("ptakhozvit-install-hide") === "1") return;
		} catch {}
		setHidden(false);
	}, [standalone]);
	if (standalone || hidden) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mb-4 flex items-center gap-3 rounded-[16px] bg-surface px-3 py-2.5 shadow-[var(--shadow-border)] md:hidden"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
				className: "size-5 shrink-0 text-primary",
				strokeWidth: 1.9
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1 text-sm",
				children: "Поставте ПтахоЗвіт на екран — як програма, усі розділи з собою."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: () => {
					if (canPrompt) install();
					else onOpenMore?.();
				},
				children: canPrompt ? "Встановити" : ios ? "Як" : "Як"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-9 shrink-0 place-items-center text-muted",
				"aria-label": "Сховати",
				onClick: () => {
					setHidden(true);
					try {
						localStorage.setItem("ptakhozvit-install-hide", "1");
					} catch {}
				},
				children: "×"
			})
		]
	});
}
function ago(iso) {
	const t = Date.parse(iso);
	if (!Number.isFinite(t)) return "";
	const sec = Math.max(0, Math.round((Date.now() - t) / 1e3));
	if (sec < 45) return "щойно";
	if (sec < 3600) return `${Math.round(sec / 60)} хв`;
	if (sec < 86400) return `${Math.round(sec / 3600)} год`;
	const days = Math.round(sec / 86400);
	return days === 1 ? "учора" : `${days} дн.`;
}
function NoticeBell({ className }) {
	const navigate = useNavigate();
	const root = (0, import_react.useRef)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [items, setItems] = (0, import_react.useState)([]);
	const [unread, setUnread] = (0, import_react.useState)(0);
	async function refresh() {
		try {
			const data = await getNotifications();
			setItems(data.items);
			setUnread(data.unread);
		} catch {}
	}
	(0, import_react.useEffect)(() => {
		refresh();
		const id = window.setInterval(() => void refresh(), 25e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (!root.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);
	async function openItem(n) {
		if (!n.read) {
			setItems((prev) => prev.map((x) => x.id === n.id ? {
				...x,
				read: true
			} : x));
			setUnread((c) => Math.max(0, c - 1));
			markNotificationRead({ data: { id: n.id } });
		}
		setOpen(false);
		if (n.href) {
			const url = new URL(n.href, "https://ptakhozvit.local");
			const org = Number(url.searchParams.get("org"));
			if (url.pathname.startsWith("/houses/")) {
				const houseId = url.pathname.split("/")[2] ?? "";
				await navigate({
					to: "/houses/$houseId",
					params: { houseId }
				});
			} else if (url.pathname === "/team") await navigate({
				to: "/team",
				search: Number.isFinite(org) && org > 0 ? { org } : {}
			});
			else if (url.pathname === "/guide") await navigate({ to: "/guide" });
			else if (url.pathname === "/feed") await navigate({ to: "/feed" });
		}
	}
	async function readAll() {
		setItems((prev) => prev.map((x) => ({
			...x,
			read: true
		})));
		setUnread(0);
		await markAllNotificationsRead();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": unread ? `Сповіщення, ${unread} нових` : "Сповіщення",
			onClick: () => {
				setOpen((v) => !v);
				if (!open) refresh();
			},
			className: "relative grid size-11 place-items-center rounded-[12px] text-muted hover:bg-surface-2 hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
				className: "size-5",
				strokeWidth: 1.75
			}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-fg",
				children: unread > 9 ? "9+" : unread
			}) : null]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] bg-surface shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-medium tracking-tight",
					children: "Сповіщення"
				}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs text-muted underline-offset-4 hover:text-fg hover:underline",
					onClick: () => void readAll(),
					children: "Усі прочитані"
				}) : null]
			}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-8 text-sm text-muted",
				children: "Поки тихо. Тут зʼявляться нові звіти і запити в команду."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-80 overflow-y-auto",
				children: items.map((n) => {
					const Icon = n.kind === "join" ? UserPlus : n.kind === "density" ? Scale : n.kind === "handbook" ? BookOpen : ClipboardList;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void openItem(n),
						className: cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2", n.read ? "opacity-70" : ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", n.read ? "bg-bg text-muted" : "bg-primary/15 text-primary"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 1.75
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium text-fg",
										children: n.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 text-[11px] text-subtle",
										children: ago(n.createdAt)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs leading-relaxed text-muted",
									children: n.body
								})]
							}),
							n.read ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-primary" })
						]
					}) }, n.id);
				})
			})]
		}) : null]
	});
}
function Onboarding({ onDone }) {
	const [out, setOut] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-10 font-display text-3xl font-medium tracking-tight",
					children: "Код господарства"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: "Нове господарство відкриває лише хазяїн сайту. Вам потрібен код саме вашої компанії — чужий код не підійде."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinForm, { onDone })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: out,
					onClick: () => {
						setOut(true);
						signOut("/login").catch(() => setOut(false));
					},
					className: "mt-8 text-xs text-muted underline-offset-4 hover:text-fg hover:underline",
					children: out ? "Вихід…" : "Вийти"
				})
			]
		})
	});
}
function JoinForm({ onDone }) {
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await joinOrganization({ data: { code } });
			onDone();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Не вдалося приєднатися");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-4",
		onSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "invite",
					children: "Код запрошення"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "invite",
					value: code,
					onChange: (e) => setCode(e.target.value.toUpperCase()),
					placeholder: "K7MP2Q",
					autoCapitalize: "characters",
					autoComplete: "off",
					maxLength: 12,
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-xs text-muted",
					children: "Шість символів. Кожне господарство має свій код."
				})
			] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				className: "w-full",
				disabled: busy || code.trim().length < 6,
				children: busy ? "Перевірка…" : "Приєднатися"
			})
		]
	});
}
var MOBILE_PRIMARY = [
	"/",
	"/report",
	"/tools"
];
var NAV_OPEN_KEY = "pz-nav";
function iconFor(item) {
	if (item.hash === "light") return Sun;
	if (item.hash === "premix") return Package;
	if (item.hash === "place") return LayoutGrid;
	if (item.hash === "norm") return Ruler;
	switch (item.to) {
		case "/": return LayoutDashboard;
		case "/report": return ClipboardList;
		case "/journal": return ScrollText;
		case "/tools": return Wrench;
		case "/feed": return Wheat;
		case "/guide": return BookOpen;
		case "/cost": return Wallet;
		case "/forecasts": return TrendingUp;
		case "/period": return ChartColumn;
		case "/holdings": return Building2;
		case "/settings": return Settings2;
		case "/team": return Users;
		default: return LayoutDashboard;
	}
}
function readNavOpen() {
	try {
		const raw = localStorage.getItem(NAV_OPEN_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}
function writeNavOpen(open) {
	try {
		localStorage.setItem(NAV_OPEN_KEY, JSON.stringify(open));
	} catch {}
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const [boot, setBoot] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const userId = user?.id;
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		let cancelled = false;
		getMe().then((data) => {
			if (!cancelled) setBoot({
				profile: data.profile,
				sites: data.sites
			});
		}).catch((err) => {
			if (cancelled) return;
			const message = err instanceof Error ? err.message : "Помилка завантаження";
			setError(message);
		});
		return () => {
			cancelled = true;
		};
	}, [userId]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Завантаження сесії…"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: !boot && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Завантаження звітів…"
		})]
	}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: error
		})
	}) : boot && !boot.profile.orgId && !isPlatformAdmin(boot.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Onboarding, { onDone: () => {
		setBoot(null);
		setError(null);
		getMe().then((data) => setBoot({
			profile: data.profile,
			sites: data.sites
		})).catch((err) => {
			setError(err instanceof Error ? err.message : "Помилка завантаження");
		});
	} }) : boot?.profile.role === "pending" && !isPlatformAdmin(boot.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingScreen, { profile: boot.profile }) : boot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellFrame, {
		profile: boot.profile,
		children
	}) : null })] });
}
function PendingScreen({ profile }) {
	const [out, setOut] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-10 max-w-md font-display text-3xl font-medium tracking-tight",
				children: "Очікуєте призначення"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-sm leading-relaxed text-muted",
				children: profile.orgName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Запис у господарстві «",
					profile.orgName,
					"» створено",
					profile.email || profile.fullName ? ` (${profile.email ?? profile.fullName})` : "",
					". Головний технолог або партнер має призначити роль: керівник фабрики, ветеринар або директор."
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Обліковий запис ",
					profile.email ?? profile.fullName ?? "",
					" створено. Головний технолог або партнер має призначити роль."
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-8",
				variant: "secondary",
				disabled: out,
				onClick: () => {
					setOut(true);
					signOut("/login").catch(() => setOut(false));
				},
				children: out ? "Вихід…" : "Вийти"
			})
		]
	});
}
function ShellFrame({ profile, children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const hash = useRouterState({ select: (s) => s.location.hash });
	const groups = (0, import_react.useMemo)(() => groupsFor(profile), [profile]);
	const flat = (0, import_react.useMemo)(() => groups.flatMap((g) => g.items), [groups]);
	const activeGroup = groups.find((g) => g.items.some((i) => navItemActive(i, pathname, hash)))?.id;
	const [open, setOpen] = (0, import_react.useState)(() => {
		const stored = readNavOpen();
		const next = {};
		for (const g of groups) next[g.id] = stored[g.id] ?? true;
		if (activeGroup) next[activeGroup] = true;
		return next;
	});
	const [out, setOut] = (0, import_react.useState)(false);
	const [more, setMore] = (0, import_react.useState)(false);
	const label = staffLabel(profile);
	(0, import_react.useEffect)(() => {
		writeNavOpen(open);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!activeGroup) return;
		setOpen((prev) => prev[activeGroup] ? prev : {
			...prev,
			[activeGroup]: true
		});
	}, [
		pathname,
		hash,
		activeGroup
	]);
	const primary = MOBILE_PRIMARY.map((to) => flat.find((i) => i.to === to && !i.hash)).filter((x) => Boolean(x));
	const tabs = primary.length ? primary : flat.filter((i) => !i.hash).slice(0, 3);
	const moreActive = more || !tabs.some((item) => navItemActive(item, pathname, hash) || item.to !== "/" && pathname.startsWith(item.to) && !item.hash);
	function toggleGroup(id) {
		setOpen((prev) => ({
			...prev,
			[id]: !prev[id]
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-surface/80 backdrop-blur-md md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), profile.orgName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 truncate px-0.5 text-xs text-muted",
							children: profile.orgName
						}) : isPlatformAdmin(profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 truncate px-0.5 text-xs text-muted",
							children: "Усі господарства"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-2",
						children: groups.map((group) => {
							const expanded = open[group.id] !== false;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-expanded": expanded,
								"aria-controls": `nav-${group.id}`,
								onClick: () => toggleGroup(group.id),
								className: "flex h-8 w-full items-center justify-between rounded-[12px] px-2 text-left text-xs font-medium uppercase tracking-[0.12em] text-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-fg",
								children: [group.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									className: cn("size-3.5 shrink-0 text-subtle transition-transform duration-150 ease-[var(--ease-out)]", expanded ? "rotate-0" : "-rotate-90"),
									strokeWidth: 2
								})]
							}), expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								id: `nav-${group.id}`,
								className: "mt-0.5 flex flex-col gap-0.5",
								children: group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavRow, {
									item,
									pathname,
									hash,
									nested: Boolean(item.hash)
								}, navItemKey(item)))
							}) : null] }, group.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: profile.fullName ?? profile.email ?? "Користувач"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/account",
								className: "mt-2 block text-xs text-muted underline-offset-4 hover:text-fg hover:underline",
								children: "Редагувати запис"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: out,
								onClick: () => {
									setOut(true);
									signOut("/login").catch(() => setOut(false));
								},
								className: "mt-2 text-xs text-muted underline-offset-4 hover:text-fg hover:underline",
								children: out ? "Вихід…" : "Вийти"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-10 flex items-center justify-between bg-surface/80 px-4 py-3 backdrop-blur-md md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { compact: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBell, {}),
						canManageOps(profile) && profile.orgId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/team",
							className: "grid size-11 place-items-center text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
								className: "size-5",
								strokeWidth: 1.75
							})
						}) : null,
						canManageFlocks(profile) && profile.orgId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/settings",
							className: "grid size-11 place-items-center text-muted",
							"aria-label": "Посадки",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
								className: "size-5",
								strokeWidth: 1.75
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/account",
							className: "grid size-11 place-items-center text-muted",
							"aria-label": "Профіль",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
								className: "size-5",
								strokeWidth: 1.75
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed right-6 top-4 z-30 hidden md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBell, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "overflow-x-hidden md:pl-60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallBanner, { onOpenMore: () => setMore(true) }),
						isDemoUser(profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 rounded-[16px] bg-primary/10 px-4 py-3 text-sm text-fg",
							children: "Це демонстрація. Дані навчальні, чужих господарств немає. Щоб вести свою ферму — вийдіть і зареєструйтесь."
						}) : null,
						children
					]
				})
			}),
			more ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-fg/25",
					"aria-label": "Закрити",
					onClick: () => setMore(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[24px] bg-surface px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-border-hover)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-medium tracking-tight",
								children: "Усі розділи"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center text-muted",
								"aria-label": "Закрити",
								onClick: () => setMore(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-5",
									strokeWidth: 1.75
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "space-y-4",
							children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-1 text-xs font-medium uppercase tracking-[0.12em] text-subtle",
								children: group.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1.5 grid grid-cols-3 gap-2",
								children: group.items.map((item) => {
									const active = navItemActive(item, pathname, hash);
									const Icon = iconFor(item);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: item.to,
										hash: item.hash,
										onClick: () => setMore(false),
										className: cn("flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-[16px] px-2 text-center text-xs font-medium", active ? "bg-primary text-primary-fg" : "bg-bg text-fg"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "size-5",
											strokeWidth: active ? 2.1 : 1.75
										}), item.label]
									}, navItemKey(item));
								})
							})] }, group.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallCard, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-[16px] bg-bg px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: profile.fullName ?? profile.email
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted",
										children: label
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/account",
										onClick: () => setMore(false),
										className: "grid size-11 place-items-center rounded-[12px] text-muted",
										"aria-label": "Профіль",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
											className: "size-5",
											strokeWidth: 1.75
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: out,
										onClick: () => {
											setOut(true);
											signOut("/login").catch(() => setOut(false));
										},
										className: "text-xs text-muted underline-offset-4 hover:underline",
										children: out ? "Вихід…" : "Вийти"
									})]
								})]
							})]
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: cn("fixed inset-x-0 bottom-0 z-20 grid bg-surface/90 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-md md:hidden", tabs.length > 2 ? "grid-cols-4" : "grid-cols-3"),
				children: [tabs.map((item) => {
					const active = !more && (navItemActive(item, pathname, hash) || item.to === "/tools" && pathname === "/tools");
					const Icon = iconFor(item);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						hash: item.hash,
						onClick: () => setMore(false),
						className: cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[10px] font-medium", active ? "text-primary" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid size-8 place-items-center rounded-[10px]", active ? "bg-primary/12" : ""),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.15 : 1.75
							})
						}), item.to === "/tools" ? "Інструменти" : item.label]
					}, navItemKey(item));
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMore((v) => !v),
					className: cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[10px] font-medium", moreActive ? "text-primary" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-8 place-items-center rounded-[10px]", moreActive ? "bg-primary/12" : ""),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {
							className: "size-5",
							strokeWidth: moreActive ? 2.15 : 1.75
						})
					}), "Ще"]
				})]
			})
		]
	});
}
function NavRow({ item, pathname, hash, nested }) {
	const active = navItemActive(item, pathname, hash);
	const Icon = iconFor(item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		hash: item.hash,
		className: cn("flex h-10 items-center gap-2.5 rounded-[14px] px-2 text-sm transition-colors duration-150", nested && "h-9 pl-3", active ? "bg-primary text-primary-fg shadow-[0_8px_18px_rgb(47_154_76_/_0.22)]" : "text-muted hover:bg-surface-2 hover:text-fg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid size-8 place-items-center rounded-[10px]", nested && "size-7 rounded-[8px]", active ? "bg-white/15" : "bg-surface-2/80"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: cn(nested ? "size-3.5" : "size-4"),
				strokeWidth: active ? 2.1 : 1.75
			})
		}), item.label]
	});
}
//#endregion
export { InstallCard as n, AppShell as t };
