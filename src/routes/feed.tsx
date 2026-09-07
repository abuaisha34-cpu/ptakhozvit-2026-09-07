import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Wheat } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import {
  FEED_PHASES,
  NUTRIENT_GROUPS,
  NUTRIENT_META,
  evaluateFeed,
  feedPhaseLabel,
  kcalFromMj,
  parseFeedValues,
  specsFor,
  type FeedPhase,
  type FeedValues,
  type NutrientId,
} from "@/lib/broiler/feed";
import { isPlatformAdmin } from "@/lib/broiler/roles";
import { deleteFeedAnalysis, getFeedTool, saveFeedAnalysis } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { cn, todayISO } from "@/lib/utils";

type FeedSearch = { org?: number };

export const Route = createFileRoute("/feed")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): FeedSearch => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function Page() {
  return (
    <AppShell>
      <FeedTool />
    </AppShell>
  );
}

function FeedTool() {
  const { org } = Route.useSearch();
  const { data, error, loading, setData } = useAsync(() => getFeedTool({ data: { orgId: org } }), [org]);
  const [phase, setPhase] = useState<FeedPhase>("starter");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [energyUnit, setEnergyUnit] = useState<"kcal" | "mj">("kcal");
  const [siteId, setSiteId] = useState<string>("");
  const [name, setName] = useState("");
  const [labDate, setLabDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const values = useMemo(() => {
    const raw: Record<string, unknown> = { ...fields };
    if (energyUnit === "mj" && fields.energyKcal) {
      const mj = Number(String(fields.energyKcal).replace(",", "."));
      if (Number.isFinite(mj) && mj > 0) raw.energyKcal = kcalFromMj(mj);
    }
    return parseFeedValues(raw);
  }, [fields, energyUnit]);

  const verdict = useMemo(() => evaluateFeed(phase, values), [phase, values]);
  const specs = useMemo(() => specsFor(phase), [phase]);

  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  if (isPlatformAdmin(data.profile) && !data.sites.length && !org) {
    return (
      <p className="text-sm text-muted">
        Відкрийте господарство в{" "}
        <Link to="/holdings" className="underline underline-offset-4">
          списку
        </Link>
        , щоб бачити аналізи корму.
      </p>
    );
  }

  function setField(id: NutrientId, v: string) {
    setFields((prev) => ({ ...prev, [id]: v }));
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await saveFeedAnalysis({
        data: {
          orgId: org,
          siteId: siteId ? Number(siteId) : null,
          phase,
          name,
          labDate,
          values,
        },
      });
      setMsg("Аналіз збережено в журналі корму.");
      setData(await getFeedTool({ data: { orgId: org } }));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Не збережено");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Якість раціону</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Корм</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Внесіть цифри з протоколу лабораторії — сайт порівняє з нормою фази бройлера і пояснить, що
          робити технологу і ветлікарю. Замовлення GREENFEED — в{" "}
          <Link to="/tools" hash="premix" className="text-primary underline-offset-4 hover:underline">
            інструменті преміксу
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {FEED_PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhase(p.id)}
            className={cn(
              "rounded-[20px] p-4 text-left shadow-[var(--shadow-border)] transition-shadow",
              phase === p.id
                ? "bg-primary text-primary-fg shadow-[0_8px_18px_rgb(47_154_76_/_0.22)]"
                : "bg-surface hover:shadow-[var(--shadow-border-hover)]",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Wheat className="size-4" strokeWidth={1.9} />
              {p.label}
            </span>
            <span className={cn("mt-1 block text-xs", phase === p.id ? "text-primary-fg/80" : "text-muted")}>
              {p.age} · {p.purpose}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => void onSave(e)} className="space-y-6">
        {NUTRIENT_GROUPS.map((g) => (
          <Card key={g.id}>
            <CardTitle>{g.label}</CardTitle>
            {g.id === "toxin" ? (
              <p className="mt-1 text-sm text-muted">Не обовʼязково — якщо в протоколі немає, залиште порожнім.</p>
            ) : g.id === "amino" ? (
              <p className="mt-1 text-sm text-muted">Якщо млин дав розрахунок амінокислот — внесіть. Інакше пропустіть.</p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {NUTRIENT_META.filter((n) => n.group === g.id).map((n) => {
                const spec = specs.find((s) => s.id === n.id);
                const check = verdict?.checks.find((c) => c.id === n.id);
                const energyLabel = n.id === "energyKcal" && energyUnit === "mj" ? "МДж/кг" : n.unit;
                return (
                  <div key={n.id}>
                    <Label>{n.label}</Label>
                    <div className="relative">
                      <Input
                        inputMode="decimal"
                        value={fields[n.id] ?? ""}
                        onChange={(e) => setField(n.id, e.target.value)}
                        placeholder={spec ? spec.min != null && spec.max != null ? `${spec.min}–${spec.max}` : `до ${spec.max}` : ""}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-subtle">
                        {energyLabel}
                      </span>
                    </div>
                    {n.id === "energyKcal" ? (
                      <button
                        type="button"
                        className="mt-1 text-[11px] text-muted underline-offset-2 hover:underline"
                        onClick={() => setEnergyUnit((u) => (u === "kcal" ? "mj" : "kcal"))}
                      >
                        вводжу в {energyUnit === "kcal" ? "ккал/кг, перемкнути на МДж" : "МДж/кг, перемкнути на ккал"}
                      </button>
                    ) : (
                      <p className={cn("mt-1 text-[11px]", check && check.severity !== "ok" ? "text-warn" : "text-subtle")}>
                        {check ? check.detail : spec?.hint}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {verdict ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-subtle">Висновок · {verdict.phaseLabel}</p>
                <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">{verdict.headline}</h2>
                <p className="mt-1 text-sm text-muted">{verdict.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={verdict.severity} />
                <span className="font-display text-3xl tabular-nums tracking-tight">{verdict.score}</span>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-subtle">
                  <tr>
                    <th className="py-2 font-medium">Показник</th>
                    <th className="py-2 font-medium">Факт</th>
                    <th className="py-2 font-medium">Норма фази</th>
                    <th className="py-2 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {verdict.checks.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2">{c.label}</td>
                      <td className="py-2 tabular-nums">
                        {c.value} {c.unit}
                      </td>
                      <td className="py-2 text-muted">{c.rangeLabel}</td>
                      <td className="py-2">
                        <StatusBadge status={c.severity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[16px] bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wider text-subtle">Технологія</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {verdict.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[16px] bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wider text-subtle">Ветеринарія</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {verdict.vet.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ) : (
          <p className="text-sm text-muted">Почніть з вологості і протеїну — висновок зʼявиться одразу.</p>
        )}

        <Card>
          <CardTitle>Зберегти партію</CardTitle>
          <p className="mt-1 text-sm text-muted">Щоб порівняти наступний протокол з цим і показати технологу.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Назва / номер партії</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Стартер №14, елеватор" />
            </div>
            <div>
              <Label>Дата протоколу</Label>
              <Input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} />
            </div>
            {data.sites.length ? (
              <div>
                <Label>Фабрика</Label>
                <Select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                  <option value="">Усе господарство</option>
                  {data.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>
          {err ? <p className="mt-3 text-sm text-bad">{err}</p> : null}
          {msg ? <p className="mt-3 text-sm text-ok">{msg}</p> : null}
          <Button type="submit" className="mt-4" disabled={busy || !verdict}>
            {busy ? "Збереження…" : "Зберегти аналіз"}
          </Button>
        </Card>
      </form>

      {data.analyses.length ? (
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight">Збережені протоколи</h2>
          <div className="mt-3 space-y-2">
            {data.analyses.map((a) => (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {a.name || feedPhaseLabel(a.phase)}
                    <span className="ml-2 text-xs font-normal text-muted">
                      {feedPhaseLabel(a.phase)}
                      {a.siteName ? ` · ${a.siteName}` : ""}
                      {a.labDate ? ` · ${a.labDate}` : ""}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {a.headline} · {a.score}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.severity} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPhase(a.phase);
                      const next: Record<string, string> = {};
                      for (const [k, v] of Object.entries(a.values)) {
                        if (v != null) next[k] = String(v);
                      }
                      setFields(next);
                      setEnergyUnit("kcal");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Відкрити
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!window.confirm("Видалити цей аналіз?")) return;
                      await deleteFeedAnalysis({ data: { orgId: org, id: a.id } });
                      setData(await getFeedTool({ data: { orgId: org } }));
                    }}
                  >
                    Видалити
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-xl font-medium tracking-tight">Як читати протокол</h2>
        <p className="mt-1 text-sm text-muted">Коротко, що означає кожна цифра з лабораторії.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {specs.map((s) => (
            <div key={s.id} className="rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="text-sm font-medium">
                {s.label}{" "}
                <span className="text-xs font-normal text-muted">
                  {s.min != null && s.max != null ? `${s.min}–${s.max} ${s.unit}` : s.max != null ? `до ${s.max} ${s.unit}` : s.unit}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
