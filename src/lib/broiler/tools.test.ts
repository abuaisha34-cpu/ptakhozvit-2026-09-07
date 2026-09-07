import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LAMP_TYPES,
  cyclePremix,
  feedKgRange,
  lampPlan,
  lightEnergyKwh,
  lightingProgram,
  placePlan,
  premixOrder,
} from "./tools.ts";

describe("lightingProgram", () => {
  it("starts at 23 hours and 30–40 lux on placement", () => {
    const p = lightingProgram(0);
    assert.equal(p.lightH, 23);
    assert.equal(p.darkH, 1);
    assert.ok(p.lux >= 30);
  });

  it("reaches 6 hours of darkness by day 14", () => {
    const p = lightingProgram(14);
    assert.equal(p.darkH, 6);
    assert.equal(p.lightH, 18);
    assert.ok(p.lux <= 10);
  });

  it("does not jump darkness by more than 2 hours a day in week 2", () => {
    for (let d = 6; d <= 12; d += 1) {
      const a = lightingProgram(d);
      const b = lightingProgram(d + 1);
      assert.ok(b.darkH - a.darkH <= 2, `day ${d} ${a.darkH} → ${b.darkH}`);
    }
  });
});

describe("lampPlan", () => {
  it("sizes lamps for a 1000 m² house at 20 lux", () => {
    const plan = lampPlan(1000, 20, LAMP_TYPES[0]);
    assert.ok(plan.count >= 10 && plan.count <= 20, `count ${plan.count}`);
    assert.ok(plan.wPerM2 > 0.2 && plan.wPerM2 < 0.6, `W/m² ${plan.wPerM2}`);
    assert.ok(lightEnergyKwh(plan, 23) > 5);
  });
});

describe("premixOrder", () => {
  it("orders more bags for 2.5% than 1% on the same flock", () => {
    const a = premixOrder({
      breed: "Ross 308",
      placed: 20_000,
      inclusionPct: 1,
      bagKg: 25,
      fromDay: 0,
      toDay: 42,
      phase: "cycle",
    });
    const b = premixOrder({
      breed: "Ross 308",
      placed: 20_000,
      inclusionPct: 2.5,
      bagKg: 25,
      fromDay: 0,
      toDay: 42,
      phase: "cycle",
    });
    assert.ok(a.feedKg > 50_000, `feed ${a.feedKg}`);
    assert.ok(b.premixKg > a.premixKg * 2);
    assert.ok(b.bags > a.bags);
    assert.equal(a.bags, Math.ceil(a.premixKg / 25));
  });

  it("splits the cycle into four phases that sum to the tour", () => {
    const rows = cyclePremix({
      breed: "Ross 308",
      placed: 20_000,
      inclusionPct: 2.5,
      bagKg: 25,
    });
    const cycle = rows.find((r) => r.phase === "cycle");
    const parts = rows.filter((r) => r.phase !== "cycle");
    assert.equal(parts.length, 4);
    assert.ok(cycle);
    const feedSum = parts.reduce((s, r) => s + r.feedKg, 0);
    assert.ok(Math.abs(feedSum - (cycle?.feedKg ?? 0)) < 2);
  });

  it("uses more feed for Cobb than Ross", () => {
    const ross = feedKgRange("Ross 308", 20_000, 0, 42);
    const cobb = feedKgRange("Cobb 500", 20_000, 0, 42);
    assert.ok(cobb > ross, `Cobb ${cobb} Ross ${ross}`);
  });
});

describe("placePlan", () => {
  it("places ~18–20k chicks in a 1000 m² house at 42 kg/m² and 2.8 kg", () => {
    const p = placePlan({
      lengthM: 100,
      widthM: 12,
      targetKgM2: 42,
      targetWeightG: 2800,
      mortPct: 4,
    });
    assert.ok(p.placed > 16_000 && p.placed < 20_000, `placed ${p.placed}`);
    assert.ok(p.nipples > 1000);
    assert.ok(p.pans > 250);
    assert.ok(p.totalAreaM2 > 1100 && p.totalAreaM2 < 1200);
  });
});
