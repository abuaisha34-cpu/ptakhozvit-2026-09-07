import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as isPlatformAdmin } from "./roles-BISHNnDi.mjs";
import { _ as round, c as fmtNum, n as cn, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { H as saveCosts, m as getCostTool } from "./fns-aaDGwzaQ.mjs";
import { t as Button } from "./button-ChVfL1l3.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { r as getStandard, t as BREEDS } from "./standards-DCoZ9WxY.mjs";
import { f as Route$18 } from "./router-CKSXmWZm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cost-WqzXfd2A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COST_ARTICLE_LABELS = {
	chick: "Курчата",
	feed: "Корм",
	gas: "Газ / обігрів",
	meds: "Ветеринарія",
	other: "Інше (підстилка, світло, праця)"
};
function articlesTotal(a) {
	return round(a.chick + a.feed + a.gas + a.meds + a.other, 0);
}
function costArticles(args, cumFeedKg, mode) {
	const share = mode === "slaughter" ? 1 : Math.min(1, args.ageDays / Math.max(1, args.targetDays));
	return {
		chick: round(args.chicksPlaced * args.chickCostUah, 0),
		feed: round(cumFeedKg * args.feedPriceUah, 0),
		gas: round(args.chicksPlaced * args.gasPerBirdUah * share, 0),
		meds: round(args.chicksPlaced * args.medsPerBirdUah * share, 0),
		other: round(args.chicksPlaced * args.otherPerBirdUah * share, 0)
	};
}
function planCost(args) {
	const std = getStandard(args.targetDays, args.breed);
	const mort = args.mortPct ?? std.cumMortPct;
	const soldHead = Math.round(args.placed * (1 - mort / 100));
	const weightG = std.weightG;
	const liveKg = soldHead * weightG / 1e3;
	const avgHead = (args.placed + soldHead) / 2;
	const feedKg = std.cumFeedG * avgHead / 1e3;
	const articles = costArticles({
		chicksPlaced: args.placed,
		chickCostUah: args.chickCostUah,
		feedPriceUah: args.feedPriceUah,
		gasPerBirdUah: args.gasPerBirdUah,
		medsPerBirdUah: args.medsPerBirdUah,
		otherPerBirdUah: args.otherPerBirdUah,
		ageDays: args.targetDays,
		targetDays: args.targetDays
	}, feedKg, "slaughter");
	const total = articlesTotal(articles);
	const revenue = liveKg * args.liveWeightPriceUah;
	const profit = revenue - total;
	return {
		articles,
		total,
		liveKg: round(liveKg, 0),
		weightG,
		fcr: std.fcr,
		soldHead,
		perKg: liveKg > 0 ? round(total / liveKg, 2) : 0,
		perBirdSold: soldHead > 0 ? round(total / soldHead, 2) : 0,
		revenue: round(revenue, 0),
		profit: round(profit, 0),
		profitabilityPct: total > 0 ? round(profit / total * 100, 1) : 0
	};
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostPage, {}) });
}
function CostPage() {
	const { org } = Route$18.useSearch();
	const { data, error, loading, setData } = useAsync(() => getCostTool({ data: { orgId: org } }), [org]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 animate-pulse rounded-[24px] bg-surface" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: error
	});
	if (!data) return null;
	if (isPlatformAdmin(data.profile) && !data.factories.length && !org && !data.profile.orgId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-sm text-muted",
		children: [
			"Відкрийте господарство в",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/holdings",
				className: "underline underline-offset-4",
				children: "списку"
			}),
			", щоб бачити собівартість."
		]
	});
	const profit = data.factories.reduce((s, f) => s + (f.forecast?.projectedProfit ?? 0), 0);
	const cost = data.factories.reduce((s, f) => s + (f.forecast?.projectedCost ?? 0), 0);
	const liveKg = data.factories.reduce((s, f) => {
		const fc = f.forecast;
		if (!fc) return s;
		return s + fc.projectedHead * fc.projectedWeightG / 1e3;
	}, 0);
	const perKg = liveKg > 0 ? cost / liveKg : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "Економіка туру"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Собівартість"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Курчата, корм, газ, ветеринарія і інше — на фактичному поголівʼї і кросі. Нижче — плановий тур без звітів."
				})
			] }),
			data.factories.some((f) => f.activeHouses) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Собівартість на здачі",
						v: `${fmtNum(perKg, 2)} ₴`,
						s: "за кг живої"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Витрати туру",
						v: `${fmtInt(cost)} ₴`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Прибуток туру",
						v: `${fmtInt(profit)} ₴`,
						s: cost ? `${fmtNum(profit / cost * 100, 1)}% до витрат` : void 0,
						ok: profit >= 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Ціна здачі",
						v: `${fmtNum(data.costs.liveWeightPriceUah, 1)} ₴`,
						s: "за кг живої"
					})
				]
			}), data.factories.map((factory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactoryCost, {
				factory,
				sale: data.costs.liveWeightPriceUah
			}, factory.site.id))] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Посадок ще немає" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Після відкриття посадки собівартість візьме факт зі звітів."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Planner, { costs: data.costs }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PricesCard, {
				initial: data.costs,
				canEdit: data.canEdit,
				orgId: org,
				onSaved: async () => setData(await getCostTool({ data: { orgId: org } }))
			})
		]
	});
}
function FactoryCost({ factory, sale }) {
	const houses = factory.houses.filter((h) => h.flock && h.forecast);
	if (!houses.length) return null;
	const f = factory.forecast;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-xl font-medium tracking-tight",
			children: factory.site.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-0.5 text-sm text-muted",
			children: [
				houses.length,
				" пташн. · ",
				fmtInt(factory.head),
				" гол.",
				f ? ` · ${fmtNum(f.projectedCostPerKg, 2)} ₴/кг на здачі` : ""
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[36rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-xs uppercase tracking-wide text-subtle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Пташник"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Крос"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "На здачі, ₴/кг"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "Прибуток"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: houses.map((h) => {
					const fc = h.forecast;
					const beat = fc.projectedCostPerKg > 0 && fc.projectedCostPerKg < sale;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/houses/$houseId",
									params: { houseId: String(h.house.id) },
									className: "hover:underline",
									children: h.house.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [h.ageDays, " д."]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								children: h.flock?.breed
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("px-4 py-3 tabular-nums", beat ? "text-ok" : "text-bad"),
								children: fmtNum(fc.projectedCostPerKg, 2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: cn("px-4 py-3 tabular-nums", fc.projectedProfit >= 0 ? "text-ok" : "text-bad"),
								children: [fmtInt(fc.projectedProfit), " ₴"]
							})
						]
					}, h.house.id);
				}) })]
			})
		})]
	});
}
function Planner({ costs }) {
	const [breed, setBreed] = (0, import_react.useState)(BREEDS[0].name);
	const [head, setHead] = (0, import_react.useState)("20000");
	const [days, setDays] = (0, import_react.useState)("42");
	const [mort, setMort] = (0, import_react.useState)("");
	const sheet = (0, import_react.useMemo)(() => planCost({
		breed,
		placed: Number(head) || 0,
		targetDays: Number(days) || 42,
		mortPct: mort === "" ? void 0 : Number(mort.replace(",", ".")),
		chickCostUah: costs.chickPriceUah,
		feedPriceUah: costs.feedPriceUah,
		gasPerBirdUah: costs.gasPerBirdUah,
		medsPerBirdUah: costs.medsPerBirdUah,
		otherPerBirdUah: costs.otherPerBirdUah,
		liveWeightPriceUah: costs.liveWeightPriceUah
	}), [
		breed,
		head,
		days,
		mort,
		costs
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Плановий тур" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Норма кросу без звітів. Падіж порожній — візьметься з таблиці."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Крос" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: breed,
						onChange: (e) => setBreed(e.target.value),
						children: BREEDS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.name,
							children: b.name
						}, b.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Поголівʼя",
						value: head,
						onChange: setHead
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Доба забою",
						value: days,
						onChange: setDays
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Падіж, %",
						value: mort,
						onChange: setMort
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "₴/кг живої",
						v: fmtNum(sheet.perKg, 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "₴/гол. здана",
						v: fmtNum(sheet.perBirdSold, 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Жива маса",
						v: `${fmtInt(sheet.liveKg)} кг`,
						s: `FCR ${fmtNum(sheet.fcr, 3)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "Прибуток",
						v: `${fmtInt(sheet.profit)} ₴`,
						s: `${fmtNum(sheet.profitabilityPct, 1)}%`,
						ok: sheet.profit >= 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticleTable, { articles: sheet.articles })
		]
	});
}
function ArticleTable({ articles }) {
	const total = articlesTotal(articles) || 1;
	const keys = Object.keys(COST_ARTICLE_LABELS);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: keys.map((id) => {
			const v = articles[id];
			const pct = v / total * 100;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: COST_ARTICLE_LABELS[id] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums text-muted",
					children: [
						fmtInt(v),
						" ₴ · ",
						fmtNum(pct, 0),
						"%"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 h-1.5 overflow-hidden rounded-full bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-primary",
					style: { width: `${Math.min(100, pct)}%` }
				})
			})] }, id);
		})
	});
}
function PricesCard({ initial, canEdit, orgId, onSaved }) {
	const [form, setForm] = (0, import_react.useState)({
		chickPriceUah: String(initial.chickPriceUah),
		feedPriceUah: String(initial.feedPriceUah),
		gasPerBirdUah: String(initial.gasPerBirdUah),
		medsPerBirdUah: String(initial.medsPerBirdUah),
		otherPerBirdUah: String(initial.otherPerBirdUah),
		liveWeightPriceUah: String(initial.liveWeightPriceUah)
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Ціни для розрахунку" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Газ, ветеринарія і інше — на голову за тур. Корм — за кілограм."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			onSubmit: async (e) => {
				e.preventDefault();
				if (!canEdit) return;
				setBusy(true);
				setErr(null);
				try {
					await saveCosts({ data: {
						...initial,
						chickPriceUah: Number(form.chickPriceUah.replace(",", ".")) || 0,
						feedPriceUah: Number(form.feedPriceUah.replace(",", ".")) || 0,
						gasPerBirdUah: Number(form.gasPerBirdUah.replace(",", ".")) || 0,
						medsPerBirdUah: Number(form.medsPerBirdUah.replace(",", ".")) || 0,
						otherPerBirdUah: Number(form.otherPerBirdUah.replace(",", ".")) || 0,
						liveWeightPriceUah: Number(form.liveWeightPriceUah.replace(",", ".")) || 0,
						orgId
					} });
					await onSaved();
				} catch (ex) {
					setErr(ex instanceof Error ? ex.message : "Не збережено");
				} finally {
					setBusy(false);
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Курча, ₴",
					value: form.chickPriceUah,
					onChange: (v) => setForm({
						...form,
						chickPriceUah: v
					}),
					disabled: !canEdit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Корм, ₴/кг",
					value: form.feedPriceUah,
					onChange: (v) => setForm({
						...form,
						feedPriceUah: v
					}),
					disabled: !canEdit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Здача, ₴/кг живої",
					value: form.liveWeightPriceUah,
					onChange: (v) => setForm({
						...form,
						liveWeightPriceUah: v
					}),
					disabled: !canEdit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Газ, ₴/гол.",
					value: form.gasPerBirdUah,
					onChange: (v) => setForm({
						...form,
						gasPerBirdUah: v
					}),
					disabled: !canEdit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Ветеринарія, ₴/гол.",
					value: form.medsPerBirdUah,
					onChange: (v) => setForm({
						...form,
						medsPerBirdUah: v
					}),
					disabled: !canEdit
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Інше, ₴/гол.",
					value: form.otherPerBirdUah,
					onChange: (v) => setForm({
						...form,
						otherPerBirdUah: v
					}),
					disabled: !canEdit
				}),
				err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-bad sm:col-span-2 lg:col-span-3",
					children: err
				}) : null,
				canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-2 lg:col-span-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "Збереження…" : "Зберегти ціни"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted sm:col-span-2 lg:col-span-3",
					children: "Ціни змінює головний технолог."
				})
			]
		})
	] });
}
function Field({ label, value, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		inputMode: "decimal",
		value,
		disabled,
		onChange: (e) => onChange(e.target.value)
	})] });
}
function Mini({ k, v, s, ok }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-[16px] bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase leading-snug tracking-wider text-subtle",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1.5 font-display text-2xl tabular-nums tracking-tight", ok === false ? "text-bad" : ok ? "text-ok" : ""),
				children: v
			}),
			s ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: s
			}) : null
		]
	});
}
//#endregion
export { Page as component };
