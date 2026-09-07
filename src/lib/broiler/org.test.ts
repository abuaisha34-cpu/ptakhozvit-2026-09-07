import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateInviteCode, generateSheetsToken, isInviteCodeFormat, isSheetsTokenFormat, normalizeInviteCode } from "./org.ts";

describe("normalizeInviteCode", () => {
  it("strips spaces, dashes and lowercases", () => {
    assert.equal(normalizeInviteCode(" ab-12 cd "), "AB12CD");
    assert.equal(normalizeInviteCode("k7_m.p2"), "K7MP2");
  });
});

describe("generateInviteCode", () => {
  it("is 6 unambiguous chars", () => {
    const code = generateInviteCode(() => 0);
    assert.equal(code.length, 6);
    assert.equal(isInviteCodeFormat(code), true);
    assert.equal(/[01IO]/.test(code), false);
  });
});

describe("generateSheetsToken", () => {
  it("is 24 chars for IMPORTDATA urls", () => {
    const token = generateSheetsToken(() => 0);
    assert.equal(token.length, 24);
    assert.equal(isSheetsTokenFormat(token), true);
  });
});
