import { S as require_jsx_runtime, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as canManageFlocks, f as isPlatformAdmin, s as dashboardTitle } from "./roles-BISHNnDi.mjs";
import { c as fmtNum, l as fmtPct, n as cn, o as fmtDateShort, s as fmtInt, t as addDaysISO } from "./org-DsT_3HSb.mjs";
import { r as useCurrentUserState } from "./brand-CvpLANUL.mjs";
import { h as getDashboard } from "./fns-aaDGwzaQ.mjs";
import { K as ArrowRight, V as Check, l as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { a as litterLabel, i as droppingLabel } from "./litter-D5RpUDRr.mjs";
import { r as formatDose } from "./water-meds-a1fez1uw.mjs";
import { n as FactoryJumpNav, r as FactorySummary, t as EmptyStartCard } from "./factory-summary-BngOe8MX.mjs";
import { i as dashboardWorkbook, r as ExportButtons } from "./export-buttons-cZRyvjVd.mjs";
import { t as LoginScreen } from "./login-screen-TavYfF3H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DQV2g_js.js
var import_jsx_runtime = require_jsx_runtime();
function HouseCompare({ houses }) {
	const live = houses.filter((h) => h.flock && h.flock.status !== "closed" && h.ageDays > 0);
	if (live.length < 2) return null;
	const byAge = /* @__PURE__ */ new Map();
	for (const h of live) {
		const bucket = Math.round(h.ageDays / 2) * 2;
		const list = byAge.get(bucket) ?? [];
		list.push(h);
		byAge.set(bucket, list);
	}
	const groups = [...byAge.entries()].map(([age, list]) => ({
		age,
		list
	})).filter((g) => g.list.length >= 2).sort((a, b) => a.age - b.age);
	if (!groups.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.16em] text-subtle",
			children: "Одне господарство"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-xl font-medium tracking-tight",
			children: "Порівняння однолітків"
		})] }), groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-[20px] bg-surface shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[520px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs uppercase tracking-wide text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
							className: "px-4 py-3 font-medium",
							children: [
								"Пташник · ~",
								g.age,
								" доба"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Маса"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "vs норма"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Падіж доби"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Корм г/гол."
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: g.list.slice().sort((a, b) => b.avgWeightG - a.avgWeightG).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/houses/$houseId",
								params: { houseId: String(h.house.id) },
								className: "font-medium hover:underline",
								children: h.house.name
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-2.5 tabular-nums",
							children: [fmtInt(h.avgWeightG), " г"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-4 py-2.5 tabular-nums", h.weightDeltaPct != null && Math.abs(h.weightDeltaPct) > 6 ? "text-warn" : "text-muted"),
							children: h.weightDeltaPct == null ? "—" : `${h.weightDeltaPct > 0 ? "+" : ""}${fmtNum(h.weightDeltaPct, 1)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: cn("px-4 py-2.5 tabular-nums", h.dayMortPct > .25 ? "text-bad" : ""),
							children: fmtPct(h.dayMortPct, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 tabular-nums",
							children: fmtInt(h.feedGPerBird)
						})
					]
				}, h.house.id)) })]
			})
		}, g.age))]
	});
}
function TodayBoard({ factories, today }) {
	const houses = factories.flatMap((f) => f.houses.filter((h) => h.flock && h.flock.status !== "closed").map((h) => ({
		factory: f.site.name,
		house: h
	})));
	if (!houses.length) return null;
	const due = addDaysISO(today, -1);
	const missing = houses.filter((h) => h.house.missingToday).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs uppercase tracking-[0.16em] text-subtle",
				children: ["Звіт за попередню добу · ", fmtDateShort(due)]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-xl font-medium tracking-tight",
				children: "Пташники"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-sm", missing ? "text-warn" : "text-ok"),
				children: missing ? `Немає звіту за вчора: ${missing}` : "Звіти за вчора здано"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: houses.map(({ factory, house: h }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/report",
				search: {
					house: h.house.id,
					date: due
				},
				className: cn("flex items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 shadow-[var(--shadow-border)]", h.missingToday ? "bg-warn/10" : "bg-surface"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate font-medium text-fg",
						children: [factories.length > 1 ? `${factory} · ` : "", h.house.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-muted",
						children: [
							h.ageDays,
							" доба · ",
							fmtInt(h.head),
							" гол.",
							h.missingToday ? " · немає звіту за вчора" : ` · ${fmtInt(h.avgWeightG)} г`
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("grid size-9 shrink-0 place-items-center rounded-full", h.missingToday ? "bg-warn/20 text-warn" : "bg-ok/15 text-ok"),
					children: h.missingToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						className: "size-4",
						strokeWidth: 2
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-4",
						strokeWidth: 2.2
					})
				})]
			}, h.house.id))
		})]
	});
}
function VetBoard({ factories, today }) {
	const houses = factories.flatMap((f) => f.houses.filter((h) => h.flock && h.flock.status !== "closed").map((h) => ({
		factory: f.site.name,
		many: factories.length > 1,
		house: h
	})));
	if (!houses.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs uppercase tracking-[0.16em] text-subtle",
			children: ["Ветеринарний огляд · ", today]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-xl font-medium tracking-tight",
			children: "Падіж, послід, випоювання"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: houses.map(({ factory, many, house: h }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/houses/$houseId",
				params: { houseId: String(h.house.id) },
				className: cn("rounded-[18px] bg-surface px-4 py-3 shadow-[var(--shadow-border)]", h.dayMortPct > .25 || h.missingToday ? "border border-warn/40" : ""),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [many ? `${factory} · ` : "", h.house.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted",
							children: [
								h.ageDays,
								" доба · ",
								fmtInt(h.head),
								" гол."
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("tabular-nums text-sm", h.dayMortPct > .25 ? "text-bad" : "text-muted"),
							children: ["падіж ", fmtPct(h.dayMortPct, 2)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: h.droppingLook || h.litterState ? `${droppingLabel(h.droppingLook)} · ${litterLabel(h.litterState)}` : "послід не вказано"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: h.meds.length ? h.meds.map((m) => formatDose(m)).join("; ") : "випоювання немає"
					})
				]
			}, h.house.id))
		})]
	});
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const { data, error, loading } = useAsync(() => getDashboard(), []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashSkeleton, {});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	if (isPlatformAdmin(data.profile) && !data.profile.orgId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/holdings" });
	const { factories, today, profile, thresholds } = data;
	const due = addDaysISO(today, -1);
	const title = dashboardTitle(profile, factories[0]?.site.name);
	const hasFlocks = factories.some((f) => f.activeHouses > 0);
	const many = factories.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs uppercase tracking-[0.16em] text-subtle",
						children: ["Звіт за попередню добу · ", fmtDateShort(due)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl font-medium tracking-tight md:text-4xl",
						children: title
					}),
					many ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Окреме зведення по кожній фабриці: поголівʼя, падіж, маса, корм і відхилення не змішуються."
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [hasFlocks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButtons, { spec: dashboardWorkbook(factories, {
						today,
						orgName: profile.orgName
					}) }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/report",
						className: "inline-flex h-11 items-center gap-2 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
						children: ["Щоденний звіт", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					})]
				})]
			}),
			!hasFlocks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyStartCard, {
				canPlace: canManageFlocks(profile),
				noFactories: factories.length === 0
			}) : profile.role === "veterinarian" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VetBoard, {
				factories,
				today
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayBoard, {
				factories,
				today
			}),
			hasFlocks && profile.role !== "veterinarian" ? factories.map((factory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseCompare, { houses: factory.houses }, `cmp-${factory.site.id}`)) : null,
			many ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryJumpNav, { factories }) : null,
			profile.role === "veterinarian" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: factories.map((factory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorySummary, {
					factory,
					thresholds,
					headingLevel: "h2",
					showSiteLink: many,
					showHeading: true
				}, factory.site.id))
			})
		]
	});
}
function DashSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-64 animate-pulse rounded-lg bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" })
		]
	});
}
//#endregion
export { Home as component };
