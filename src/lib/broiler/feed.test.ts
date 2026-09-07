import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFeed, kcalFromMj, parseFeedValues } from "./feed.ts";

describe("evaluateFeed", () => {
  it("scores a balanced starter as ok", () => {
    const v = evaluateFeed("starter", {
      moisture: 12.4,
      protein: 21.5,
      fat: 6.2,
      fiber: 3.1,
      ash: 5.8,
      calcium: 0.92,
      phosphorus: 0.66,
      energyKcal: 3070,
    });
    assert.ok(v);
    assert.equal(v.severity, "ok");
    assert.ok(v.score >= 85);
    assert.match(v.headline, /нормі/i);
  });

  it("flags wet high-fiber finisher", () => {
    const v = evaluateFeed("finisher", {
      moisture: 15.2,
      protein: 18.2,
      fiber: 6.4,
    });
    assert.ok(v);
    assert.ok(v.severity === "warn" || v.severity === "critical");
    const moisture = v.checks.find((c) => c.id === "moisture");
    assert.ok(moisture);
    assert.notEqual(moisture.severity, "ok");
  });

  it("treats aflatoxin as critical", () => {
    const v = evaluateFeed("prestarter", {
      protein: 23,
      aflatoxin: 0.08,
    });
    assert.ok(v);
    assert.equal(v.severity, "critical");
    assert.ok(v.score < 70);
  });

  it("ignores empty fields", () => {
    const v = evaluateFeed("grower", { protein: 20 });
    assert.ok(v);
    assert.equal(v.filled, 1);
    assert.equal(v.checks[0].id, "protein");
  });

  it("returns null when nothing is filled", () => {
    assert.equal(evaluateFeed("starter", {}), null);
  });
});

describe("parseFeedValues", () => {
  it("accepts comma decimals and skips junk", () => {
    const v = parseFeedValues({ protein: "21,4", moisture: "abc", fat: -1, energyKcal: 3000 });
    assert.equal(v.protein, 21.4);
    assert.equal(v.energyKcal, 3000);
    assert.equal(v.moisture, undefined);
    assert.equal(v.fat, undefined);
  });
});

describe("kcalFromMj", () => {
  it("converts megajoules", () => {
    assert.equal(kcalFromMj(10), 2390);
  });
});
