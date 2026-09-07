import { _ as round } from "./org-DsT_3HSb.mjs";
import { i as humidityFromNorms } from "./handbook-OalI0BW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/standards-DCoZ9WxY.js
var BREEDS = [
	{
		id: "ross308",
		name: "Ross 308",
		targetDays: 42,
		targetWeightG: 2800
	},
	{
		id: "cobb500",
		name: "Cobb 500",
		targetDays: 42,
		targetWeightG: 2950
	},
	{
		id: "hubbard",
		name: "Hubbard Flex",
		targetDays: 42,
		targetWeightG: 2650
	},
	{
		id: "arbor",
		name: "Arbor Acres Plus",
		targetDays: 42,
		targetWeightG: 2850
	}
];
BREEDS[0].name;
function breedByName(name) {
	const n = (name ?? "").trim().toLowerCase();
	return BREEDS.find((b) => b.name.toLowerCase() === n || b.id === n) ?? BREEDS[0];
}
/** Commercial as-hatched mixed-sex curves, interpolated daily. Water is ml/bird/day. */
var CURVES = {
	ross308: [
		{
			d: 0,
			w: 42,
			feed: 10,
			water: 40,
			mort: .35,
			tMin: 33,
			tMax: 35
		},
		{
			d: 7,
			w: 189,
			feed: 38,
			water: 90,
			mort: 1.05,
			tMin: 30,
			tMax: 32
		},
		{
			d: 14,
			w: 512,
			feed: 78,
			water: 170,
			mort: 1.55,
			tMin: 27,
			tMax: 29
		},
		{
			d: 21,
			w: 997,
			feed: 118,
			water: 240,
			mort: 2.05,
			tMin: 24,
			tMax: 26
		},
		{
			d: 28,
			w: 1576,
			feed: 158,
			water: 295,
			mort: 2.55,
			tMin: 22,
			tMax: 24
		},
		{
			d: 35,
			w: 2204,
			feed: 188,
			water: 335,
			mort: 3.25,
			tMin: 20,
			tMax: 22
		},
		{
			d: 42,
			w: 2839,
			feed: 205,
			water: 365,
			mort: 4.05,
			tMin: 19,
			tMax: 21
		},
		{
			d: 49,
			w: 3450,
			feed: 215,
			water: 385,
			mort: 4.9,
			tMin: 18,
			tMax: 21
		}
	],
	cobb500: [
		{
			d: 0,
			w: 44,
			feed: 11,
			water: 42,
			mort: .32,
			tMin: 33,
			tMax: 35
		},
		{
			d: 7,
			w: 202,
			feed: 41,
			water: 96,
			mort: .98,
			tMin: 30,
			tMax: 32
		},
		{
			d: 14,
			w: 546,
			feed: 84,
			water: 182,
			mort: 1.45,
			tMin: 27,
			tMax: 29
		},
		{
			d: 21,
			w: 1055,
			feed: 126,
			water: 258,
			mort: 1.95,
			tMin: 24,
			tMax: 26
		},
		{
			d: 28,
			w: 1668,
			feed: 168,
			water: 318,
			mort: 2.45,
			tMin: 22,
			tMax: 24
		},
		{
			d: 35,
			w: 2340,
			feed: 200,
			water: 355,
			mort: 3.1,
			tMin: 20,
			tMax: 22
		},
		{
			d: 42,
			w: 3010,
			feed: 218,
			water: 385,
			mort: 3.85,
			tMin: 19,
			tMax: 21
		},
		{
			d: 49,
			w: 3650,
			feed: 228,
			water: 405,
			mort: 4.7,
			tMin: 18,
			tMax: 21
		}
	],
	hubbard: [
		{
			d: 0,
			w: 40,
			feed: 9,
			water: 38,
			mort: .38,
			tMin: 33,
			tMax: 35
		},
		{
			d: 7,
			w: 175,
			feed: 35,
			water: 84,
			mort: 1.1,
			tMin: 30,
			tMax: 32
		},
		{
			d: 14,
			w: 478,
			feed: 72,
			water: 158,
			mort: 1.62,
			tMin: 27,
			tMax: 29
		},
		{
			d: 21,
			w: 938,
			feed: 110,
			water: 225,
			mort: 2.15,
			tMin: 24,
			tMax: 26
		},
		{
			d: 28,
			w: 1485,
			feed: 148,
			water: 275,
			mort: 2.65,
			tMin: 22,
			tMax: 24
		},
		{
			d: 35,
			w: 2080,
			feed: 176,
			water: 315,
			mort: 3.35,
			tMin: 20,
			tMax: 22
		},
		{
			d: 42,
			w: 2680,
			feed: 194,
			water: 345,
			mort: 4.15,
			tMin: 19,
			tMax: 21
		},
		{
			d: 49,
			w: 3240,
			feed: 204,
			water: 365,
			mort: 5,
			tMin: 18,
			tMax: 21
		}
	],
	arbor: [
		{
			d: 0,
			w: 42,
			feed: 10,
			water: 40,
			mort: .34,
			tMin: 33,
			tMax: 35
		},
		{
			d: 7,
			w: 194,
			feed: 39,
			water: 92,
			mort: 1.02,
			tMin: 30,
			tMax: 32
		},
		{
			d: 14,
			w: 524,
			feed: 80,
			water: 174,
			mort: 1.5,
			tMin: 27,
			tMax: 29
		},
		{
			d: 21,
			w: 1020,
			feed: 121,
			water: 248,
			mort: 2,
			tMin: 24,
			tMax: 26
		},
		{
			d: 28,
			w: 1615,
			feed: 162,
			water: 302,
			mort: 2.5,
			tMin: 22,
			tMax: 24
		},
		{
			d: 35,
			w: 2260,
			feed: 192,
			water: 342,
			mort: 3.2,
			tMin: 20,
			tMax: 22
		},
		{
			d: 42,
			w: 2905,
			feed: 210,
			water: 372,
			mort: 4,
			tMin: 19,
			tMax: 21
		},
		{
			d: 49,
			w: 3520,
			feed: 220,
			water: 392,
			mort: 4.85,
			tMin: 18,
			tMax: 21
		}
	]
};
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function atDay(knots, age) {
	const d = Math.max(0, age);
	let i = 0;
	while (i < knots.length - 1 && knots[i + 1].d < d) i += 1;
	const a = knots[i];
	const b = knots[Math.min(i + 1, knots.length - 1)];
	if (b.d === a.d) return a;
	const t = (d - a.d) / (b.d - a.d);
	return {
		d,
		w: lerp(a.w, b.w, t),
		feed: lerp(a.feed, b.feed, t),
		water: lerp(a.water, b.water, t),
		mort: lerp(a.mort, b.mort, t),
		tMin: lerp(a.tMin, b.tMin, t),
		tMax: lerp(a.tMax, b.tMax, t)
	};
}
var cache = /* @__PURE__ */ new Map();
/** RH in the house: placement 50–55%, through day 14 50–60%, then 50–70%. */
function humidityTarget(ageDays) {
	return humidityFromNorms(ageDays);
}
function build(breedId) {
	const hit = cache.get(breedId);
	if (hit) return hit;
	const knots = CURVES[breedId] ?? CURVES.ross308;
	const startW = knots[0].w;
	const table = [];
	let cumFeed = 0;
	let prevW = startW;
	let prevMort = 0;
	for (let d = 0; d <= 49; d += 1) {
		const p = atDay(knots, d);
		const feed = d === 0 ? 0 : p.feed;
		const water = d === 0 ? 0 : p.water;
		cumFeed += feed;
		const gain = d === 0 ? 0 : p.w - prevW;
		const dailyMort = Math.max(0, p.mort - prevMort);
		const liveGain = Math.max(1, p.w - startW);
		const rh = humidityTarget(d);
		table.push({
			ageDays: d,
			weightG: round(p.w, 0),
			dailyGainG: round(gain, 1),
			feedGPerBird: round(feed, 1),
			cumFeedG: round(cumFeed, 1),
			waterMlPerBird: round(water, 0),
			fcr: d === 0 ? 0 : round(cumFeed / liveGain, 3),
			dailyMortPct: round(dailyMort, 3),
			cumMortPct: round(p.mort, 2),
			tempMin: round(p.tMin, 1),
			tempMax: round(p.tMax, 1),
			humidityMin: rh.min,
			humidityMax: rh.max
		});
		prevW = p.w;
		prevMort = p.mort;
	}
	cache.set(breedId, table);
	return table;
}
function getStandard(ageDays, breed) {
	const id = breedByName(breed).id;
	const table = build(id);
	return table[Math.max(0, Math.min(table.length - 1, Math.round(ageDays)))];
}
function startWeight(breed) {
	return getStandard(0, breed).weightG;
}
/** Breed-table forecast for the house: per-bird curve × morning head. */
function houseDailyForecast(std, head) {
	const h = Math.max(0, head);
	return {
		weightG: std.weightG,
		feedKg: round(std.feedGPerBird * h / 1e3, 1),
		waterL: round(std.waterMlPerBird * h / 1e3, 0),
		feedGPerBird: std.feedGPerBird,
		waterMlPerBird: std.waterMlPerBird,
		dailyGainG: std.dailyGainG
	};
}
//#endregion
export { startWeight as a, houseDailyForecast as i, breedByName as n, getStandard as r, BREEDS as t };
