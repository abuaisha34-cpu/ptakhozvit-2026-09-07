import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as canDeleteReports } from "./roles-BISHNnDi.mjs";
import { b as yesterdayISO, c as fmtNum, i as eachDateISO, l as fmtPct, n as cn, o as fmtDateShort, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { K as saveFlockTreatments, b as getHouseDetail, c as deleteDailyReport } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { i as Route$3 } from "./router-CKSXmWZm.mjs";
import { t as StatusBadge } from "./badge-C54FFsVZ.mjs";
import { a as litterLabel, i as droppingLabel } from "./litter-D5RpUDRr.mjs";
import { r as formatDose } from "./water-meds-a1fez1uw.mjs";
import { t as TreatmentCalendarCard } from "./treatment-calendar-aA5wPRYW.mjs";
import { a as MortChart, i as FeedPerBirdChart, o as WaterPerBirdChart, r as FeedKgChart, s as WeightChart, t as CumFeedChart } from "./charts-JaYm1jpa.mjs";
import { a as houseWorkbook, r as ExportButtons } from "./export-buttons-cZRyvjVd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/houses._houseId-B2_kZwIU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { houseId } = Route$3.useParams();
	const { flock } = Route$3.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseView, {
		houseId: Number(houseId),
		flockId: flock
	}) });
}
function HouseView({ houseId, flockId }) {
	const [tick, setTick] = (0, import_react.useState)(0);
	const { data, error, loading } = useAsync(() => getHouseDetail({ data: {
		houseId,
		flockId
	} }), [
		houseId,
		flockId,
		tick
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	const o = data.overview;
	const f = o?.forecast;
	const last = data.series.at(-1);
	const feedDelta = last && last.stdFeedGPerBird ? (last.feedGPerBird - last.stdFeedGPerBird) / last.stdFeedGPerBird * 100 : null;
	const waterDelta = last && last.waterMlPerBird != null && last.stdWaterMlPerBird ? (last.waterMlPerBird - last.stdWaterMlPerBird) / last.stdWaterMlPerBird * 100 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/sites/$siteId",
						params: { siteId: String(data.site.id) },
						className: "text-xs text-muted hover:text-fg",
						children: ["← ", data.site.name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: data.house.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							"Місткість ",
							fmtInt(data.house.capacity),
							data.house.areaM2 > 0 ? ` · ${fmtInt(data.house.areaM2)} м²` : "",
							data.flock ? ` · ${data.flock.code} · посадка ${fmtDateShort(data.flock.placedAt)} · ${data.flock.breed}${data.flock.status === "closed" && data.flock.closedAt ? ` · здано ${fmtDateShort(data.flock.closedAt)}` : ""}` : " · немає активної посадки"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [data.reports.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportButtons, { spec: houseWorkbook({
						siteName: data.site.name,
						houseName: data.house.name,
						flockCode: data.flock?.code,
						breed: data.flock?.breed,
						placedAt: data.flock?.placedAt,
						reports: data.reports
					}) }) : null, o ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status }) : null]
				})]
			}),
			data.flock && data.flock.status !== "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissingBanner, {
				houseId: data.house.id,
				placedAt: data.flock.placedAt,
				reportDates: data.reports.map((r) => r.reportDate)
			}) : null,
			data.pastFlocks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Архів посадок" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [data.pastFlocks.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/houses/$houseId",
					params: { houseId: String(houseId) },
					search: { flock: f.id },
					className: "inline-flex h-11 items-center rounded-[12px] bg-bg px-3 text-sm text-muted hover:text-fg",
					children: [
						f.code,
						" · ",
						fmtDateShort(f.placedAt),
						f.closedAt ? ` — ${fmtDateShort(f.closedAt)}` : ""
					]
				}, f.id)), data.flock?.status === "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/houses/$houseId",
					params: { houseId: String(houseId) },
					className: "inline-flex h-11 items-center rounded-[12px] bg-primary px-3 text-sm text-primary-fg",
					children: "Активна"
				}) : null]
			})] }) : null,
			data.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TreatmentCalendarCard, {
				title: "Календар обробок",
				hint: data.canEditTreatments ? "Технолог або ветлікар може змінити добу, назву, додати обробку або позначити «зроблено». Це лише ця посадка." : "Графік вакцинацій і обробок цієї посадки. Фактичне випоювання — нижче, зі щоденних звітів.",
				items: data.treatments,
				canEdit: data.canEditTreatments,
				ageDays: data.overview?.ageDays,
				flockMode: true,
				onSave: async (items) => {
					await saveFlockTreatments({ data: {
						flockId: data.flock.id,
						items
					} });
					setTick((n) => n + 1);
				}
			}) : null,
			data.flock && data.reports.some((r) => r.meds.length) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Фактичне випоювання" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1 text-sm text-muted",
				children: data.reports.filter((r) => r.meds.length).slice(-8).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					r.reportDate,
					": ",
					r.meds.map((m) => formatDose(m)).join("; ")
				] }, r.id))
			})] }) : null,
			o ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Поголівʼя",
						v: fmtInt(o.head)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Доба",
						v: String(o.ageDays)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Падіж з посадки",
						v: fmtPct(o.cumMortPct, 2),
						s: `норма ${fmtPct(o.stdCumMortPct, 2)} · продаж не входить`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Маса",
						v: `${fmtInt(o.avgWeightG)} г`,
						s: o.weightDeltaPct != null ? `${o.weightDeltaPct > 0 ? "+" : ""}${fmtNum(o.weightDeltaPct, 1)}%` : ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "кг/м²",
						v: o.density && o.density.areaM2 > 0 ? fmtNum(o.density.kgM2, 1) : "вкажіть площу",
						s: o.density?.reached ? `ліміт ${o.density.limitKgM2} кг/м² уже` : o.density?.daysToLimit != null ? `${o.density.limitKgM2} кг/м² · ${o.density.reachAgeDays} доба · ${fmtDateShort(o.density.reachDate)}` : o.house.areaM2 > 0 ? "прогноз за приростом" : "площа в параметрах пташника"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Продано",
						v: o.soldHead ? `${fmtInt(o.soldHead)} гол.` : "—",
						s: o.soldHead ? `${fmtNum(o.soldWeightKg, 0)} кг · сер. ${fmtInt(o.saleAvgG)} г` : "ще немає здачі"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Корм / добу",
						v: last ? `${fmtInt(last.feedKg)} кг` : "—",
						s: last ? `${fmtInt(last.feedGPerBird)} г/гол.${feedDelta != null ? ` · ${feedDelta > 0 ? "+" : ""}${fmtNum(feedDelta, 1)}%` : ""}` : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Вода / добу",
						v: last?.waterMlPerBird != null ? `${fmtInt(last.waterMlPerBird)} мл` : "—",
						s: last ? `норма ${fmtInt(last.stdWaterMlPerBird)} мл${waterDelta != null ? ` · ${waterDelta > 0 ? "+" : ""}${fmtNum(waterDelta, 1)}%` : ""}` : void 0
					})
				]
			}) : null,
			o ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Конверсія корму" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Корм з посадки, кг ÷ приріст живої маси (залишок + здача − маса курчат). Падіж у знаменник не входить — тому FCR гірший, якщо птиця гине."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FcrCell, {
							k: "Зараз",
							v: o.fcr ? fmtNum(o.fcr, 3) : "—",
							s: `норма кросу ${fmtNum(o.stdFcr, 3)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FcrCell, {
							k: "На здачі",
							v: o.soldHead ? fmtNum(o.saleFcr, 3) : "—",
							s: o.soldHead ? `${fmtInt(o.soldHead)} гол. · ${fmtNum(o.soldWeightKg, 0)} кг` : "поки не здавали"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FcrCell, {
							k: "Прогноз на закриття",
							v: f?.projectedFcr ? fmtNum(f.projectedFcr, 3) : "—",
							s: f ? `${fmtInt(f.remainingDays)} діб · ${fmtInt(f.projectedWeightG)} г · ${fmtInt(f.projectedHead)} гол.` : "немає посадки"
						})
					]
				})
			] }) : null,
			f ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Днів до забою",
						v: fmtInt(f.remainingDays)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Прогноз маси",
						v: `${fmtInt(f.projectedWeightG)} г`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "EPEF на забої",
						v: fmtInt(f.projectedEpef)
					})
				]
			}) : null,
			o && o.deviations.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Відхилення" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: o.deviations.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-fg",
							children: [d.title, "."]
						}),
						" ",
						d.detail
					]
				}, d.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Маса" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightChart, { data: data.series.map((r) => ({
						date: r.date,
						weight: r.weight,
						stdWeight: r.stdWeight
					})) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Падіж, %" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MortChart, { data: data.series.map((r) => ({
						date: r.date,
						mortPct: r.dayMortPct
					})) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Корм за добу, кг" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Факт видачі проти норми кросу на поголівʼя ранку."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedKgChart, { data: data.series })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Корм на голову, г" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Незалежно від розміру посадки — зручно ловити перевитрату."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedPerBirdChart, { data: data.series })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Вода на голову, мл" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Норма кросу ",
								data.flock?.breed ?? "",
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaterPerBirdChart, { data: data.series })
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Накопичений корм" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Сума з посадки. Якщо факт вище норми при відставанні за масою — FCR уже гірший за план."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CumFeedChart, { data: data.series })
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2 md:hidden",
				children: [...data.reports].reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [
									r.reportDate,
									" · ",
									r.ageDays,
									" доба"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/report",
								search: {
									house: data.house.id,
									date: r.reportDate
								},
								className: "text-xs text-muted",
								children: "Змінити"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"падіж ",
								r.mortality,
								r.culled ? `+${r.culled}` : "",
								" · ",
								fmtInt(r.headEnd),
								" гол. · ",
								fmtInt(r.avgWeightG),
								" г"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [r.droppingLook || r.litterState ? `${droppingLabel(r.droppingLook)} · ${litterLabel(r.litterState)}` : "послід —", r.meds.length ? ` · ${r.meds.map((m) => formatDose(m)).join("; ")}` : ""]
						}),
						r.droppingPhoto ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: r.droppingPhoto,
							alt: "",
							className: "mt-2 max-h-32 rounded-[12px] object-cover"
						}) : null
					]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)] md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[980px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface-2 text-xs uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Дата"
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
								children: "Поголівʼя"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Маса"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Продаж"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Корм"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Вода"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "t°"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Послід"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Випоювання"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "Примітка"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-medium" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: [...data.reports].reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: r.reportDate
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: r.ageDays
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-2 tabular-nums",
								children: [r.mortality, r.culled ? `+${r.culled}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: fmtInt(r.headEnd)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: fmtInt(r.avgWeightG)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: r.soldHead ? `${fmtInt(r.soldHead)} / ${fmtNum(r.soldWeightKg, 0)} кг · ${fmtInt(r.soldWeightKg * 1e3 / r.soldHead)} г` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: fmtNum(r.feedKg, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 tabular-nums",
								children: r.waterL != null ? fmtNum(r.waterL, 0) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-2 tabular-nums",
								children: [
									r.tempMin ?? "—",
									"–",
									r.tempMax ?? "—"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2 text-xs text-muted",
								children: r.droppingLook || r.litterState ? `${droppingLabel(r.droppingLook)} · ${litterLabel(r.litterState)}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-[220px] px-4 py-2 text-xs text-muted",
								children: r.meds.length ? r.meds.map((m) => formatDose(m)).join("; ") : "немає"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "max-w-[200px] truncate px-4 py-2 text-muted",
								children: r.notes || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/report",
										search: {
											house: data.house.id,
											date: r.reportDate
										},
										className: "inline-flex h-9 items-center rounded-[10px] px-3 text-xs font-medium text-muted hover:bg-bg hover:text-fg",
										children: "Змінити"
									}), canDeleteReports(data.profile) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: async () => {
											if (!window.confirm(`Надіслати звіт за ${r.reportDate} в кошик? Його можна повернути в Журналі.`)) return;
											await deleteDailyReport({ data: { reportId: r.id } });
											setTick((n) => n + 1);
										},
										children: "Видалити"
									}) : null]
								})
							})
						]
					}, r.id)) })]
				})
			})
		]
	});
}
function Mini({ k, v, s, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn("p-4", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-subtle hyphens-none",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl tabular-nums tracking-tight",
				children: v
			}),
			s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: s
			}) : null
		]
	});
}
function FcrCell({ k, v, s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[16px] bg-bg px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-subtle",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl tabular-nums tracking-tight",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: s
			})
		]
	});
}
function MissingBanner({ houseId, placedAt, reportDates }) {
	const have = new Set(reportDates);
	const missing = eachDateISO(placedAt, yesterdayISO()).filter((d) => !have.has(d));
	if (!missing.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-fg",
		children: [
			"Немає звітів за ",
			missing.length,
			" ",
			missing.length === 1 ? "добу" : "діб",
			" від посадки до вчора. Можна внести заднім числом — від ",
			fmtDateShort(missing[0]),
			"."
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/report",
		search: {
			house: houseId,
			date: missing[0]
		},
		className: "mt-3 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
		children: ["Заповнити з ", fmtDateShort(missing[0])]
	})] });
}
//#endregion
export { Page as component };
