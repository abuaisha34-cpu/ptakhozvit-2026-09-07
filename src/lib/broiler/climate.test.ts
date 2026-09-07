import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildClimateAdvice, humidityTarget, type WeatherDay } from "./climate.ts";

function day(partial: Partial<WeatherDay>): WeatherDay {
  return {
    date: "2026-08-28",
    tempMin: 12,
    tempMax: 22,
    humidityMean: 55,
    precipMm: 0,
    precipProb: null,
    windMaxMs: 3,
    kind: "clear",
    label: "Ясно",
    ...partial,
  };
}

describe("humidityTarget", () => {
  it("is 50–55% on placement day", () => {
    assert.deepEqual(humidityTarget(0), { min: 50, max: 55 });
  });

  it("is 50–60% through day 14", () => {
    assert.deepEqual(humidityTarget(1), { min: 50, max: 60 });
    assert.deepEqual(humidityTarget(7), { min: 50, max: 60 });
    assert.deepEqual(humidityTarget(14), { min: 50, max: 60 });
  });

  it("is 50–70% after day 14", () => {
    assert.deepEqual(humidityTarget(15), { min: 50, max: 70 });
    assert.deepEqual(humidityTarget(42), { min: 50, max: 70 });
  });
});

describe("buildClimateAdvice", () => {
  it("marks cold night as critical for chicks", () => {
    const a = buildClimateAdvice({
      ageDays: 2,
      houseTempMin: 33,
      houseTempMax: 35,
      outdoor: day({ tempMin: 4, tempMax: 14, kind: "cloudy", label: "Хмарно" }),
    });
    assert.equal(a.severity, "critical");
    assert.match(a.headline, /курчат|опален|брудер|зал/i);
    assert.ok(a.items.some((i) => /брудер|протяг/i.test(i.detail)));
  });

  it("flags heat stress for finish birds", () => {
    const a = buildClimateAdvice({
      ageDays: 35,
      houseTempMin: 20,
      houseTempMax: 22,
      outdoor: day({ tempMin: 18, tempMax: 33, humidityMean: 45, kind: "clear" }),
    });
    assert.ok(["warn", "critical"].includes(a.severity));
    assert.ok(a.items.some((i) => /теплового|тунель/i.test(`${i.title} ${i.detail}`)));
  });

  it("is calm when outdoor sits near house target", () => {
    const a = buildClimateAdvice({
      ageDays: 21,
      houseTempMin: 24,
      houseTempMax: 26,
      outdoor: day({ tempMin: 18, tempMax: 25 }),
    });
    assert.ok(["ok", "watch"].includes(a.severity));
  });

  it("flags indoor humidity above 55% on placement", () => {
    const a = buildClimateAdvice({
      ageDays: 0,
      houseTempMin: 33,
      houseTempMax: 35,
      indoorHumidity: 65,
      outdoor: day({ tempMin: 18, tempMax: 24 }),
    });
    assert.equal(a.humidityMin, 50);
    assert.equal(a.humidityMax, 55);
    assert.ok(a.items.some((i) => /вологість/i.test(i.title) && /65/.test(i.detail)));
  });

  it("keeps 50–60% band on day 10", () => {
    const a = buildClimateAdvice({
      ageDays: 10,
      houseTempMin: 28,
      houseTempMax: 30,
      indoorHumidity: 55,
      outdoor: day({ tempMin: 16, tempMax: 22 }),
    });
    assert.equal(a.humidityMin, 50);
    assert.equal(a.humidityMax, 60);
    assert.ok(!a.items.some((i) => /вологість/i.test(i.title)));
  });
});
