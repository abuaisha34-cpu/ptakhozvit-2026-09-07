import type { PlaceHit, SiteWeather, WeatherDay, WeatherKind } from "@/lib/broiler/climate";
import { weatherKindLabel } from "@/lib/broiler/climate";
import { todayISO } from "@/lib/utils";

const UA = "PtahoZvit/1.0 (poultry production; weather for house climate)";
const CACHE_MS = 20 * 60 * 1000;

type CacheSlot = { at: number; weather: SiteWeather };

const g = globalThis as typeof globalThis & { __wxCache__?: Map<string, CacheSlot> };
g.__wxCache__ ??= new Map();

async function readJson(url: string, ms = 8000): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(`weather ${res.status}`);
  return res.json();
}

function kyivYmd(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function kyivHour(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Kyiv",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

const KIND_RANK: Record<WeatherKind, number> = {
  clear: 0,
  partly: 1,
  cloudy: 2,
  fog: 3,
  rain: 4,
  snow: 5,
  thunder: 6,
};

function metSymbolKind(code: string): WeatherKind {
  const c = code.replace(/_day|_night|_polartwilight/g, "");
  if (c.includes("thunder")) return "thunder";
  if (c.includes("snow") || c.includes("sleet")) return "snow";
  if (c.includes("rain") || c.includes("drizzle")) return "rain";
  if (c.includes("fog") || c.includes("mist")) return "fog";
  if (c === "cloudy") return "cloudy";
  if (c.includes("partlycloudy") || c === "fair") return "partly";
  return "clear";
}

function pickKind(kinds: WeatherKind[]): WeatherKind {
  return kinds.reduce((a, b) => (KIND_RANK[b] > KIND_RANK[a] ? b : a), "clear" as WeatherKind);
}

function mean(xs: number[]): number | null {
  if (!xs.length) return null;
  return xs.reduce((s, n) => s + n, 0) / xs.length;
}

type MetPoint = {
  time: string;
  data: {
    instant?: { details?: { air_temperature?: number; relative_humidity?: number; wind_speed?: number } };
    next_1_hours?: { summary?: { symbol_code?: string }; details?: { precipitation_amount?: number } };
    next_6_hours?: { summary?: { symbol_code?: string }; details?: { precipitation_amount?: number } };
  };
};

function daysFromMetNo(points: MetPoint[]): WeatherDay[] {
  const buckets = new Map<
    string,
    { temps: number[]; rh: number[]; wind: number[]; precip: number[]; kinds: WeatherKind[] }
  >();
  for (const p of points) {
    const date = kyivYmd(p.time);
    const b = buckets.get(date) ?? { temps: [], rh: [], wind: [], precip: [], kinds: [] };
    const d = p.data.instant?.details;
    if (typeof d?.air_temperature === "number") b.temps.push(d.air_temperature);
    if (typeof d?.relative_humidity === "number") b.rh.push(d.relative_humidity);
    if (typeof d?.wind_speed === "number") b.wind.push(d.wind_speed);
    const rain =
      p.data.next_1_hours?.details?.precipitation_amount ??
      (p.data.next_6_hours?.details?.precipitation_amount != null
        ? p.data.next_6_hours.details.precipitation_amount / 6
        : 0);
    if (typeof rain === "number") b.precip.push(rain);
    const hour = kyivHour(p.time);
    const sym = p.data.next_1_hours?.summary?.symbol_code ?? p.data.next_6_hours?.summary?.symbol_code;
    if (sym && hour >= 6 && hour <= 18) b.kinds.push(metSymbolKind(sym));
    else if (sym) b.kinds.push(metSymbolKind(sym));
    buckets.set(date, b);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([, b]) => b.temps.length)
    .map(([date, b]) => {
      const kind = pickKind(b.kinds.length ? b.kinds : ["partly"]);
      return {
        date,
        tempMin: Math.round(Math.min(...b.temps) * 10) / 10,
        tempMax: Math.round(Math.max(...b.temps) * 10) / 10,
        humidityMean: mean(b.rh) != null ? Math.round(mean(b.rh) as number) : null,
        precipMm: Math.round(b.precip.reduce((s, n) => s + n, 0) * 10) / 10,
        precipProb: null,
        windMaxMs: Math.round(Math.max(0, ...b.wind) * 10) / 10,
        kind,
        label: weatherKindLabel(kind),
      };
    });
}

async function fromMetNo(lat: number, lon: number): Promise<WeatherDay[]> {
  const json = (await readJson(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
  )) as { properties?: { timeseries?: MetPoint[] } };
  const ts = json.properties?.timeseries ?? [];
  if (!ts.length) throw new Error("порожній прогноз");
  return daysFromMetNo(ts);
}

function wttrKind(desc: string): WeatherKind {
  const d = desc.toLowerCase();
  if (d.includes("thunder") || d.includes("гроз")) return "thunder";
  if (d.includes("snow") || d.includes("сніг") || d.includes("sleet")) return "snow";
  if (d.includes("rain") || d.includes("drizzle") || d.includes("shower") || d.includes("дощ")) return "rain";
  if (d.includes("fog") || d.includes("mist") || d.includes("туман")) return "fog";
  if (d.includes("overcast") || d.includes("cloud") || d.includes("хмар")) {
    return d.includes("partly") || d.includes("мінлив") ? "partly" : "cloudy";
  }
  return "clear";
}

async function fromWttr(lat: number, lon: number): Promise<WeatherDay[]> {
  const json = (await readJson(`https://wttr.in/${lat},${lon}?format=j1&m&lang=uk`)) as {
    weather?: Array<{
      date: string;
      maxtempC: string;
      mintempC: string;
      hourly?: Array<{ humidity: string; windspeedKmph: string; precipMM: string; weatherDesc?: { value: string }[] }>;
    }>;
  };
  const rows = json.weather ?? [];
  if (!rows.length) throw new Error("порожній прогноз");
  return rows.map((d) => {
    const hours = d.hourly ?? [];
    const rh = mean(hours.map((h) => Number(h.humidity)).filter(Number.isFinite));
    const windKmh = Math.max(0, ...hours.map((h) => Number(h.windspeedKmph)).filter(Number.isFinite));
    const precip = hours.reduce((s, h) => s + (Number(h.precipMM) || 0), 0);
    const mid = hours[Math.min(4, hours.length - 1)];
    const kind = wttrKind(mid?.weatherDesc?.[0]?.value ?? "");
    return {
      date: d.date,
      tempMin: Number(d.mintempC),
      tempMax: Number(d.maxtempC),
      humidityMean: rh != null ? Math.round(rh) : null,
      precipMm: Math.round(precip * 10) / 10,
      precipProb: null,
      windMaxMs: Math.round((windKmh / 3.6) * 10) / 10,
      kind,
      label: weatherKindLabel(kind),
    };
  });
}

async function fromOpenMeteo(lat: number, lon: number, date: string): Promise<WeatherDay[]> {
  const start = date;
  const endParts = date.split("-").map(Number);
  const endDt = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2] + 2));
  const end = endDt.toISOString().slice(0, 10);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code` +
    `&hourly=relative_humidity_2m&timezone=Europe%2FKyiv&start_date=${start}&end_date=${end}`;
  const json = (await readJson(url)) as {
    error?: boolean;
    daily?: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      precipitation_probability_max?: number[];
      wind_speed_10m_max: number[];
      weather_code: number[];
    };
    hourly?: { time: string[]; relative_humidity_2m: number[] };
  };
  if (json.error || !json.daily?.time?.length) throw new Error("open-meteo");
  const rhByDate = new Map<string, number[]>();
  json.hourly?.time.forEach((t, i) => {
    const d = t.slice(0, 10);
    const arr = rhByDate.get(d) ?? [];
    arr.push(json.hourly!.relative_humidity_2m[i]);
    rhByDate.set(d, arr);
  });
  return json.daily.time.map((d, i) => {
    const code = json.daily!.weather_code[i] ?? 1;
    const kind = wmoKind(code);
    const rh = mean(rhByDate.get(d) ?? []);
    return {
      date: d,
      tempMin: json.daily!.temperature_2m_min[i],
      tempMax: json.daily!.temperature_2m_max[i],
      humidityMean: rh != null ? Math.round(rh) : null,
      precipMm: json.daily!.precipitation_sum[i] ?? 0,
      precipProb: json.daily!.precipitation_probability_max?.[i] ?? null,
      windMaxMs: json.daily!.wind_speed_10m_max[i] ?? 0,
      kind,
      label: weatherKindLabel(kind),
    };
  });
}

function wmoKind(code: number): WeatherKind {
  if (code === 0) return "clear";
  if (code <= 3) return "partly";
  if (code <= 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "thunder";
  if (code >= 51) return "rain";
  return "cloudy";
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return [];
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
    `&count=6&language=uk&country=ua`;
  try {
    const json = (await readJson(url, 6000)) as {
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        admin1?: string;
        country?: string;
        country_code?: string;
      }>;
    };
    const rows = json.results ?? [];
    return rows.map((r) => ({
      name: r.name,
      admin: r.admin1 ?? null,
      country: r.country ?? null,
      lat: r.latitude,
      lon: r.longitude,
      label: [r.name, r.admin1].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}

export async function loadWeather(input: {
  lat: number;
  lon: number;
  place: string;
  date: string;
}): Promise<SiteWeather | null> {
  const key = `${input.lat.toFixed(3)},${input.lon.toFixed(3)}`;
  const hit = g.__wxCache__!.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return sliceWeather(hit.weather, input.date);
  }
  const days = await fetchDays(input.lat, input.lon, input.date);
  if (!days.length) return null;
  const weather: SiteWeather = {
    place: input.place,
    lat: input.lat,
    lon: input.lon,
    source: "metno",
    days,
    selected: days[0],
  };
  g.__wxCache__!.set(key, { at: Date.now(), weather });
  return sliceWeather(weather, input.date);
}

async function fetchDays(lat: number, lon: number, date: string): Promise<WeatherDay[]> {
  const errors: string[] = [];
  try {
    return await fromMetNo(lat, lon);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "metno");
  }
  try {
    return await fromWttr(lat, lon);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "wttr");
  }
  try {
    return await fromOpenMeteo(lat, lon, date);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "om");
  }
  throw new Error(`Немає прогнозу (${errors.join("; ")})`);
}

function sliceWeather(weather: SiteWeather, date: string): SiteWeather {
  const selected =
    weather.days.find((d) => d.date === date) ??
    weather.days.find((d) => d.date >= todayISO()) ??
    weather.days[0];
  return { ...weather, selected };
}
