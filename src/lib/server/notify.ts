import type { Sql } from "@/lib/db";
import type { DensityForecast } from "@/lib/broiler/calc";
import type { Profile } from "@/lib/broiler/types";

type StaffRow = {
  user_id: string;
  role: string;
  site_id: number | null;
  is_owner: boolean;
  is_admin: boolean;
};

async function loadAudience(
  sql: Sql,
  orgId: number,
  includeAllPlatform = false,
): Promise<StaffRow[]> {
  if (includeAllPlatform) {
    return sql.query<StaffRow>(
      `select user_id, role, site_id,
              coalesce(is_owner, false) as is_owner,
              coalesce(is_admin, false) as is_admin
         from staff_profiles
        where is_owner = true
           or is_admin = true
           or (org_id = $1 and role in ('technologist', 'partner', 'director', 'veterinarian', 'site_manager'))`,
      [orgId],
    );
  }
  return sql.query<StaffRow>(
    `select user_id, role, site_id,
            coalesce(is_owner, false) as is_owner,
            coalesce(is_admin, false) as is_admin
       from staff_profiles
      where (org_id = $1 and role in ('technologist', 'partner', 'director', 'veterinarian', 'site_manager'))
         or ((is_owner = true or is_admin = true) and org_id = $1)`,
    [orgId],
  );
}

async function fanOut(
  sql: Sql,
  opts: {
    orgId: number;
    actorUserId: string;
    recipients: string[];
    kind: "report" | "join" | "density" | "handbook";
    title: string;
    body: string;
    href: string;
    includeActor?: boolean;
  },
) {
  const seen = new Set<string>();
  for (const userId of opts.recipients) {
    if (!userId || seen.has(userId)) continue;
    if (!opts.includeActor && userId === opts.actorUserId) continue;
    seen.add(userId);
    await sql.query(
      `insert into notifications
         (org_id, user_id, kind, title, body, href, actor_user_id)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [opts.orgId, userId, opts.kind, opts.title, opts.body, opts.href, opts.actorUserId],
    );
  }
}

function actorName(actor: Profile): string {
  return actor.fullName?.trim() || actor.email || "Користувач";
}

export async function notifyNewReport(
  sql: Sql,
  opts: {
    orgId: number;
    siteId: number;
    houseId: number;
    houseName: string;
    siteName: string;
    reportDate: string;
    actor: Profile;
  },
) {
  const staff = await loadAudience(sql, opts.orgId);
  const recipients = staff
    .filter((row) => {
      if (row.is_owner || row.is_admin) return true;
      if (row.role === "technologist" || row.role === "partner") return true;
      if (row.role === "director" || row.role === "veterinarian") {
        return !row.site_id || row.site_id === opts.siteId;
      }
      if (row.role === "site_manager") return row.site_id === opts.siteId;
      return false;
    })
    .map((row) => row.user_id);

  await fanOut(sql, {
    orgId: opts.orgId,
    actorUserId: opts.actor.userId,
    recipients,
    kind: "report",
    title: "Новий щоденний звіт",
    body: `${actorName(opts.actor)} · ${opts.siteName}, ${opts.houseName} · ${opts.reportDate}`,
    href: `/houses/${opts.houseId}`,
  });
}

export async function notifyJoinRequest(
  sql: Sql,
  opts: { orgId: number; orgName: string; actor: Profile },
) {
  const staff = await loadAudience(sql, opts.orgId, true);
  const recipients = staff
    .filter((row) => row.is_owner || row.is_admin || row.role === "technologist" || row.role === "partner" || row.role === "director")
    .map((row) => row.user_id);

  await fanOut(sql, {
    orgId: opts.orgId,
    actorUserId: opts.actor.userId,
    recipients,
    kind: "join",
    title: "Запит у господарство",
    body: `${actorName(opts.actor)} хоче увійти в «${opts.orgName}». Призначте роль.`,
    href: `/team?org=${opts.orgId}`,
  });
}

export async function notifyDensity(
  sql: Sql,
  opts: {
    orgId: number;
    siteId: number;
    houseId: number;
    houseName: string;
    siteName: string;
    density: DensityForecast;
  },
) {
  const staff = await loadAudience(sql, opts.orgId);
  const recipients = staff
    .filter((row) => {
      if (row.is_owner || row.is_admin) return true;
      if (row.role === "technologist" || row.role === "partner") return true;
      if (row.role === "director" || row.role === "veterinarian") {
        return !row.site_id || row.site_id === opts.siteId;
      }
      if (row.role === "site_manager") return row.site_id === opts.siteId;
      return false;
    })
    .map((row) => row.user_id);

  const d = opts.density;
  const href = `/houses/${opts.houseId}`;
  const existing = await sql.query<{ id: number }>(
    `select id from notifications
      where org_id = $1 and kind = 'density' and href = $2
        and created_at > now() - interval '2 days'
        and read = false
      limit 1`,
    [opts.orgId, href],
  );
  if (existing[0]) return;

  await fanOut(sql, {
    orgId: opts.orgId,
    actorUserId: "",
    includeActor: true,
    recipients,
    kind: "density",
    title: d.reached
      ? `Ліміт ${d.limitKgM2} кг/м² — ${opts.houseName}`
      : `За ${d.daysToLimit} діб — ${d.limitKgM2} кг/м² · ${opts.houseName}`,
    body: d.reached
      ? `${opts.siteName}, ${opts.houseName}: зараз ${d.kgM2} кг/м².`
      : `${opts.siteName}, ${opts.houseName}: зараз ${d.kgM2} кг/м². ${d.limitKgM2} кг/м² на ${d.reachAgeDays} добу (${d.reachDate}).`,
    href,
  });
}

export async function notifyHandbookQuestion(
  sql: Sql,
  opts: { orgId: number; question: string; actor: Profile },
) {
  const staff = await loadAudience(sql, opts.orgId);
  const recipients = staff
    .filter((row) => row.is_owner || row.is_admin || row.role === "technologist" || row.role === "partner")
    .map((row) => row.user_id);
  await fanOut(sql, {
    orgId: opts.orgId,
    actorUserId: opts.actor.userId,
    recipients,
    kind: "handbook",
    title: "Питання в довідник",
    body: `${actorName(opts.actor)}: ${opts.question.slice(0, 160)}`,
    href: "/guide",
  });
}

