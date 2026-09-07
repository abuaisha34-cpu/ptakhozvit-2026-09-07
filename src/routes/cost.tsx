import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import {
  COST_ARTICLE_LABELS,
  articlesTotal,
  planCost,
  type CostArticles,
  type CostSheet,
} from "@/lib/broiler/cost";
import { BREEDS } from "@/lib/broiler/standards";
import type { CostSettings, FactoryOverview } from "@/lib/broiler/types";
import { isPlatformAdmin } from "@/lib/broiler/roles";
import { getCostTool, saveCosts } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { cn, fmtInt, fmtNum } from "@/lib/utils";

type Search = { org?: number };

export const Route = createFileRoute("/cost")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): Search => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function Page() {
  return (
    <AppShell>
      <CostPage />
    </AppShell>
  );
}

function CostPage() {
  const { org } = Route.useSearch();
  const { data, error, loading, setData } = useAsync(() => getCostTool({ data: { orgId: org } }), [org]);

  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  if (isPlatformAdmin(data.profile) && !data.factories.length && !org && !data.profile.orgId) {
    return (
      <p className="text-sm text-muted">
        Відкрийте господарство в{" "}
        <Link to="/holdings" className="underline underline-offset-4">
          списку
        </Link>
        , щоб бачити собівартість.
      </p>
    );
  }

  const profit = data.factories.reduce((s, f) => s + (f.forecast?.projectedProfit ?? 0), 0);
  const cost = data.factories.reduce((s, f) => s + (f.forecast?.projectedCost ?? 0), 0);
  const liveKg = data.factories.reduce((s, f) => {
    const fc = f.forecast;
    if (!fc) return s;
    return s + (fc.projectedHead * fc.projectedWeightG) / 1000;
  }, 0);
  const perKg = liveKg > 0 ? cost / liveKg : 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Економіка туру</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Собівартість</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Курчата, корм, газ, ветеринарія і інше — на фактичному поголівʼї і кросі. Нижче — плановий тур без
          звітів.
        </p>
      </header>

      {data.factories.some((f) => f.activeHouses) ? (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini k="Собівартість на здачі" v={`${fmtNum(perKg, 2)} ₴`} s="за кг живої" />
            <Mini k="Витрати туру" v={`${fmtInt(cost)} ₴`} />
            <Mini
              k="Прибуток туру"
              v={`${fmtInt(profit)} ₴`}
              s={cost ? `${fmtNum((profit / cost) * 100, 1)}% до витрат` : undefined}
              ok={profit >= 0}
            />
            <Mini k="Ціна здачі" v={`${fmtNum(data.costs.liveWeightPriceUah, 1)} ₴`} s="за кг живої" />
          </div>
          {data.factories.map((factory) => (
            <FactoryCost key={factory.site.id} factory={factory} sale={data.costs.liveWeightPriceUah} />
          ))}
        </>
      ) : (
        <Card>
          <CardTitle>Посадок ще немає</CardTitle>
          <p className="mt-2 text-sm text-muted">Після відкриття посадки собівартість візьме факт зі звітів.</p>
        </Card>
      )}

      <Planner costs={data.costs} />

      <PricesCard
        initial={data.costs}
        canEdit={data.canEdit}
        orgId={org}
        onSaved={async () => setData(await getCostTool({ data: { orgId: org } }))}
      />
    </div>
  );
}

function FactoryCost({ factory, sale }: { factory: FactoryOverview; sale: number }) {
  const houses = factory.houses.filter((h) => h.flock && h.forecast);
  if (!houses.length) return null;
  const f = factory.forecast;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-medium tracking-tight">{factory.site.name}</h2>
        <p className="mt-0.5 text-sm text-muted">
          {houses.length} пташн. · {fmtInt(factory.head)} гол.
          {f ? ` · ${fmtNum(f.projectedCostPerKg, 2)} ₴/кг на здачі` : ""}
        </p>
      </div>
      <div className="overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-subtle">
              <th className="px-4 py-3 font-medium">Пташник</th>
              <th className="px-4 py-3 font-medium">Крос</th>
              <th className="px-4 py-3 font-medium">На здачі, ₴/кг</th>
              <th className="px-4 py-3 font-medium">Прибуток</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((h) => {
              const fc = h.forecast!;
              const beat = fc.projectedCostPerKg > 0 && fc.projectedCostPerKg < sale;
              return (
                <tr key={h.house.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link
                      to="/houses/$houseId"
                      params={{ houseId: String(h.house.id) }}
                      className="hover:underline"
                    >
                      {h.house.name}
                    </Link>
                    <p className="text-xs text-muted">{h.ageDays} д.</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{h.flock?.breed}</td>
                  <td className={cn("px-4 py-3 tabular-nums", beat ? "text-ok" : "text-bad")}>
                    {fmtNum(fc.projectedCostPerKg, 2)}
                  </td>
                  <td className={cn("px-4 py-3 tabular-nums", fc.projectedProfit >= 0 ? "text-ok" : "text-bad")}>
                    {fmtInt(fc.projectedProfit)} ₴
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Planner({ costs }: { costs: CostSettings }) {
  const [breed, setBreed] = useState(BREEDS[0].name);
  const [head, setHead] = useState("20000");
  const [days, setDays] = useState("42");
  const [mort, setMort] = useState("");
  const sheet: CostSheet = useMemo(
    () =>
      planCost({
        breed,
        placed: Number(head) || 0,
        targetDays: Number(days) || 42,
        mortPct: mort === "" ? undefined : Number(mort.replace(",", ".")),
        chickCostUah: costs.chickPriceUah,
        feedPriceUah: costs.feedPriceUah,
        gasPerBirdUah: costs.gasPerBirdUah,
        medsPerBirdUah: costs.medsPerBirdUah,
        otherPerBirdUah: costs.otherPerBirdUah,
        liveWeightPriceUah: costs.liveWeightPriceUah,
      }),
    [breed, head, days, mort, costs],
  );
  return (
    <Card className="space-y-4">
      <div>
        <CardTitle>Плановий тур</CardTitle>
        <p className="mt-1 text-sm text-muted">Норма кросу без звітів. Падіж порожній — візьметься з таблиці.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <Label>Крос</Label>
          <Select value={breed} onChange={(e) => setBreed(e.target.value)}>
            {BREEDS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <Field label="Поголівʼя" value={head} onChange={setHead} />
        <Field label="Доба забою" value={days} onChange={setDays} />
        <Field label="Падіж, %" value={mort} onChange={setMort} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Mini k="₴/кг живої" v={fmtNum(sheet.perKg, 2)} />
        <Mini k="₴/гол. здана" v={fmtNum(sheet.perBirdSold, 2)} />
        <Mini k="Жива маса" v={`${fmtInt(sheet.liveKg)} кг`} s={`FCR ${fmtNum(sheet.fcr, 3)}`} />
        <Mini k="Прибуток" v={`${fmtInt(sheet.profit)} ₴`} s={`${fmtNum(sheet.profitabilityPct, 1)}%`} ok={sheet.profit >= 0} />
      </div>
      <ArticleTable articles={sheet.articles} />
    </Card>
  );
}

function ArticleTable({ articles }: { articles: CostArticles }) {
  const total = articlesTotal(articles) || 1;
  const keys = Object.keys(COST_ARTICLE_LABELS) as (keyof CostArticles)[];
  return (
    <div className="space-y-2">
      {keys.map((id) => {
        const v = articles[id];
        const pct = (v / total) * 100;
        return (
          <div key={id}>
            <div className="flex justify-between text-sm">
              <span>{COST_ARTICLE_LABELS[id]}</span>
              <span className="tabular-nums text-muted">
                {fmtInt(v)} ₴ · {fmtNum(pct, 0)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PricesCard({
  initial,
  canEdit,
  orgId,
  onSaved,
}: {
  initial: CostSettings;
  canEdit: boolean;
  orgId?: number;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    chickPriceUah: String(initial.chickPriceUah),
    feedPriceUah: String(initial.feedPriceUah),
    gasPerBirdUah: String(initial.gasPerBirdUah),
    medsPerBirdUah: String(initial.medsPerBirdUah),
    otherPerBirdUah: String(initial.otherPerBirdUah),
    liveWeightPriceUah: String(initial.liveWeightPriceUah),
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <Card>
      <CardTitle>Ціни для розрахунку</CardTitle>
      <p className="mt-1 text-sm text-muted">Газ, ветеринарія і інше — на голову за тур. Корм — за кілограм.</p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canEdit) return;
          setBusy(true);
          setErr(null);
          try {
            await saveCosts({
              data: {
                ...initial,
                chickPriceUah: Number(form.chickPriceUah.replace(",", ".")) || 0,
                feedPriceUah: Number(form.feedPriceUah.replace(",", ".")) || 0,
                gasPerBirdUah: Number(form.gasPerBirdUah.replace(",", ".")) || 0,
                medsPerBirdUah: Number(form.medsPerBirdUah.replace(",", ".")) || 0,
                otherPerBirdUah: Number(form.otherPerBirdUah.replace(",", ".")) || 0,
                liveWeightPriceUah: Number(form.liveWeightPriceUah.replace(",", ".")) || 0,
                orgId,
              },
            });
            await onSaved();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Не збережено");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Курча, ₴" value={form.chickPriceUah} onChange={(v) => setForm({ ...form, chickPriceUah: v })} disabled={!canEdit} />
        <Field label="Корм, ₴/кг" value={form.feedPriceUah} onChange={(v) => setForm({ ...form, feedPriceUah: v })} disabled={!canEdit} />
        <Field label="Здача, ₴/кг живої" value={form.liveWeightPriceUah} onChange={(v) => setForm({ ...form, liveWeightPriceUah: v })} disabled={!canEdit} />
        <Field label="Газ, ₴/гол." value={form.gasPerBirdUah} onChange={(v) => setForm({ ...form, gasPerBirdUah: v })} disabled={!canEdit} />
        <Field label="Ветеринарія, ₴/гол." value={form.medsPerBirdUah} onChange={(v) => setForm({ ...form, medsPerBirdUah: v })} disabled={!canEdit} />
        <Field label="Інше, ₴/гол." value={form.otherPerBirdUah} onChange={(v) => setForm({ ...form, otherPerBirdUah: v })} disabled={!canEdit} />
        {err ? <p className="text-sm text-bad sm:col-span-2 lg:col-span-3">{err}</p> : null}
        {canEdit ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={busy}>
              {busy ? "Збереження…" : "Зберегти ціни"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted sm:col-span-2 lg:col-span-3">Ціни змінює головний технолог.</p>
        )}
      </form>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input inputMode="decimal" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Mini({ k, v, s, ok }: { k: string; v: string; s?: string; ok?: boolean }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-surface px-3 py-3 shadow-[var(--shadow-border)]">
      <p className="text-[11px] uppercase leading-snug tracking-wider text-subtle">{k}</p>
      <p className={cn("mt-1.5 font-display text-2xl tabular-nums tracking-tight", ok === false ? "text-bad" : ok ? "text-ok" : "")}>
        {v}
      </p>
      {s ? <p className="mt-1 text-xs text-muted">{s}</p> : null}
    </div>
  );
}
