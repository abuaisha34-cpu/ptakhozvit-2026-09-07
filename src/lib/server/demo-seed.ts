import type { Sql } from "@/lib/db";
import { breedByName, getStandard } from "@/lib/broiler/standards";
import { insertFactory } from "./authz";
import { addDaysISO, diffDays, round, todayISO } from "@/lib/utils";

export const DEMO_ORG_NAME = "Демо · ПтахоЗвіт";
export const DEMO_INVITE = "DEM7KX";

function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function asIsoDate(value: unknown): string {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  }
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    if (value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0) {
      return value.toISOString().slice(0, 10);
    }
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Kyiv",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }
  return "";
}

export async function ensureDemoOrg(sql: Sql): Promise<{ orgId: number; created: boolean }> {
  const existing = await sql.query<{ id: number }>(
    "select id from organizations where is_demo = true order by id limit 1",
  );
  if (existing[0]) {
    await refreshDemoIfStale(sql, existing[0].id);
    return { orgId: existing[0].id, created: false };
  }

  const org = await sql.query<{ id: number }>(
    `insert into organizations (name, invite_code, created_by, is_demo)
     values ($1, $2, 'demo-seed', true)
     returning id`,
    [DEMO_ORG_NAME, DEMO_INVITE],
  );
  const orgId = org[0].id;
  const costs = await sql.query<{ id: number }>("select id from cost_settings where org_id = $1", [orgId]);
  if (!costs[0]) {
    await sql.query(
      `insert into cost_settings (id, org_id)
       select coalesce(max(id), 0) + 1, $1 from cost_settings`,
      [orgId],
    );
  }
  await fillDemoProduction(sql, orgId);
  return { orgId, created: true };
}

async function refreshDemoIfStale(sql: Sql, orgId: number): Promise<void> {
  await sql.query(
    `update flocks set breed = 'Hubbard Flex'
      where breed in ('Hubbard', 'hubbard')
        and site_id in (select id from sites where org_id = $1)`,
    [orgId],
  );
  const due = addDaysISO(todayISO(), -1);
  const stats = await sql.query<{ flocks: string | number; last: unknown; oldest: unknown }>(
    `select
       (select count(*)::int from flocks f join sites s on s.id = f.site_id
         where s.org_id = $1 and f.status = 'active') as flocks,
       (select max(d.report_date) from daily_reports d
          join flocks f on f.id = d.flock_id
          join sites s on s.id = f.site_id
         where s.org_id = $1) as last,
       (select min(f.placed_at) from flocks f join sites s on s.id = f.site_id
         where s.org_id = $1 and f.status = 'active') as oldest`,
    [orgId],
  );
  const flocks = Number(stats[0]?.flocks ?? 0);
  const last = asIsoDate(stats[0]?.last);
  const oldest = asIsoDate(stats[0]?.oldest);
  const agedOut = oldest ? diffDays(oldest, due) > 45 : false;
  if (flocks >= 4 && last === due && !agedOut) return;
  if (flocks >= 1 && last && last < due && !agedOut) {
    await topUpDemoReports(sql, orgId, due);
    return;
  }
  await wipeDemoProduction(sql, orgId);
  await fillDemoProduction(sql, orgId);
}

async function wipeDemoProduction(sql: Sql, orgId: number): Promise<void> {
  await sql.query(
    `delete from daily_reports
      where flock_id in (
        select f.id from flocks f join sites s on s.id = f.site_id where s.org_id = $1
      )`,
    [orgId],
  );
  await sql.query(`delete from flocks where site_id in (select id from sites where org_id = $1)`, [orgId]);
}

export async function resetDemoOrg(sql: Sql): Promise<number> {
  const { orgId } = await ensureDemoOrg(sql);
  await wipeDemoProduction(sql, orgId);
  await fillDemoProduction(sql, orgId);
  return orgId;
}

async function topUpDemoReports(sql: Sql, orgId: number, due: string): Promise<void> {
  const flocks = await sql.query<{
    id: number;
    breed: string;
    placed_at: unknown;
    house_id: number;
    chicks_placed: number;
  }>(
    `select f.id, f.breed, f.placed_at, f.house_id, f.chicks_placed
       from flocks f
       join sites s on s.id = f.site_id
      where s.org_id = $1 and f.status = 'active'`,
    [orgId],
  );
  for (const flock of flocks) {
    const placedAt = asIsoDate(flock.placed_at);
    const last = await sql.query<{
      report_date: unknown;
      head_end: number;
      dropping_look: string | null;
      litter_state: string | null;
    }>(
      `select report_date, head_end, dropping_look, litter_state
         from daily_reports where flock_id = $1
         order by report_date desc limit 1`,
      [flock.id],
    );
    let cursor = last[0] ? addDaysISO(asIsoDate(last[0].report_date), 1) : placedAt;
    let head = last[0] ? Number(last[0].head_end) : Number(flock.chicks_placed);
    const look = last[0]?.dropping_look || "normal";
    const litter = last[0]?.litter_state || "dry";
    const houseIndex = flocks.indexOf(flock) % 4;
    while (cursor && cursor <= due) {
      const day = diffDays(placedAt, cursor);
      if (day < 0 || day > 49) break;
      head = await insertDemoReport(sql, {
        flockId: flock.id,
        houseId: flock.house_id,
        breed: flock.breed,
        date: cursor,
        day,
        headStart: head,
        look,
        litter,
        note: "",
        houseIndex,
      });
      cursor = addDaysISO(cursor, 1);
    }
  }
}

async function insertDemoReport(
  sql: Sql,
  args: {
    flockId: number;
    houseId: number;
    breed: string;
    date: string;
    day: number;
    headStart: number;
    look: string;
    litter: string;
    note: string;
    houseIndex: number;
  },
): Promise<number> {
  const std = getStandard(args.day, args.breed);
  const j = jitter(args.houseId * 100 + args.day);
  const mort = args.day === 0 ? 0 : Math.max(0, Math.round(3 + j * 4 + args.day * 0.08));
  const culled = args.day > 0 && args.day % 9 === 0 ? 2 : 0;
  const head = Math.max(0, args.headStart - mort - culled);
  const weight = Math.max(40, Math.round(std.weightG * (0.97 + args.houseIndex * 0.008 + (j - 0.5) * 0.03)));
  const feedKg = round((std.feedGPerBird * args.headStart * (1.01 + (j - 0.5) * 0.04)) / 1000, 1);
  const waterL = round((std.waterMlPerBird * args.headStart * (1.02 + (j - 0.5) * 0.05)) / 1000, 1);
  const tMin = round(std.tempMin + (j - 0.4), 1);
  const tMax = round(std.tempMax + (j - 0.5) * 1.2, 1);
  const hum = Math.round(58 + (j - 0.5) * 10);
  await sql.query(
    `insert into daily_reports (
       flock_id, report_date, age_days, head_start, mortality, culled, head_end,
       avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
       dropping_look, litter_state, notes, submitted_by, sold_head, sold_weight_kg
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'demo-seed',0,0)`,
    [
      args.flockId,
      args.date,
      args.day,
      args.headStart,
      mort,
      culled,
      head,
      weight,
      feedKg,
      waterL,
      tMin,
      tMax,
      hum,
      args.look,
      args.litter,
      args.note,
    ],
  );
  return head;
}

async function fillDemoProduction(sql: Sql, orgId: number): Promise<void> {
  let sites = await sql.query<{ id: number }>("select id from sites where org_id = $1 order by id", [orgId]);
  if (!sites[0]) {
    await insertFactory(sql, orgId, {
      name: "Фабрика Весняна",
      location: "Вінницька область",
      houseCount: 4,
      capacity: 18000,
    });
    await sql.query(
      `update sites set geo_name = 'Вінниця', geo_admin = 'Вінницька область', lat = 49.2331, lon = 28.4682
        where org_id = $1`,
      [orgId],
    );
    sites = await sql.query<{ id: number }>("select id from sites where org_id = $1 order by id", [orgId]);
  }
  const siteId = sites[0].id;
  const houses = await sql.query<{ id: number; code: string; name: string; area_m2: number }>(
    "select id, code, name, coalesce(area_m2, 1000) as area_m2 from houses where site_id = $1 order by sort_order, id",
    [siteId],
  );
  if (houses.length < 4) return;

  const today = todayISO();
  const due = addDaysISO(today, -1);
  const specs = [
    { breed: "Ross 308", age: 18, chicks: 17540, look: "normal" as const, litter: "dry" as const, meds: false },
    { breed: "Ross 308", age: 27, chicks: 17820, look: "soft" as const, litter: "moist" as const, meds: true },
    { breed: "Cobb 500", age: 11, chicks: 17200, look: "normal" as const, litter: "dry" as const, meds: false },
    { breed: "Hubbard Flex", age: 33, chicks: 18000, look: "loose" as const, litter: "caked" as const, meds: false },
  ];

  for (let i = 0; i < 4; i += 1) {
    const house = houses[i];
    const spec = specs[i];
    const info = breedByName(spec.breed);
    const placedAt = addDaysISO(today, -spec.age);
    const code = `Д-${placedAt.slice(2, 7).replace("-", "")}-F1${house.code}`;
    const flockRows = await sql.query<{ id: number }>(
      `insert into flocks (site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah, target_days, target_weight_g, status)
       values ($1,$2,$3,$4,$5,$6,18,$7,$8,'active') returning id`,
      [siteId, house.id, code, spec.breed, placedAt, spec.chicks, info.targetDays, info.targetWeightG],
    );
    const flockId = flockRows[0].id;
    let head = spec.chicks;
    for (let day = 0; day <= spec.age; day += 1) {
      const date = addDaysISO(placedAt, day);
      if (date > due) break;
      const look = day > spec.age - 3 ? spec.look : "normal";
      const litter = day > spec.age - 4 ? spec.litter : "dry";
      const note = day === spec.age && spec.meds ? "На випоюванні енрофлоксацин 3-тя доба курсу." : "";
      const before = head;
      head = await insertDemoReport(sql, {
        flockId,
        houseId: house.id,
        breed: spec.breed,
        date,
        day,
        headStart: before,
        look,
        litter,
        note,
        houseIndex: i,
      });
      if (spec.meds && day >= spec.age - 4 && day <= spec.age) {
        const rec = await sql.query<{ id: number }>(
          `select id from daily_reports where flock_id = $1 and report_date = $2`,
          [flockId, date],
        );
        if (rec[0]) {
          await sql.query(
            `insert into daily_report_meds (report_id, prep_id, group_id, name, conc, unit, sort_order)
             values ($1, 'enro', 'antibiotic', 'Енрофлоксацин', 80, 'ml', 0)`,
            [rec[0].id],
          );
        }
      }
    }
  }
}
