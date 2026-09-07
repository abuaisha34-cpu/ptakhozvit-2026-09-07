import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupsFor, navItemActive, navItemKey, navItemVisible } from "./nav.ts";
import type { Profile } from "./types.ts";

function profile(patch: Partial<Profile> = {}): Profile {
  return {
    userId: "u",
    role: "technologist",
    siteId: null,
    fullName: "Тест",
    email: "t@x",
    orgId: 1,
    orgName: "Ферма",
    inviteCode: "ABC",
    isOwner: false,
    isAdmin: false,
    isDemo: false,
    ...patch,
  };
}

describe("navItemVisible", () => {
  it("hides holdings from a farm technologist", () => {
    assert.equal(navItemVisible({ access: "owner" }, profile()), false);
    assert.equal(navItemVisible({ access: "org" }, profile()), true);
    assert.equal(navItemVisible({ access: "ops" }, profile()), true);
  });

  it("hides team from a veterinarian", () => {
    const vet = profile({ role: "veterinarian" });
    assert.equal(navItemVisible({ access: "ops" }, vet), false);
    assert.equal(navItemVisible({ access: "org" }, vet), true);
    assert.equal(navItemVisible({ access: "flocks" }, vet), false);
  });

  it("shows holdings only to the platform owner", () => {
    assert.equal(navItemVisible({ access: "owner" }, profile({ isOwner: true, orgId: 1 })), true);
  });
});

describe("groupsFor", () => {
  it("gives a technologist four groups including tools", () => {
    const g = groupsFor(profile());
    assert.deepEqual(
      g.map((x) => x.id),
      ["work", "tools", "economy", "farm"],
    );
    const tools = g.find((x) => x.id === "tools");
    assert.ok(tools?.items.some((i) => i.hash === "premix"));
    assert.ok(tools?.items.some((i) => i.to === "/feed"));
    assert.ok(!g.some((x) => x.items.some((i) => i.to === "/holdings")));
  });

  it("hides farm group from a vet without flock rights", () => {
    const g = groupsFor(profile({ role: "veterinarian" }));
    assert.ok(!g.some((x) => x.id === "farm"));
    assert.ok(g.some((x) => x.id === "tools"));
    assert.ok(g.some((x) => x.id === "economy"));
  });

  it("keeps unique keys for hash items", () => {
    assert.equal(navItemKey({ to: "/tools" }), "/tools");
    assert.equal(navItemKey({ to: "/tools", hash: "premix" }), "/tools#premix");
  });
});

describe("navItemActive", () => {
  it("matches a tools hash without lighting up the overview item", () => {
    assert.equal(navItemActive({ to: "/tools", label: "x", access: "org", group: "tools" }, "/tools", ""), true);
    assert.equal(
      navItemActive({ to: "/tools", hash: "premix", label: "x", access: "org", group: "tools" }, "/tools", "premix"),
      true,
    );
    assert.equal(
      navItemActive({ to: "/tools", label: "x", access: "org", group: "tools" }, "/tools", "premix"),
      false,
    );
  });
});
