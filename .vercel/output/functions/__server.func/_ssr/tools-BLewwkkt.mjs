import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as round, c as fmtNum, n as cn, s as fmtInt } from "./org-DsT_3HSb.mjs";
import { h as getDashboard } from "./fns-aaDGwzaQ.mjs";
import { n as CardTitle, t as Card } from "./card-3aZJP2Zh.mjs";
import { n as Label, r as Select, t as Input } from "./input-x1ihG6i4.mjs";
import { t as AppShell } from "./app-shell-BufNlwdv.mjs";
import { t as useAsync } from "./use-async-D_XiVQwO.mjs";
import { t as DEFAULT_NORMS } from "./handbook-OalI0BW1.mjs";
import { r as getStandard, t as BREEDS } from "./standards-DCoZ9WxY.mjs";
import { t as FEED_PHASES } from "./feed-s9t3EOEY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools-BLewwkkt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Aviagen-style step-down: 23 год на посадці, з 7-ї доби додаємо темряву до 6 год. */
function lightingProgram(ageDays) {
	const d = Math.max(0, Math.round(ageDays));
	if (d <= 0) return {
		ageDays: d,
		lightH: 23,
		darkH: 1,
		lux: 30,
		luxMax: 40,
		note: "Посадка. Курча має знайти корм і воду."
	};
	if (d <= 6) return {
		ageDays: d,
		lightH: 23,
		darkH: 1,
		lux: 20,
		luxMax: 30,
		note: "Перший тиждень. Високий люкс, майже цілодобове світло."
	};
	if (d === 7) return {
		ageDays: d,
		lightH: 22,
		darkH: 2,
		lux: 15,
		luxMax: 20,
		note: "Початок темряви. Не ріжте більше ніж на 1–2 год за добу."
	};
	if (d === 8) return {
		ageDays: d,
		lightH: 21,
		darkH: 3,
		lux: 12,
		luxMax: 15,
		note: "Зменшення дня."
	};
	if (d === 9) return {
		ageDays: d,
		lightH: 20,
		darkH: 4,
		lux: 10,
		luxMax: 12,
		note: "Зменшення дня."
	};
	if (d === 10) return {
		ageDays: d,
		lightH: 19,
		darkH: 5,
		lux: 10,
		luxMax: 12,
		note: "Зменшення дня."
	};
	if (d <= 14) return {
		ageDays: d,
		lightH: 18,
		darkH: 6,
		lux: 8,
		luxMax: 10,
		note: "6 годин темряви. Ріст, спокійніший птах."
	};
	return {
		ageDays: d,
		lightH: 18,
		darkH: 6,
		lux: 5,
		luxMax: 10,
		note: "Ріст і фініш. 5–10 лк, без різких стрибків."
	};
}
var LAMP_TYPES = [
	{
		id: "led20",
		name: "LED 20 Вт",
		watts: 20,
		lumens: 3e3
	},
	{
		id: "led30",
		name: "LED 30 Вт",
		watts: 30,
		lumens: 4500
	},
	{
		id: "led50",
		name: "LED 50 Вт",
		watts: 50,
		lumens: 7500
	}
];
var LIGHT_UTIL = .55;
function lampPlan(areaM2, lux, lamp) {
	const area = Math.max(0, areaM2);
	const neededLm = area <= 0 || lux <= 0 ? 0 : lux * area / LIGHT_UTIL;
	const count = lamp.lumens > 0 && neededLm > 0 ? Math.ceil(neededLm / lamp.lumens) : 0;
	const watts = count * lamp.watts;
	return {
		count,
		watts,
		wPerM2: area > 0 ? round(watts / area, 2) : 0,
		neededLm: round(neededLm, 0),
		kWhPerHour: round(watts / 1e3, 3)
	};
}
function lightEnergyKwh(plan, lightH, days = 1) {
	return round(plan.kWhPerHour * Math.max(0, lightH) * Math.max(0, days), 2);
}
var PHASE_SPAN = {
	prestarter: {
		from: 0,
		to: 10
	},
	starter: {
		from: 11,
		to: 21
	},
	grower: {
		from: 22,
		to: 35
	},
	finisher: {
		from: 36,
		to: 42
	}
};
var PREMIX_PRODUCTS = [
	{
		id: "gf-1",
		name: "GREENFEED 1%",
		inclusionPct: 1,
		bagKg: 25
	},
	{
		id: "gf-25",
		name: "GREENFEED 2,5%",
		inclusionPct: 2.5,
		bagKg: 25
	},
	{
		id: "gf-5",
		name: "GREENFEED 5%",
		inclusionPct: 5,
		bagKg: 25
	},
	{
		id: "custom",
		name: "Інший премікс",
		inclusionPct: 2.5,
		bagKg: 25
	}
];
function feedKgRange(breed, placed, fromDay, toDay) {
	const from = Math.max(0, Math.round(fromDay));
	const to = Math.max(from, Math.round(toDay));
	const head0 = Math.max(0, placed);
	let kg = 0;
	for (let d = from; d <= to; d += 1) {
		const std = getStandard(d, breed);
		const prev = getStandard(Math.max(0, d - 1), breed);
		const head = head0 * (1 - (d === 0 ? 0 : prev.cumMortPct) / 100);
		kg += std.feedGPerBird * head / 1e3;
	}
	return round(kg, 1);
}
function premixOrder(args) {
	const feedKg = feedKgRange(args.breed, args.placed, args.fromDay, args.toDay);
	const incl = Math.max(0, args.inclusionPct) / 100;
	const premixKg = round(feedKg * incl, 1);
	const bag = Math.max(.1, args.bagKg);
	const bags = premixKg > 0 ? Math.ceil(premixKg / bag) : 0;
	const price = args.pricePerKg != null && args.pricePerKg > 0 ? args.pricePerKg : null;
	return {
		phase: args.phase,
		fromDay: args.fromDay,
		toDay: args.toDay,
		feedKg,
		premixKg,
		bags,
		cost: price != null ? round(premixKg * price, 0) : null
	};
}
function cyclePremix(args) {
	const rows = FEED_PHASES.map((p) => {
		const span = PHASE_SPAN[p.id];
		return premixOrder({
			...args,
			fromDay: span.from,
			toDay: span.to,
			phase: p.id
		});
	});
	const feedKg = round(rows.reduce((s, r) => s + r.feedKg, 0), 1);
	const premixKg = round(rows.reduce((s, r) => s + r.premixKg, 0), 1);
	const bags = rows.reduce((s, r) => s + r.bags, 0);
	const cost = rows.every((r) => r.cost != null) ? rows.reduce((s, r) => s + (r.cost ?? 0), 0) : null;
	rows.push({
		phase: "cycle",
		fromDay: 0,
		toDay: 42,
		feedKg,
		premixKg,
		bags,
		cost
	});
	return rows;
}
function placePlan(args) {
	const houses = Math.max(1, Math.round(args.houses ?? 1));
	const usable = Math.min(100, Math.max(50, args.usablePct ?? 95)) / 100;
	const areaM2 = round(Math.max(0, args.lengthM) * Math.max(0, args.widthM) * usable, 1);
	const totalAreaM2 = round(areaM2 * houses, 1);
	const liveKg = round(totalAreaM2 * Math.max(0, args.targetKgM2), 0);
	const wKg = Math.max(.04, args.targetWeightG / 1e3);
	const soldHead = wKg > 0 ? Math.floor(liveKg / wKg) : 0;
	const surv = Math.min(.999, Math.max(.7, 1 - Math.max(0, args.mortPct) / 100));
	const placed = surv > 0 ? Math.ceil(soldHead / surv) : soldHead;
	const birdsPerM2 = totalAreaM2 > 0 ? round(placed / totalAreaM2, 1) : 0;
	return {
		areaM2,
		totalAreaM2,
		placed,
		soldHead,
		liveKg,
		densityNow: args.targetKgM2,
		nipples: Math.ceil(placed / 12),
		pans: Math.ceil(placed / 60),
		birdsPerM2
	};
}
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tools, {}) });
}
function Tools() {
	const { data, error, loading } = useAsync(() => getDashboard(), []);
	const houses = data?.factories.flatMap((f) => f.houses.filter((h) => h.flock)) ?? [];
	const hash = useRouterState({ select: (s) => s.location.hash });
	(0, import_react.useEffect)(() => {
		const id = hash.replace(/^#/, "");
		if (!id || loading) return;
		const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		}), 80);
		return () => window.clearTimeout(t);
	}, [loading, hash]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.16em] text-subtle",
					children: "Калькулятори технолога"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-medium tracking-tight",
					children: "Інструменти"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: "Світло на добу, замовлення преміксу, скільки курчат садити на площу і норма кросу. Цифри з таблиці породи, не «на око»."
				})
			] }),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 animate-pulse rounded-[16px] bg-surface" }) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jump, {
						href: "#light",
						label: "Освітлення"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jump, {
						href: "#premix",
						label: "Премікс"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jump, {
						href: "#place",
						label: "Посадка"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Jump, {
						href: "#norm",
						label: "Норма кросу"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LightingCard, { houses }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PremixCard, { houses }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceCard, { houses }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NormCard, { houses })
		]
	});
}
function Jump({ href, label }) {
	const id = href.replace(/^#/, "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/tools",
		hash: id,
		className: "inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
		children: label
	});
}
function pickHouse(houses, id) {
	const n = Number(id);
	return houses.find((h) => h.house.id === n) ?? houses[0] ?? null;
}
function LightingCard({ houses }) {
	const [houseId, setHouseId] = (0, import_react.useState)("");
	const house = pickHouse(houses, houseId);
	const [age, setAge] = (0, import_react.useState)("14");
	const [lengthM, setLengthM] = (0, import_react.useState)("100");
	const [widthM, setWidthM] = (0, import_react.useState)("12");
	const [lampId, setLampId] = (0, import_react.useState)(LAMP_TYPES[0].id);
	const [price, setPrice] = (0, import_react.useState)("6.5");
	const live = houses.find((h) => String(h.house.id) === houseId) ?? house;
	const program = lightingProgram(Number(age) || 0);
	const area = Math.max(0, (Number(lengthM) || 0) * (Number(widthM) || 0));
	const lamp = LAMP_TYPES.find((l) => l.id === lampId) ?? LAMP_TYPES[0];
	const plan = lampPlan(area, program.lux, lamp);
	const kwh = lightEnergyKwh(plan, program.lightH);
	const uah = (Number(price.replace(",", ".")) || 0) * kwh;
	function takeHouse(h) {
		setHouseId(String(h.house.id));
		setAge(String(h.ageDays));
		if (h.house.areaM2 > 0) {
			setWidthM("12");
			setLengthM(String(Math.max(1, Math.round(h.house.areaM2 / 12))));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: "light",
		className: "scroll-mt-24 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Освітлення" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Години світла і люкс на добу за програмою кросу. Кількість LED — з площі залу."
			})] }),
			houses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousePick, {
				houses,
				value: houseId,
				onChange: takeHouse
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Доба",
						value: age,
						onChange: setAge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Довжина, м",
						value: lengthM,
						onChange: setLengthM
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ширина, м",
						value: widthM,
						onChange: setWidthM
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Світильник" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: lampId,
						onChange: (e) => setLampId(e.target.value),
						children: LAMP_TYPES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: l.id,
							children: l.name
						}, l.id))
					})] })
				]
			}),
			live?.flock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					live.house.name,
					" · ",
					live.ageDays,
					" доба · ",
					fmtInt(live.house.areaM2),
					" м²"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Світло",
						v: `${program.lightH} год`,
						s: `${program.darkH} год темряви`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Люкс",
						v: `${program.lux}–${program.luxMax}`,
						s: "на рівні птаха"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Світильників",
						v: fmtInt(plan.count),
						s: `${fmtNum(plan.wPerM2, 2)} Вт/м²`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "За добу",
						v: `${fmtNum(kwh, 1)} кВт·год`,
						s: uah ? `${fmtInt(uah)} ₴` : void 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: program.note
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ціна електроенергії, ₴/кВт·год" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "max-w-40",
				inputMode: "decimal",
				value: price,
				onChange: (e) => setPrice(e.target.value)
			})] })
		]
	});
}
function PremixCard({ houses }) {
	const [houseId, setHouseId] = (0, import_react.useState)("");
	const house = pickHouse(houses, houseId);
	const [breed, setBreed] = (0, import_react.useState)(house?.flock?.breed ?? BREEDS[0].name);
	const [head, setHead] = (0, import_react.useState)("20000");
	const [productId, setProductId] = (0, import_react.useState)(PREMIX_PRODUCTS[1].id);
	const [incl, setIncl] = (0, import_react.useState)(String(PREMIX_PRODUCTS[1].inclusionPct));
	const [bag, setBag] = (0, import_react.useState)(String(PREMIX_PRODUCTS[1].bagKg));
	const [price, setPrice] = (0, import_react.useState)("");
	const rows = (0, import_react.useMemo)(() => cyclePremix({
		breed,
		placed: Number(head) || 0,
		inclusionPct: Number(String(incl).replace(",", ".")) || 0,
		bagKg: Number(String(bag).replace(",", ".")) || 25,
		pricePerKg: price ? Number(String(price).replace(",", ".")) : void 0
	}), [
		breed,
		head,
		incl,
		bag,
		price
	]);
	const cycle = rows.find((r) => r.phase === "cycle");
	function takeHouse(h) {
		setHouseId(String(h.house.id));
		if (h.flock) {
			setBreed(h.flock.breed);
			setHead(String(h.flock.chicksPlaced));
		}
	}
	function setProduct(id) {
		setProductId(id);
		const p = PREMIX_PRODUCTS.find((x) => x.id === id);
		if (p && p.id !== "custom") {
			setIncl(String(p.inclusionPct));
			setBag(String(p.bagKg));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: "premix",
		className: "scroll-mt-24 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Замовлення преміксу" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Скільки кілограмів і мішків треба на фазу і на весь тур. GREENFEED 1% / 2,5% / 5% або свій відсоток."
			})] }),
			houses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousePick, {
				houses,
				value: houseId,
				onChange: takeHouse
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
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
						label: "Посадка, гол.",
						value: head,
						onChange: setHead
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Продукт" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: productId,
						onChange: (e) => setProduct(e.target.value),
						children: PREMIX_PRODUCTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Включення, %",
						value: incl,
						onChange: setIncl
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Мішок, кг",
						value: bag,
						onChange: setBag
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ціна, ₴/кг",
						value: price,
						onChange: setPrice
					})
				]
			}),
			cycle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Корм за тур",
						v: `${fmtInt(cycle.feedKg)} кг`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Премікс",
						v: `${fmtNum(cycle.premixKg, 0)} кг`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Мішків",
						v: fmtInt(cycle.bags),
						s: `${bag} кг`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Сума",
						v: cycle.cost != null ? `${fmtInt(cycle.cost)} ₴` : "—",
						s: "якщо вказали ціну"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[32rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase tracking-wide text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Фаза"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Добі"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Корм, кг"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3 font-medium",
								children: "Премікс, кг"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Мішків"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 font-medium",
								children: r.phase === "cycle" ? "Весь тур" : FEED_PHASES.find((p) => p.id === r.phase)?.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2 pr-3 tabular-nums text-muted",
								children: [
									r.fromDay,
									"–",
									r.toDay
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 tabular-nums",
								children: fmtInt(r.feedKg)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 tabular-nums",
								children: fmtNum(r.premixKg, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: cn("py-2 tabular-nums", r.phase === "cycle" ? "font-medium" : ""),
								children: fmtInt(r.bags)
							})
						]
					}, r.phase)) })]
				})
			})
		]
	});
}
function PlaceCard({ houses }) {
	const [houseId, setHouseId] = (0, import_react.useState)("");
	const house = pickHouse(houses, houseId);
	const [lengthM, setLengthM] = (0, import_react.useState)("100");
	const [widthM, setWidthM] = (0, import_react.useState)("12");
	const [count, setCount] = (0, import_react.useState)("1");
	const [kgM2, setKgM2] = (0, import_react.useState)(String(DEFAULT_NORMS.densityLimitKgM2));
	const [weight, setWeight] = (0, import_react.useState)(house?.flock ? String(house.flock.targetWeightG) : "2800");
	const [mort, setMort] = (0, import_react.useState)("4");
	const plan = placePlan({
		lengthM: Number(lengthM) || 0,
		widthM: Number(widthM) || 0,
		houses: Number(count) || 1,
		targetKgM2: Number(String(kgM2).replace(",", ".")) || 0,
		targetWeightG: Number(weight) || 2800,
		mortPct: Number(String(mort).replace(",", ".")) || 0
	});
	function takeHouse(h) {
		setHouseId(String(h.house.id));
		if (h.house.areaM2 > 0) {
			setWidthM("12");
			setLengthM(String(Math.max(1, Math.round(h.house.areaM2 / 12))));
		}
		if (h.flock) setWeight(String(h.flock.targetWeightG));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: "place",
		className: "scroll-mt-24 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Посадка на площу" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Скільки курчат садити, щоб на забої вийти на ліміт кг/м². Ніпелі — 12 гол./шт., годівниці — 60 гол./шт."
			})] }),
			houses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousePick, {
				houses,
				value: houseId,
				onChange: takeHouse
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Довжина, м",
						value: lengthM,
						onChange: setLengthM
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ширина, м",
						value: widthM,
						onChange: setWidthM
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Пташників",
						value: count,
						onChange: setCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ліміт кг/м²",
						value: kgM2,
						onChange: setKgM2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Маса здачі, г",
						value: weight,
						onChange: setWeight
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Садити",
						v: fmtInt(plan.placed),
						s: "гол. на всі зали"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "На здачі",
						v: fmtInt(plan.soldHead),
						s: `${fmtInt(plan.liveKg)} кг живої`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Ніпелів",
						v: fmtInt(plan.nipples),
						s: "12 гол. на ніпель"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Годівниць",
						v: fmtInt(plan.pans),
						s: "60 гол. на таріль"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Корисна площа ",
					fmtNum(plan.totalAreaM2, 0),
					" м² · ",
					fmtNum(plan.birdsPerM2, 1),
					" гол./м² на посадці."
				]
			})
		]
	});
}
function NormCard({ houses }) {
	const [houseId, setHouseId] = (0, import_react.useState)("");
	const house = pickHouse(houses, houseId);
	const [breed, setBreed] = (0, import_react.useState)(house?.flock?.breed ?? BREEDS[0].name);
	const [age, setAge] = (0, import_react.useState)("21");
	const [head, setHead] = (0, import_react.useState)("17500");
	const std = getStandard(Number(age) || 0, breed);
	const light = lightingProgram(Number(age) || 0);
	const headN = Number(head) || 0;
	const feedKg = std.feedGPerBird * headN / 1e3;
	const waterL = std.waterMlPerBird * headN / 1e3;
	function takeHouse(h) {
		setHouseId(String(h.house.id));
		setAge(String(h.ageDays));
		setHead(String(h.head));
		if (h.flock) setBreed(h.flock.breed);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		id: "norm",
		className: "scroll-mt-24 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Норма кросу на добу" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Маса, корм, вода, температура і світло з таблиці породи. Помножено на ваше поголівʼя."
			})] }),
			houses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HousePick, {
				houses,
				value: houseId,
				onChange: takeHouse
			}) : null,
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
						label: "Доба",
						value: age,
						onChange: setAge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Поголівʼя",
						value: head,
						onChange: setHead
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Маса",
						v: `${fmtInt(std.weightG)} г`,
						s: `+${fmtNum(std.dailyGainG, 0)} г/добу`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Корм",
						v: `${fmtNum(std.feedGPerBird, 0)} г/гол.`,
						s: `${fmtInt(feedKg)} кг на залу`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Вода",
						v: `${fmtInt(std.waterMlPerBird)} мл`,
						s: `${fmtInt(waterL)} л на залу`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "FCR",
						v: fmtNum(std.fcr, 3),
						s: `падіж ${fmtNum(std.cumMortPct, 2)}% накопич.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Температура",
						v: `${fmtNum(std.tempMin, 0)}–${fmtNum(std.tempMax, 0)} °C`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Вологість",
						v: `${std.humidityMin}–${std.humidityMax} %`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Світло",
						v: `${light.lightH} год`,
						s: `${light.lux}–${light.luxMax} лк`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						k: "Корм накопич.",
						v: `${fmtInt(std.cumFeedG)} г`,
						s: "на голову з посадки"
					})
				]
			})
		]
	});
}
function HousePick({ houses, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Взяти з пташника" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onChange: (e) => {
			const h = houses.find((x) => String(x.house.id) === e.target.value);
			if (h) onChange(h);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			children: "Оберіть пташник"
		}), houses.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
			value: h.house.id,
			children: [
				h.house.name,
				" · ",
				h.flock?.breed,
				" · ",
				h.ageDays,
				" д. · ",
				fmtInt(h.head),
				" гол."
			]
		}, h.house.id))]
	})] });
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		inputMode: "decimal",
		value,
		onChange: (e) => onChange(e.target.value)
	})] });
}
function Kpi({ k, v, s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-[16px] bg-bg px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase leading-snug tracking-wider text-subtle",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 font-display text-2xl tabular-nums tracking-tight",
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
