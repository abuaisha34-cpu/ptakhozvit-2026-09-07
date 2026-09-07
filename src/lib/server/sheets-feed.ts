import type { Sql } from "@/lib/db";
import { isSheetsTokenFormat } from "@/lib/broiler/org";
import { toTsv } from "@/lib/sheets-tsv";
import { addDaysISO, num, todayISO } from "@/lib/utils";

export type SheetsKind = "today" | "period";

export async function orgBySheetsToken(
  sql: Sql,
  token: string,
): Promise<{ id: number; name: string } | null> {
  if (!isSheetsTokenFormat(token)) return null;
  const rows = await sql.query<{ id: number; name: string }>(
    "select id, name from organizations where sheets_token = $1",
    [token],
  );
  return rows[0] ?? null;
}

export async function buildSheetsTsv(
  sql: Sql,
  org: { id: number; name: string },
  kind: SheetsKind,
  from: string,
  to: string,
): Promise<{ filename: string; body: string }> {
  if (kind === "today") {
    const today = todayISO();
    const rows = await sql.query<{
      site_name: string;
      house_name: string;
      flock_code: string | null;
      breed: string | null;
      report_date: string | null;
      age_days: number | null;
      head_end: number | null;
      avg_weight_g: number | null;
      mortality: number | null;
      culled: number | null;
      feed_kg: string | number | null;
      water_l: string | number | null;
      notes: string | null;
    }>(
      `select s.name as site_name, h.name as house_name,
              f.code as flock_code, f.breed,
              r.report_date, r.age_days, r.head_end, r.avg_weight_g,
              r.mortality, r.culled, r.feed_kg, r.water_l, r.notes
         from houses h
         join sites s on s.id = h.site_id
         left join flocks f on f.house_id = h.id and f.status = 'active'
         left join daily_reports r
           on r.flock_id = f.id and r.report_date = $2
        where s.org_id = $1
        order by s.sort_order, h.sort_order`,
      [org.id, today],
    );
    return {
      filename: `ptahozvit-zvedennya-${today}.tsv`,
      body: toTsv(
        [
          "Фабрика",
          "Пташник",
          "Посадка",
          "Крос",
          "Дата звіту",
          "Доба",
          "Поголівʼя",
          "Маса, г",
          "Падіж",
          "Вибраковка",
          "Корм, кг",
          "Вода, л",
        ],
        rows.map((r) => [
          r.site_name,
          r.house_name,
          r.flock_code,
          r.breed,
          r.report_date,
          r.age_days,
          r.head_end,
          r.avg_weight_g,
          r.mortality,
          r.culled,
          r.feed_kg == null ? "" : num(r.feed_kg),
          r.water_l == null ? "" : num(r.water_l),
        ]),
        org.name,
        `Зведення · ${today}`,
      ),
    };
  }

  const rows = await sql.query<{
    report_date: string;
    site_name: string;
    house_name: string;
    age_days: number;
    mortality: number;
    culled: number;
    head_end: number;
    avg_weight_g: number;
    feed_kg: string | number;
    water_l: string | number | null;
    notes: string | null;
  }>(
    `select r.report_date, s.name as site_name, h.name as house_name,
            r.age_days, r.mortality, r.culled, r.head_end, r.avg_weight_g,
            r.feed_kg, r.water_l, r.notes
       from daily_reports r
       join flocks f on f.id = r.flock_id
       join houses h on h.id = f.house_id
       join sites s on s.id = f.site_id
      where s.org_id = $1
        and r.report_date between $2 and $3
      order by r.report_date, s.sort_order, h.sort_order`,
    [org.id, from, to],
  );
  return {
    filename: `ptahozvit-${from}-${to}.tsv`,
    body: toTsv(
      [
        "Дата",
        "Фабрика",
        "Пташник",
        "Доба",
        "Падіж",
        "Вибраковка",
        "Поголівʼя",
        "Маса, г",
        "Корм, кг",
        "Вода, л",
      ],
      rows.map((r) => [
        r.report_date,
        r.site_name,
        r.house_name,
        r.age_days,
        r.mortality,
        r.culled,
        r.head_end,
        r.avg_weight_g,
        num(r.feed_kg),
        r.water_l == null ? "" : num(r.water_l),
      ]),
      org.name,
      `Щоденні звіти · ${from} — ${to}`,
    ),
  };
}

export function defaultPeriod(): { from: string; to: string } {
  const to = todayISO();
  return { from: addDaysISO(to, -14), to };
}
