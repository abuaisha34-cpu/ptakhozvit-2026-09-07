import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { FeedKgChart, FeedPerBirdChart, MortChart, WeightChart } from "@/components/charts";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { FactoryWeatherLine } from "@/components/weather-panel";
import type { Deviation, Severity } from "@/lib/broiler/calc";
import type { AlertThresholdsView, FactoryOverview, HouseOverview } from "@/lib/broiler/types";
import { cn, fmtDateShort, fmtInt, fmtNum, fmtPct, pctDelta } from "@/lib/utils";

export function FactorySummary({
  factory,
  thresholds,
  housesVariant = "chips",
  headingLevel = "h2",
  showSiteLink = false,
  showHeading = true,
}: {
  factory: FactoryOverview;
  thresholds: AlertThresholdsView;
  housesVariant?: "chips" | "cards";
  headingLevel?: "h1" | "h2";
  showSiteLink?: boolean;
  showHeading?: boolean;
}) {
  const hasFlocks = factory.activeHouses > 0;
  const Heading = headingLevel;
  const last = factory.series.at(-1);
  const feedDelta = factory.feedDeltaPct ?? (last ? pctDelta(last.feedGPerBird, last.stdFeedGPerBird) : null);
  const feedTone =
    feedDelta == null ? undefined : Math.abs(feedDelta) > thresholds.feedPct ? "bad" : "ok";
  const feedHint =
    factory.feedGPerBird > 0
      ? `${fmtInt(factory.feedGPerBird)} г/гол.${
          feedDelta == null ? "" : ` · ${feedDelta > 0 ? "+" : ""}${fmtNum(feedDelta, 1)}% до норми`
        }`
      : undefined;
  const ranked = [...factory.deviations].sort((a, b) => {
    const rank = { critical: 0, warn: 1, watch: 2, ok: 3 };
    return rank[a.severity] - rank[b.severity];
  });
  const headingClass =
    headingLevel === "h1"
      ? "font-display text-3xl font-medium tracking-tight md:text-4xl"
      : "font-display text-xl font-medium tracking-tight md:text-2xl";

  return (
    <section
      id={`factory-${factory.site.id}`}
      className="scroll-mt-20 space-y-5 rounded-[24px] bg-surface p-4 shadow-[var(--shadow-border)] md:p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showHeading ? (
            showSiteLink ? (
              <Link to="/sites/$siteId" params={{ siteId: String(factory.site.id) }} className="min-w-0">
                <Heading className={cn(headingClass, "text-fg")}>{factory.site.name}</Heading>
              </Link>
            ) : (
              <Heading className={headingClass}>{factory.site.name}</Heading>
            )
          ) : null}
          <p className={cn("text-sm text-muted", showHeading ? "mt-1" : "")}>
            {factory.site.location} · {factory.houses.length} пташники · активних {factory.activeHouses}
            {hasFlocks ? ` · ${fmtInt(factory.head)} гол. з ${fmtInt(factory.placed)}` : ""}
            {factory.missingToday ? ` · немає звіту за вчора: ${factory.missingToday}` : ""}
          </p>
          <FactoryWeatherLine
            place={factory.weatherPlace ?? factory.site.geoName}
            weather={factory.weather}
            climate={factory.climate}
          />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={factory.status} />
          {showSiteLink ? (
            <Link
              to="/sites/$siteId"
              params={{ siteId: String(factory.site.id) }}
              className="inline-flex h-11 items-center gap-1.5 rounded-[12px] bg-bg px-3 text-sm text-muted hover:text-fg"
            >
              Фабрика
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </header>

      {hasFlocks ? (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          <Kpi label="Поголів'я" value={fmtInt(factory.head)} hint={`з ${fmtInt(factory.placed)} посадки`} />
          <Kpi
            label="Падіж / добу"
            value={fmtPct(factory.dayMortPct, 2)}
            hint={`${fmtInt(factory.dayMortality)} гол.`}
            tone={factory.dayMortPct > 0.25 ? "bad" : "ok"}
          />
          <Kpi
            label="Сер. маса"
            value={`${fmtInt(factory.avgWeightG)} г`}
            hint={`FCR ${fmtNum(factory.fcr, 3)}`}
          />
          <Kpi
            label="Корм / добу"
            value={factory.feedKg > 0 ? `${fmtInt(factory.feedKg)} кг` : "—"}
            hint={feedHint}
            tone={feedTone}
          />
          <Kpi
            label="EPEF"
            value={factory.epef ? fmtInt(factory.epef) : "—"}
            hint={
              factory.forecast
                ? `до забою ${factory.forecast.remainingDays} діб · ${fmtInt(factory.forecast.projectedWeightG)} г`
                : undefined
            }
            className="col-span-2 lg:col-span-1"
          />
        </div>
      ) : (
        <p className="text-sm text-muted">Немає активної посадки на цій фабриці.</p>
      )}

      {factory.soldHead > 0 ? (
        <p className="text-sm tabular-nums text-muted">
          Продано {fmtInt(factory.soldHead)} гол. · {fmtNum(factory.soldWeightKg, 0)} кг
        </p>
      ) : null}

      <div
        className={cn(
          "grid gap-2",
          housesVariant === "cards" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {factory.houses.map((h) =>
          housesVariant === "cards" ? (
            <HouseCard key={h.house.id} item={h} />
          ) : (
            <HouseChip key={h.house.id} item={h} />
          ),
        )}
      </div>

      {hasFlocks && ranked.length ? (
        <div>
          <p className="font-display text-lg font-medium tracking-tight">Відхилення цієї фабрики</p>
          <p className="mt-1 text-sm text-muted">Порівняння з нормою кросу на фактичну добу кожного пташника.</p>
          <ul className="mt-3 divide-y divide-border">
            {ranked.slice(0, 8).map((d) => (
              <DeviationRow key={d.id} item={d} />
            ))}
          </ul>
        </div>
      ) : null}

      {factory.series.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="font-display text-lg font-medium tracking-tight">Жива маса проти норми</p>
            <p className="mt-1 text-sm text-muted">Середнє зважене по пташниках цієї фабрики, останні 14 діб.</p>
            <div className="mt-3">
              <WeightChart data={factory.series} />
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-medium tracking-tight">Добовий падіж</p>
            <p className="mt-1 text-sm text-muted">Частка від ранкового поголівʼя фабрики.</p>
            <div className="mt-3">
              <MortChart data={factory.series} />
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-medium tracking-tight">Корм, кг проти норми</p>
            <p className="mt-1 text-sm text-muted">Факт видачі на ранкове поголівʼя цієї фабрики.</p>
            <div className="mt-3">
              <FeedKgChart data={factory.series} />
            </div>
          </div>
          <div>
            <p className="font-display text-lg font-medium tracking-tight">Корм на голову</p>
            <p className="mt-1 text-sm text-muted">Грамами на голову за добу. Не залежить від розміру посадки.</p>
            <div className="mt-3">
              <FeedPerBirdChart data={factory.series} />
            </div>
          </div>
        </div>
      ) : null}

      {factory.forecast ? (
        <p className="text-xs text-subtle">
          Прогноз до забою: {factory.forecast.remainingDays} діб · {fmtInt(factory.forecast.projectedWeightG)} г ·
          EPEF {fmtInt(factory.forecast.projectedEpef)}
        </p>
      ) : null}
    </section>
  );
}

export function FactoryJumpNav({ factories }: { factories: FactoryOverview[] }) {
  if (factories.length < 2) return null;
  return (
    <nav aria-label="Фабрики" className="flex flex-wrap gap-2">
      {factories.map((f) => (
        <a
          key={f.site.id}
          href={`#factory-${f.site.id}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
        >
          <span className="font-medium text-fg">{shortFactory(f.site.name)}</span>
          {f.activeHouses ? (
            <span className="tabular-nums text-muted">{fmtInt(f.head)}</span>
          ) : (
            <span className="text-subtle">немає посадки</span>
          )}
          {f.missingToday ? <span className="text-bad">{f.missingToday}</span> : null}
        </a>
      ))}
    </nav>
  );
}

function HouseChip({ item }: { item: HouseOverview }) {
  return (
    <Link
      to="/houses/$houseId"
      params={{ houseId: String(item.house.id) }}
      className="block rounded-[16px] bg-bg px-3 py-3 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-fg">{item.house.name}</p>
        <StatusBadge status={item.status} />
      </div>
      {item.flock ? (
        <>
          <p className="mt-2 font-display text-xl tabular-nums tracking-tight">
            {fmtInt(item.head)}
            <span className="ml-1 font-sans text-xs font-normal text-muted">гол.</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {item.ageDays} доба · {item.flock.breed} · пос. {fmtDateShort(item.flock.placedAt)}
          </p>
          {item.lastReportDate ? (
            <p className="mt-1 text-xs tabular-nums text-muted">
              {fmtInt(item.avgWeightG)} г{chipDelta(item.weightDeltaPct)}
              {" · "}
              корм{chipDelta(item.feedDeltaPct)}
              {item.waterDeltaPct != null ? ` · вода${chipDelta(item.waterDeltaPct)}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              {item.missingToday ? "Немає звіту за вчора" : "Звіт за сьогодні не потрібен"}
            </p>
          )}
          {item.density && item.density.areaM2 > 0 ? (
            <p className={cn("mt-1 text-xs tabular-nums", item.density.warn ? "text-warn" : "text-muted")}>
              {fmtNum(item.density.kgM2, 1)} кг/м²
              {item.density.reached
                ? ` · ліміт ${item.density.limitKgM2} кг/м² уже`
                : item.density.daysToLimit != null
                  ? ` · ${item.density.limitKgM2} кг/м² на ${item.density.reachAgeDays} добу`
                  : ""}
            </p>
          ) : null}
          {item.soldHead > 0 ? (
            <p className="mt-1 text-xs tabular-nums text-muted">
              продано {fmtInt(item.soldHead)} гол. · сер. {fmtInt(item.saleAvgG)} г · FCR {fmtNum(item.saleFcr, 3)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-2 text-xs text-muted">Немає активної посадки</p>
      )}
    </Link>
  );
}

function HouseCard({ item }: { item: HouseOverview }) {
  const o = item;
  return (
    <Link
      to="/houses/$houseId"
      params={{ houseId: String(item.house.id) }}
      className="block rounded-[16px] bg-bg p-4 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-xl font-medium tracking-tight">{item.house.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            Місткість {fmtInt(item.house.capacity)}
            {item.house.areaM2 > 0 ? ` · ${fmtInt(item.house.areaM2)} м²` : ""}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      {o.flock ? (
        <>
          <p className="mt-4 font-display text-3xl tabular-nums tracking-tight">
            {fmtInt(o.head)}
            <span className="ml-1.5 font-sans text-sm font-normal text-muted">гол.</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {o.ageDays} доба · {o.flock.breed} · посадка {fmtDateShort(o.flock.placedAt)} · {o.flock.code}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Mini k="Маса" v={`${fmtInt(o.avgWeightG)} г`} s={chipDelta(o.weightDeltaPct).trim()} />
            <Mini k="Корм" v={`${fmtInt(o.feedGPerBird)} г`} s={chipDelta(o.feedDeltaPct).trim()} />
            <Mini
              k="кг/м²"
              v={o.density && o.density.areaM2 > 0 ? fmtNum(o.density.kgM2, 1) : "—"}
              s={
                o.density?.reached
                  ? `ліміт ${o.density.limitKgM2} уже`
                  : o.density?.daysToLimit != null
                    ? `${o.density.limitKgM2} на ${o.density.reachAgeDays} д.`
                    : chipDelta(o.waterDeltaPct).trim()
              }
            />
          </div>
          {o.soldHead > 0 ? (
            <p className="mt-3 text-xs tabular-nums text-muted">
              Продано {fmtInt(o.soldHead)} гол. · {fmtNum(o.soldWeightKg, 0)} кг · сер. {fmtInt(o.saleAvgG)} г · FCR{" "}
              {fmtNum(o.saleFcr, 3)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">Немає активної посадки. Відкрийте її в параметрах.</p>
      )}
    </Link>
  );
}

function Mini({ k, v, s }: { k: string; v: string; s?: string }) {
  return (
    <div className="rounded-[12px] bg-surface px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-subtle hyphens-none">{k}</p>
      <p className="mt-0.5 tabular-nums text-fg">{v}</p>
      {s ? <p className="text-[10px] text-muted">{s}</p> : null}
    </div>
  );
}

function chipDelta(pct: number | null): string {
  if (pct == null) return "";
  return ` ${pct > 0 ? "+" : ""}${fmtNum(pct, 1)}%`;
}

function Kpi({
  label,
  value,
  hint,
  tone,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "bad";
  className?: string;
}) {
  return (
    <div className={cn("rounded-[16px] bg-bg px-3 py-3", className)}>
      <p className="text-[11px] uppercase tracking-wider text-subtle hyphens-none">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl tabular-nums tracking-tight md:text-3xl",
          tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : "text-fg",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function DeviationRow({ item }: { item: Deviation }) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", toneClass(item.severity))} strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-sm text-fg">
          <span className={cn("mr-2 text-[11px] uppercase tracking-wide", toneClass(item.severity))}>
            {item.severity === "critical" ? "Критично" : item.severity === "warn" ? "Увага" : "Нагляд"}
          </span>
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
      </div>
    </li>
  );
}

function toneClass(s: Severity): string {
  if (s === "critical") return "text-bad";
  if (s === "warn") return "text-warn";
  if (s === "watch") return "text-watch";
  return "text-ok";
}

function shortFactory(name: string): string {
  return name.replace(/^Фабрика\s+/, "").replace(/[«»]/g, "");
}

export function EmptyStartCard({ canPlace, noFactories }: { canPlace: boolean; noFactories?: boolean }) {
  return (
    <Card>
      <CardTitle>{noFactories ? "Немає фабрик" : "Чистий старт"}</CardTitle>
      <p className="mt-2 text-sm text-muted">
        {noFactories
          ? "Додайте першу фабрику — назву, кількість пташників і місткість. Потім відкрийте посадку."
          : "Відкрийте посадку в кожному пташнику, вкажіть крос — норми корму і води підтягнуться самі. Потім керівники подають щоденний звіт."}
      </p>
      {canPlace ? (
        <Link
          to="/settings"
          className="mt-4 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
        >
          {noFactories ? "Додати фабрику" : "Відкрити посадки"}
        </Link>
      ) : (
        <p className="mt-3 text-sm text-muted">Зачекайте, поки керівник фабрики або технолог відкриє посадку.</p>
      )}
    </Card>
  );
}
