import { round } from "../utils.ts";
import { FEED_PHASES, type FeedPhase } from "./feed.ts";
import { getStandard } from "./standards.ts";

export type LightingProgram = {
  ageDays: number;
  lightH: number;
  darkH: number;
  lux: number;
  luxMax: number;
  note: string;
};

/** Aviagen-style step-down: 23 год на посадці, з 7-ї доби додаємо темряву до 6 год. */
export function lightingProgram(ageDays: number): LightingProgram {
  const d = Math.max(0, Math.round(ageDays));
  if (d <= 0) {
    return { ageDays: d, lightH: 23, darkH: 1, lux: 30, luxMax: 40, note: "Посадка. Курча має знайти корм і воду." };
  }
  if (d <= 6) {
    return { ageDays: d, lightH: 23, darkH: 1, lux: 20, luxMax: 30, note: "Перший тиждень. Високий люкс, майже цілодобове світло." };
  }
  if (d === 7) {
    return { ageDays: d, lightH: 22, darkH: 2, lux: 15, luxMax: 20, note: "Початок темряви. Не ріжте більше ніж на 1–2 год за добу." };
  }
  if (d === 8) {
    return { ageDays: d, lightH: 21, darkH: 3, lux: 12, luxMax: 15, note: "Зменшення дня." };
  }
  if (d === 9) {
    return { ageDays: d, lightH: 20, darkH: 4, lux: 10, luxMax: 12, note: "Зменшення дня." };
  }
  if (d === 10) {
    return { ageDays: d, lightH: 19, darkH: 5, lux: 10, luxMax: 12, note: "Зменшення дня." };
  }
  if (d <= 14) {
    return { ageDays: d, lightH: 18, darkH: 6, lux: 8, luxMax: 10, note: "6 годин темряви. Ріст, спокійніший птах." };
  }
  return { ageDays: d, lightH: 18, darkH: 6, lux: 5, luxMax: 10, note: "Ріст і фініш. 5–10 лк, без різких стрибків." };
}

export type LampType = {
  id: string;
  name: string;
  watts: number;
  lumens: number;
};

export const LAMP_TYPES: LampType[] = [
  { id: "led20", name: "LED 20 Вт", watts: 20, lumens: 3000 },
  { id: "led30", name: "LED 30 Вт", watts: 30, lumens: 4500 },
  { id: "led50", name: "LED 50 Вт", watts: 50, lumens: 7500 },
];

const LIGHT_UTIL = 0.55;

export type LampPlan = {
  count: number;
  watts: number;
  wPerM2: number;
  neededLm: number;
  kWhPerHour: number;
};

export function lampPlan(areaM2: number, lux: number, lamp: LampType): LampPlan {
  const area = Math.max(0, areaM2);
  const neededLm = area <= 0 || lux <= 0 ? 0 : (lux * area) / LIGHT_UTIL;
  const count = lamp.lumens > 0 && neededLm > 0 ? Math.ceil(neededLm / lamp.lumens) : 0;
  const watts = count * lamp.watts;
  return {
    count,
    watts,
    wPerM2: area > 0 ? round(watts / area, 2) : 0,
    neededLm: round(neededLm, 0),
    kWhPerHour: round(watts / 1000, 3),
  };
}

export function lightEnergyKwh(plan: LampPlan, lightH: number, days = 1): number {
  return round(plan.kWhPerHour * Math.max(0, lightH) * Math.max(0, days), 2);
}

export const PHASE_SPAN: Record<FeedPhase, { from: number; to: number }> = {
  prestarter: { from: 0, to: 10 },
  starter: { from: 11, to: 21 },
  grower: { from: 22, to: 35 },
  finisher: { from: 36, to: 42 },
};

export type PremixProduct = {
  id: string;
  name: string;
  inclusionPct: number;
  bagKg: number;
};

export const PREMIX_PRODUCTS: PremixProduct[] = [
  { id: "gf-1", name: "GREENFEED 1%", inclusionPct: 1, bagKg: 25 },
  { id: "gf-25", name: "GREENFEED 2,5%", inclusionPct: 2.5, bagKg: 25 },
  { id: "gf-5", name: "GREENFEED 5%", inclusionPct: 5, bagKg: 25 },
  { id: "custom", name: "Інший премікс", inclusionPct: 2.5, bagKg: 25 },
];

export function feedKgRange(breed: string, placed: number, fromDay: number, toDay: number): number {
  const from = Math.max(0, Math.round(fromDay));
  const to = Math.max(from, Math.round(toDay));
  const head0 = Math.max(0, placed);
  let kg = 0;
  for (let d = from; d <= to; d += 1) {
    const std = getStandard(d, breed);
    const prev = getStandard(Math.max(0, d - 1), breed);
    const head = head0 * (1 - (d === 0 ? 0 : prev.cumMortPct) / 100);
    kg += (std.feedGPerBird * head) / 1000;
  }
  return round(kg, 1);
}

export type PremixOrder = {
  phase: FeedPhase | "cycle";
  fromDay: number;
  toDay: number;
  feedKg: number;
  premixKg: number;
  bags: number;
  cost: number | null;
};

export function premixOrder(args: {
  breed: string;
  placed: number;
  inclusionPct: number;
  bagKg: number;
  fromDay: number;
  toDay: number;
  phase: FeedPhase | "cycle";
  pricePerKg?: number;
}): PremixOrder {
  const feedKg = feedKgRange(args.breed, args.placed, args.fromDay, args.toDay);
  const incl = Math.max(0, args.inclusionPct) / 100;
  const premixKg = round(feedKg * incl, 1);
  const bag = Math.max(0.1, args.bagKg);
  const bags = premixKg > 0 ? Math.ceil(premixKg / bag) : 0;
  const price = args.pricePerKg != null && args.pricePerKg > 0 ? args.pricePerKg : null;
  return {
    phase: args.phase,
    fromDay: args.fromDay,
    toDay: args.toDay,
    feedKg,
    premixKg,
    bags,
    cost: price != null ? round(premixKg * price, 0) : null,
  };
}

export function cyclePremix(args: {
  breed: string;
  placed: number;
  inclusionPct: number;
  bagKg: number;
  pricePerKg?: number;
}): PremixOrder[] {
  const rows = FEED_PHASES.map((p) => {
    const span = PHASE_SPAN[p.id];
    return premixOrder({ ...args, fromDay: span.from, toDay: span.to, phase: p.id });
  });
  const feedKg = round(rows.reduce((s, r) => s + r.feedKg, 0), 1);
  const premixKg = round(rows.reduce((s, r) => s + r.premixKg, 0), 1);
  const bags = rows.reduce((s, r) => s + r.bags, 0);
  const cost = rows.every((r) => r.cost != null) ? rows.reduce((s, r) => s + (r.cost ?? 0), 0) : null;
  rows.push({ phase: "cycle", fromDay: 0, toDay: 42, feedKg, premixKg, bags, cost });
  return rows;
}

export type PlacePlan = {
  areaM2: number;
  totalAreaM2: number;
  placed: number;
  soldHead: number;
  liveKg: number;
  densityNow: number;
  nipples: number;
  pans: number;
  birdsPerM2: number;
};

export function placePlan(args: {
  lengthM: number;
  widthM: number;
  houses?: number;
  usablePct?: number;
  targetKgM2: number;
  targetWeightG: number;
  mortPct: number;
}): PlacePlan {
  const houses = Math.max(1, Math.round(args.houses ?? 1));
  const usable = Math.min(100, Math.max(50, args.usablePct ?? 95)) / 100;
  const areaM2 = round(Math.max(0, args.lengthM) * Math.max(0, args.widthM) * usable, 1);
  const totalAreaM2 = round(areaM2 * houses, 1);
  const liveKg = round(totalAreaM2 * Math.max(0, args.targetKgM2), 0);
  const wKg = Math.max(0.04, args.targetWeightG / 1000);
  const soldHead = wKg > 0 ? Math.floor(liveKg / wKg) : 0;
  const surv = Math.min(0.999, Math.max(0.7, 1 - Math.max(0, args.mortPct) / 100));
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
    birdsPerM2,
  };
}
