import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CumFeedChart, FeedKgChart, FeedPerBirdChart, MortChart, WaterPerBirdChart, WeightChart } from "@/components/charts";
import { ExportButtons } from "@/components/export-buttons";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { houseWorkbook } from "@/lib/export-report";
import { deleteDailyReport, getHouseDetail, saveFlockTreatments } from "@/lib/server/fns";
import { droppingLabel, litterLabel } from "@/lib/broiler/litter";
import { formatDose } from "@/lib/broiler/water-meds";
import { useAsync } from "@/lib/use-async";
import { TreatmentCalendarCard } from "@/components/treatment-calendar";
import { canDeleteReports } from "@/lib/broiler/roles";
import { fmtDateShort, fmtInt, fmtNum, fmtPct, cn, eachDateISO, yesterdayISO } from "@/lib/utils";

type HouseSearch = { flock?: number };

export const Route = createFileRoute("/houses/$houseId")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): HouseSearch => {
    const flock = Number(search.flock);
    return { flock: Number.isFinite(flock) && flock > 0 ? flock : undefined };
  },
});

function Page() {
  const { houseId } = Route.useParams();
  const { flock } = Route.useSearch();
  return (
    <AppShell>
      <HouseView houseId={Number(houseId)} flockId={flock} />
    </AppShell>
  );
}

function HouseView({ houseId, flockId }: { houseId: number; flockId?: number }) {
  const [tick, setTick] = useState(0);
  const { data, error, loading } = useAsync(
    () => getHouseDetail({ data: { houseId, flockId } }),
    [houseId, flockId, tick],
  );
  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  const o = data.overview;
  const f = o?.forecast;
  const last = data.series.at(-1);
  const feedDelta =
    last && last.stdFeedGPerBird
      ? ((last.feedGPerBird - last.stdFeedGPerBird) / last.stdFeedGPerBird) * 100
      : null;
  const waterDelta =
    last && last.waterMlPerBird != null && last.stdWaterMlPerBird
      ? ((last.waterMlPerBird - last.stdWaterMlPerBird) / last.stdWaterMlPerBird) * 100
      : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to="/sites/$siteId"
            params={{ siteId: String(data.site.id) }}
            className="text-xs text-muted hover:text-fg"
          >
            ← {data.site.name}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">{data.house.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Місткість {fmtInt(data.house.capacity)}
            {data.house.areaM2 > 0 ? ` · ${fmtInt(data.house.areaM2)} м²` : ""}
            {data.flock
              ? ` · ${data.flock.code} · посадка ${fmtDateShort(data.flock.placedAt)} · ${data.flock.breed}${
                  data.flock.status === "closed" && data.flock.closedAt
                    ? ` · здано ${fmtDateShort(data.flock.closedAt)}`
                    : ""
                }`
              : " · немає активної посадки"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.reports.length ? (
            <ExportButtons
              spec={houseWorkbook({
                siteName: data.site.name,
                houseName: data.house.name,
                flockCode: data.flock?.code,
                breed: data.flock?.breed,
                placedAt: data.flock?.placedAt,
                reports: data.reports,
              })}
            />
          ) : null}
          {o ? <StatusBadge status={o.status} /> : null}
        </div>
      </header>

      {data.flock && data.flock.status !== "closed" ? (
        <MissingBanner
          houseId={data.house.id}
          placedAt={data.flock.placedAt}
          reportDates={data.reports.map((r) => r.reportDate)}
        />
      ) : null}

      {data.pastFlocks.length ? (
        <Card>
          <CardTitle>Архів посадок</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.pastFlocks.map((f) => (
              <Link
                key={f.id}
                to="/houses/$houseId"
                params={{ houseId: String(houseId) }}
                search={{ flock: f.id }}
                className="inline-flex h-11 items-center rounded-[12px] bg-bg px-3 text-sm text-muted hover:text-fg"
              >
                {f.code} · {fmtDateShort(f.placedAt)}
                {f.closedAt ? ` — ${fmtDateShort(f.closedAt)}` : ""}
              </Link>
            ))}
            {data.flock?.status === "closed" ? (
              <Link
                to="/houses/$houseId"
                params={{ houseId: String(houseId) }}
                className="inline-flex h-11 items-center rounded-[12px] bg-primary px-3 text-sm text-primary-fg"
              >
                Активна
              </Link>
            ) : null}
          </div>
        </Card>
      ) : null}

      {data.flock ? (
        <TreatmentCalendarCard
          title="Календар обробок"
          hint={
            data.canEditTreatments
              ? "Технолог або ветлікар може змінити добу, назву, додати обробку або позначити «зроблено». Це лише ця посадка."
              : "Графік вакцинацій і обробок цієї посадки. Фактичне випоювання — нижче, зі щоденних звітів."
          }
          items={data.treatments}
          canEdit={data.canEditTreatments}
          ageDays={data.overview?.ageDays}
          flockMode
          onSave={async (items) => {
            await saveFlockTreatments({ data: { flockId: data.flock!.id, items } });
            setTick((n) => n + 1);
          }}
        />
      ) : null}

      {data.flock && data.reports.some((r) => r.meds.length) ? (
        <Card>
          <CardTitle>Фактичне випоювання</CardTitle>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {data.reports
              .filter((r) => r.meds.length)
              .slice(-8)
              .map((r) => (
                <li key={r.id}>
                  {r.reportDate}: {r.meds.map((m) => formatDose(m)).join("; ")}
                </li>
              ))}
          </ul>
        </Card>
      ) : null}

      {o ? (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Mini k="Поголівʼя" v={fmtInt(o.head)} />
          <Mini k="Доба" v={String(o.ageDays)} />
          <Mini
            k="Падіж з посадки"
            v={fmtPct(o.cumMortPct, 2)}
            s={`норма ${fmtPct(o.stdCumMortPct, 2)} · продаж не входить`}
          />
          <Mini
            k="Маса"
            v={`${fmtInt(o.avgWeightG)} г`}
            s={o.weightDeltaPct != null ? `${o.weightDeltaPct > 0 ? "+" : ""}${fmtNum(o.weightDeltaPct, 1)}%` : ""}
          />
          <Mini
            k="кг/м²"
            v={o.density && o.density.areaM2 > 0 ? fmtNum(o.density.kgM2, 1) : "вкажіть площу"}
            s={
              o.density?.reached
                ? `ліміт ${o.density.limitKgM2} кг/м² уже`
                : o.density?.daysToLimit != null
                  ? `${o.density.limitKgM2} кг/м² · ${o.density.reachAgeDays} доба · ${fmtDateShort(o.density.reachDate!)}`
                  : o.house.areaM2 > 0
                    ? "прогноз за приростом"
                    : "площа в параметрах пташника"
            }
          />
          <Mini
            k="Продано"
            v={o.soldHead ? `${fmtInt(o.soldHead)} гол.` : "—"}
            s={
              o.soldHead
                ? `${fmtNum(o.soldWeightKg, 0)} кг · сер. ${fmtInt(o.saleAvgG)} г`
                : "ще немає здачі"
            }
          />
          <Mini
            k="Корм / добу"
            v={last ? `${fmtInt(last.feedKg)} кг` : "—"}
            s={
              last
                ? `${fmtInt(last.feedGPerBird)} г/гол.${
                    feedDelta != null ? ` · ${feedDelta > 0 ? "+" : ""}${fmtNum(feedDelta, 1)}%` : ""
                  }`
                : undefined
            }
          />
          <Mini
            k="Вода / добу"
            v={last?.waterMlPerBird != null ? `${fmtInt(last.waterMlPerBird)} мл` : "—"}
            s={
              last
                ? `норма ${fmtInt(last.stdWaterMlPerBird)} мл${
                    waterDelta != null ? ` · ${waterDelta > 0 ? "+" : ""}${fmtNum(waterDelta, 1)}%` : ""
                  }`
                : undefined
            }
          />
        </section>
      ) : null}

      {o ? (
        <Card>
          <CardTitle>Конверсія корму</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Корм з посадки, кг ÷ приріст живої маси (залишок + здача − маса курчат). Падіж у знаменник не
            входить — тому FCR гірший, якщо птиця гине.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FcrCell
              k="Зараз"
              v={o.fcr ? fmtNum(o.fcr, 3) : "—"}
              s={`норма кросу ${fmtNum(o.stdFcr, 3)}`}
            />
            <FcrCell
              k="На здачі"
              v={o.soldHead ? fmtNum(o.saleFcr, 3) : "—"}
              s={
                o.soldHead
                  ? `${fmtInt(o.soldHead)} гол. · ${fmtNum(o.soldWeightKg, 0)} кг`
                  : "поки не здавали"
              }
            />
            <FcrCell
              k="Прогноз на закриття"
              v={f?.projectedFcr ? fmtNum(f.projectedFcr, 3) : "—"}
              s={
                f
                  ? `${fmtInt(f.remainingDays)} діб · ${fmtInt(f.projectedWeightG)} г · ${fmtInt(f.projectedHead)} гол.`
                  : "немає посадки"
              }
            />
          </div>
        </Card>
      ) : null}

      {f ? (
        <section className="grid gap-3 md:grid-cols-3">
          <Mini k="Днів до забою" v={fmtInt(f.remainingDays)} />
          <Mini k="Прогноз маси" v={`${fmtInt(f.projectedWeightG)} г`} />
          <Mini k="EPEF на забої" v={fmtInt(f.projectedEpef)} />
        </section>
      ) : null}

      {o && o.deviations.length ? (
        <Card>
          <CardTitle>Відхилення</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {o.deviations.map((d) => (
              <li key={d.id} className="text-muted">
                <span className="text-fg">{d.title}.</span> {d.detail}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Маса</CardTitle>
          <WeightChart data={data.series.map((r) => ({ date: r.date, weight: r.weight, stdWeight: r.stdWeight }))} />
        </Card>
        <Card>
          <CardTitle>Падіж, %</CardTitle>
          <MortChart data={data.series.map((r) => ({ date: r.date, mortPct: r.dayMortPct }))} />
        </Card>
        <Card>
          <CardTitle>Корм за добу, кг</CardTitle>
          <p className="mt-1 text-sm text-muted">Факт видачі проти норми кросу на поголівʼя ранку.</p>
          <FeedKgChart data={data.series} />
        </Card>
        <Card>
          <CardTitle>Корм на голову, г</CardTitle>
          <p className="mt-1 text-sm text-muted">Незалежно від розміру посадки — зручно ловити перевитрату.</p>
          <FeedPerBirdChart data={data.series} />
        </Card>
        <Card>
          <CardTitle>Вода на голову, мл</CardTitle>
          <p className="mt-1 text-sm text-muted">Норма кросу {data.flock?.breed ?? ""}.</p>
          <WaterPerBirdChart data={data.series} />
        </Card>
      </section>

      <Card>
        <CardTitle>Накопичений корм</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Сума з посадки. Якщо факт вище норми при відставанні за масою — FCR уже гірший за план.
        </p>
        <div className="mt-3">
          <CumFeedChart data={data.series} />
        </div>
      </Card>

      <div className="space-y-2 md:hidden">
        {[...data.reports].reverse().map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">
                {r.reportDate} · {r.ageDays} доба
              </p>
              <Link
                to="/report"
                search={{ house: data.house.id, date: r.reportDate }}
                className="text-xs text-muted"
              >
                Змінити
              </Link>
            </div>
            <p className="mt-1 text-sm text-muted">
              падіж {r.mortality}
              {r.culled ? `+${r.culled}` : ""} · {fmtInt(r.headEnd)} гол. · {fmtInt(r.avgWeightG)} г
            </p>
            <p className="mt-1 text-xs text-muted">
              {r.droppingLook || r.litterState
                ? `${droppingLabel(r.droppingLook)} · ${litterLabel(r.litterState)}`
                : "послід —"}
              {r.meds.length ? ` · ${r.meds.map((m) => formatDose(m)).join("; ")}` : ""}
            </p>
            {r.droppingPhoto ? (
              <img src={r.droppingPhoto} alt="" className="mt-2 max-h-32 rounded-[12px] object-cover" />
            ) : null}
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)] md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Доба</th>
              <th className="px-4 py-3 font-medium">Падіж</th>
              <th className="px-4 py-3 font-medium">Поголівʼя</th>
              <th className="px-4 py-3 font-medium">Маса</th>
              <th className="px-4 py-3 font-medium">Продаж</th>
              <th className="px-4 py-3 font-medium">Корм</th>
              <th className="px-4 py-3 font-medium">Вода</th>
              <th className="px-4 py-3 font-medium">t°</th>
              <th className="px-4 py-3 font-medium">Послід</th>
              <th className="px-4 py-3 font-medium">Випоювання</th>
              <th className="px-4 py-3 font-medium">Примітка</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {[...data.reports].reverse().map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-2 tabular-nums">{r.reportDate}</td>
                <td className="px-4 py-2 tabular-nums">{r.ageDays}</td>
                <td className="px-4 py-2 tabular-nums">
                  {r.mortality}
                  {r.culled ? `+${r.culled}` : ""}
                </td>
                <td className="px-4 py-2 tabular-nums">{fmtInt(r.headEnd)}</td>
                <td className="px-4 py-2 tabular-nums">{fmtInt(r.avgWeightG)}</td>
                <td className="px-4 py-2 tabular-nums">
                  {r.soldHead
                    ? `${fmtInt(r.soldHead)} / ${fmtNum(r.soldWeightKg, 0)} кг · ${fmtInt(
                        r.soldWeightKg * 1000 / r.soldHead,
                      )} г`
                    : "—"}
                </td>
                <td className="px-4 py-2 tabular-nums">{fmtNum(r.feedKg, 0)}</td>
                <td className="px-4 py-2 tabular-nums">{r.waterL != null ? fmtNum(r.waterL, 0) : "—"}</td>
                <td className="px-4 py-2 tabular-nums">
                  {r.tempMin ?? "—"}–{r.tempMax ?? "—"}
                </td>
                <td className="px-4 py-2 text-xs text-muted">
                  {r.droppingLook || r.litterState
                    ? `${droppingLabel(r.droppingLook)} · ${litterLabel(r.litterState)}`
                    : "—"}
                </td>
                <td className="max-w-[220px] px-4 py-2 text-xs text-muted">
                  {r.meds.length ? r.meds.map((m) => formatDose(m)).join("; ") : "немає"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-2 text-muted">{r.notes || "—"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/report"
                      search={{ house: data.house.id, date: r.reportDate }}
                      className="inline-flex h-9 items-center rounded-[10px] px-3 text-xs font-medium text-muted hover:bg-bg hover:text-fg"
                    >
                      Змінити
                    </Link>
                    {canDeleteReports(data.profile) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!window.confirm(`Надіслати звіт за ${r.reportDate} в кошик? Його можна повернути в Журналі.`)) return;
                        await deleteDailyReport({ data: { reportId: r.id } });
                        setTick((n) => n + 1);
                      }}
                    >
                      Видалити
                    </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Mini({ k, v, s, className }: { k: string; v: string; s?: string; className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <p className="text-[11px] uppercase tracking-wider text-subtle hyphens-none">{k}</p>
      <p className="mt-2 font-display text-2xl tabular-nums tracking-tight">{v}</p>
      {s ? <p className="mt-1 text-xs text-muted">{s}</p> : null}
    </Card>
  );
}

function FcrCell({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-[16px] bg-bg px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-subtle">{k}</p>
      <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">{v}</p>
      <p className="mt-1 text-xs text-muted">{s}</p>
    </div>
  );
}

function MissingBanner({
  houseId,
  placedAt,
  reportDates,
}: {
  houseId: number;
  placedAt: string;
  reportDates: string[];
}) {
  const have = new Set(reportDates);
  const missing = eachDateISO(placedAt, yesterdayISO()).filter((d) => !have.has(d));
  if (!missing.length) return null;
  return (
    <Card>
      <p className="text-sm text-fg">
        Немає звітів за {missing.length} {missing.length === 1 ? "добу" : "діб"} від посадки до вчора. Можна
        внести заднім числом — від {fmtDateShort(missing[0])}.
      </p>
      <Link
        to="/report"
        search={{ house: houseId, date: missing[0] }}
        className="mt-3 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
      >
        Заповнити з {fmtDateShort(missing[0])}
      </Link>
    </Card>
  );
}
