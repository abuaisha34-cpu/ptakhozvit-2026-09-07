import type { Sql } from "@/lib/db";
import type { JournalAction, JournalEntity, Profile } from "@/lib/broiler/types";
import { staffLabel } from "@/lib/broiler/roles";

export type JournalWrite = {
  orgId: number;
  siteId?: number | null;
  actor: Profile;
  action: JournalAction;
  entity: JournalEntity;
  summary: string;
  href?: string | null;
};

function actorName(actor: Profile): string {
  return actor.fullName?.trim() || actor.email || staffLabel(actor);
}

export async function writeJournal(sql: Sql, event: JournalWrite): Promise<void> {
  if (!event.orgId) return;
  try {
    await sql.query(
      `insert into journal_events
         (org_id, site_id, actor_user_id, actor_name, actor_role, action, entity, summary, href)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        event.orgId,
        event.siteId ?? null,
        event.actor.userId,
        actorName(event.actor),
        event.actor.isOwner ? "owner" : event.actor.isAdmin ? "sysadmin" : event.actor.role,
        event.action,
        event.entity,
        event.summary,
        event.href ?? null,
      ],
    );
  } catch (err) {
    console.error("[journal]", err);
  }
}
