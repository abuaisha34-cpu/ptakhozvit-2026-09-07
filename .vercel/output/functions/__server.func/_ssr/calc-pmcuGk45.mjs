import { _ as round, h as num, t as addDaysISO } from "./org-DsT_3HSb.mjs";
import { a as startWeight, r as getStandard } from "./standards-DCoZ9WxY.mjs";
import { o as parseDroppingLook, r as buildLitterAdvice, s as parseLitterState } from "./litter-D5RpUDRr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calc-pmcuGk45.js
/** Dead + culled from placement, never counting sold birds. */
function cumulativeMortalityPct(placed, remainingHead, soldHead = 0) {
	if (placed <= 0) return 0;
	return Math.max(0, placed - remainingHead - Math.max(0, soldHead)) / placed * 100;
}
/** Birds that left alive (remaining + sold) / placed. */
function livabilityPct(placed, remainingHead, soldHead = 0) {
	if (placed <= 0) return 0;
	return (remainingHead + Math.max(0, soldHead)) / placed * 100;
}
/**
* Biological FCR: all feed since placement / live-weight gain.
* Gain = remaining birds × current avg + sold kg − chick weight of birds placed.
* Dead birds stay in the numerator (their feed) and out of the denominator.
*/
function biologicalFcr(input) {
	const remainingKg = Math.max(0, input.remainingHead) * Math.max(0, input.remainingAvgG) / 1e3;
	const gainKg = Math.max(0, input.cumSoldWeightKg ?? 0) + remainingKg - input.placed * startWeight(input.breed) / 1e3;
	if (gainKg <= 0 || input.cumFeedKg <= 0) return 0;
	return input.cumFeedKg / gainKg;
}
var DEFAULT_THRESHOLDS = {
	feedPct: 8,
	waterPct: 10,
	weightPct: 6
};
function livability(placed, head, soldHead = 0) {
	return livabilityPct(placed, head, soldHead);
}
function dayMortPct(dead, headStart) {
	if (!headStart) return 0;
	return dead / headStart * 100;
}
function saleAvgWeightG(soldHead, soldWeightKg) {
	if (soldHead <= 0 || soldWeightKg <= 0) return 0;
	return soldWeightKg * 1e3 / soldHead;
}
/** Biological FCR using scale weights of sold birds plus remaining inventory. */
function fcrAtSale(input) {
	return biologicalFcr(input);
}
/** European Production Efficiency Factor. */
function epefValue(livabilityPct, avgWeightG, fcr, ageDays) {
	if (!fcr || !ageDays) return 0;
	return livabilityPct * (avgWeightG / 1e3) * 100 / (fcr * ageDays);
}
function snapshotFromSeries(input) {
	const standard = getStandard(input.ageDays, input.breed);
	const sold = Math.max(0, input.soldHead ?? 0);
	const liv = livabilityPct(input.placed, input.head, sold);
	const fcr = biologicalFcr({
		cumFeedKg: input.cumFeedKg,
		remainingHead: input.head,
		remainingAvgG: input.avgWeightG,
		placed: input.placed,
		cumSoldWeightKg: input.soldWeightKg ?? 0,
		breed: input.breed
	});
	const feedGPerBird = input.headStart ? input.feedKg * 1e3 / input.headStart : 0;
	const waterMlPerBird = input.waterL != null && input.headStart ? input.waterL * 1e3 / input.headStart : null;
	return {
		ageDays: input.ageDays,
		head: input.head,
		placed: input.placed,
		mortality: input.mortality,
		culled: input.culled,
		dayMortPct: dayMortPct(input.mortality + input.culled, input.headStart),
		cumMortPct: cumulativeMortalityPct(input.placed, input.head, sold),
		livabilityPct: liv,
		avgWeightG: input.avgWeightG,
		dailyGainG: input.ageDays > 0 ? input.avgWeightG - input.prevWeightG : 0,
		feedKg: input.feedKg,
		cumFeedKg: input.cumFeedKg,
		feedGPerBird,
		waterL: input.waterL ?? null,
		waterMlPerBird,
		fcr,
		epef: epefValue(liv, input.avgWeightG, fcr, input.ageDays),
		tempMin: input.tempMin,
		tempMax: input.tempMax,
		humidity: input.humidity,
		standard
	};
}
function evaluateDeviations(args) {
	const { siteId, siteName, flockId, snap } = args;
	const std = snap.standard;
	const th = args.thresholds ?? DEFAULT_THRESHOLDS;
	const out = [];
	if (args.missingToday) out.push({
		id: `${flockId}-missing`,
		severity: "warn",
		siteId,
		siteName,
		flockId,
		title: "Немає звіту за попередню добу",
		detail: `${siteName} не подала звіт за вчора.`,
		metric: "звіт",
		actual: 0,
		standard: 1,
		deltaPct: -100
	});
	const mortDelta = snap.dayMortPct - std.dailyMortPct;
	if (snap.dayMortPct >= .35 || mortDelta >= .18) out.push({
		id: `${flockId}-mort-day`,
		severity: snap.dayMortPct >= .45 || mortDelta >= .28 ? "critical" : "warn",
		siteId,
		siteName,
		flockId,
		title: "Підвищений добовий падіж",
		detail: `${round(snap.dayMortPct, 2)}% за добу при нормі ${round(std.dailyMortPct, 2)}% (${snap.mortality + snap.culled} гол.).`,
		metric: "падіж",
		actual: snap.dayMortPct,
		standard: std.dailyMortPct,
		deltaPct: std.dailyMortPct ? mortDelta / std.dailyMortPct * 100 : null
	});
	const cumMortDelta = snap.cumMortPct - std.cumMortPct;
	if (cumMortDelta >= .8) out.push({
		id: `${flockId}-mort-cum`,
		severity: cumMortDelta >= 1.6 ? "critical" : "warn",
		siteId,
		siteName,
		flockId,
		title: "Накопичений падіж вище норми",
		detail: `${round(snap.cumMortPct, 2)}% з посадки при нормі ${round(std.cumMortPct, 2)}% на ${snap.ageDays} добу.`,
		metric: "падіж накопичений",
		actual: snap.cumMortPct,
		standard: std.cumMortPct,
		deltaPct: std.cumMortPct ? cumMortDelta / std.cumMortPct * 100 : null
	});
	if (std.weightG > 0 && snap.avgWeightG > 0) {
		const wDelta = (snap.avgWeightG - std.weightG) / std.weightG * 100;
		if (wDelta <= -th.weightPct) out.push({
			id: `${flockId}-weight`,
			severity: wDelta <= -th.weightPct * 2 ? "critical" : "warn",
			siteId,
			siteName,
			flockId,
			title: "Відставання за живою масою",
			detail: `${Math.round(snap.avgWeightG)} г проти норми ${std.weightG} г (${round(wDelta, 1)}%). Поріг ${th.weightPct}%.`,
			metric: "маса",
			actual: snap.avgWeightG,
			standard: std.weightG,
			deltaPct: wDelta
		});
		else if (wDelta >= Math.max(10, th.weightPct * 1.5)) out.push({
			id: `${flockId}-weight-hi`,
			severity: "watch",
			siteId,
			siteName,
			flockId,
			title: "Маса суттєво вище норми",
			detail: `${Math.round(snap.avgWeightG)} г проти ${std.weightG} г (${round(wDelta, 1)}%).`,
			metric: "маса",
			actual: snap.avgWeightG,
			standard: std.weightG,
			deltaPct: wDelta
		});
	}
	if (std.feedGPerBird > 0 && snap.feedGPerBird > 0) {
		const fDelta = (snap.feedGPerBird - std.feedGPerBird) / std.feedGPerBird * 100;
		if (Math.abs(fDelta) >= th.feedPct) {
			const over = fDelta > 0;
			out.push({
				id: `${flockId}-feed`,
				severity: Math.abs(fDelta) >= th.feedPct * 1.8 ? "critical" : "warn",
				siteId,
				siteName,
				flockId,
				title: over ? "Перевитрата корму" : "Недожор корму",
				detail: `${round(snap.feedGPerBird, 0)} г/гол. проти норми ${round(std.feedGPerBird, 0)} г (${round(fDelta, 1)}%). Поріг ±${th.feedPct}%.`,
				metric: "корм",
				actual: snap.feedGPerBird,
				standard: std.feedGPerBird,
				deltaPct: fDelta
			});
		}
	}
	if (std.waterMlPerBird > 0 && snap.waterMlPerBird != null && snap.waterMlPerBird > 0) {
		const wDelta = (snap.waterMlPerBird - std.waterMlPerBird) / std.waterMlPerBird * 100;
		if (Math.abs(wDelta) >= th.waterPct) {
			const over = wDelta > 0;
			out.push({
				id: `${flockId}-water`,
				severity: Math.abs(wDelta) >= th.waterPct * 1.8 ? "critical" : "warn",
				siteId,
				siteName,
				flockId,
				title: over ? "Надмірне споживання води" : "Мало п’ють",
				detail: `${round(snap.waterMlPerBird, 0)} мл/гол. проти норми ${round(std.waterMlPerBird, 0)} мл (${round(wDelta, 1)}%). Поріг ±${th.waterPct}%.`,
				metric: "вода",
				actual: snap.waterMlPerBird,
				standard: std.waterMlPerBird,
				deltaPct: wDelta
			});
		}
	}
	if (std.fcr > 0 && snap.fcr > 0) {
		const fDelta = (snap.fcr - std.fcr) / std.fcr * 100;
		if (fDelta >= 6) out.push({
			id: `${flockId}-fcr`,
			severity: fDelta >= 12 ? "critical" : "warn",
			siteId,
			siteName,
			flockId,
			title: "Погіршена конверсія корму",
			detail: `FCR ${round(snap.fcr, 3)} проти норми ${round(std.fcr, 3)} (${round(fDelta, 1)}%).`,
			metric: "FCR",
			actual: snap.fcr,
			standard: std.fcr,
			deltaPct: fDelta
		});
	}
	if (snap.tempMin != null && snap.tempMax != null) {
		const tooCold = snap.tempMin < std.tempMin - 1.5;
		const tooHot = snap.tempMax > std.tempMax + 1.5;
		if (tooCold || tooHot) out.push({
			id: `${flockId}-temp`,
			severity: tooCold && snap.tempMin < std.tempMin - 3 ? "critical" : "warn",
			siteId,
			siteName,
			flockId,
			title: tooHot ? "Перегрів у пташнику" : "Температура нижче зони комфорту",
			detail: `Факт ${round(snap.tempMin, 1)}–${round(snap.tempMax, 1)} °C, норма ${std.tempMin}–${std.tempMax} °C на ${snap.ageDays} добу.`,
			metric: "температура",
			actual: tooHot ? num(snap.tempMax) : num(snap.tempMin),
			standard: tooHot ? std.tempMax : std.tempMin,
			deltaPct: null
		});
	}
	if (snap.humidity != null && (snap.humidity < std.humidityMin || snap.humidity > std.humidityMax)) {
		const far = snap.humidity < std.humidityMin - 5 || snap.humidity > std.humidityMax + 5;
		out.push({
			id: `${flockId}-hum`,
			severity: far ? "warn" : "watch",
			siteId,
			siteName,
			flockId,
			title: "Вологість поза діапазоном",
			detail: `${round(snap.humidity, 0)}% при нормі ${std.humidityMin}–${std.humidityMax}% на ${snap.ageDays} добу.`,
			metric: "вологість",
			actual: snap.humidity,
			standard: (std.humidityMin + std.humidityMax) / 2,
			deltaPct: null
		});
	}
	const litter = buildLitterAdvice(parseDroppingLook(args.droppingLook), parseLitterState(args.litterState), snap.ageDays);
	if (litter && litter.severity !== "ok") out.push({
		id: `${flockId}-litter`,
		severity: litter.severity,
		siteId,
		siteName,
		flockId,
		title: "Послід / підстилка",
		detail: `${litter.lookLabel} · ${litter.litterLabel}. ${litter.vet[0] ?? litter.tech[0]}`,
		metric: "підстилка",
		actual: litter.severity === "critical" ? 3 : litter.severity === "warn" ? 2 : 1,
		standard: 0,
		deltaPct: null
	});
	return out;
}
function forecastCycle(c) {
	const chickCost = c.chicksPlaced * c.chickCostUah;
	const feedCost = c.cumFeedKg * c.feedPriceUah;
	const other = c.chicksPlaced * (c.otherPerBirdUah + c.gasPerBirdUah + c.medsPerBirdUah);
	const costToDate = chickCost + feedCost + other * Math.min(1, c.ageDays / Math.max(1, c.targetDays));
	const liveKg = c.head * c.avgWeightG / 1e3;
	const costPerKgLive = liveKg > 0 ? costToDate / liveKg : 0;
	const inventoryValue = liveKg * c.liveWeightPriceUah;
	const marginToDate = inventoryValue - costToDate;
	const profitabilityToDate = costToDate > 0 ? marginToDate / costToDate * 100 : 0;
	const remainingDays = Math.max(0, c.targetDays - c.ageDays);
	const stdNow = getStandard(c.ageDays, c.breed);
	const stdTarget = getStandard(c.targetDays, c.breed);
	const chick = startWeight(c.breed);
	const adg = c.recentAdgG > 0 ? c.recentAdgG : Math.max(40, stdNow.dailyGainG);
	const projectedWeightG = remainingDays ? Math.min(c.targetWeightG * 1.08, Math.round(c.avgWeightG + adg * remainingDays)) : c.avgWeightG;
	const remainingMortPct = Math.max(0, stdTarget.cumMortPct - stdNow.cumMortPct);
	const projectedHead = Math.max(0, Math.round(c.head * (1 - remainingMortPct / 100)));
	const fcrNow = biologicalFcr({
		cumFeedKg: c.cumFeedKg,
		remainingHead: c.head,
		remainingAvgG: c.avgWeightG,
		placed: c.chicksPlaced,
		cumSoldWeightKg: c.soldWeightKg ?? 0,
		breed: c.breed
	});
	const projectedAddFeedKg = Math.max(0, stdTarget.cumFeedG - stdNow.cumFeedG) * (stdNow.fcr > 0 && fcrNow > 0 ? Math.max(.9, fcrNow / stdNow.fcr) : 1) * c.head / 1e3;
	const projectedFeedKg = c.cumFeedKg + projectedAddFeedKg;
	const projectedCost = chickCost + projectedFeedKg * c.feedPriceUah + c.chicksPlaced * (c.otherPerBirdUah + c.gasPerBirdUah + c.medsPerBirdUah);
	const projectedLiveKg = projectedHead * projectedWeightG / 1e3;
	const projectedRevenue = projectedLiveKg * c.liveWeightPriceUah;
	const projectedProfit = projectedRevenue - projectedCost;
	const projectedProfitability = projectedCost > 0 ? projectedProfit / projectedCost * 100 : 0;
	const projectedCostPerKg = projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0;
	const projFcr = biologicalFcr({
		cumFeedKg: projectedFeedKg,
		remainingHead: projectedHead,
		remainingAvgG: projectedWeightG,
		placed: c.chicksPlaced,
		cumSoldWeightKg: c.soldWeightKg ?? 0,
		breed: c.breed
	});
	const projFcrForEpef = projFcr || (projectedLiveKg > 0 ? projectedFeedKg / (c.chicksPlaced * Math.max(0, projectedWeightG - chick) / 1e3) : 0);
	const projectedEpef = epefValue(livability(c.chicksPlaced, projectedHead, c.soldHead ?? 0), projectedWeightG, projFcrForEpef, c.targetDays);
	return {
		costToDate: round(costToDate, 0),
		costPerKgLive: round(costPerKgLive, 2),
		inventoryValue: round(inventoryValue, 0),
		marginToDate: round(marginToDate, 0),
		profitabilityToDate: round(profitabilityToDate, 1),
		remainingDays,
		projectedHead,
		projectedWeightG: Math.round(projectedWeightG),
		projectedFeedKg: round(projectedFeedKg, 0),
		projectedCost: round(projectedCost, 0),
		projectedCostPerKg: round(projectedCostPerKg, 2),
		projectedRevenue: round(projectedRevenue, 0),
		projectedProfit: round(projectedProfit, 0),
		projectedProfitability: round(projectedProfitability, 1),
		projectedEpef: round(projectedEpef, 0),
		projectedFcr: round(projFcr, 3)
	};
}
function densityKgM2(head, avgWeightG, areaM2) {
	if (areaM2 <= 0 || head <= 0 || avgWeightG <= 0) return 0;
	return head * avgWeightG / 1e3 / areaM2;
}
function forecastDensity(input) {
	const areaM2 = Math.max(0, input.areaM2);
	const limit = input.limitKgM2 && input.limitKgM2 > 0 ? input.limitKgM2 : 42;
	const warnDays = input.warnDays && input.warnDays > 0 ? input.warnDays : 5;
	const kgM2 = round(densityKgM2(input.head, input.avgWeightG, areaM2), 2);
	const blank = {
		kgM2,
		limitKgM2: limit,
		areaM2,
		daysToLimit: null,
		reachAgeDays: null,
		reachDate: null,
		warn: false,
		reached: false
	};
	if (areaM2 <= 0 || input.head <= 0 || input.avgWeightG <= 0 || !input.reportDate) return blank;
	if (kgM2 >= limit) return {
		...blank,
		daysToLimit: 0,
		reachAgeDays: input.ageDays,
		reachDate: input.reportDate,
		warn: true,
		reached: true
	};
	const targetWeightG = limit * areaM2 * 1e3 / input.head;
	const std = getStandard(input.ageDays, input.breed);
	const adg = input.recentAdgG > 0 ? input.recentAdgG : Math.max(40, std.dailyGainG);
	if (adg <= 0) return blank;
	const days = Math.ceil((targetWeightG - input.avgWeightG) / adg);
	if (days < 0) return {
		...blank,
		daysToLimit: 0,
		reachAgeDays: input.ageDays,
		reachDate: input.reportDate,
		warn: true,
		reached: true
	};
	if (days > 90) return blank;
	return {
		kgM2,
		limitKgM2: limit,
		areaM2,
		daysToLimit: days,
		reachAgeDays: input.ageDays + days,
		reachDate: addDaysISO(input.reportDate, days),
		warn: days <= warnDays,
		reached: false
	};
}
function statusFromDeviations(items) {
	if (items.some((d) => d.severity === "critical")) return "critical";
	if (items.some((d) => d.severity === "warn")) return "warn";
	if (items.some((d) => d.severity === "watch")) return "watch";
	return "ok";
}
//#endregion
export { saleAvgWeightG as a, forecastDensity as i, fcrAtSale as n, snapshotFromSeries as o, forecastCycle as r, statusFromDeviations as s, evaluateDeviations as t };
