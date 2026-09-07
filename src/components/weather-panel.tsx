import { Cloud, CloudFog, CloudLightning, CloudRain, Cloudy, Droplets, Snowflake, Sun, Wind } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { buildClimateAdvice, type PlaceHit, type SiteWeather, type WeatherKind } from "@/lib/broiler/climate";
import { searchPlaces, saveSiteGeo } from "@/lib/server/fns";
import { cn, fmtDateShort, fmtNum } from "@/lib/utils";

const KIND_ICON: Record<WeatherKind, typeof Sun> = {
  clear: Sun,
  partly: Cloud,
  cloudy: Cloudy,
  rain: CloudRain,
  snow: Snowflake,
  thunder: CloudLightning,
  fog: CloudFog,
};

export function GeoPicker({
  siteId,
  current,
  onSaved,
}: {
  siteId: number;
  current?: string | null;
  onSaved: () => void | Promise<void>;
}) {
  const [q, setQ] = useState(current ?? "");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const query = q.trim();
      if (query.length < 2) {
        setHits([]);
        return;
      }
      void searchPlaces({ data: { query } })
        .then(setHits)
        .catch(() => setHits([]));
    }, 280);
    return () => window.clearTimeout(t);
  }, [q]);

  async function pick(hit: PlaceHit) {
    setBusy(true);
    setErr(null);
    try {
      await saveSiteGeo({
        data: {
          siteId,
          geoName: hit.name,
          geoAdmin: hit.admin,
          lat: hit.lat,
          lon: hit.lon,
        },
      });
      setQ(hit.label);
      setOpen(false);
      await onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не збережено");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <Input
        value={q}
        placeholder="Місто або село фабрики"
        aria-label="Населений пункт"
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && hits.length ? (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[12px] bg-surface p-1 shadow-[var(--shadow-border-hover)]">
          {hits.map((h) => (
            <li key={`${h.lat},${h.lon}`}>
              <button
                type="button"
                disabled={busy}
                className="flex h-11 w-full items-center rounded-[10px] px-3 text-left text-sm text-fg hover:bg-bg"
                onClick={() => void pick(h)}
              >
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {err ? <p className="mt-1 text-xs text-bad">{err}</p> : null}
    </div>
  );
}

export function WeatherPanel({
  siteId,
  geoName,
  canSetGeo,
  weather,
  weatherError,
  reportDate,
  ageDays,
  houseTempMin,
  houseTempMax,
  indoorMin,
  indoorMax,
  indoorHumidity,
  humidityMin,
  humidityMax,
  onGeoSaved,
}: {
  siteId: number | null;
  geoName: string | null;
  canSetGeo: boolean;
  weather: SiteWeather | null;
  weatherError: string | null;
  reportDate?: string;
  ageDays: number;
  houseTempMin: number | null;
  houseTempMax: number | null;
  indoorMin: number | null;
  indoorMax: number | null;
  indoorHumidity: number | null;
  humidityMin?: number | null;
  humidityMax?: number | null;
  onGeoSaved: () => void | Promise<void>;
}) {
  const climate = useMemo(() => {
    if (!weather?.selected || houseTempMin == null || houseTempMax == null) return null;
    return buildClimateAdvice({
      ageDays,
      houseTempMin,
      houseTempMax,
      indoorMin,
      indoorMax,
      indoorHumidity,
      outdoor: weather.selected,
      upcoming: weather.days,
      humidityMin: humidityMin ?? undefined,
      humidityMax: humidityMax ?? undefined,
    });
  }, [weather, ageDays, houseTempMin, houseTempMax, indoorMin, indoorMax, indoorHumidity, humidityMin, humidityMax]);

  if (!geoName && !weather) {
    return (
      <Card>
        <CardTitle>Погода і мікроклімат</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Вкажіть населений пункт фабрики — підтягнеться прогноз, і з нього будуть рекомендації
          для залу за віком птиці.
        </p>
        {canSetGeo && siteId ? (
          <div className="mt-3">
            <GeoPicker siteId={siteId} onSaved={onGeoSaved} />
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">Населений пункт задає керівник фабрики або технолог у «Посадках».</p>
        )}
      </Card>
    );
  }

  const day = weather?.selected;
  const Icon = day ? KIND_ICON[day.kind] : Cloud;
  const upcoming = weather?.days.filter((d) => d.date !== day?.date).slice(0, 3) ?? [];

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Погода надворі</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {weather?.place ?? geoName}
            {day ? ` · ${fmtDateShort(day.date)}` : ""}
            {reportDate && day && day.date !== reportDate ? " · найближчий прогноз" : ""}
          </p>
        </div>
        {climate ? <StatusBadge status={climate.severity} /> : null}
      </div>

      {weatherError && !day ? <p className="text-sm text-bad">{weatherError}</p> : null}

      {day ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              icon={Icon}
              k={day.label}
              v={`${fmtNum(day.tempMax, 0)}° / ${fmtNum(day.tempMin, 0)}°`}
            />
            <Metric icon={Wind} k="Вітер" v={`${fmtNum(day.windMaxMs, 1)} м/с`} />
            <Metric
              icon={Droplets}
              k="Вологість"
              v={day.humidityMean != null ? `${fmtNum(day.humidityMean, 0)}%` : "—"}
            />
            <Metric
              icon={CloudRain}
              k="Опади"
              v={day.precipMm > 0 ? `${fmtNum(day.precipMm, 1)} мм` : "без опадів"}
            />
          </div>
          {upcoming.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {upcoming.map((d) => {
                const DIcon = KIND_ICON[d.kind];
                return (
                  <div
                    key={d.date}
                    className="min-w-[7.5rem] rounded-[16px] bg-bg px-3 py-2"
                  >
                    <p className="text-xs text-subtle">{fmtDateShort(d.date)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm tabular-nums text-fg">
                      <DIcon className="size-3.5 text-muted" strokeWidth={1.75} />
                      {fmtNum(d.tempMax, 0)}°/{fmtNum(d.tempMin, 0)}°
                    </p>
                    <p className="text-xs text-muted">{d.label}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}

      {climate ? (
        <div className="rounded-[16px] bg-bg p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            Мікроклімат · {climate.ageBand}
          </p>
          <p className="mt-2 font-display text-lg font-medium leading-snug tracking-tight text-fg">
            {climate.headline}
          </p>
          <p className="mt-2 text-sm text-muted">
            Норма в залі {fmtNum(climate.houseTempMin, 0)}–{fmtNum(climate.houseTempMax, 0)} °C · RH{" "}
            {climate.humidityMin}–{climate.humidityMax}%
            {day
              ? ` · надворі ${fmtNum(day.tempMin, 0)}–${fmtNum(day.tempMax, 0)} °C`
              : ""}
          </p>
          <ul className="mt-3 space-y-3">
            {climate.items.map((it) => (
              <li key={it.title} className="text-sm">
                <p className={cn("font-medium", tone(it.severity))}>{it.title}</p>
                <p className="mt-0.5 leading-relaxed text-muted">{it.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">Відкрийте посадку — рекомендації підуть від доби життя птиці.</p>
      )}

      {canSetGeo && siteId ? (
        <div>
          <p className="mb-1 text-xs text-subtle">Змінити населений пункт</p>
          <GeoPicker siteId={siteId} current={geoName} onSaved={onGeoSaved} />
        </div>
      ) : null}
    </Card>
  );
}

function Metric({
  icon: Icon,
  k,
  v,
}: {
  icon: typeof Sun;
  k: string;
  v: string;
}) {
  return (
    <div className="rounded-[16px] bg-bg px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-subtle">
        <Icon className="size-3.5" strokeWidth={1.75} />
        {k}
      </p>
      <p className="mt-1 text-sm tabular-nums text-fg">{v}</p>
    </div>
  );
}

function tone(s: "ok" | "watch" | "warn" | "critical"): string {
  if (s === "critical") return "text-bad";
  if (s === "warn") return "text-warn";
  if (s === "watch") return "text-watch";
  return "text-fg";
}

export function FactoryWeatherLine({
  place,
  weather,
  climate,
}: {
  place: string | null;
  weather: SiteWeather["selected"] | null;
  climate: { headline: string; severity: "ok" | "watch" | "warn" | "critical" } | null;
}) {
  if (!weather && !place) return null;
  const Icon = weather ? KIND_ICON[weather.kind] : Cloud;
  return (
    <div className="mt-2 space-y-1">
      {weather ? (
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
          Надворі{place ? ` ${place}` : ""}: {fmtNum(weather.tempMax, 0)}° / {fmtNum(weather.tempMin, 0)}° ·{" "}
          {weather.label}
        </p>
      ) : place ? (
        <p className="text-sm text-muted">{place}</p>
      ) : null}
      {climate && climate.severity !== "ok" ? (
        <p className={cn("text-sm", tone(climate.severity))}>{climate.headline}</p>
      ) : null}
    </div>
  );
}
