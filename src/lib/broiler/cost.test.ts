import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { articlesTotal, costArticles, planCost } from "./cost.ts";

const prices = {
  chickCostUah: 18,
  feedPriceUah: 14.5,
  gasPerBirdUah: 4.2,
  medsPerBirdUah: 2.8,
  otherPerBirdUah: 11.5,
  liveWeightPriceUah: 62,
};

describe("planCost", () => {
  it("gives a 20k Ross house a live-weight cost under the sale price", () => {
    const sheet = planCost({ breed: "Ross 308", placed: 20_000, targetDays: 42, ...prices });
    assert.ok(sheet.liveKg > 40_000, `live ${sheet.liveKg}`);
    assert.ok(sheet.perKg > 20 && sheet.perKg < prices.liveWeightPriceUah, `perKg ${sheet.perKg}`);
    assert.ok(sheet.profit > 0);
    assert.ok(sheet.articles.feed > sheet.articles.chick);
    assert.equal(sheet.total, articlesTotal(sheet.articles));
  });

  it("raises грн/кг when feed price goes up", () => {
    const a = planCost({ breed: "Ross 308", placed: 20_000, targetDays: 42, ...prices });
    const b = planCost({
      breed: "Ross 308",
      placed: 20_000,
      targetDays: 42,
      ...prices,
      feedPriceUah: 18,
    });
    assert.ok(b.perKg > a.perKg, `${a.perKg} vs ${b.perKg}`);
    assert.ok(b.articles.feed > a.articles.feed);
  });

  it("uses more feed for Cobb than Ross on the same days", () => {
    const ross = planCost({ breed: "Ross 308", placed: 20_000, targetDays: 42, ...prices });
    const cobb = planCost({ breed: "Cobb 500", placed: 20_000, targetDays: 42, ...prices });
    assert.ok(cobb.articles.feed > ross.articles.feed, `Cobb ${cobb.articles.feed} Ross ${ross.articles.feed}`);
  });
});

describe("costArticles", () => {
  it("splits chick and feed and prorates other costs by age", () => {
    const base = {
      chicksPlaced: 20_000,
      chickCostUah: 18,
      feedPriceUah: 14.5,
      gasPerBirdUah: 4,
      medsPerBirdUah: 2,
      otherPerBirdUah: 10,
      ageDays: 21,
      targetDays: 42,
    };
    const mid = costArticles(base, 40_000, "today");
    const end = costArticles(base, 80_000, "slaughter");
    assert.equal(mid.chick, 360_000);
    assert.equal(end.chick, 360_000);
    assert.ok(end.gas > mid.gas);
    assert.ok(end.feed > mid.feed);
  });
});
