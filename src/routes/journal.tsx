import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ExportButtons } from "@/components/export-buttons";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ACTION_LABEL, ENTITY_LABEL } from "@/lib/export-labels";
import { journalWorkbook } from "@/lib/export-report";
import { getJournal, getRecycleBin, restoreFlock, restoreReport } from "@/lib/server/fns";
import type { JournalEvent } from "@/lib/broiler/types";
import { canDeleteReports, canManageFlocks, isPlatformAdmin } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";
import { addDaysISO, cn, fmtDateShort, fmtInt, todayISO } from "@/lib/utils";

type JournalSearch = { org?: number };

export const Route = createFileRoute("/journal")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): JournalSearch => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function when(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(new Date(t));
}

function Page() {
  return (
    <AppShell>
      <Journal />
    </AppShell>
  );
}

function Journal() {
  const { org } = Route.useSearch();
  const navigate = useNavigate();
  const today = todayISO();
  const [from, setFrom] = useState(addDaysISO(today, -14));
  const [to, setTo] = useState(today);
  const [siteId, setSiteId] = useState("all");
  const [action, setAction] = useState("all");
  const query = useMemo(
    () => ({
      from,
      to,
      siteId: siteId === "all" ? null : Number(siteId),
      orgId: org,
      action: action === "all" ? undefined : action,
    }),
    [from, to, siteId, org, action],
  );
  const { data, error, loading } = useAsync(() => getJournal({ data: query }), [query]);

  function open(ev: JournalEvent) {
    if (!ev.href) return;
    const url = new URL(ev.href, "https://ptakhozvit.local");
    const orgQ = Number(url.searchParams.get("org"));
    if (url.pathname.startsWith("/houses/")) {
      void navigate({ to: "/houses/$houseId", params: { houseId: url.pathname.split("/")[2] ?? "" } });
    } else if (url.pathname.startsWith("/sites/")) {
      void navigate({ to: "/sites/$siteId", params: { siteId: url.pathname.split("/")[2] ?? "" } });
    } else if (url.pathname.startsWith("/holdings/")) {
      void navigate({ to: "/holdings/$orgId", params: { orgId: url.pathname.split("/")[2] ?? "" } });
    } else if (url.pathname === "/team") {
      void navigate({
        to: "/team",
        search: Number.isFinite(orgQ) && orgQ > 0 ? { org: orgQ } : {},
      });
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Журнал</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Хто створив або змінив звіт, посадку, фабрику чи запис у команді. Помилково видалене —
            у кошику нижче, історія пташника не зникає.
          </p>
        </div>
        <ExportButtons
          spec={
            data
              ? journalWorkbook(data.events, {
                  from,
                  to,
                  orgName: data.profile.orgName,
                })
              : null
          }
          disabled={!data?.events.length}
        />
      </header>

      <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="j-from">З дати</Label>
          <Input id="j-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="j-to">По дату</Label>
          <Input id="j-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="j-site">Фабрика</Label>
          <Select id="j-site" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="all">Усі</option>
            {(data?.sites ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="j-act">Дія</Label>
          <Select id="j-act" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="all">Усі</option>
            <option value="create">Створено</option>
            <option value="update">Змінено</option>
            <option value="delete">Видалено</option>
            <option value="join">Заявка</option>
            <option value="assign">Призначено</option>
            <option value="restore">Повернуто</option>
          </Select>
        </div>
      </Card>

      <RecyclePanel orgId={org} />

      {data && !loading && isPlatformAdmin(data.profile) && !data.sites.length && !org ? (
        <p className="text-sm text-muted">
          Відкрийте господарство в{" "}
          <Link to="/holdings" className="underline underline-offset-4">
            списку
          </Link>
          , щоб бачити його журнал.
        </p>
      ) : null}

      {loading ? <div className="h-48 animate-pulse rounded-[24px] bg-surface" /> : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      {data && !loading ? (
        data.events.length === 0 ? (
          <p className="text-sm text-muted">За цей період записів немає.</p>
        ) : (
          <ul className="overflow-hidden rounded-[24px] bg-surface shadow-[var(--shadow-border)]">
            {data.events.map((ev) => (
              <li key={ev.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => open(ev)}
                  disabled={!ev.href}
                  className={cn(
                    "flex w-full flex-col gap-1 px-4 py-3 text-left sm:flex-row sm:items-start sm:gap-4",
                    ev.href ? "hover:bg-surface-2" : "cursor-default",
                  )}
                >
                  <span className="w-36 shrink-0 text-xs text-subtle">{when(ev.createdAt)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          ev.action === "delete"
                            ? "bg-bad/15 text-bad"
                            : ev.action === "restore"
                              ? "bg-ok/15 text-ok"
                              : ev.action === "create"
                                ? "bg-ok/15 text-ok"
                                : "bg-bg text-muted",
                        )}
                      >
                        {ACTION_LABEL[ev.action]} · {ENTITY_LABEL[ev.entity]}
                      </span>
                      <span className="text-sm font-medium text-fg">{ev.actorName}</span>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{ev.summary}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

function RecyclePanel({ orgId }: { orgId?: number }) {
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { data, error, loading } = useAsync(
    () => getRecycleBin({ data: orgId ? { orgId } : {} }),
    [orgId, tick],
  );
  if (loading) return <div className="h-24 animate-pulse rounded-[24px] bg-surface" />;
  if (error || !data) return null;
  const canFlock = canManageFlocks(data.profile);
  const canReport = canDeleteReports(data.profile) || canFlock;
  if (!canFlock && !canReport) return null;
  const { flocks, reports } = data.bin;
  const empty = !flocks.length && !reports.length;

  async function restore(kind: "flock" | "report", id: number) {
    const key = `${kind}-${id}`;
    setBusy(key);
    setMsg(null);
    try {
      if (kind === "flock") await restoreFlock({ data: { flockId: id } });
      else await restoreReport({ data: { reportId: id } });
      setTick((n) => n + 1);
      setMsg("Повернуто. Історія пташника на місці.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Не вдалося повернути");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardTitle>Кошик</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Помилково видалена посадка або звіт лежать тут. Повернення не затирає інші дні. Якщо в
        пташнику вже є нова активна посадка — стара стане архівом з усіма звітами.
      </p>
      {empty ? (
        <p className="mt-3 text-sm text-muted">Кошик порожній.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {flocks.map((f) => (
            <div
              key={`f-${f.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">
                  Посадка {f.code} · {f.siteName}, {f.houseName}
                </p>
                <p className="text-xs text-muted">
                  {fmtDateShort(f.placedAt)} · {fmtInt(f.chicksPlaced)} гол. · {f.breed} · звітів{" "}
                  {f.reportCount}
                </p>
              </div>
              {canFlock ? (
                <Button
                  size="sm"
                  disabled={busy === `flock-${f.id}`}
                  onClick={() => void restore("flock", f.id)}
                >
                  {busy === `flock-${f.id}` ? "…" : "Повернути"}
                </Button>
              ) : null}
            </div>
          ))}
          {reports.map((r) => (
            <div
              key={`r-${r.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">
                  Звіт {fmtDateShort(r.reportDate)} · {r.siteName}, {r.houseName}
                </p>
                <p className="text-xs text-muted">
                  {r.flockCode} · {r.ageDays} доба · {fmtInt(r.avgWeightG)} г · корм {fmtInt(r.feedKg)} кг
                </p>
              </div>
              {canReport ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy === `report-${r.id}`}
                  onClick={() => void restore("report", r.id)}
                >
                  {busy === `report-${r.id}` ? "…" : "Повернути"}
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
      {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
    </Card>
  );
}

