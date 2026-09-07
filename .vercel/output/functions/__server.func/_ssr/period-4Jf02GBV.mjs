import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as fmtNum, s as fmtInt, t as addDaysISO, v as shortSite, y as todayISO } from "./org-DsT_3HSb.mjs";
import { w as getPeriodReport } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { n as FeedBySiteChart } from "./charts-JaYm1jpa.mjs";
import { r as ExportButtons, s as periodWorkbook } from "./export-buttons-cZRyvjVd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/period-4Jf02GBV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Period, {}) });
}
function Period() {
	const today = todayISO();
	const [from, setFrom] = (0, import_react.useState)(addDaysISO(today, -7));
	const [to, setTo] = (0, import_react.useState)(today);
	const [siteId, setSiteId] = (0, import_react.useState)("all");
	const query = (0, import_react.useMemo)(() => ({
		from,
		to,
		siteId: siteId === "all" ? null : Number(siteId)
	}), [
		from,
		to,
		siteId
	]);
	const { data, error, loading } = useAsync(() => getPeriodReport({ data: query }), [query]);
	const totals = (0, import_react.useMemo)(() => {
		if (!data) return null;
		const mort = data.rows.reduce((s, r) => s + r.mortality + r.culled, 0);
		const feed = data.rows.reduce((s, r) => s + r.feedKg, 0);
		const soldHead = data.rows.reduce((s, r) => s + r.soldHead, 0);
		const soldKg = data.rows.reduce((s, r) => s + r.soldWeightKg, 0);
		return {
			mort,
			feed,
			n: data.rows.length,
			soldHead,
			soldKg
		};
	}, [data]);
	const feedChart = (0, import_react.useMemo)(() => {
		if (!data?.rows.length) return {
			points: [],
			keys: []
		};
		const keys = [];
		const seen = /* @__PURE__ */ new Set();
		for (const s of data.sites) {
			const k = shortSite(s.name);
			if (!seen.has(k)) {
				seen.add(k);
				keys.push(k);
			}
		}
		for (const r of data.rows) {
			const k = shortSite(r.siteName);
			if (!seen.has(k)) {
				seen.add(k);
				keys.push(k);
			}
		}
		const byDate = /* @__PURE__ */ new Map();
		for (const r of data.rows) {
			const k = shortSite(r.siteName);
			const cur = byDate.get(r.date) ?? {};
			cur[k] = (cur[k] ?? 0) + r.feedKg;
			byDate.set(r.date, cur);
		}
		const points = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, feedBySite]) => ({
			date,
			feedBySite
		}));
		const used = keys.filter((k) => points.some((p) => (p.feedBySite[k] ?? 0) > 0));
		return {
			points,
			keys: used.length ? used : keys
		};
	}, [data]);
	function downloadCsv() {
		if (!data) return;
		const header = [
			"Дата",
			"Фабрика",
			"Пташник",
			"Доба",
			"Падіж",
			"Вибраковка",
			"Поголів'я",
			"Маса г",
			"Корм кг",
			"FCR",
			"Продаж гол.",
			"Продаж кг",
			"Середня курка г",
			"FCR продажу",
			"Примітка"
		];
		const lines = data.rows.map((r) => [
			r.date,
			r.siteName,
			r.houseName,
			r.ageDays,
			r.mortality,
			r.culled,
			r.head,
			r.avgWeightG,
			r.feedKg,
			r.fcr.toFixed(3),
			r.soldHead,
			r.soldWeightKg,
			r.saleAvgG ? Math.round(r.saleAvgG) : "",
			r.saleFcr ? r.saleFcr.toFixed(3) : "",
			`"${r.notes.replace(/"/g, "''")}"`
		].join(";"));
		const blob = new Blob([[header.join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ptahozvit-${from}-${to}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "Звітність"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "За період"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButtons, {
						spec: data ? periodWorkbook(data.rows, {
							from,
							to,
							orgName: data.profile.orgName,
							siteName: siteId === "all" ? null : data.sites.find((s) => String(s.id) === siteId)?.name ?? null
						}) : null,
						disabled: !data?.rows.length
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: downloadCsv,
						disabled: !data?.rows.length,
						children: "CSV"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "from",
						children: "З"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "from",
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "to",
						children: "По"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "to",
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "sid",
						children: "Фабрика"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						id: "sid",
						value: siteId,
						onChange: (e) => setSiteId(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "Усі"
						}), data?.sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))]
					})] })
				]
			}),
			totals ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Рядків ",
					totals.n,
					" · падіж+вибраковка ",
					fmtInt(totals.mort),
					" гол. · корм ",
					fmtNum(totals.feed, 0),
					" кг",
					totals.soldHead ? ` · продано ${fmtInt(totals.soldHead)} гол. / ${fmtNum(totals.soldKg, 0)} кг` : ""
				]
			}) : null,
			feedChart.points.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Споживання корму за період" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Денна видача по фабриках, кг. Фільтр дат і фабрики вище."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedBySiteChart, {
						data: feedChart.points,
						keys: feedChart.keys
					})
				})
			] }) : null,
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-[24px] bg-surface" }) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[1100px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface-2 text-xs uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Дата"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Фабрика"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Пташник"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Доба"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Падіж"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Маса"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Корм"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "FCR"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Продаж"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Сер. курка"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "FCR здачі"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Примітка"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [data?.rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: r.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: r.siteName.replace("Фабрика ", "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: r.houseName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: r.ageDays
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: [r.mortality, r.culled ? ` +${r.culled}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: [fmtInt(r.avgWeightG), " г"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: fmtNum(r.feedKg, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: fmtNum(r.fcr, 2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: r.soldHead ? `${fmtInt(r.soldHead)} / ${fmtNum(r.soldWeightKg, 0)} кг` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: r.saleAvgG ? `${fmtInt(r.saleAvgG)} г` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 tabular-nums",
								children: r.soldHead ? fmtNum(r.saleFcr, 3) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-[220px] truncate px-4 py-2.5 text-muted",
								children: r.notes || "—"
							})
						]
					}, `${r.date}-${r.houseId}-${i}`)), data && !data.rows.length && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 12,
						className: "px-4 py-10 text-center text-muted",
						children: "Немає звітів за цей період"
					}) }) : null] })]
				})
			})
		]
	});
}
//#endregion
export { Page as component };
