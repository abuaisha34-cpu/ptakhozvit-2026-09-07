import type { Sql } from "@/lib/db";
import { generateInviteCode } from "@/lib/broiler/org";

async function backfillHousesFromSites(sql: Sql): Promise<void> {
  const sites = await sql.query<{
    id: number;
    code: string;
    name: string;
    houses: number;
    capacity: number;
  }>(
    `select s.id, s.code, s.name, s.houses, s.capacity
       from sites s
      where not exists (select 1 from houses h where h.site_id = s.id)
      order by s.id`,
  );
  if (!sites.length) return;

  for (const site of sites) {
    const n = Math.max(1, site.houses || 1);
    const cap = Math.max(1000, Math.round((site.capacity || 10000) / n));
    const houseIds: number[] = [];
    for (let i = 1; i <= n; i += 1) {
      const rows = await sql.query<{ id: number }>(
        `insert into houses (site_id, code, name, capacity, area_m2, sort_order)
         values ($1, $2, $3, $4, $5, $6) returning id`,
        [site.id, `H${i}`, `Пташник ${i}`, cap, Math.round(cap / 18), i],
      );
      houseIds.push(rows[0].id);
    }
    const newName = site.name.replace(/^Дільниця\b/, "Фабрика");
    if (newName !== site.name) {
      await sql.query("update sites set name = $2 where id = $1", [site.id, newName]);
    }
    await sql.query(
      `update flocks set house_id = $2
        where site_id = $1 and house_id is null`,
      [site.id, houseIds[0]],
    );
  }
}

/** Drop generated demo flocks/reports once so production can start empty. */
async function clearDemoOnce(sql: Sql): Promise<void> {
  try {
    const flag = await sql.query<{ ops_reset: number | string | null }>(
      "select ops_reset from cost_settings where id = 1",
    );
    if (Number(flag[0]?.ops_reset ?? 0) !== 0) return;
  } catch {
    return;
  }
  await sql.query("delete from daily_reports where submitted_by = 'seed'");
  await sql.query(
    `delete from flocks f
      where not exists (select 1 from daily_reports r where r.flock_id = f.id)`,
  );
  await sql.query("update cost_settings set ops_reset = 1 where id = 1");
}

async function attachOrphanSites(sql: Sql): Promise<void> {
  try {
    const orphans = await sql.query<{ id: number }>(
      "select id from sites where org_id is null limit 1",
    );
    if (!orphans[0]) return;
  } catch {
    return;
  }

  let code = generateInviteCode();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const org = await sql.query<{ id: number }>(
        `insert into organizations (name, invite_code, created_by)
         values ($1, $2, $3) returning id`,
        ["Господарство", code, "seed"],
      );
      const orgId = org[0].id;
      await sql.query("update sites set org_id = $1 where org_id is null", [orgId]);
      await sql.query("update staff_profiles set org_id = $1 where org_id is null", [orgId]);
      const existingCosts = await sql.query<{ id: number }>(
        "select id from cost_settings where org_id = $1",
        [orgId],
      );
      if (!existingCosts[0]) {
        await sql.query(
          `insert into cost_settings (id, org_id)
           select coalesce(max(id), 0) + 1, $1 from cost_settings`,
          [orgId],
        );
      }
      return;
    } catch {
      code = generateInviteCode();
    }
  }
}

export async function seedIfEmpty(sql: Sql): Promise<void> {
  await clearDemoOnce(sql);
  await backfillHousesFromSites(sql);
  await attachOrphanSites(sql);
  try {
    await sql.query(
      `update staff_profiles set is_owner = true
        where user_id = (
          select user_id from staff_profiles order by created_at, user_id limit 1
        )
        and not exists (select 1 from staff_profiles where is_owner = true)`,
    );
  } catch {
    /* column appears after 0009 */
  }
}
