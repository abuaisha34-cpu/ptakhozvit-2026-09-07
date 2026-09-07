import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as canManageFlocks, f as isPlatformAdmin, r as canDeleteReports } from "./roles-BISHNnDi.mjs";
import { n as cn, o as fmtDateShort, s as fmtInt, t as addDaysISO, y as todayISO } from "./org-DsT_3HSb.mjs";
import { E as getRecycleBin, R as restoreFlock, x as getJournal, z as restoreReport } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { l as Route$12 } from "./router-CKSXmWZm.mjs";
import { n as ENTITY_LABEL, o as journalWorkbook, r as ExportButtons, t as ACTION_LABEL } from "./export-buttons-cZRyvjVd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/journal-Bo8jyiA6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function when(iso) {
	const t = Date.parse(iso);
	if (!Number.isFinite(t)) return iso;
	return new Intl.DateTimeFormat("uk-UA", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Europe/Kyiv"
	}).format(new Date(t));
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Journal, {}) });
}
function Journal() {
	const { org } = Route$12.useSearch();
	const navigate = useNavigate();
	const today = todayISO();
	const [from, setFrom] = (0, import_react.useState)(addDaysISO(today, -14));
	const [to, setTo] = (0, import_react.useState)(today);
	const [siteId, setSiteId] = (0, import_react.useState)("all");
	const [action, setAction] = (0, import_react.useState)("all");
	const query = (0, import_react.useMemo)(() => ({
		from,
		to,
		siteId: siteId === "all" ? null : Number(siteId),
		orgId: org,
		action: action === "all" ? void 0 : action
	}), [
		from,
		to,
		siteId,
		org,
		action
	]);
	const { data, error, loading } = useAsync(() => getJournal({ data: query }), [query]);
	function open(ev) {
		if (!ev.href) return;
		const url = new URL(ev.href, "https://ptakhozvit.local");
		const orgQ = Number(url.searchParams.get("org"));
		if (url.pathname.startsWith("/houses/")) navigate({
			to: "/houses/$houseId",
			params: { houseId: url.pathname.split("/")[2] ?? "" }
		});
		else if (url.pathname.startsWith("/sites/")) navigate({
			to: "/sites/$siteId",
			params: { siteId: url.pathname.split("/")[2] ?? "" }
		});
		else if (url.pathname.startsWith("/holdings/")) navigate({
			to: "/holdings/$orgId",
			params: { orgId: url.pathname.split("/")[2] ?? "" }
		});
		else if (url.pathname === "/team") navigate({
			to: "/team",
			search: Number.isFinite(orgQ) && orgQ > 0 ? { org: orgQ } : {}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Журнал"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Хто створив або змінив звіт, посадку, фабрику чи запис у команді. Помилково видалене — у кошику нижче, історія пташника не зникає."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButtons, {
					spec: data ? journalWorkbook(data.events, {
						from,
						to,
						orgName: data.profile.orgName
					}) : null,
					disabled: !data?.events.length
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "j-from",
						children: "З дати"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "j-from",
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "j-to",
						children: "По дату"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "j-to",
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "j-site",
						children: "Фабрика"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						id: "j-site",
						value: siteId,
						onChange: (e) => setSiteId(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Усі"
						}), (data?.sites ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "j-act",
						children: "Дія"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						id: "j-act",
						value: action,
						onChange: (e) => setAction(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Усі"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "create",
								children: "Створено"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "update",
								children: "Змінено"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "delete",
								children: "Видалено"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "join",
								children: "Заявка"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "assign",
								children: "Призначено"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "restore",
								children: "Повернуто"
							})
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecyclePanel, { orgId: org }),
			data && !loading && isPlatformAdmin(data.profile) && !data.sites.length && !org ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Відкрийте господарство в",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/holdings",
						className: "underline underline-offset-4",
						children: "списку"
					}),
					", щоб бачити його журнал."
				]
			}) : null,
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" }) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: error
			}) : null,
			data && !loading ? data.events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "За цей період записів немає."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-[24px] bg-surface shadow-[var(--shadow-border)]",
				children: data.events.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-border last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => open(ev),
						disabled: !ev.href,
						className: cn("flex w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-start sm:gap-4", ev.href ? "hover:bg-surface-2" : "cursor-default"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-36 shrink-0 text-xs text-subtle",
							children: when(ev.createdAt)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("rounded-full px-2 py-0.5 text-[11px] font-medium", ev.action === "delete" ? "bg-bad/15 text-bad" : ev.action === "restore" ? "bg-ok/15 text-ok" : ev.action === "create" ? "bg-ok/15 text-ok" : "bg-bg text-muted"),
									children: [
										ACTION_LABEL[ev.action],
										" · ",
										ENTITY_LABEL[ev.entity]
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium text-fg",
									children: ev.actorName
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-muted",
								children: ev.summary
							})]
						})]
					})
				}, ev.id))
			}) : null
		]
	});
}
function RecyclePanel({ orgId }) {
	const [tick, setTick] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const { data, error, loading } = useAsync(() => getRecycleBin({ data: orgId ? { orgId } : {} }), [orgId, tick]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-[24px] bg-surface" });
	if (error || !data) return null;
	const canFlock = canManageFlocks(data.profile);
	const canReport = canDeleteReports(data.profile) || canFlock;
	if (!canFlock && !canReport) return null;
	const { flocks, reports } = data.bin;
	const empty = !flocks.length && !reports.length;
	async function restore(kind, id) {
		const key = `${kind}-${id}`;
		setBusy(key);
		setMsg(null);
		try {
			if (kind === "flock") await restoreFlock({ data: { flockId: id } });
			else await restoreReport({ data: { reportId: id } });
			setTick((n) => n + 1);
			setMsg("Повернуто. Історія пташника на місці.");
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Не вдалося повернути");
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Кошик" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Помилково видалена посадка або звіт лежать тут. Повернення не затирає інші дні. Якщо в пташнику вже є нова активна посадка — стара стане архівом з усіма звітами."
		}),
		empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Кошик порожній."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [flocks.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium",
					children: [
						"Посадка ",
						f.code,
						" · ",
						f.siteName,
						", ",
						f.houseName
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						fmtDateShort(f.placedAt),
						" · ",
						fmtInt(f.chicksPlaced),
						" гол. · ",
						f.breed,
						" · звітів",
						" ",
						f.reportCount
					]
				})] }), canFlock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: busy === `flock-${f.id}`,
					onClick: () => void restore("flock", f.id),
					children: busy === `flock-${f.id}` ? "…" : "Повернути"
				}) : null]
			}, `f-${f.id}`)), reports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium",
					children: [
						"Звіт ",
						fmtDateShort(r.reportDate),
						" · ",
						r.siteName,
						", ",
						r.houseName
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						r.flockCode,
						" · ",
						r.ageDays,
						" доба · ",
						fmtInt(r.avgWeightG),
						" г · корм ",
						fmtInt(r.feedKg),
						" кг"
					]
				})] }), canReport ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					disabled: busy === `report-${r.id}`,
					onClick: () => void restore("report", r.id),
					children: busy === `report-${r.id}` ? "…" : "Повернути"
				}) : null]
			}, `r-${r.id}`))]
		}),
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: msg
		}) : null
	] });
}
//#endregion
export { Page as component };
