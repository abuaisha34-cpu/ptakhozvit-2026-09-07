import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as fmtNum, o as fmtDateShort, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { h as getDashboard } from "./fns-aaDGwzaQ.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forecasts-COskEqP0.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forecasts, {}) });
}
function Forecasts() {
	const { data, error, loading } = useAsync(() => getDashboard(), []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "До цільового забою"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Прогноз посадки"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Окремо по кожній фабриці і пташнику: маса, щільність і три конверсії корму — зараз, на здачі і прогноз на закриття посадки."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-8",
				children: data.factories.map((factory) => {
					const f = factory.forecast;
					const houses = factory.houses;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-end justify-between gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl font-medium tracking-tight",
									children: factory.site.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-sm text-muted",
									children: [
										factory.activeHouses,
										" активних · ",
										fmtInt(factory.head),
										" гол."
									]
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
										className: "p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] uppercase tracking-wider text-subtle",
											children: "Днів до забою"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-display text-2xl tabular-nums",
											children: f ? fmtInt(f.remainingDays) : "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
										className: "p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] uppercase tracking-wider text-subtle",
											children: "Прогноз маси"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-display text-2xl tabular-nums",
											children: f ? `${fmtInt(f.projectedWeightG)} г` : "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
										className: "p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] uppercase tracking-wider text-subtle",
											children: "FCR на закриття"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-display text-2xl tabular-nums",
											children: f?.projectedFcr ? fmtNum(f.projectedFcr, 3) : "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
										className: "p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] uppercase tracking-wider text-subtle",
											children: "EPEF"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-display text-2xl tabular-nums",
											children: f ? fmtInt(f.projectedEpef) : "—"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full min-w-[720px] text-left text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-surface-2 text-xs uppercase tracking-wide text-subtle",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "Пташник"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "Посадка"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "Доба"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "Маса факт / прогноз"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "кг/м² · ліміт"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "FCR зараз"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "FCR здачі"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "FCR закриття"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 font-medium",
												children: "EPEF"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: houses.map((s) => {
										const hf = s.forecast;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t border-border",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/houses/$houseId",
														params: { houseId: String(s.house.id) },
														className: "hover:underline",
														children: s.house.name
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 tabular-nums text-muted",
													children: s.flock ? fmtDateShort(s.flock.placedAt) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-4 py-3 tabular-nums text-muted",
													children: [s.ageDays, hf ? ` → ${s.ageDays + hf.remainingDays}` : ""]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-4 py-3 tabular-nums",
													children: [
														fmtInt(s.avgWeightG),
														" / ",
														hf ? fmtInt(hf.projectedWeightG) : "—",
														" г"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: s.density?.warn ? "px-4 py-3 tabular-nums text-warn" : "px-4 py-3 tabular-nums",
													children: s.density && s.density.areaM2 > 0 ? s.density.reached ? `${fmtNum(s.density.kgM2, 1)} · ліміт` : s.density.daysToLimit != null ? `${fmtNum(s.density.kgM2, 1)} · ${s.density.reachAgeDays} д.` : fmtNum(s.density.kgM2, 1) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 tabular-nums",
													children: s.fcr ? fmtNum(s.fcr, 3) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 tabular-nums",
													children: s.soldHead ? fmtNum(s.saleFcr, 3) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 tabular-nums",
													children: hf?.projectedFcr ? fmtNum(hf.projectedFcr, 3) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 tabular-nums",
													children: hf ? fmtInt(hf.projectedEpef) : "—"
												})
											]
										}, s.house.id);
									}) })]
								})
							})
						]
					}, factory.site.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Як читати прогноз" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "FCR = увесь корм з посадки ÷ (жива маса залишку + вага здачі − маса курчат). Падіж не рахується як мʼясо, тому погіршує конверсію." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "FCR зараз — на останній звіт. FCR здачі — заморожений на день останнього продажу." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "FCR закриття — прогноз на цільову добу кросу від фактичного приросту і витрати корму." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Маса на забої — від фактичного середнього приросту цієї посадки, не від таблиці кросу." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "EPEF рахується на цільову добу з фактичним падежем і прогнозною конверсією." })
				]
			})] })
		]
	});
}
//#endregion
export { Page as component };
