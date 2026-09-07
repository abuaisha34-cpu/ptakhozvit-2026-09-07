import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getStandard, houseDailyForecast } from "./standards.ts";
import { cumulativeMortalityPct, livabilityPct } from "./mort.ts";
import { biologicalFcr } from "./fcr.ts";

describe("houseDailyForecast", () => {
  it("scales Ross 308 day 21 to house head", () => {
    const std = getStandard(21, "Ross 308");
    const f = houseDailyForecast(std, 40_000);
    assert.equal(f.weightG, std.weightG);
    assert.equal(f.feedKg, round1((std.feedGPerBird * 40_000) / 1000));
    assert.equal(f.waterL, Math.round((std.waterMlPerBird * 40_000) / 1000));
    assert.ok(f.weightG > 900 && f.weightG < 1100);
    assert.ok(f.feedKg > 4000);
    assert.ok(f.waterL > 8000);
  });

  it("is zero feed and water when the house is empty", () => {
    const std = getStandard(21, "Cobb 500");
    const f = houseDailyForecast(std, 0);
    assert.equal(f.feedKg, 0);
    assert.equal(f.waterL, 0);
    assert.ok(f.weightG > 0);
  });
});

describe("cumulativeMortalityPct", () => {
  it("does not count a partial sale as mortality", () => {
    const placed = 19_743;
    const sold = 4_075;
    const remaining = placed - sold;
    assert.equal(Number(cumulativeMortalityPct(placed, remaining, sold).toFixed(2)), 0);
    assert.equal(Number(livabilityPct(placed, remaining, sold).toFixed(1)), 100);
  });

  it("counts only dead and culled after a sale", () => {
    const placed = 20_000;
    const sold = 4_075;
    const dead = 120;
    const remaining = placed - dead - sold;
    assert.equal(Number(cumulativeMortalityPct(placed, remaining, sold).toFixed(2)), 0.6);
    assert.equal(Number(livabilityPct(placed, remaining, sold).toFixed(2)), 99.4);
  });
});

describe("biologicalFcr", () => {
  it("counts sold live weight in the gain, not as a loss", () => {
    const placed = 20_000;
    const soldHead = 4_075;
    const remaining = placed - soldHead;
    const avgG = 2400;
    const soldKg = (soldHead * avgG) / 1000;
    const feed = 80_000;
    const withSale = biologicalFcr({
      cumFeedKg: feed,
      remainingHead: remaining,
      remainingAvgG: avgG,
      placed,
      cumSoldWeightKg: soldKg,
      breed: "Ross 308",
    });
    const withoutSale = biologicalFcr({
      cumFeedKg: feed,
      remainingHead: remaining,
      remainingAvgG: avgG,
      placed,
      cumSoldWeightKg: 0,
      breed: "Ross 308",
    });
    assert.ok(withSale > 1.4 && withSale < 1.9);
    assert.ok(withoutSale > withSale);
  });

  it("is zero when there is no gain yet", () => {
    assert.equal(
      biologicalFcr({
        cumFeedKg: 100,
        remainingHead: 10_000,
        remainingAvgG: 40,
        placed: 10_000,
        breed: "Ross 308",
      }),
      0,
    );
  });
});

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
