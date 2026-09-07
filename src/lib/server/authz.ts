import type { Sql } from "@/lib/db";
import type { CostSettings, House, Profile, Role, Site } from "@/lib/broiler/types";
import { generateInviteCode } from "@/lib/broiler/org";
import { canManageFlocks, hasTechAccess, isPlatformAdmin, seesAllFactories } from "@/lib/broiler/roles";
import { num } from "@/lib/utils";
import { seedIfEmpty } from "./seed";

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Недостатньо прав") {
    super(message);
    this.name = "ForbiddenError";
  }
}

type ProfileRow = {
  user_id: string;
  role: string;
  site_id: number | null;
  full_name: string | null;
  email: string | null;
  org_id: number | null;
  org_name: string | null;
  invite_code: string | null;
  is_owner: boolean;
  is_admin: boolean;
  is_demo: boolean;
};

const FALLBACK_COSTS: CostSettings = {
  feedPriceUah: 14.5,
  chickPriceUah: 18,
  liveWeightPriceUah: 62,
  otherPerBirdUah: 11.5,
  gasPerBirdUah: 4.2,
  medsPerBirdUah: 2.8,
  feedAlertPct: 8,
  waterAlertPct: 10,
  weightAlertPct: 6,
};

export function mapProfile(row: ProfileRow): Profile {
  const role = row.role as Role;
  return {
    userId: row.user_id,
    role,
    siteId: row.site_id,
    fullName: row.full_name,
    email: row.email,
    orgId: row.org_id,
    orgName: row.org_name,
    inviteCode: hasTechAccess({
      role,
      isOwner: Boolean(row.is_owner),
      isAdmin: Boolean(row.is_admin),
    })
      ? row.invite_code
      : null,
    isOwner: Boolean(row.is_owner),
    isAdmin: Boolean(row.is_admin),
    isDemo: Boolean(row.is_demo),
  };
}

const PROFILE_SELECT = `p.user_id, p.role, p.site_id, p.full_name, p.email, p.org_id, p.is_owner,
       coalesce(p.is_admin, false) as is_admin,
       coalesce(p.is_demo, false) as is_demo,
       o.name as org_name, o.invite_code`;

async function loadProfileRow(sql: Sql, userId: string): Promise<ProfileRow | null> {
  const rows = await sql.query<ProfileRow>(
    `select ${PROFILE_SELECT}
       from staff_profiles p
       left join organizations o on o.id = p.org_id
      where p.user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function ensureProfile(
  sql: Sql,
  userId: string,
  hint?: { name?: string | null; email?: string | null },
): Promise<Profile> {
  await seedIfEmpty(sql);
  let row = await loadProfileRow(sql, userId);

  if (!row) {
    const ownerRows = await sql.query<{ c: string | number }>(
      "select count(*)::int as c from staff_profiles where is_owner = true",
    );
    const demoHint = /@guest\.ptakhozvit\.com\.ua$/i.test(hint?.email ?? "");
    const isOwner = num(ownerRows[0]?.c) === 0 && !demoHint;
    try {
      await sql.query(
        `insert into staff_profiles (user_id, role, site_id, full_name, email, org_id, is_owner)
         values ($1, 'pending', null, $2, $3, null, $4)`,
        [userId, hint?.name ?? null, hint?.email ?? null, isOwner],
      );
    } catch {
      if (!isOwner) throw new Error("Не вдалося створити профіль");
      await sql.query(
        `insert into staff_profiles (user_id, role, site_id, full_name, email, org_id, is_owner)
         values ($1, 'pending', null, $2, $3, null, false)`,
        [userId, hint?.name ?? null, hint?.email ?? null],
      );
    }
    row = await loadProfileRow(sql, userId);
    if (!row) throw new Error("Не вдалося створити профіль");
    return mapProfile(row);
  }

  if (!row.is_owner) {
    const ownerRows = await sql.query<{ c: string | number }>(
      "select count(*)::int as c from staff_profiles where is_owner = true",
    );
    if (num(ownerRows[0]?.c) === 0) {
      await sql.query("update staff_profiles set is_owner = true where user_id = $1", [userId]);
      row = { ...row, is_owner: true };
    }
  }

  if (row.role === "pending" && row.org_id) {
    const techCountRows = await sql.query<{ c: string | number }>(
      "select count(*)::int as c from staff_profiles where org_id = $1 and role = 'technologist'",
      [row.org_id],
    );
    if (num(techCountRows[0]?.c) === 0) {
      await sql.query("update staff_profiles set role = 'technologist' where user_id = $1", [userId]);
      row = { ...row, role: "technologist" };
    }
  }

  if ((hint?.name && !row.full_name) || (hint?.email && !row.email)) {
    await sql.query(
      `update staff_profiles
          set full_name = coalesce(full_name, $2),
              email = coalesce(email, $3)
        where user_id = $1`,
      [userId, hint?.name ?? null, hint?.email ?? null],
    );
    return mapProfile({
      ...row,
      full_name: row.full_name ?? hint?.name ?? null,
      email: row.email ?? hint?.email ?? null,
    });
  }
  return mapProfile(row);
}

export function requireOrgId(profile: Profile): number {
  if (!profile.orgId) {
    throw new ForbiddenError("Введіть код запрошення свого господарства");
  }
  return profile.orgId;
}

export function assertPlatformOwner(profile: Profile): void {
  if (!profile.isOwner) {
    throw new ForbiddenError("Лише хазяїн сайту");
  }
}

export function assertPlatformAdmin(profile: Profile): void {
  if (isPlatformAdmin(profile)) return;
  throw new ForbiddenError("Лише хазяїн або адміністратор системи");
}

export function assertTechnologist(profile: Profile): void {
  if (hasTechAccess(profile)) return;
  throw new ForbiddenError("Лише головний технолог або партнер");
}

export async function resolveOrgId(
  sql: Sql,
  profile: Profile,
  requested?: number | null,
): Promise<number> {
  if (isPlatformAdmin(profile) && requested) {
    const rows = await sql.query<{ id: number }>("select id from organizations where id = $1", [
      requested,
    ]);
    if (!rows[0]) throw new ForbiddenError("Господарство не знайдено");
    return requested;
  }
  return requireOrgId(profile);
}

export function assertCanAccessSite(profile: Profile, siteId: number): void {
  if (isPlatformAdmin(profile)) return;
  if (!profile.orgId) {
    throw new ForbiddenError("Немає доступу до цієї фабрики");
  }
  if (seesAllFactories(profile)) return;
  if (
    (profile.role === "site_manager" ||
      profile.role === "director" ||
      profile.role === "veterinarian") &&
    profile.siteId === siteId
  ) {
    return;
  }
  throw new ForbiddenError("Немає доступу до цієї фабрики");
}

export function assertCanManageFlocks(profile: Profile, siteId: number): void {
  if (!canManageFlocks(profile)) {
    throw new ForbiddenError("Немає права відкривати посадки чи змінювати поголівʼя");
  }
  assertCanAccessSite(profile, siteId);
}

export async function assertSiteOfOrg(
  sql: Sql,
  profile: Profile,
  siteId: number,
): Promise<void> {
  if (isPlatformAdmin(profile)) {
    const rows = await sql.query<{ id: number }>("select id from sites where id = $1", [siteId]);
    if (!rows[0]) throw new ForbiddenError("Немає доступу до цієї фабрики");
    return;
  }
  const ids = await visibleSiteIds(sql, profile);
  if (!ids.includes(siteId)) {
    throw new ForbiddenError("Немає доступу до цієї фабрики");
  }
  assertCanAccessSite(profile, siteId);
}

export async function loadSites(sql: Sql, orgId: number | null | undefined): Promise<Site[]> {
  if (!orgId) return [];
  return loadSitesWhere(sql, "s.org_id = $1", [orgId]);
}

export async function loadSiteById(sql: Sql, siteId: number): Promise<Site | null> {
  const rows = await loadSitesWhere(sql, "s.id = $1", [siteId]);
  return rows[0] ?? null;
}

async function loadSitesWhere(sql: Sql, where: string, params: unknown[]): Promise<Site[]> {
  const rows = await sql.query<{
    id: number;
    org_id: number;
    code: string;
    name: string;
    location: string;
    houses: number;
    capacity: number;
    sort_order: number;
    geo_name: string | null;
    geo_admin: string | null;
    lat: string | number | null;
    lon: string | number | null;
  }>(
    `select s.id, s.org_id, s.code, s.name, s.location, s.sort_order,
            s.geo_name, s.geo_admin, s.lat, s.lon,
            coalesce(h.n, s.houses)::int as houses,
            coalesce(h.cap, s.capacity)::int as capacity
       from sites s
       left join (
         select site_id, count(*)::int as n, coalesce(sum(capacity),0)::int as cap
           from houses group by site_id
       ) h on h.site_id = s.id
      where ${where}
      order by s.sort_order, s.id`,
    params,
  );
  return rows.map((r) => ({
    id: r.id,
    orgId: r.org_id,
    code: r.code,
    name: r.name,
    location: r.location,
    houses: r.houses,
    capacity: r.capacity,
    sortOrder: r.sort_order,
    geoName: r.geo_name,
    geoAdmin: r.geo_admin,
    lat: r.lat == null ? null : num(r.lat),
    lon: r.lon == null ? null : num(r.lon),
  }));
}

export async function loadHouses(sql: Sql, siteIds?: number[]): Promise<House[]> {
  if (siteIds && siteIds.length === 0) return [];
  const filter = siteIds?.length
    ? `where site_id in (${siteIds.map((_, i) => `$${i + 1}`).join(", ")})`
    : "";
  const rows = await sql.query<{
    id: number;
    site_id: number;
    code: string;
    name: string;
    capacity: number;
    area_m2: string | number;
    sort_order: number;
  }>(
    `select id, site_id, code, name, capacity, area_m2, sort_order from houses ${filter} order by site_id, sort_order, id`,
    siteIds ?? [],
  );
  return rows.map((r) => ({
    id: r.id,
    siteId: r.site_id,
    code: r.code,
    name: r.name,
    capacity: r.capacity,
    areaM2: num(r.area_m2),
    sortOrder: r.sort_order,
  }));
}

export async function loadHouseById(sql: Sql, houseId: number): Promise<House | null> {
  const rows = await sql.query<{
    id: number;
    site_id: number;
    code: string;
    name: string;
    capacity: number;
    area_m2: string | number;
    sort_order: number;
  }>(
    "select id, site_id, code, name, capacity, area_m2, sort_order from houses where id = $1",
    [houseId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    siteId: r.site_id,
    code: r.code,
    name: r.name,
    capacity: r.capacity,
    areaM2: num(r.area_m2),
    sortOrder: r.sort_order,
  };
}

export async function ensureCostSettings(sql: Sql, orgId: number): Promise<void> {
  const existing = await sql.query<{ id: number }>(
    "select id from cost_settings where org_id = $1",
    [orgId],
  );
  if (existing[0]) return;
  await sql.query(
    `insert into cost_settings (id, org_id)
     select coalesce(max(id), 0) + 1, $1 from cost_settings`,
    [orgId],
  );
}

export async function loadCostSettings(sql: Sql, orgId: number | null | undefined): Promise<CostSettings> {
  if (!orgId) return FALLBACK_COSTS;
  try {
    await ensureCostSettings(sql, orgId);
    const rows = await sql.query<{
      feed_price_uah: string;
      chick_price_uah: string;
      live_weight_price_uah: string;
      other_per_bird_uah: string;
      gas_per_bird_uah: string;
      meds_per_bird_uah: string;
      feed_alert_pct?: string | number | null;
      water_alert_pct?: string | number | null;
      weight_alert_pct?: string | number | null;
    }>(
      `select feed_price_uah, chick_price_uah, live_weight_price_uah, other_per_bird_uah,
              gas_per_bird_uah, meds_per_bird_uah,
              feed_alert_pct, water_alert_pct, weight_alert_pct
         from cost_settings where org_id = $1`,
      [orgId],
    );
    const r = rows[0];
    return {
      feedPriceUah: num(r?.feed_price_uah ?? FALLBACK_COSTS.feedPriceUah),
      chickPriceUah: num(r?.chick_price_uah ?? FALLBACK_COSTS.chickPriceUah),
      liveWeightPriceUah: num(r?.live_weight_price_uah ?? FALLBACK_COSTS.liveWeightPriceUah),
      otherPerBirdUah: num(r?.other_per_bird_uah ?? FALLBACK_COSTS.otherPerBirdUah),
      gasPerBirdUah: num(r?.gas_per_bird_uah ?? FALLBACK_COSTS.gasPerBirdUah),
      medsPerBirdUah: num(r?.meds_per_bird_uah ?? FALLBACK_COSTS.medsPerBirdUah),
      feedAlertPct: num(r?.feed_alert_pct ?? FALLBACK_COSTS.feedAlertPct) || FALLBACK_COSTS.feedAlertPct,
      waterAlertPct: num(r?.water_alert_pct ?? FALLBACK_COSTS.waterAlertPct) || FALLBACK_COSTS.waterAlertPct,
      weightAlertPct: num(r?.weight_alert_pct ?? FALLBACK_COSTS.weightAlertPct) || FALLBACK_COSTS.weightAlertPct,
    };
  } catch {
    return FALLBACK_COSTS;
  }
}

export async function visibleSiteIds(sql: Sql, profile: Profile): Promise<number[]> {
  if (!profile.orgId) return [];
  const sites = await loadSites(sql, profile.orgId);
  if (seesAllFactories(profile)) return sites.map((s) => s.id);
  if (
    profile.siteId &&
    (profile.role === "site_manager" ||
      profile.role === "director" ||
      profile.role === "veterinarian") &&
    sites.some((s) => s.id === profile.siteId)
  ) {
    return [profile.siteId];
  }
  return [];
}

export async function insertOrganization(
  sql: Sql,
  userId: string,
  name: string,
): Promise<{ orgId: number; inviteCode: string }> {
  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("Вкажіть назву господарства");
  if (trimmed.length > 80) throw new Error("Назва задовга");
  let inviteCode = generateInviteCode();
  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const rows = await sql.query<{ id: number }>(
        `insert into organizations (name, invite_code, created_by)
         values ($1, $2, $3) returning id`,
        [trimmed, inviteCode, userId],
      );
      const orgId = rows[0].id;
      await ensureCostSettings(sql, orgId);
      return { orgId, inviteCode };
    } catch (err) {
      lastError = err;
      inviteCode = generateInviteCode();
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Не вдалося створити господарство");
}

export async function insertFactory(
  sql: Sql,
  orgId: number,
  data: { name: string; location?: string; houseCount: number; capacity: number },
): Promise<{ siteId: number; code: string }> {
  const name = data.name.trim();
  if (name.length < 2) throw new Error("Вкажіть назву фабрики");
  const houseCount = Math.min(24, Math.max(1, Math.round(data.houseCount)));
  const cap = Math.min(200000, Math.max(500, Math.round(data.capacity)));
  const countRows = await sql.query<{ c: number }>(
    "select coalesce(max(sort_order), 0)::int as c from sites where org_id = $1",
    [orgId],
  );
  let n = (countRows[0]?.c ?? 0) + 1;
  let code = `F${n}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const clash = await sql.query<{ id: number }>(
      "select id from sites where org_id = $1 and code = $2",
      [orgId, code],
    );
    if (!clash[0]) break;
    n += 1;
    code = `F${n}`;
  }
  const siteRows = await sql.query<{ id: number }>(
    `insert into sites (org_id, code, name, location, houses, capacity, sort_order)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [orgId, code, name, (data.location ?? "").trim(), houseCount, cap * houseCount, n],
  );
  const siteId = siteRows[0].id;
  for (let i = 1; i <= houseCount; i += 1) {
    await sql.query(
      `insert into houses (site_id, code, name, capacity, area_m2, sort_order)
       values ($1, $2, $3, $4, $5, $6)`,
      [siteId, `H${i}`, `Пташник ${i}`, cap, Math.round(cap / 18), i],
    );
  }
  return { siteId, code };
}
