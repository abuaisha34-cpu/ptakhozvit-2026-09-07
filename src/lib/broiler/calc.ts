import { getStandard, startWeight, type StandardDay } from "./standards";
import { buildLitterAdvice, parseDroppingLook, parseLitterState } from "./litter";
import { cumulativeMortalityPct, livabilityPct } from "./mort";
import { biologicalFcr } from "./fcr";
import { num, round, addDaysISO } from "@/lib/utils";

export type Severity = "ok" | "watch" | "warn" | "critical";

export type AlertThresholds = {
  feedPct: number;
  waterPct: number;
  weightPct: number;
};

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  feedPct: 8,
  waterPct: 10,
  weightPct: 6,
};

export type Deviation = {
  id: string;
  severity: Severity;
  siteId: number;
  siteName: string;
  flockId: number;
  title: string;
  detail: string;
  metric: string;
  actual: number;
  standard: number | null;
  deltaPct: number | null;
};

export type DailySnapshot = {
  ageDays: number;
  head: number;
  placed: number;
  mortality: number;
  culled: number;
  dayMortPct: number;
  cumMortPct: number;
  livabilityPct: number;
  avgWeightG: number;
  dailyGainG: number;
  feedKg: number;
  cumFeedKg: number;
  feedGPerBird: number;
  waterL: number | null;
  waterMlPerBird: number | null;
  fcr: number;
  epef: number;
  tempMin: number | null;
  tempMax: number | null;
  humidity: number | null;
  standard: StandardDay;
};

export function livability(placed: number, head: number, soldHead = 0): number {
  return livabilityPct(placed, head, soldHead);
}

export function dayMortPct(dead: number, headStart: number): number {
  if (!headStart) return 0;
  return (dead / headStart) * 100;
}

export function fcrValue(cumFeedKg: number, placed: number, avgWeightG: number, breed?: string | null): number {
  return biologicalFcr({
    cumFeedKg,
    remainingHead: placed,
    remainingAvgG: avgWeightG,
    placed,
    breed,
  });
}

export function saleAvgWeightG(soldHead: number, soldWeightKg: number): number {
  if (soldHead <= 0 || soldWeightKg <= 0) return 0;
  return (soldWeightKg * 1000) / soldHead;
}

/** Biological FCR using scale weights of sold birds plus remaining inventory. */
export function fcrAtSale(input: {
  cumFeedKg: number;
  cumSoldWeightKg: number;
  remainingHead: number;
  remainingAvgG: number;
  placed: number;
  breed?: string | null;
}): number {
  return biologicalFcr(input);
}

/** European Production Efficiency Factor. */
export function epefValue(
  livabilityPct: number,
  avgWeightG: number,
  fcr: number,
  ageDays: number,
): number {
  if (!fcr || !ageDays) return 0;
  return (livabilityPct * (avgWeightG / 1000) * 100) / (fcr * ageDays);
}

export function snapshotFromSeries(input: {
  placed: number;
  ageDays: number;
  head: number;
  mortality: number;
  culled: number;
  headStart: number;
  avgWeightG: number;
  prevWeightG: number;
  feedKg: number;
  cumFeedKg: number;
  waterL?: number | null;
  tempMin: number | null;
  tempMax: number | null;
  humidity: number | null;
  breed?: string | null;
  soldHead?: number;
  soldWeightKg?: number;
}): DailySnapshot {
  const standard = getStandard(input.ageDays, input.breed);
  const sold = Math.max(0, input.soldHead ?? 0);
  const liv = livabilityPct(input.placed, input.head, sold);
  const fcr = biologicalFcr({
    cumFeedKg: input.cumFeedKg,
    remainingHead: input.head,
    remainingAvgG: input.avgWeightG,
    placed: input.placed,
    cumSoldWeightKg: input.soldWeightKg ?? 0,
    breed: input.breed,
  });
  const feedGPerBird = input.headStart ? (input.feedKg * 1000) / input.headStart : 0;
  const waterMlPerBird =
    input.waterL != null && input.headStart ? (input.waterL * 1000) / input.headStart : null;
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
    standard,
  };
}

export function severityFrom(deltaAbsPct: number, warnAt: number, critAt: number): Severity {
  if (deltaAbsPct >= critAt) return "critical";
  if (deltaAbsPct >= warnAt) return "warn";
  if (deltaAbsPct >= warnAt * 0.5) return "watch";
  return "ok";
}

export function evaluateDeviations(args: {
  siteId: number;
  siteName: string;
  flockId: number;
  snap: DailySnapshot;
  missingToday: boolean;
  reportDate: string;
  thresholds?: AlertThresholds;
  droppingLook?: string | null;
  litterState?: string | null;
}): Deviation[] {
  const { siteId, siteName, flockId, snap } = args;
  const std = snap.standard;
  const th = args.thresholds ?? DEFAULT_THRESHOLDS;
  const out: Deviation[] = [];

  if (args.missingToday) {
    out.push({
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
      deltaPct: -100,
    });
  }

  const mortDelta = snap.dayMortPct - std.dailyMortPct;
  if (snap.dayMortPct >= 0.35 || mortDelta >= 0.18) {
    out.push({
      id: `${flockId}-mort-day`,
      severity: snap.dayMortPct >= 0.45 || mortDelta >= 0.28 ? "critical" : "warn",
      siteId,
      siteName,
      flockId,
      title: "Підвищений добовий падіж",
      detail: `${round(snap.dayMortPct, 2)}% за добу при нормі ${round(std.dailyMortPct, 2)}% (${snap.mortality + snap.culled} гол.).`,
      metric: "падіж",
      actual: snap.dayMortPct,
      standard: std.dailyMortPct,
      deltaPct: std.dailyMortPct ? (mortDelta / std.dailyMortPct) * 100 : null,
    });
  }

  const cumMortDelta = snap.cumMortPct - std.cumMortPct;
  if (cumMortDelta >= 0.8) {
    out.push({
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
      deltaPct: std.cumMortPct ? (cumMortDelta / std.cumMortPct) * 100 : null,
    });
  }

  if (std.weightG > 0 && snap.avgWeightG > 0) {
    const wDelta = ((snap.avgWeightG - std.weightG) / std.weightG) * 100;
    if (wDelta <= -th.weightPct) {
      out.push({
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
        deltaPct: wDelta,
      });
    } else if (wDelta >= Math.max(10, th.weightPct * 1.5)) {
      out.push({
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
        deltaPct: wDelta,
      });
    }
  }

  if (std.feedGPerBird > 0 && snap.feedGPerBird > 0) {
    const fDelta = ((snap.feedGPerBird - std.feedGPerBird) / std.feedGPerBird) * 100;
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
        deltaPct: fDelta,
      });
    }
  }

  if (std.waterMlPerBird > 0 && snap.waterMlPerBird != null && snap.waterMlPerBird > 0) {
    const wDelta = ((snap.waterMlPerBird - std.waterMlPerBird) / std.waterMlPerBird) * 100;
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
        deltaPct: wDelta,
      });
    }
  }

  if (std.fcr > 0 && snap.fcr > 0) {
    const fDelta = ((snap.fcr - std.fcr) / std.fcr) * 100;
    if (fDelta >= 6) {
      out.push({
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
        deltaPct: fDelta,
      });
    }
  }

  if (snap.tempMin != null && snap.tempMax != null) {
    const tooCold = snap.tempMin < std.tempMin - 1.5;
    const tooHot = snap.tempMax > std.tempMax + 1.5;
    if (tooCold || tooHot) {
      out.push({
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
        deltaPct: null,
      });
    }
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
      deltaPct: null,
    });
  }

  const litter = buildLitterAdvice(
    parseDroppingLook(args.droppingLook),
    parseLitterState(args.litterState),
    snap.ageDays,
  );
  if (litter && litter.severity !== "ok") {
    out.push({
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
      deltaPct: null,
    });
  }

  return out;
}

export type CostInput = {
  chicksPlaced: number;
  chickCostUah: number;
  cumFeedKg: number;
  feedPriceUah: number;
  otherPerBirdUah: number;
  gasPerBirdUah: number;
  medsPerBirdUah: number;
  liveWeightPriceUah: number;
  head: number;
  avgWeightG: number;
  ageDays: number;
  targetDays: number;
  targetWeightG: number;
  recentAdgG: number;
  breed?: string | null;
  soldHead?: number;
  soldWeightKg?: number;
};

export type Forecast = {
  costToDate: number;
  costPerKgLive: number;
  inventoryValue: number;
  marginToDate: number;
  profitabilityToDate: number;
  remainingDays: number;
  projectedHead: number;
  projectedWeightG: number;
  projectedFeedKg: number;
  projectedCost: number;
  projectedCostPerKg: number;
  projectedRevenue: number;
  projectedProfit: number;
  projectedProfitability: number;
  projectedEpef: number;
  projectedFcr: number;
};

export function forecastCycle(c: CostInput): Forecast {
  const chickCost = c.chicksPlaced * c.chickCostUah;
  const feedCost = c.cumFeedKg * c.feedPriceUah;
  const other = c.chicksPlaced * (c.otherPerBirdUah + c.gasPerBirdUah + c.medsPerBirdUah);
  const costToDate = chickCost + feedCost + other * Math.min(1, c.ageDays / Math.max(1, c.targetDays));

  const liveKg = (c.head * c.avgWeightG) / 1000;
  const costPerKgLive = liveKg > 0 ? costToDate / liveKg : 0;
  const inventoryValue = liveKg * c.liveWeightPriceUah;
  const marginToDate = inventoryValue - costToDate;
  const profitabilityToDate = costToDate > 0 ? (marginToDate / costToDate) * 100 : 0;

  const remainingDays = Math.max(0, c.targetDays - c.ageDays);
  const stdNow = getStandard(c.ageDays, c.breed);
  const stdTarget = getStandard(c.targetDays, c.breed);
  const chick = startWeight(c.breed);
  const adg = c.recentAdgG > 0 ? c.recentAdgG : Math.max(40, stdNow.dailyGainG);
  const projectedWeightG = remainingDays
    ? Math.min(c.targetWeightG * 1.08, Math.round(c.avgWeightG + adg * remainingDays))
    : c.avgWeightG;

  const remainingMortPct = Math.max(0, stdTarget.cumMortPct - stdNow.cumMortPct);
  const projectedHead = Math.max(
    0,
    Math.round(c.head * (1 - remainingMortPct / 100)),
  );

  const fcrNow = biologicalFcr({
    cumFeedKg: c.cumFeedKg,
    remainingHead: c.head,
    remainingAvgG: c.avgWeightG,
    placed: c.chicksPlaced,
    cumSoldWeightKg: c.soldWeightKg ?? 0,
    breed: c.breed,
  });
  const remainingFeedGPerBird = Math.max(0, stdTarget.cumFeedG - stdNow.cumFeedG);
  const fcrDrift = stdNow.fcr > 0 && fcrNow > 0 ? Math.max(0.9, fcrNow / stdNow.fcr) : 1;
  const projectedAddFeedKg = (remainingFeedGPerBird * fcrDrift * c.head) / 1000;
  const projectedFeedKg = c.cumFeedKg + projectedAddFeedKg;

  const projectedCost =
    chickCost +
    projectedFeedKg * c.feedPriceUah +
    c.chicksPlaced * (c.otherPerBirdUah + c.gasPerBirdUah + c.medsPerBirdUah);

  const projectedLiveKg = (projectedHead * projectedWeightG) / 1000;
  const projectedRevenue = projectedLiveKg * c.liveWeightPriceUah;
  const projectedProfit = projectedRevenue - projectedCost;
  const projectedProfitability = projectedCost > 0 ? (projectedProfit / projectedCost) * 100 : 0;
  const projectedCostPerKg = projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0;
  const projFcr = biologicalFcr({
    cumFeedKg: projectedFeedKg,
    remainingHead: projectedHead,
    remainingAvgG: projectedWeightG,
    placed: c.chicksPlaced,
    cumSoldWeightKg: c.soldWeightKg ?? 0,
    breed: c.breed,
  });
  const projFcrForEpef = projFcr || (projectedLiveKg > 0
    ? projectedFeedKg / ((c.chicksPlaced * Math.max(0, projectedWeightG - chick)) / 1000)
    : 0);
  const projectedEpef = epefValue(
    livability(c.chicksPlaced, projectedHead, c.soldHead ?? 0),
    projectedWeightG,
    projFcrForEpef,
    c.targetDays,
  );

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
    projectedFcr: round(projFcr, 3),
  };
}

export const DENSITY_LIMIT_KG_M2 = 42;
export const DENSITY_WARN_DAYS = 5;

export type DensityForecast = {
  kgM2: number;
  limitKgM2: number;
  areaM2: number;
  daysToLimit: number | null;
  reachAgeDays: number | null;
  reachDate: string | null;
  warn: boolean;
  reached: boolean;
};

export function densityKgM2(head: number, avgWeightG: number, areaM2: number): number {
  if (areaM2 <= 0 || head <= 0 || avgWeightG <= 0) return 0;
  return (head * avgWeightG) / 1000 / areaM2;
}

export function forecastDensity(input: {
  head: number;
  avgWeightG: number;
  ageDays: number;
  areaM2: number;
  recentAdgG: number;
  breed?: string | null;
  reportDate: string;
  limitKgM2?: number;
  warnDays?: number;
}): DensityForecast {
  const areaM2 = Math.max(0, input.areaM2);
  const limit = input.limitKgM2 && input.limitKgM2 > 0 ? input.limitKgM2 : DENSITY_LIMIT_KG_M2;
  const warnDays = input.warnDays && input.warnDays > 0 ? input.warnDays : DENSITY_WARN_DAYS;
  const kgM2 = round(densityKgM2(input.head, input.avgWeightG, areaM2), 2);
  const blank: DensityForecast = {
    kgM2,
    limitKgM2: limit,
    areaM2,
    daysToLimit: null,
    reachAgeDays: null,
    reachDate: null,
    warn: false,
    reached: false,
  };
  if (areaM2 <= 0 || input.head <= 0 || input.avgWeightG <= 0 || !input.reportDate) return blank;
  if (kgM2 >= limit) {
    return {
      ...blank,
      daysToLimit: 0,
      reachAgeDays: input.ageDays,
      reachDate: input.reportDate,
      warn: true,
      reached: true,
    };
  }
  const targetWeightG = (limit * areaM2 * 1000) / input.head;
  const std = getStandard(input.ageDays, input.breed);
  const adg = input.recentAdgG > 0 ? input.recentAdgG : Math.max(40, std.dailyGainG);
  if (adg <= 0) return blank;
  const days = Math.ceil((targetWeightG - input.avgWeightG) / adg);
  if (days < 0) {
    return {
      ...blank,
      daysToLimit: 0,
      reachAgeDays: input.ageDays,
      reachDate: input.reportDate,
      warn: true,
      reached: true,
    };
  }
  if (days > 90) return blank;
  return {
    kgM2,
    limitKgM2: limit,
    areaM2,
    daysToLimit: days,
    reachAgeDays: input.ageDays + days,
    reachDate: addDaysISO(input.reportDate, days),
    warn: days <= warnDays,
    reached: false,
  };
}

export function statusFromDeviations(items: Deviation[]): Severity {
  if (items.some((d) => d.severity === "critical")) return "critical";
  if (items.some((d) => d.severity === "warn")) return "warn";
  if (items.some((d) => d.severity === "watch")) return "watch";
  return "ok";
}
