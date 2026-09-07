import type { Sql } from "@/lib/db";
import {
  DEFAULT_NORMS,
  SEED_ARTICLES,
  type HandbookArticle,
  type HandbookCategory,
  type OrgNorms,
} from "@/lib/broiler/handbook";
import { num } from "@/lib/utils";

function mapNorms(r: {
  humidity_place_min: string | number;
  humidity_place_max: string | number;
  humidity_early_until: number;
  humidity_early_min: string | number;
  humidity_early_max: string | number;
  humidity_late_min: string | number;
  humidity_late_max: string | number;
  density_limit_kg_m2: string | number;
  density_warn_days: number;
}): OrgNorms {
  return {
    humidityPlaceMin: num(r.humidity_place_min),
    humidityPlaceMax: num(r.humidity_place_max),
    humidityEarlyUntil: Number(r.humidity_early_until),
    humidityEarlyMin: num(r.humidity_early_min),
    humidityEarlyMax: num(r.humidity_early_max),
    humidityLateMin: num(r.humidity_late_min),
    humidityLateMax: num(r.humidity_late_max),
    densityLimitKgM2: num(r.density_limit_kg_m2),
    densityWarnDays: Number(r.density_warn_days),
  };
}

export async function ensureOrgNorms(sql: Sql, orgId: number): Promise<OrgNorms> {
  const existing = await sql.query<{
    humidity_place_min: string | number;
    humidity_place_max: string | number;
    humidity_early_until: number;
    humidity_early_min: string | number;
    humidity_early_max: string | number;
    humidity_late_min: string | number;
    humidity_late_max: string | number;
    density_limit_kg_m2: string | number;
    density_warn_days: number;
  }>("select * from org_norms where org_id = $1", [orgId]);
  if (existing[0]) return mapNorms(existing[0]);
  await sql.query("insert into org_norms (org_id) values ($1)", [orgId]);
  return { ...DEFAULT_NORMS };
}

export async function saveOrgNorms(
  sql: Sql,
  orgId: number,
  norms: OrgNorms,
  userId: string,
): Promise<OrgNorms> {
  await sql.query(
    `insert into org_norms (
       org_id, humidity_place_min, humidity_place_max, humidity_early_until,
       humidity_early_min, humidity_early_max, humidity_late_min, humidity_late_max,
       density_limit_kg_m2, density_warn_days, updated_at, updated_by
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),$11)
     on conflict (org_id) do update set
       humidity_place_min = excluded.humidity_place_min,
       humidity_place_max = excluded.humidity_place_max,
       humidity_early_until = excluded.humidity_early_until,
       humidity_early_min = excluded.humidity_early_min,
       humidity_early_max = excluded.humidity_early_max,
       humidity_late_min = excluded.humidity_late_min,
       humidity_late_max = excluded.humidity_late_max,
       density_limit_kg_m2 = excluded.density_limit_kg_m2,
       density_warn_days = excluded.density_warn_days,
       updated_at = now(),
       updated_by = excluded.updated_by`,
    [
      orgId,
      norms.humidityPlaceMin,
      norms.humidityPlaceMax,
      norms.humidityEarlyUntil,
      norms.humidityEarlyMin,
      norms.humidityEarlyMax,
      norms.humidityLateMin,
      norms.humidityLateMax,
      norms.densityLimitKgM2,
      norms.densityWarnDays,
      userId,
    ],
  );
  return norms;
}

export async function seedHandbook(sql: Sql, orgId: number): Promise<void> {
  for (const a of SEED_ARTICLES) {
    await sql.query(
      `insert into handbook_articles
         (org_id, slug, category, question, answer_tech, answer_vet, sort_order, status, priority)
       values ($1,$2,$3,$4,$5,$6,$7,'published',$8)
       on conflict (org_id, slug) do nothing`,
      [orgId, a.slug, a.category, a.question, a.answerTech, a.answerVet, a.sortOrder, Boolean(a.priority)],
    );
  }
  const already = await sql.query<{ n: string | number }>(
    "select count(*) as n from handbook_articles where org_id = $1 and priority = true",
    [orgId],
  );
  if (Number(already[0]?.n ?? 0) === 0) {
    const slugs = SEED_ARTICLES.filter((a) => a.priority).map((a) => a.slug);
    if (slugs.length) {
      const ph = slugs.map((_, i) => `$${i + 2}`).join(", ");
      await sql.query(
        `update handbook_articles set priority = true where org_id = $1 and slug in (${ph})`,
        [orgId, ...slugs],
      );
    }
  }
}

function mapArticle(r: {
  id: number;
  slug: string;
  category: string;
  question: string;
  answer_tech: string;
  answer_vet: string;
  sort_order: number;
  status: string;
  hidden: boolean;
  priority: boolean;
  asked_by: string | null;
}): HandbookArticle {
  return {
    id: r.id,
    slug: r.slug,
    category: r.category as HandbookCategory,
    question: r.question,
    answerTech: r.answer_tech,
    answerVet: r.answer_vet,
    sortOrder: r.sort_order,
    status: r.status === "question" ? "question" : "published",
    hidden: Boolean(r.hidden),
    priority: Boolean(r.priority),
    askedBy: r.asked_by,
  };
}

export async function loadHandbook(
  sql: Sql,
  orgId: number,
  includeHidden: boolean,
): Promise<HandbookArticle[]> {
  await seedHandbook(sql, orgId);
  const rows = await sql.query<{
    id: number;
    slug: string;
    category: string;
    question: string;
    answer_tech: string;
    answer_vet: string;
    sort_order: number;
    status: string;
    hidden: boolean;
    asked_by: string | null;
    priority: boolean;
  }>(
    `select id, slug, category, question, answer_tech, answer_vet, sort_order, status, hidden, asked_by, priority
       from handbook_articles
      where org_id = $1
        ${includeHidden ? "" : "and hidden = false"}
      order by case when status = 'question' then 0 else 1 end, priority desc, sort_order, id`,
    [orgId],
  );
  return rows.map(mapArticle);
}
