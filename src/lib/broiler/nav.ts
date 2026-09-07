import { canManageFlocks, canManageOps, isPlatformAdmin } from "./roles.ts";
import type { Profile } from "./types.ts";

export type NavAccess = "owner" | "org" | "ops" | "flocks";
export type NavGroupId = "work" | "tools" | "economy" | "farm";
export type NavTo =
  | "/"
  | "/report"
  | "/journal"
  | "/tools"
  | "/feed"
  | "/guide"
  | "/cost"
  | "/forecasts"
  | "/period"
  | "/holdings"
  | "/settings"
  | "/team";

export type NavDef = {
  to: NavTo;
  hash?: string;
  label: string;
  access: NavAccess;
  group: NavGroupId;
};

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: "work", label: "Робота" },
  { id: "tools", label: "Інструменти" },
  { id: "economy", label: "Економіка" },
  { id: "farm", label: "Господарство" },
];

export const NAV_ITEMS: NavDef[] = [
  { to: "/", label: "Сьогодні", access: "org", group: "work" },
  { to: "/report", label: "Звіт", access: "org", group: "work" },
  { to: "/journal", label: "Журнал", access: "org", group: "work" },

  { to: "/tools", label: "Усі інструменти", access: "org", group: "tools" },
  { to: "/tools", hash: "light", label: "Освітлення", access: "org", group: "tools" },
  { to: "/tools", hash: "premix", label: "Премікс", access: "org", group: "tools" },
  { to: "/tools", hash: "place", label: "Посадка", access: "org", group: "tools" },
  { to: "/tools", hash: "norm", label: "Норма кросу", access: "org", group: "tools" },
  { to: "/feed", label: "Корм", access: "org", group: "tools" },
  { to: "/guide", label: "Довідник", access: "org", group: "tools" },

  { to: "/cost", label: "Собівартість", access: "org", group: "economy" },
  { to: "/forecasts", label: "Прогнози", access: "org", group: "economy" },
  { to: "/period", label: "Період", access: "org", group: "economy" },

  { to: "/holdings", label: "Господарства", access: "owner", group: "farm" },
  { to: "/settings", label: "Посадки", access: "flocks", group: "farm" },
  { to: "/team", label: "Команда", access: "ops", group: "farm" },
];

export function navItemKey(item: Pick<NavDef, "to" | "hash">): string {
  return item.hash ? `${item.to}#${item.hash}` : item.to;
}

export function navItemVisible(item: Pick<NavDef, "access">, profile: Profile): boolean {
  if (item.access === "owner") return isPlatformAdmin(profile);
  if (!profile.orgId && isPlatformAdmin(profile)) return false;
  if (item.access === "ops") return canManageOps(profile);
  if (item.access === "flocks") return canManageFlocks(profile);
  return Boolean(profile.orgId) || isPlatformAdmin(profile);
}

export function navItemActive(item: NavDef, pathname: string, hash: string): boolean {
  const h = hash.replace(/^#/, "");
  if (item.to === "/") return pathname === "/" && !item.hash;
  if (item.hash) return pathname === item.to && h === item.hash;
  if (item.to === "/tools") return pathname === "/tools" && !h;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function groupsFor(profile: Profile): { id: NavGroupId; label: string; items: NavDef[] }[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: NAV_ITEMS.filter((n) => n.group === g.id && navItemVisible(n, profile)),
  })).filter((g) => g.items.length > 0);
}
