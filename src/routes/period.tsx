import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { FeedBySiteChart } from "@/components/charts";
import { ExportButtons } from "@/components/export-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { periodWorkbook } from "@/lib/export-report";
import { getPeriodReport } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { addDaysISO, fmtInt, fmtNum, shortSite, todayISO } from "@/lib/utils";

export const Route = createFileRoute("/period")({ component: Page });

function Page() {
  return (
    <AppShell>
      <Period />
    </AppShell>
  );
}

function Period() {
  const today = todayISO();
  const [from, setFrom] = useState(addDaysISO(today, -7));
  const [to, setTo] = useState(today);
  const [siteId, setSiteId] = useState<string>("all");
  const query = useMemo(
    () => ({
      from,
      to,
      siteId: siteId === "all" ? null : Number(siteId),
    }),
    [from, to, siteId],
  );
  const { data, error, loading } = useAsync(() => getPeriodReport({ data: query }), [query]);

  const totals = useMemo(() => {
    if (!data) return null;
    const mort = data.rows.reduce((s, r) => s + r.mortality + r.culled, 0);
    const feed = data.rows.reduce((s, r) => s + r.feedKg, 0);
    const soldHead = data.rows.reduce((s, r) => s + r.soldHead, 0);
    const soldKg = data.rows.reduce((s, r) => s + r.soldWeightKg, 0);
    return { mort, feed, n: data.rows.length, soldHead, soldKg };
  }, [data]);

  const feedChart = useMemo(() => {
    if (!data?.rows.length) return { points: [] as Array<{ date: string; feedBySite: Record<string, number> }>, keys: [] as string[] };
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const s of data.sites) {
      const k = shortSite(s.name);
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
    for (const r of data.rows) {
      const k = shortSite(r.siteName);
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
    const byDate = new Map<string, Record<string, number>>();
    for (const r of data.rows) {
      const k = shortSite(r.siteName);
      const cur = byDate.get(r.date) ?? {};
      cur[k] = (cur[k] ?? 0) + r.feedKg;
      byDate.set(r.date, cur);
    }
    const points = [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, feedBySite]) => ({ date, feedBySite }));
    const used = keys.filter((k) => points.some((p) => (p.feedBySite[k] ?? 0) > 0));
    return { points, keys: used.length ? used : keys };
  }, [data]);

  function downloadCsv() {
    if (!data) return;
    const header = [
      "Дата",
      "Фабрика",
      "Пташник",
      "Доба",
      "Падіж",
      "Вибраковка",
      "Поголів'я",
      "Маса г",
      "Корм кг",
      "FCR",
      "Продаж гол.",
      "Продаж кг",
      "Середня курка г",
      "FCR продажу",
      "Примітка",
    ];
    const lines = data.rows.map((r) =>
      [
        r.date,
        r.siteName,
        r.houseName,
        r.ageDays,
        r.mortality,
        r.culled,
        r.head,
        r.avgWeightG,
        r.feedKg,
        r.fcr.toFixed(3),
        r.soldHead,
        r.soldWeightKg,
        r.saleAvgG ? Math.round(r.saleAvgG) : "",
        r.saleFcr ? r.saleFcr.toFixed(3) : "",
        `"${r.notes.replace(/"/g, "''")}"`,
      ].join(";"),
    );
    const blob = new Blob([[header.join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ptahozvit-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">Звітність</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">За період</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButtons
            spec={
              data
                ? periodWorkbook(data.rows, {
                    from,
                    to,
                    orgName: data.profile.orgName,
                    siteName:
                      siteId === "all"
                        ? null
                        : data.sites.find((s) => String(s.id) === siteId)?.name ?? null,
                  })
                : null
            }
            disabled={!data?.rows.length}
          />
          <Button variant="ghost" onClick={downloadCsv} disabled={!data?.rows.length}>
            CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <Label htmlFor="from">З</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">По</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sid">Фабрика</Label>
          <Select id="sid" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="all">Усі</option>
            {data?.sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {totals ? (
        <p className="text-sm text-muted">
          Рядків {totals.n} · падіж+вибраковка {fmtInt(totals.mort)} гол. · корм {fmtNum(totals.feed, 0)} кг
          {totals.soldHead
            ? ` · продано ${fmtInt(totals.soldHead)} гол. / ${fmtNum(totals.soldKg, 0)} кг`
            : ""}
        </p>
      ) : null}

      {feedChart.points.length ? (
        <Card>
          <CardTitle>Споживання корму за період</CardTitle>
          <p className="mt-1 text-sm text-muted">Денна видача по фабриках, кг. Фільтр дат і фабрики вище.</p>
          <div className="mt-3">
            <FeedBySiteChart data={feedChart.points} keys={feedChart.keys} />
          </div>
        </Card>
      ) : null}

      {loading ? <div className="h-48 animate-pulse rounded-[24px] bg-surface" /> : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <div className="overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Фабрика</th>
              <th className="px-4 py-3 font-medium">Пташник</th>
              <th className="px-4 py-3 font-medium">Доба</th>
              <th className="px-4 py-3 font-medium">Падіж</th>
              <th className="px-4 py-3 font-medium">Маса</th>
              <th className="px-4 py-3 font-medium">Корм</th>
              <th className="px-4 py-3 font-medium">FCR</th>
              <th className="px-4 py-3 font-medium">Продаж</th>
              <th className="px-4 py-3 font-medium">Сер. курка</th>
              <th className="px-4 py-3 font-medium">FCR здачі</th>
              <th className="px-4 py-3 font-medium">Примітка</th>
            </tr>
          </thead>
          <tbody>
            {data?.rows.map((r, i) => (
              <tr key={`${r.date}-${r.houseId}-${i}`} className="border-t border-border">
                <td className="px-4 py-2.5 tabular-nums">{r.date}</td>
                <td className="px-4 py-2.5">{r.siteName.replace("Фабрика ", "")}</td>
                <td className="px-4 py-2.5">{r.houseName}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.ageDays}</td>
                <td className="px-4 py-2.5 tabular-nums">
                  {r.mortality}
                  {r.culled ? ` +${r.culled}` : ""}
                </td>
                <td className="px-4 py-2.5 tabular-nums">{fmtInt(r.avgWeightG)} г</td>
                <td className="px-4 py-2.5 tabular-nums">{fmtNum(r.feedKg, 0)}</td>
                <td className="px-4 py-2.5 tabular-nums">{fmtNum(r.fcr, 2)}</td>
                <td className="px-4 py-2.5 tabular-nums">
                  {r.soldHead ? `${fmtInt(r.soldHead)} / ${fmtNum(r.soldWeightKg, 0)} кг` : "—"}
                </td>
                <td className="px-4 py-2.5 tabular-nums">{r.saleAvgG ? `${fmtInt(r.saleAvgG)} г` : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.soldHead ? fmtNum(r.saleFcr, 3) : "—"}</td>
                <td className="max-w-[220px] truncate px-4 py-2.5 text-muted">{r.notes || "—"}</td>
              </tr>
            ))}
            {data && !data.rows.length && !loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-muted">
                  Немає звітів за цей період
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
