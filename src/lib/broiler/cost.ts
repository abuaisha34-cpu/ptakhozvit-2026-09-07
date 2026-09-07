import { round } from "../utils.ts";
import { getStandard } from "./standards.ts";

export type CostArticles = {
  chick: number;
  feed: number;
  gas: number;
  meds: number;
  other: number;
};

export const EMPTY_ARTICLES: CostArticles = { chick: 0, feed: 0, gas: 0, meds: 0, other: 0 };

export const COST_ARTICLE_LABELS: Record<keyof CostArticles, string> = {
  chick: "Курчата",
  feed: "Корм",
  gas: "Газ / обігрів",
  meds: "Ветеринарія",
  other: "Інше (підстилка, світло, праця)",
};

export function articlesTotal(a: CostArticles): number {
  return round(a.chick + a.feed + a.gas + a.meds + a.other, 0);
}

export function sumArticles(list: CostArticles[]): CostArticles {
  return list.reduce(
    (s, a) => ({
      chick: s.chick + a.chick,
      feed: s.feed + a.feed,
      gas: s.gas + a.gas,
      meds: s.meds + a.meds,
      other: s.other + a.other,
    }),
    { ...EMPTY_ARTICLES },
  );
}

export function costArticles(
  args: {
    chicksPlaced: number;
    chickCostUah: number;
    feedPriceUah: number;
    gasPerBirdUah: number;
    medsPerBirdUah: number;
    otherPerBirdUah: number;
    ageDays: number;
    targetDays: number;
  },
  cumFeedKg: number,
  mode: "today" | "slaughter",
): CostArticles {
  const share = mode === "slaughter" ? 1 : Math.min(1, args.ageDays / Math.max(1, args.targetDays));
  return {
    chick: round(args.chicksPlaced * args.chickCostUah, 0),
    feed: round(cumFeedKg * args.feedPriceUah, 0),
    gas: round(args.chicksPlaced * args.gasPerBirdUah * share, 0),
    meds: round(args.chicksPlaced * args.medsPerBirdUah * share, 0),
    other: round(args.chicksPlaced * args.otherPerBirdUah * share, 0),
  };
}

export type CostSheet = {
  articles: CostArticles;
  total: number;
  liveKg: number;
  weightG: number;
  fcr: number;
  soldHead: number;
  perKg: number;
  perBirdSold: number;
  revenue: number;
  profit: number;
  profitabilityPct: number;
};

export function planCost(args: {
  breed: string;
  placed: number;
  targetDays: number;
  mortPct?: number;
  chickCostUah: number;
  feedPriceUah: number;
  gasPerBirdUah: number;
  medsPerBirdUah: number;
  otherPerBirdUah: number;
  liveWeightPriceUah: number;
}): CostSheet {
  const std = getStandard(args.targetDays, args.breed);
  const mort = args.mortPct ?? std.cumMortPct;
  const soldHead = Math.round(args.placed * (1 - mort / 100));
  const weightG = std.weightG;
  const liveKg = (soldHead * weightG) / 1000;
  const avgHead = (args.placed + soldHead) / 2;
  const feedKg = (std.cumFeedG * avgHead) / 1000;
  const articles = costArticles(
    {
      chicksPlaced: args.placed,
      chickCostUah: args.chickCostUah,
      feedPriceUah: args.feedPriceUah,
      gasPerBirdUah: args.gasPerBirdUah,
      medsPerBirdUah: args.medsPerBirdUah,
      otherPerBirdUah: args.otherPerBirdUah,
      ageDays: args.targetDays,
      targetDays: args.targetDays,
    },
    feedKg,
    "slaughter",
  );
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
    profitabilityPct: total > 0 ? round((profit / total) * 100, 1) : 0,
  };
}
