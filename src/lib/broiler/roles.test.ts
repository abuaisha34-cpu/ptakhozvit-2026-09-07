import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Profile } from "./types.ts";
import { canDeleteReports, canManageFlocks, canManageOps, hasTechAccess, isPlatformAdmin, seesAllFactories } from "./roles.ts";

function profile(role: Profile["role"], extra: Partial<Profile> = {}): Profile {
  return {
    userId: "u",
    role,
    siteId: extra.siteId ?? null,
    fullName: null,
    email: null,
    orgId: 1,
    orgName: "Тест",
    inviteCode: null,
    isOwner: extra.isOwner ?? false,
    isAdmin: extra.isAdmin ?? false,
    isDemo: extra.isDemo ?? false,
  };
}

describe("hasTechAccess", () => {
  it("treats partner like the chief technologist", () => {
    assert.equal(hasTechAccess(profile("technologist")), true);
    assert.equal(hasTechAccess(profile("partner")), true);
    assert.equal(hasTechAccess(profile("pending", { isOwner: true })), true);
    assert.equal(hasTechAccess(profile("director")), false);
    assert.equal(hasTechAccess(profile("site_manager")), false);
    assert.equal(hasTechAccess(profile("pending", { isAdmin: true })), true);
    assert.equal(isPlatformAdmin(profile("pending", { isAdmin: true })), true);
    assert.equal(isPlatformAdmin(profile("technologist")), false);
  });
});

describe("partner visibility", () => {
  it("sees all factories and ops", () => {
    const p = profile("partner");
    assert.equal(seesAllFactories(p), true);
    assert.equal(canManageOps(p), true);
    assert.equal(canManageFlocks(p), true);
  });
});

describe("canDeleteReports", () => {
  it("is tech/admin only", () => {
    assert.equal(canDeleteReports(profile("technologist")), true);
    assert.equal(canDeleteReports(profile("partner")), true);
    assert.equal(canDeleteReports(profile("site_manager")), false);
    assert.equal(canDeleteReports(profile("veterinarian")), false);
    assert.equal(canDeleteReports(profile("director")), false);
    assert.equal(canDeleteReports(profile("technologist", { isDemo: true })), false);
  });
});
