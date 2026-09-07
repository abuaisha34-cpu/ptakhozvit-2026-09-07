import type { Sql } from "@/lib/db";
import {
  calendarFromTemplate,
  defaultTreatmentCalendar,
  parseTreatmentCalendar,
  type TreatmentEvent,
} from "@/lib/broiler/treatments";

export async function ensureTreatmentTables(sql: Sql): Promise<void> {
  await sql.query(`
    create table if not exists org_treatment_calendars (
      org_id integer primary key,
      payload jsonb not null default '[]',
      updated_at timestamptz not null default now(),
      updated_by text
    )`);
  await sql.query(`
    create table if not exists flock_treatment_calendars (
      flock_id integer primary key,
      payload jsonb not null default '[]',
      updated_at timestamptz not null default now(),
      updated_by text
    )`);
}

export async function loadOrgTreatmentCalendar(sql: Sql, orgId: number): Promise<TreatmentEvent[]> {
  await ensureTreatmentTables(sql);
  const rows = await sql.query<{ payload: unknown }>(
    "select payload from org_treatment_calendars where org_id = $1",
    [orgId],
  );
  return parseTreatmentCalendar(rows[0]?.payload) ?? defaultTreatmentCalendar();
}

export async function saveOrgTreatmentCalendar(
  sql: Sql,
  orgId: number,
  items: TreatmentEvent[],
  userId: string,
): Promise<TreatmentEvent[]> {
  await ensureTreatmentTables(sql);
  const parsed = parseTreatmentCalendar(items) ?? [];
  await sql.query(
    `insert into org_treatment_calendars (org_id, payload, updated_at, updated_by)
     values ($1, $2::jsonb, now(), $3)
     on conflict (org_id) do update set payload = excluded.payload, updated_at = now(), updated_by = excluded.updated_by`,
    [orgId, JSON.stringify(parsed), userId],
  );
  return parsed;
}

export async function loadFlockTreatmentCalendar(
  sql: Sql,
  flockId: number,
  orgId: number,
): Promise<TreatmentEvent[]> {
  await ensureTreatmentTables(sql);
  const rows = await sql.query<{ payload: unknown }>(
    "select payload from flock_treatment_calendars where flock_id = $1",
    [flockId],
  );
  const own = parseTreatmentCalendar(rows[0]?.payload);
  if (own) return own;
  const org = await loadOrgTreatmentCalendar(sql, orgId);
  return calendarFromTemplate(org);
}

export async function saveFlockTreatmentCalendar(
  sql: Sql,
  flockId: number,
  items: TreatmentEvent[],
  userId: string,
): Promise<TreatmentEvent[]> {
  await ensureTreatmentTables(sql);
  const parsed = parseTreatmentCalendar(items) ?? [];
  await sql.query(
    `insert into flock_treatment_calendars (flock_id, payload, updated_at, updated_by)
     values ($1, $2::jsonb, now(), $3)
     on conflict (flock_id) do update set payload = excluded.payload, updated_at = now(), updated_by = excluded.updated_by`,
    [flockId, JSON.stringify(parsed), userId],
  );
  return parsed;
}

export async function copyOrgCalendarToFlock(
  sql: Sql,
  flockId: number,
  orgId: number,
  userId: string,
): Promise<void> {
  const org = await loadOrgTreatmentCalendar(sql, orgId);
  await saveFlockTreatmentCalendar(sql, flockId, calendarFromTemplate(org), userId);
}
