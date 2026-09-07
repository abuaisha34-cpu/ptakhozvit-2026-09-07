import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Settings2, ScrollText, Users } from "lucide-react";
import { FactoryJumpNav, FactorySummary } from "@/components/factory-summary";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { deleteOrganization, getHoldingDetail, rotateInviteCode, saveOrganization } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";

export const Route = createFileRoute("/holdings/$orgId")({ component: HoldingPage });

function HoldingPage() {
  const { orgId } = Route.useParams();
  return <Holding orgId={Number(orgId)} />;
}

function Holding({ orgId }: { orgId: number }) {
  const { data, error, loading, setData } = useAsync(
    () => getHoldingDetail({ data: { orgId } }),
    [orgId],
  );
  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  const many = data.factories.length > 1;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/holdings" className="text-xs text-muted hover:text-fg">
            ← Усі господарства
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
            {data.org.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Код запрошення {data.org.inviteCode} · зведення лише цього господарства
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/guide"
            search={{ org: orgId }}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            Довідник
          </Link>
          <Link
            to="/journal"
            search={{ org: orgId }}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            <ScrollText className="size-4" strokeWidth={1.75} />
            Журнал
          </Link>
          <Link
            to="/team"
            search={{ org: orgId }}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4 text-sm text-fg shadow-[var(--shadow-border)]"
          >
            <Users className="size-4" strokeWidth={1.75} />
            Команда
          </Link>
          <Link
            to="/settings"
            search={{ org: orgId }}
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            <Settings2 className="size-4" strokeWidth={1.75} />
            Посадки
          </Link>
        </div>
      </header>

      <OrgAdmin
        key={orgId}
        orgId={orgId}
        name={data.org.name}
        inviteCode={data.org.inviteCode}
        staffCount={data.staffCount}
        onChanged={async () => setData(await getHoldingDetail({ data: { orgId } }))}
      />

      {many ? <FactoryJumpNav factories={data.factories} /> : null}

      <div className="space-y-6">
        {data.factories.map((factory) => (
          <FactorySummary
            key={factory.site.id}
            factory={factory}
            thresholds={data.thresholds}
            headingLevel="h2"
            showSiteLink
            showHeading
          />
        ))}
      </div>
    </div>
  );
}

function OrgAdmin({
  orgId,
  name,
  inviteCode,
  staffCount,
  onChanged,
}: {
  orgId: number;
  name: string;
  inviteCode: string;
  staffCount: number;
  onChanged: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState(name);
  const [busy, setBusy] = useState<"save" | "code" | "delete" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setBusy("save");
    setErr(null);
    setMsg(null);
    try {
      await saveOrganization({ data: { name: orgName, orgId } });
      await onChanged();
      setMsg("Назву оновлено");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Помилка");
    } finally {
      setBusy(null);
    }
  }

  async function newCode() {
    setBusy("code");
    setErr(null);
    setMsg(null);
    try {
      const res = await rotateInviteCode({ data: { orgId } });
      await onChanged();
      setMsg(`Новий код ${res.inviteCode}. Старий більше не діє.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Помилка");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    setErr(null);
    setMsg(null);
    try {
      await deleteOrganization({ data: { orgId, confirmName: confirm } });
      await navigate({ to: "/holdings" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Помилка");
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardTitle>Параметри господарства</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Лише хазяїн сайту. Фабрики й посадки — кнопка «Посадки» вище.
      </p>

      <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={saveName}>
        <div>
          <Label htmlFor="hold-name">Назва</Label>
          <Input id="hold-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" variant="secondary" disabled={busy !== null || orgName.trim().length < 2}>
            {busy === "save" ? "Збереження…" : "Зберегти"}
          </Button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="font-display text-xl tracking-[0.16em] text-fg">{inviteCode}</p>
        <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => void newCode()}>
          {busy === "code" ? "…" : "Новий код"}
        </Button>
        <p className="text-xs text-muted">Старий код одразу перестає пускати людей.</p>
      </div>

      {msg ? <p className="mt-3 text-sm text-ok">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-bad">{err}</p> : null}

      <div className="mt-8 border-t border-border pt-5">
        <p className="text-sm font-medium text-bad">Видалити господарство</p>
        <p className="mt-1 text-sm text-muted">
          Зникнуть фабрики, посадки, звіти і код. Люди з команди втратять доступ
          {staffCount ? ` (${staffCount})` : ""}. Облікові записи залишаться.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Label htmlFor="hold-del">Введіть назву «{name}»</Label>
            <Input
              id="hold-del"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <Button
            variant="danger"
            disabled={busy !== null || confirm.trim() !== name.trim()}
            onClick={() => void remove()}
          >
            {busy === "delete" ? "Видалення…" : "Видалити"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
