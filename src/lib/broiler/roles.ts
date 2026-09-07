import type { Profile, Role } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  technologist: "Головний технолог",
  partner: "Партнер",
  director: "Директор",
  veterinarian: "Ветеринарний лікар",
  site_manager: "Керівник фабрики",
  pending: "Очікує призначення",
};

export const ASSIGNABLE_ROLES: Role[] = [
  "technologist",
  "partner",
  "director",
  "veterinarian",
  "site_manager",
  "pending",
];

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export function staffLabel(profile: Profile): string {
  if (profile.isDemo) return "Демо-доступ";
  if (profile.isOwner) return "Хазяїн сайту";
  if (profile.isAdmin) return "Адміністратор системи";
  return roleLabel(profile.role);
}

/** Owner or appointed system administrator — all holdings. */
export function isPlatformAdmin(profile: Pick<Profile, "isOwner" | "isAdmin">): boolean {
  return profile.isOwner || profile.isAdmin;
}

/** Same visibility and ops as the chief technologist. */
export function hasTechAccess(profile: Pick<Profile, "role" | "isOwner" | "isAdmin">): boolean {
  return isPlatformAdmin(profile) || profile.role === "technologist" || profile.role === "partner";
}

export function seesAllFactories(profile: Profile): boolean {
  if (hasTechAccess(profile)) return true;
  if ((profile.role === "director" || profile.role === "veterinarian") && !profile.siteId) {
    return true;
  }
  return false;
}

export function factoryRequired(role: Role): boolean {
  return role === "site_manager";
}

export function factorySelectable(role: Role): boolean {
  return role === "site_manager" || role === "director" || role === "veterinarian";
}

export function canManageOps(profile: Profile): boolean {
  return hasTechAccess(profile);
}

/** Open/edit placements and headcount on accessible factories. */
export function canManageFlocks(profile: Profile): boolean {
  return (
    hasTechAccess(profile) ||
    profile.role === "site_manager" ||
    profile.role === "director"
  );
}

export function canDeleteReports(profile: Profile): boolean {
  return hasTechAccess(profile) && !profile.isDemo;
}

/** Change vaccination/treatment calendar for a house or the org template. */
export function canEditTreatments(profile: Pick<Profile, "role" | "isOwner" | "isAdmin" | "isDemo">): boolean {
  if (profile.isDemo) return false;
  return hasTechAccess(profile) || profile.role === "veterinarian";
}

/** Guest on the shared advertising demo farm. */
export function isDemoUser(profile: Pick<Profile, "isDemo">): boolean {
  return Boolean(profile.isDemo);
}

export function dashboardTitle(profile: Profile, factoryName?: string | null): string {
  if (profile.role === "site_manager") return factoryName ?? "Моя фабрика";
  if (profile.role === "veterinarian") return profile.orgName ? `Ветеринарія · ${profile.orgName}` : "Ветеринарний контроль";
  if (profile.orgName) return profile.orgName;
  return "Зведення виробництва";
}
