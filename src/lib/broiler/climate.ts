import type { Severity } from "./calc";
import { DEFAULT_NORMS, humidityFromNorms, type OrgNorms } from "./handbook.ts";

export type WeatherKind = "clear" | "partly" | "cloudy" | "rain" | "snow" | "thunder" | "fog";

export type WeatherDay = {
  date: string;
  tempMin: number;
  tempMax: number;
  humidityMean: number | null;
  precipMm: number;
  precipProb: number | null;
  windMaxMs: number;
  kind: WeatherKind;
  label: string;
};

export type SiteWeather = {
  place: string;
  lat: number;
  lon: number;
  source: "metno" | "wttr" | "open-meteo";
  days: WeatherDay[];
  selected: WeatherDay;
};

export type PlaceHit = {
  name: string;
  admin: string | null;
  country: string | null;
  lat: number;
  lon: number;
  label: string;
};

export type ClimateItem = {
  severity: Severity;
  title: string;
  detail: string;
};

export type ClimateAdvice = {
  severity: Severity;
  headline: string;
  ageBand: string;
  houseTempMin: number;
  houseTempMax: number;
  humidityMin: number;
  humidityMax: number;
  heatGapNight: number;
  heatGapDay: number;
  items: ClimateItem[];
};

const KIND_LABEL: Record<WeatherKind, string> = {
  clear: "Ясно",
  partly: "Мінлива хмарність",
  cloudy: "Хмарно",
  rain: "Дощ",
  snow: "Сніг",
  thunder: "Гроза",
  fog: "Туман",
};

export function weatherKindLabel(kind: WeatherKind): string {
  return KIND_LABEL[kind];
}

export function humidityTarget(ageDays: number, norms: OrgNorms = DEFAULT_NORMS): { min: number; max: number } {
  return humidityFromNorms(ageDays, norms);
}

export function ageBandLabel(ageDays: number): string {
  if (ageDays <= 3) return "0–3 доба · брудинг";
  if (ageDays <= 7) return "перший тиждень";
  if (ageDays <= 14) return "2-й тиждень · перехід";
  if (ageDays <= 21) return "3-й тиждень · ріст";
  if (ageDays <= 28) return "4-й тиждень";
  return "фініш";
}

const RANK: Record<Severity, number> = { ok: 0, watch: 1, warn: 2, critical: 3 };

function worst(items: ClimateItem[]): Severity {
  return items.reduce<Severity>((acc, it) => (RANK[it.severity] > RANK[acc] ? it.severity : acc), "ok");
}

function push(items: ClimateItem[], item: ClimateItem | null): void {
  if (item) items.push(item);
}

export function buildClimateAdvice(input: {
  ageDays: number;
  houseTempMin: number;
  houseTempMax: number;
  indoorMin?: number | null;
  indoorMax?: number | null;
  indoorHumidity?: number | null;
  outdoor: WeatherDay;
  upcoming?: WeatherDay[];
  humidityMin?: number;
  humidityMax?: number;
  norms?: OrgNorms;
}): ClimateAdvice {
  const age = Math.max(0, Math.round(input.ageDays));
  const tMin = input.houseTempMin;
  const tMax = input.houseTempMax;
  const rh =
    input.humidityMin != null && input.humidityMax != null
      ? { min: input.humidityMin, max: input.humidityMax }
      : humidityTarget(age, input.norms);
  const out = input.outdoor;
  const nightGap = tMin - out.tempMin;
  const dayGap = tMax - out.tempMax;
  const swing = out.tempMax - out.tempMin;
  const chicks = age <= 7;
  const young = age <= 14;
  const finish = age >= 28;
  const items: ClimateItem[] = [];

  if (chicks && out.tempMin < 12) {
    push(items, {
      severity: out.tempMin < 6 ? "critical" : "warn",
      title: "Холодна ніч — курчата без терморегуляції",
      detail: `Надворі вночі ${fmt(out.tempMin)} °C, у залі треба ${fmt(tMin)}–${fmt(tMax)} °C. Прогрійте пташник заздалегідь, брудер на рівні курчати, підстилка 5–7 см. Протяг на підлозі недопустимий.`,
    });
  } else if (nightGap >= 12) {
    push(items, {
      severity: chicks ? "warn" : "watch",
      title: "Ніч значно холодніша за норму залу",
      detail: `Дефіцит тепла вночі ≈ ${fmt(nightGap)} °C. Тримайте опалення; мінімальну вентиляцію короткими циклами за CO₂ і вологою підстилки, не «на постійну».`,
    });
  } else if (nightGap >= 6) {
    push(items, {
      severity: "watch",
      title: "Ніч прохолодніша за зал",
      detail: `Зовні ${fmt(out.tempMin)} °C при нормі ${fmt(tMin)}–${fmt(tMax)} °C. Підігрів уночі, вдень можна трохи додати повітрообмін.`,
    });
  }

  if (out.tempMax + 1.5 >= tMin && chicks) {
    push(items, {
      severity: "watch",
      title: "День тепліший, ніж здається для брудингу",
      detail: `Максимум надворі ${fmt(out.tempMax)} °C. Удень перевірте, щоб під брудером не було перегріву: курчата мають рівномірно лежати кільцем, не тікати від лампи.`,
    });
  }

  if (!chicks && out.tempMax > tMax + 2) {
    const heat = out.tempMax >= 32 || (finish && out.tempMax >= 28);
    push(items, {
      severity: heat ? (out.tempMax >= 34 ? "critical" : "warn") : "watch",
      title: heat ? "Ризик теплового стресу" : "День тепліший за норму залу",
      detail: heat
        ? `Надворі до ${fmt(out.tempMax)} °C при нормі ${fmt(tMin)}–${fmt(tMax)} °C на ${age} добу. Тунельна вентиляція, швидкість повітря на рівні птаха, додаткові ніпелі. Не годуйте в пік спеки.`
        : `Максимум ${fmt(out.tempMax)} °C vs норма залу до ${fmt(tMax)} °C. Збільшіть повітрообмін удень, стежте за розльотом птаха від стін і поїлок.`,
    });
  }

  if (finish && out.tempMin > tMax) {
    push(items, {
      severity: "warn",
      title: "Ніч не охолоджує залу",
      detail: `Мінімум надворі ${fmt(out.tempMin)} °C вище за норму ${fmt(tMax)} °C. Птах не відновиться за ніч — вентиляція цілодобово, за можливості туманоутворення, якщо вологість дозволяє.`,
    });
  }

  if (swing >= 12) {
    push(items, {
      severity: young ? "watch" : "ok",
      title: "Великий перепад дня і ночі",
      detail: `Амплітуда ${fmt(swing)} °C (${fmt(out.tempMin)}…${fmt(out.tempMax)}). Дві програми: вдень повітря, вночі тепло і мінімальна вентиляція. Не залишайте штору «на день» на ніч.`,
    });
  }

  if (out.windMaxMs >= 8) {
    push(items, {
      severity: chicks ? "warn" : "watch",
      title: "Сильний вітер",
      detail:
        out.windMaxMs >= 12
          ? `Пориви до ${fmt(out.windMaxMs)} м/с. Перевірте штори, припливи й підпір. На брудингу не ловіть «щілину» на рівні підлоги.`
          : `Вітер до ${fmt(out.windMaxMs)} м/с. Холодний вітер виносить тепло через огородження — додайте потужність опалення, якщо ніч холодніша за ${fmt(tMin)} °C.`,
    });
  }

  if (out.precipMm >= 1 || out.kind === "rain" || out.kind === "snow" || out.kind === "thunder") {
    push(items, {
      severity: out.kind === "thunder" ? "watch" : young ? "watch" : "ok",
      title: out.kind === "thunder" ? "Гроза" : out.kind === "snow" ? "Сніг / мокрий холод" : "Волога погода",
      detail:
        out.kind === "thunder"
          ? "Резерв живлення вентиляторів і брудера. Після зливи не відкривайте приплив на повну — вологе повітря без підігріву сяде на підстилку."
          : young
            ? `Опади ${fmt(out.precipMm, 1)} мм. Вологе повітря + курчата = мокра підстилка і падіж від переохолодження. Підігрівайте приплив, перевірте ніпелі, підстилку тримайте сухою.`
            : `Опади ${fmt(out.precipMm, 1)} мм. Слідкуйте за вологістю підстилки і аміаком; не переливайте воду.`,
    });
  }

  if (out.humidityMean != null && out.humidityMean >= 80 && out.tempMax >= 26 && !chicks) {
    push(items, {
      severity: "warn",
      title: "Спека при високій вологості",
      detail: `RH надворі ≈ ${fmt(out.humidityMean)}%. Випарне охолодження майже не працює. Максимальна швидкість повітря, відкриті торці, додаткова вода. Стежте за відкритим дзьобом і скупченням біля стін.`,
    });
  }

  if (young && out.humidityMean != null && out.humidityMean < 40) {
    push(items, {
      severity: "watch",
      title: "Сухе повітря для молодняка",
      detail: `RH надворі ≈ ${fmt(out.humidityMean)}%, у залі треба ${rh.min}–${rh.max}%. Сухе повітря сушить слизові і жовтковий мішок. Зволожте (туман, вода на бетон поза брудером), не охолоджуючи курча.`,
    });
  }

  const indoorMin = numOrNull(input.indoorMin);
  const indoorMax = numOrNull(input.indoorMax);
  if (indoorMin != null && indoorMin < tMin - 1.5) {
    push(items, {
      severity: chicks ? "critical" : "warn",
      title: "У залі холодніше за норму кросу",
      detail: `Записано ${fmt(indoorMin)} °C, норма від ${fmt(tMin)} °C. Підніміть брудер/опалення, знайдіть холодні зони вздовж стін.`,
    });
  }
  if (indoorMax != null && indoorMax > tMax + 1.5) {
    push(items, {
      severity: finish ? "warn" : "watch",
      title: "У залі тепліше за норму кросу",
      detail: `Записано до ${fmt(indoorMax)} °C, норма до ${fmt(tMax)} °C. Збільшіть повітрообмін, перевірте датчики на рівні птаха.`,
    });
  }
  const indoorRh = numOrNull(input.indoorHumidity);
  if (indoorRh != null && (indoorRh < rh.min || indoorRh > rh.max)) {
    const far = indoorRh < rh.min - 5 || indoorRh > rh.max + 5;
    push(items, {
      severity: far && young ? "warn" : "watch",
      title: indoorRh > rh.max ? "Вологість у залі висока" : "Вологість у залі низька",
      detail:
        indoorRh > rh.max
          ? `${fmt(indoorRh)}% при нормі ${rh.min}–${rh.max}%. Ризик мокрої підстилки й аміаку — підігрів + короткі цикли вентиляції, ніпелі без протікання.`
          : `${fmt(indoorRh)}% при нормі ${rh.min}–${rh.max}%. Зволожте повітря (туман, вода на бетон поза брудером), не охолоджуючи курча.`,
    });
  }

  const upcoming = (input.upcoming ?? []).filter((d) => d.date > out.date).slice(0, 2);
  const hotter = upcoming.find((d) => d.tempMax >= out.tempMax + 4);
  const colder = upcoming.find((d) => d.tempMin <= out.tempMin - 4);
  if (hotter) {
    push(items, {
      severity: finish || hotter.tempMax >= 30 ? "watch" : "ok",
      title: "Завтра тепліше",
      detail: `${fmtDate(hotter.date)}: ${fmt(hotter.tempMin)}–${fmt(hotter.tempMax)} °C. З вечора підготуйте вентиляцію (тунель, аварійні люки), перевірте поїлки.`,
    });
  }
  if (colder && !hotter) {
    push(items, {
      severity: chicks ? "watch" : "ok",
      title: "Похолодання в прогнозі",
      detail: `${fmtDate(colder.date)}: ніч ${fmt(colder.tempMin)} °C. Не знижуйте опалення «бо сьогодні було тепло» — закладіть паливо/газ на ніч.`,
    });
  }

  if (items.length === 0) {
    push(items, {
      severity: "ok",
      title: "Погода близька до режиму залу",
      detail: `Надворі ${fmt(out.tempMin)}–${fmt(out.tempMax)} °C, норма кросу ${fmt(tMin)}–${fmt(tMax)} °C на ${age} добу. Тримайте RH ${rh.min}–${rh.max}%, підстилку сухою, вентиляцію за відчуттям птаха.`,
    });
  }

  const severity = worst(items);
  const headline = headlineFor(severity, chicks, nightGap, out, tMin, tMax, age);

  return {
    severity,
    headline,
    ageBand: `${age} доба · ${ageBandLabel(age)}`,
    houseTempMin: tMin,
    houseTempMax: tMax,
    humidityMin: rh.min,
    humidityMax: rh.max,
    heatGapNight: round1(nightGap),
    heatGapDay: round1(dayGap),
    items: items.filter((it) => it.severity !== "ok").length
      ? items.filter((it) => it.severity !== "ok")
      : items.slice(0, 1),
  };
}

function headlineFor(
  severity: Severity,
  chicks: boolean,
  nightGap: number,
  out: WeatherDay,
  tMin: number,
  tMax: number,
  age: number,
): string {
  if (severity === "critical" && chicks) {
    return `Курчата: надворі ${fmt(out.tempMin)}–${fmt(out.tempMax)} °C, у залі треба ${fmt(tMin)}–${fmt(tMax)} °C — опалення і без протягів`;
  }
  if (out.tempMax >= 32 && age >= 21) {
    return `Спека ${fmt(out.tempMax)} °C на ${age} добу — максимум повітря і вода`;
  }
  if (nightGap >= 12) {
    return `Ніч ${fmt(out.tempMin)} °C, норма залу від ${fmt(tMin)} °C — тримайте тепло, вентиляція мінімальна`;
  }
  if (out.tempMax > tMax + 2) {
    return `День ${fmt(out.tempMax)} °C вище за норму залу ${fmt(tMax)} °C — додайте повітрообмін`;
  }
  if (out.kind === "rain" || out.kind === "snow") {
    return `${out.label}, ${fmt(out.tempMin)}–${fmt(out.tempMax)} °C — бережіть підстилку від вологи`;
  }
  return `Надворі ${fmt(out.tempMin)}–${fmt(out.tempMax)} °C · у пташнику тримайте ${fmt(tMin)}–${fmt(tMax)} °C`;
}

function fmt(n: number, digits = 0): string {
  const f = 10 ** digits;
  const v = Math.round(n * f) / f;
  return v.toLocaleString("uk-UA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${m}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function numOrNull(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  return v;
}
