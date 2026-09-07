import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { assignStaff, getTeam, removeStaff } from "@/lib/server/fns";
import type { Role, TeamMember } from "@/lib/broiler/types";
import { ASSIGNABLE_ROLES, factoryRequired, factorySelectable, ROLE_LABELS } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";

type TeamSearch = { org?: number };

export const Route = createFileRoute("/team")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): TeamSearch => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function Page() {
  return (
    <AppShell>
      <Team />
    </AppShell>
  );
}

function Team() {
  const { org } = Route.useSearch();
  const { data, error, loading, setData } = useAsync(() => getTeam({ data: { orgId: org } }), [org]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(
    member: TeamMember,
    patch: { role: Role; siteId: number | null; fullName: string; email: string },
  ) {
    setBusy(member.userId);
    setMsg(null);
    try {
      await assignStaff({
        data: {
          userId: member.userId,
          role: patch.role,
          siteId: patch.siteId,
          fullName: patch.fullName,
          email: patch.email,
          orgId: org,
        },
      });
      const next = await getTeam({ data: { orgId: org } });
      setData(next);
      setMsg("Обліковий запис оновлено");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Помилка");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-[24px] bg-surface" />;
  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl font-medium">Команда</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Команда</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Людина реєструється сама і вводить код запрошення цього господарства. Потім ви
          призначаєте роль: партнер, керівник фабрики, ветеринарний лікар або директор. Новий запит
          одразу зʼявляється в дзвіночку сповіщень.
        </p>
      </header>

      {data.inviteCode ? <InviteCard code={data.inviteCode} /> : null}

      {msg ? <p className="text-sm text-ok">{msg}</p> : null}

      <div className="space-y-3">
        {data.members.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            sites={data.sites}
            self={m.userId === data.profile.userId}
            busy={busy === m.userId}
            onSave={save}
            onRemove={async () => {
              if (!window.confirm("Виключити цю людину з господарства?")) return;
              setBusy(m.userId);
              setMsg(null);
              try {
                await removeStaff({ data: { userId: m.userId, orgId: org } });
                setData(await getTeam({ data: { orgId: org } }));
                setMsg("Людину виключено");
              } catch (err) {
                setMsg(err instanceof Error ? err.message : "Помилка");
              } finally {
                setBusy(null);
              }
            }}
          />
        ))}
      </div>

      <Card>
        <CardTitle>Ролі</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            <span className="text-fg">Керівник фабрики</span> — своя фабрика: відкриває посадки, змінює
            поголівʼя, подає і замінює щоденні звіти (у тому числі заднім числом).
          </li>
          <li>
            <span className="text-fg">Ветеринарний лікар</span> — усі фабрики або одна. Бачить падіж,
            воду, температуру і може подавати звіт.
          </li>
          <li>
            <span className="text-fg">Директор</span> — зведення і прогнози; може відкривати посадки та
            змінювати поголівʼя на доступних фабриках.
          </li>
          <li>
            <span className="text-fg">Головний технолог</span> — посадки по всіх фабриках, пороги і
            команда.
          </li>
          <li>
            <span className="text-fg">Партнер</span> — бачить і керує всім, як головний технолог: усі
            фабрики, звіти, корм, довідник, команда і посадки.
          </li>
        </ul>
      </Card>
    </div>
  );
}

function InviteCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card>
      <CardTitle>Код запрошення</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Новий співробітник реєструється на цьому сайті і вводить код — потрапляє лише у ваше
        господарство, не в чужі.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="font-display text-2xl tracking-[0.2em] text-fg">{code}</p>
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Скопійовано" : "Копіювати"}
        </Button>
      </div>
    </Card>
  );
}

function MemberRow({
  member,
  sites,
  self,
  busy,
  onSave,
  onRemove,
}: {
  member: TeamMember;
  sites: { id: number; name: string }[];
  self: boolean;
  busy: boolean;
  onSave: (
    m: TeamMember,
    patch: { role: Role; siteId: number | null; fullName: string; email: string },
  ) => void;
  onRemove: () => void;
}) {
  const [role, setRole] = useState<Role>(member.role);
  const [siteId, setSiteId] = useState<string>(member.siteId ? String(member.siteId) : "");
  const [fullName, setFullName] = useState(member.fullName ?? "");
  const [email, setEmail] = useState(member.email ?? "");

  return (
    <div className="space-y-3 rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor={`name-${member.userId}`}>ПІБ</Label>
          <Input
            id={`name-${member.userId}`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Імʼя прізвище"
          />
        </div>
        <div>
          <Label htmlFor={`email-${member.userId}`}>Email</Label>
          <Input
            id={`email-${member.userId}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@farm.ua"
          />
        </div>
        <div>
          <Label htmlFor={`role-${member.userId}`}>Роль</Label>
          <Select
            id={`role-${member.userId}`}
            value={role}
            disabled={self}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`site-${member.userId}`}>Фабрика</Label>
          <Select
            id={`site-${member.userId}`}
            value={siteId}
            disabled={!factorySelectable(role)}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">{factoryRequired(role) ? "Оберіть фабрику" : "Усі фабрики"}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{self ? "Це ви. Роль технолога зняти з себе не можна." : member.email}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={busy}
            onClick={() =>
              onSave(member, {
                role,
                siteId: siteId ? Number(siteId) : null,
                fullName,
                email,
              })
            }
          >
            {busy ? "…" : "Зберегти"}
          </Button>
          {!self ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={onRemove}>
              Виключити
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
