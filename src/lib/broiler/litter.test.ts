import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLitterAdvice,
  parseDroppingLook,
  parseLitterState,
} from "./litter.ts";

describe("parse litter options", () => {
  it("accepts known ids and rejects junk", () => {
    assert.equal(parseDroppingLook("bloody"), "bloody");
    assert.equal(parseDroppingLook("nope"), null);
    assert.equal(parseLitterState("caked"), "caked");
    assert.equal(parseLitterState(""), null);
  });
});

describe("buildLitterAdvice", () => {
  it("is ok for normal droppings on dry litter", () => {
    const a = buildLitterAdvice("normal", "dry", 10);
    assert.ok(a);
    assert.equal(a.severity, "ok");
    assert.ok(a.tech.length >= 1);
    assert.ok(a.vet.length >= 1);
  });

  it("marks bloody droppings critical", () => {
    const a = buildLitterAdvice("bloody", "dry", 21);
    assert.equal(a?.severity, "critical");
    assert.match(a?.vet.join(" ") ?? "", /кокцид/i);
  });

  it("marks wet litter critical even if droppings are normal", () => {
    const a = buildLitterAdvice("normal", "wet", 5);
    assert.equal(a?.severity, "critical");
    assert.match(a?.tech.join(" ") ?? "", /калюж|протікан|підсип/i);
  });

  it("returns null when nothing is chosen", () => {
    assert.equal(buildLitterAdvice(null, null, 3), null);
  });
});
