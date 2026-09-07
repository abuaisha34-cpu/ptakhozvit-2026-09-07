import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as fmtNum, g as pctDelta, l as fmtPct, n as cn, o as fmtDateShort, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { K as ArrowRight, l as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as StatusBadge } from "./badge-C54FFsVZ.mjs";
import { a as MortChart, i as FeedPerBirdChart, r as FeedKgChart, s as WeightChart } from "./charts-JaYm1jpa.mjs";
import { t as FactoryWeatherLine } from "./weather-panel-nJeJGT7J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/factory-summary-BngOe8MX.js
var import_jsx_runtime = require_jsx_runtime();
function FactorySummary({ factory, thresholds, housesVariant = "chips", headingLevel = "h2", showSiteLink = false, showHeading = true }) {
	const hasFlocks = factory.activeHouses > 0;
	const Heading = headingLevel;
	const last = factory.series.at(-1);
	const feedDelta = factory.feedDeltaPct ?? (last ? pctDelta(last.feedGPerBird, last.stdFeedGPerBird) : null);
	const feedTone = feedDelta == null ? void 0 : Math.abs(feedDelta) > thresholds.feedPct ? "bad" : "ok";
	const feedHint = factory.feedGPerBird > 0 ? `${fmtInt(factory.feedGPerBird)} г/гол.${feedDelta == null ? "" : ` · ${feedDelta > 0 ? "+" : ""}${fmtNum(feedDelta, 1)}% до норми`}` : void 0;
	const ranked = [...factory.deviations].sort((a, b) => {
		const rank = {
			critical: 0,
			warn: 1,
			watch: 2,
			ok: 3
		};
		return rank[a.severity] - rank[b.severity];
	});
	const headingClass = headingLevel === "h1" ? "font-display text-3xl font-medium tracking-tight md:text-4xl" : "font-display text-xl font-medium tracking-tight md:text-2xl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: `factory-${factory.site.id}`,
		className: "scroll-mt-20 space-y-5 rounded-[24px] bg-surface p-4 shadow-[var(--shadow-border)] md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						showHeading ? showSiteLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/sites/$siteId",
							params: { siteId: String(factory.site.id) },
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
								className: cn(headingClass, "text-fg"),
								children: factory.site.name
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
							className: headingClass,
							children: factory.site.name
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("text-sm text-muted", showHeading ? "mt-1" : ""),
							children: [
								factory.site.location,
								" · ",
								factory.houses.length,
								" пташники · активних ",
								factory.activeHouses,
								hasFlocks ? ` · ${fmtInt(factory.head)} гол. з ${fmtInt(factory.placed)}` : "",
								factory.missingToday ? ` · немає звіту за вчора: ${factory.missingToday}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryWeatherLine, {
							place: factory.weatherPlace ?? factory.site.geoName,
							weather: factory.weather,
							climate: factory.climate
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: factory.status }), showSiteLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/sites/$siteId",
						params: { siteId: String(factory.site.id) },
						className: "inline-flex h-11 items-center gap-1.5 rounded-[12px] bg-bg px-3 text-sm text-muted hover:text-fg",
						children: ["Фабрика", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					}) : null]
				})]
			}),
			hasFlocks ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Поголів'я",
						value: fmtInt(factory.head),
						hint: `з ${fmtInt(factory.placed)} посадки`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Падіж / добу",
						value: fmtPct(factory.dayMortPct, 2),
						hint: `${fmtInt(factory.dayMortality)} гол.`,
						tone: factory.dayMortPct > .25 ? "bad" : "ok"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Сер. маса",
						value: `${fmtInt(factory.avgWeightG)} г`,
						hint: `FCR ${fmtNum(factory.fcr, 3)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Корм / добу",
						value: factory.feedKg > 0 ? `${fmtInt(factory.feedKg)} кг` : "—",
						hint: feedHint,
						tone: feedTone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "EPEF",
						value: factory.epef ? fmtInt(factory.epef) : "—",
						hint: factory.forecast ? `до забою ${factory.forecast.remainingDays} діб · ${fmtInt(factory.forecast.projectedWeightG)} г` : void 0,
						className: "col-span-2 lg:col-span-1"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Немає активної посадки на цій фабриці."
			}),
			factory.soldHead > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums text-muted",
				children: [
					"Продано ",
					fmtInt(factory.soldHead),
					" гол. · ",
					fmtNum(factory.soldWeightKg, 0),
					" кг"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("grid gap-2", housesVariant === "cards" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"),
				children: factory.houses.map((h) => housesVariant === "cards" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseCard, { item: h }, h.house.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseChip, { item: h }, h.house.id))
			}),
			hasFlocks && ranked.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Відхилення цієї фабрики"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Порівняння з нормою кросу на фактичну добу кожного пташника."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: ranked.slice(0, 8).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviationRow, { item: d }, d.id))
				})
			] }) : null,
			factory.series.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-medium tracking-tight",
							children: "Жива маса проти норми"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Середнє зважене по пташниках цієї фабрики, останні 14 діб."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeightChart, { data: factory.series })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-medium tracking-tight",
							children: "Добовий падіж"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Частка від ранкового поголівʼя фабрики."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MortChart, { data: factory.series })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-medium tracking-tight",
							children: "Корм, кг проти норми"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Факт видачі на ранкове поголівʼя цієї фабрики."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedKgChart, { data: factory.series })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg font-medium tracking-tight",
							children: "Корм на голову"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Грамами на голову за добу. Не залежить від розміру посадки."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedPerBirdChart, { data: factory.series })
						})
					] })
				]
			}) : null,
			factory.forecast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					"Прогноз до забою: ",
					factory.forecast.remainingDays,
					" діб · ",
					fmtInt(factory.forecast.projectedWeightG),
					" г · EPEF ",
					fmtInt(factory.forecast.projectedEpef)
				]
			}) : null
		]
	});
}
function FactoryJumpNav({ factories }) {
	if (factories.length < 2) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Фабрики",
		className: "flex flex-wrap gap-2",
		children: factories.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: `#factory-${f.site.id}`,
			className: "inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-fg",
					children: shortFactory(f.site.name)
				}),
				f.activeHouses ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums text-muted",
					children: fmtInt(f.head)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: "немає посадки"
				}),
				f.missingToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-bad",
					children: f.missingToday
				}) : null
			]
		}, f.site.id))
	});
}
function HouseChip({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/houses/$houseId",
		params: { houseId: String(item.house.id) },
		className: "block rounded-[16px] bg-bg px-3 py-3 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-fg",
				children: item.house.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: item.status })]
		}), item.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-display text-xl tabular-nums tracking-tight",
				children: [fmtInt(item.head), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1 font-sans text-xs font-normal text-muted",
					children: "гол."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					item.ageDays,
					" доба · ",
					item.flock.breed,
					" · пос. ",
					fmtDateShort(item.flock.placedAt)
				]
			}),
			item.lastReportDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs tabular-nums text-muted",
				children: [
					fmtInt(item.avgWeightG),
					" г",
					chipDelta(item.weightDeltaPct),
					" · ",
					"корм",
					chipDelta(item.feedDeltaPct),
					item.waterDeltaPct != null ? ` · вода${chipDelta(item.waterDeltaPct)}` : ""
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: item.missingToday ? "Немає звіту за вчора" : "Звіт за сьогодні не потрібен"
			}),
			item.density && item.density.areaM2 > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mt-1 text-xs tabular-nums", item.density.warn ? "text-warn" : "text-muted"),
				children: [
					fmtNum(item.density.kgM2, 1),
					" кг/м²",
					item.density.reached ? ` · ліміт ${item.density.limitKgM2} кг/м² уже` : item.density.daysToLimit != null ? ` · ${item.density.limitKgM2} кг/м² на ${item.density.reachAgeDays} добу` : ""
				]
			}) : null,
			item.soldHead > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs tabular-nums text-muted",
				children: [
					"продано ",
					fmtInt(item.soldHead),
					" гол. · сер. ",
					fmtInt(item.saleAvgG),
					" г · FCR ",
					fmtNum(item.saleFcr, 3)
				]
			}) : null
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted",
			children: "Немає активної посадки"
		})]
	});
}
function HouseCard({ item }) {
	const o = item;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/houses/$houseId",
		params: { houseId: String(item.house.id) },
		className: "block rounded-[16px] bg-bg p-4 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl font-medium tracking-tight",
				children: item.house.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: [
					"Місткість ",
					fmtInt(item.house.capacity),
					item.house.areaM2 > 0 ? ` · ${fmtInt(item.house.areaM2)} м²` : ""
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: item.status })]
		}), o.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-display text-3xl tabular-nums tracking-tight",
				children: [fmtInt(o.head), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-1.5 font-sans text-sm font-normal text-muted",
					children: "гол."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					o.ageDays,
					" доба · ",
					o.flock.breed,
					" · посадка ",
					fmtDateShort(o.flock.placedAt),
					" · ",
					o.flock.code
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-3 gap-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Маса",
						v: `${fmtInt(o.avgWeightG)} г`,
						s: chipDelta(o.weightDeltaPct).trim()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Корм",
						v: `${fmtInt(o.feedGPerBird)} г`,
						s: chipDelta(o.feedDeltaPct).trim()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "кг/м²",
						v: o.density && o.density.areaM2 > 0 ? fmtNum(o.density.kgM2, 1) : "—",
						s: o.density?.reached ? `ліміт ${o.density.limitKgM2} уже` : o.density?.daysToLimit != null ? `${o.density.limitKgM2} на ${o.density.reachAgeDays} д.` : chipDelta(o.waterDeltaPct).trim()
					})
				]
			}),
			o.soldHead > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs tabular-nums text-muted",
				children: [
					"Продано ",
					fmtInt(o.soldHead),
					" гол. · ",
					fmtNum(o.soldWeightKg, 0),
					" кг · сер. ",
					fmtInt(o.saleAvgG),
					" г · FCR",
					" ",
					fmtNum(o.saleFcr, 3)
				]
			}) : null
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "Немає активної посадки. Відкрийте її в параметрах."
		})]
	});
}
function Mini({ k, v, s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[12px] bg-surface px-2 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] uppercase tracking-wide text-subtle hyphens-none",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 tabular-nums text-fg",
				children: v
			}),
			s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] text-muted",
				children: s
			}) : null
		]
	});
}
function chipDelta(pct) {
	if (pct == null) return "";
	return ` ${pct > 0 ? "+" : ""}${fmtNum(pct, 1)}%`;
}
function Kpi({ label, value, hint, tone, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-[16px] bg-bg px-3 py-3", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-subtle hyphens-none",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1.5 font-display text-2xl tabular-nums tracking-tight md:text-3xl", tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : "text-fg"),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function DeviationRow({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-3 py-3 first:pt-0 last:pb-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
			className: cn("mt-0.5 size-4 shrink-0", toneClass(item.severity)),
			strokeWidth: 1.75
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mr-2 text-[11px] uppercase tracking-wide", toneClass(item.severity)),
					children: item.severity === "critical" ? "Критично" : item.severity === "warn" ? "Увага" : "Нагляд"
				}), item.title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: item.detail
			})]
		})]
	});
}
function toneClass(s) {
	if (s === "critical") return "text-bad";
	if (s === "warn") return "text-warn";
	if (s === "watch") return "text-watch";
	return "text-ok";
}
function shortFactory(name) {
	return name.replace(/^Фабрика\s+/, "").replace(/[«»]/g, "");
}
function EmptyStartCard({ canPlace, noFactories }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: noFactories ? "Немає фабрик" : "Чистий старт" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: noFactories ? "Додайте першу фабрику — назву, кількість пташників і місткість. Потім відкрийте посадку." : "Відкрийте посадку в кожному пташнику, вкажіть крос — норми корму і води підтягнуться самі. Потім керівники подають щоденний звіт."
		}),
		canPlace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/settings",
			className: "mt-4 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg",
			children: noFactories ? "Додати фабрику" : "Відкрити посадки"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "Зачекайте, поки керівник фабрики або технолог відкриє посадку."
		})
	] });
}
//#endregion
export { FactoryJumpNav as n, FactorySummary as r, EmptyStartCard as t };
