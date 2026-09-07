import type { Sql } from "@/lib/db";
import type { RecycleBin } from "@/lib/broiler/types";

export async function ensureRecycleTables(sql: Sql): Promise<void> {
  await sql.query(`
    create table if not exists recycle_flocks (
      id integer primary key,
      site_id integer not null,
      house_id integer not null,
      code text not null default '',
      breed text not null default '',
      placed_at date,
      chicks_placed integer,
      status text,
      payload jsonb not null,
      deleted_at timestamptz not null default now(),
      deleted_by text
    )`);
  await sql.query(`
    create table if not exists recycle_reports (
      id integer primary key,
      flock_id integer not null,
      house_id integer,
      report_date date,
      payload jsonb not null,
      deleted_at timestamptz not null default now(),
      deleted_by text
    )`);
}

async function bumpSerial(sql: Sql, table: "flocks" | "daily_reports"): Promise<void> {
  const q =
    table === "flocks"
      ? `select setval(pg_get_serial_sequence('flocks', 'id'), greatest(coalesce((select max(id) from flocks), 1), 1), true)`
      : `select setval(pg_get_serial_sequence('daily_reports', 'id'), greatest(coalesce((select max(id) from daily_reports), 1), 1), true)`;
  try {
    await sql.query(q);
  } catch {
    /* identity/serial name varies — ignore */
  }
}

export async function archiveFlock(sql: Sql, flockId: number, userId: string): Promise<{ code: string; siteId: number }> {
  await ensureRecycleTables(sql);
  const flocks = await sql.query<{
    id: number;
    site_id: number;
    house_id: number;
    code: string;
    breed: string;
    placed_at: string;
    chicks_placed: number;
    status: string;
  }>("select id, site_id, house_id, code, breed, placed_at, chicks_placed, status from flocks where id = $1", [
    flockId,
  ]);
  if (!flocks[0]) throw new Error("Посадку не знайдено");
  const f = flocks[0];
  await sql.query(
    `insert into recycle_reports (id, flock_id, house_id, report_date, payload, deleted_by)
     select r.id, r.flock_id, $2, r.report_date, to_jsonb(r), $3
       from daily_reports r
      where r.flock_id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            flock_id = excluded.flock_id,
            house_id = excluded.house_id,
            report_date = excluded.report_date,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`,
    [flockId, f.house_id, userId],
  );
  await sql.query(
    `insert into recycle_flocks (
        id, site_id, house_id, code, breed, placed_at, chicks_placed, status, payload, deleted_by
     )
     select id, site_id, house_id, code, breed, placed_at, chicks_placed, status, to_jsonb(flocks), $2
       from flocks where id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            site_id = excluded.site_id,
            house_id = excluded.house_id,
            code = excluded.code,
            breed = excluded.breed,
            placed_at = excluded.placed_at,
            chicks_placed = excluded.chicks_placed,
            status = excluded.status,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`,
    [flockId, userId],
  );
  await sql.query("delete from daily_reports where flock_id = $1", [flockId]);
  await sql.query("delete from flocks where id = $1", [flockId]);
  return { code: f.code, siteId: f.site_id };
}

export async function archiveReport(
  sql: Sql,
  reportId: number,
  userId: string,
): Promise<{ siteId: number; flockId: number; reportDate: string }> {
  await ensureRecycleTables(sql);
  const rows = await sql.query<{
    site_id: number;
    flock_id: number;
    house_id: number;
    report_date: string;
  }>(
    `select f.site_id, r.flock_id, f.house_id, r.report_date
       from daily_reports r
       join flocks f on f.id = r.flock_id
      where r.id = $1`,
    [reportId],
  );
  if (!rows[0]) throw new Error("Звіт не знайдено");
  await sql.query(
    `insert into recycle_reports (id, flock_id, house_id, report_date, payload, deleted_by)
     select r.id, r.flock_id, $2, r.report_date, to_jsonb(r), $3
       from daily_reports r where r.id = $1
     on conflict (id) do update
        set payload = excluded.payload,
            flock_id = excluded.flock_id,
            house_id = excluded.house_id,
            report_date = excluded.report_date,
            deleted_at = now(),
            deleted_by = excluded.deleted_by`,
    [reportId, rows[0].house_id, userId],
  );
  await sql.query("delete from daily_reports where id = $1", [reportId]);
  return {
    siteId: rows[0].site_id,
    flockId: rows[0].flock_id,
    reportDate: String(rows[0].report_date).slice(0, 10),
  };
}

export async function archiveOrgFlocks(sql: Sql, orgId: number, userId: string): Promise<number> {
  await ensureRecycleTables(sql);
  const flocks = await sql.query<{ id: number }>(
    `select id from flocks where site_id in (select id from sites where org_id = $1)`,
    [orgId],
  );
  for (const f of flocks) {
    await archiveFlock(sql, f.id, userId);
  }
  return flocks.length;
}

export async function restoreFlockRow(
  sql: Sql,
  flockId: number,
): Promise<{ houseId: number; code: string; siteId: number; status: string }> {
  await ensureRecycleTables(sql);
  const rows = await sql.query<{
    site_id: number;
    house_id: number;
    code: string;
    status: string | null;
    payload: unknown;
  }>("select site_id, house_id, code, status, payload from recycle_flocks where id = $1", [flockId]);
  if (!rows[0]) throw new Error("У кошику цієї посадки немає");
  const live = await sql.query<{ id: number }>("select id from flocks where id = $1", [flockId]);
  if (live[0]) throw new Error("Ця посадка вже є в пташнику");
  await sql.query(
    `insert into flocks
     select x.*
       from recycle_flocks rf,
            jsonb_populate_record(null::flocks, rf.payload) as x
      where rf.id = $1`,
    [flockId],
  );
  const other = await sql.query<{ id: number }>(
    `select id from flocks where house_id = $1 and status = 'active' and id <> $2 limit 1`,
    [rows[0].house_id, flockId],
  );
  let status = rows[0].status === "closed" ? "closed" : "active";
  if (other[0]) {
    status = "closed";
    await sql.query(
      `update flocks
          set status = 'closed',
              closed_at = coalesce(closed_at, current_date)
        where id = $1`,
      [flockId],
    );
  }
  await sql.query(
    `insert into daily_reports
     select x.*
       from recycle_reports rr,
            jsonb_populate_record(null::daily_reports, rr.payload) as x
      where rr.flock_id = $1
        and not exists (select 1 from daily_reports d where d.id = rr.id)
        and not exists (
          select 1 from daily_reports d
           where d.flock_id = rr.flock_id and d.report_date = rr.report_date
        )`,
    [flockId],
  );
  await sql.query("delete from recycle_reports where flock_id = $1", [flockId]);
  await sql.query("delete from recycle_flocks where id = $1", [flockId]);
  await bumpSerial(sql, "flocks");
  await bumpSerial(sql, "daily_reports");
  return { houseId: rows[0].house_id, code: rows[0].code, siteId: rows[0].site_id, status };
}

export async function restoreReportRow(
  sql: Sql,
  reportId: number,
): Promise<{ houseId: number; flockId: number; reportDate: string; siteId: number }> {
  await ensureRecycleTables(sql);
  const rows = await sql.query<{
    flock_id: number;
    house_id: number | null;
    report_date: string | null;
    payload: unknown;
  }>("select flock_id, house_id, report_date, payload from recycle_reports where id = $1", [reportId]);
  if (!rows[0]) throw new Error("У кошику цього звіту немає");
  const flock = await sql.query<{ id: number; site_id: number; house_id: number }>(
    "select id, site_id, house_id from flocks where id = $1",
    [rows[0].flock_id],
  );
  if (!flock[0]) {
    throw new Error("Спочатку поверніть посадку — звіт лежить разом із нею в кошику");
  }
  const clash = await sql.query<{ id: number }>(
    `select id from daily_reports where flock_id = $1 and report_date = $2`,
    [rows[0].flock_id, rows[0].report_date],
  );
  if (clash[0]) {
    throw new Error(
      `На ${String(rows[0].report_date).slice(0, 10)} уже є звіт. Видаліть або змініть його, тоді повертайте з кошика.`,
    );
  }
  await sql.query(
    `insert into daily_reports
     select x.*
       from recycle_reports rr,
            jsonb_populate_record(null::daily_reports, rr.payload) as x
      where rr.id = $1
        and not exists (select 1 from daily_reports d where d.id = rr.id)`,
    [reportId],
  );
  await sql.query("delete from recycle_reports where id = $1", [reportId]);
  await bumpSerial(sql, "daily_reports");
  return {
    houseId: flock[0].house_id,
    flockId: flock[0].id,
    reportDate: String(rows[0].report_date ?? "").slice(0, 10),
    siteId: flock[0].site_id,
  };
}

export async function listRecycleBin(sql: Sql, siteIds: number[]): Promise<RecycleBin> {
  if (!siteIds.length) return { flocks: [], reports: [] };
  await ensureRecycleTables(sql);
  const ph = siteIds.map((_, i) => `$${i + 1}`).join(", ");
  const flocks = await sql.query<{
    id: number;
    code: string;
    breed: string;
    placed_at: string | null;
    chicks_placed: number | null;
    status: string | null;
    deleted_at: string;
    house_id: number;
    house_name: string;
    site_id: number;
    site_name: string;
    reports: number;
  }>(
    `select f.id, f.code, f.breed, f.placed_at, f.chicks_placed, f.status, f.deleted_at,
            h.id as house_id, h.name as house_name, s.id as site_id, s.name as site_name,
            (select count(*)::int from recycle_reports r where r.flock_id = f.id) as reports
       from recycle_flocks f
       join houses h on h.id = f.house_id
       join sites s on s.id = f.site_id
      where s.id in (${ph})
      order by f.deleted_at desc`,
    siteIds,
  );
  const reports = await sql.query<{
    id: number;
    report_date: string | null;
    payload: { age_days?: number; avg_weight_g?: number; feed_kg?: number };
    deleted_at: string;
    flock_id: number;
    flock_code: string;
    house_id: number;
    house_name: string;
    site_name: string;
  }>(
    `select r.id, r.report_date, r.payload, r.deleted_at,
            fl.id as flock_id, fl.code as flock_code, h.id as house_id, h.name as house_name, s.name as site_name
       from recycle_reports r
       join flocks fl on fl.id = r.flock_id
       join houses h on h.id = fl.house_id
       join sites s on s.id = fl.site_id
      where s.id in (${ph})
        and not exists (select 1 from recycle_flocks rf where rf.id = r.flock_id)
      order by r.deleted_at desc`,
    siteIds,
  );
  return {
    flocks: flocks.map((f) => ({
      id: f.id,
      code: f.code,
      breed: f.breed,
      placedAt: f.placed_at ? String(f.placed_at).slice(0, 10) : "",
      chicksPlaced: Number(f.chicks_placed ?? 0),
      status: f.status ?? "active",
      deletedAt: String(f.deleted_at),
      houseId: f.house_id,
      houseName: f.house_name,
      siteId: f.site_id,
      siteName: f.site_name,
      reportCount: Number(f.reports),
    })),
    reports: reports.map((r) => {
      const payload =
        r.payload && typeof r.payload === "object"
          ? r.payload
          : {};
      return {
        id: r.id,
        reportDate: r.report_date ? String(r.report_date).slice(0, 10) : "",
        ageDays: Number(payload.age_days ?? 0),
        avgWeightG: Number(payload.avg_weight_g ?? 0),
        feedKg: Number(payload.feed_kg ?? 0),
        deletedAt: String(r.deleted_at),
        flockId: r.flock_id,
        flockCode: r.flock_code,
        houseId: r.house_id,
        houseName: r.house_name,
        siteName: r.site_name,
      };
    }),
  };
}
