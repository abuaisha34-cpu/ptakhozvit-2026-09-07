import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function num(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function round(value: number, digits = 1): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Calendar date in Europe/Kyiv as YYYY-MM-DD. */
export function todayISO(timeZone = "Europe/Kyiv"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Previous calendar day in Europe/Kyiv — the day a daily report is due. */
export function yesterdayISO(timeZone = "Europe/Kyiv"): string {
  return addDaysISO(todayISO(timeZone), -1);
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function eachDateISO(from: string, to: string): string[] {
  if (!from || !to || from > to) return [];
  const out: string[] = [];
  let d = from;
  while (d <= to) {
    out.push(d);
    d = addDaysISO(d, 1);
    if (out.length > 80) break;
  }
  return out;
}

export function diffDays(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

const uaInt = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
const uaMoney = new Intl.NumberFormat("uk-UA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtInt(n: number): string {
  return uaInt.format(Math.round(n));
}

export function fmtNum(n: number, digits = 1): string {
  if (digits === 0) return uaInt.format(Math.round(n));
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: digits > 1 ? digits : 0,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtUah(n: number): string {
  return `${uaMoney.format(n)} ₴`;
}

export function fmtPct(n: number, digits = 2): string {
  return `${n.toLocaleString("uk-UA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function fmtDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function shortSite(name: string): string {
  return name.replace("Фабрика ", "").replace(/[«»]/g, "");
}

export function pctDelta(actual: number, standard: number): number | null {
  if (!standard) return null;
  return ((actual - standard) / standard) * 100;
}
