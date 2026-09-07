import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { FEED_PHASES } from "@/lib/broiler/feed";
import { DEFAULT_NORMS } from "@/lib/broiler/handbook";
import { BREEDS, getStandard } from "@/lib/broiler/standards";
import {
  LAMP_TYPES,
  PREMIX_PRODUCTS,
  cyclePremix,
  lampPlan,
  lightEnergyKwh,
  lightingProgram,
  placePlan,
} from "@/lib/broiler/tools";
import type { HouseOverview } from "@/lib/broiler/types";
import { getDashboard } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { cn, fmtInt, fmtNum } from "@/lib/utils";

export const Route = createFileRoute("/tools")({ component: Page });

function Page() {
  return (
    <AppShell>
      <Tools />
    </AppShell>
  );
}

function Tools() {
  const { data, error, loading } = useAsync(() => getDashboard(), []);
  const houses = data?.factories.flatMap((f) => f.houses.filter((h) => h.flock)) ?? [];
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (!id || loading) return;
    const t = window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
    return () => window.clearTimeout(t);
  }, [loading, hash]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Калькулятори технолога</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Інструменти</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Світло на добу, замовлення преміксу, скільки курчат садити на площу і норма кросу. Цифри з таблиці
          породи, не «на око».
        </p>
      </header>

      {loading ? <div className="h-16 animate-pulse rounded-[16px] bg-surface" /> : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <nav className="flex flex-wrap gap-2">
        <Jump href="#light" label="Освітлення" />
        <Jump href="#premix" label="Премікс" />
        <Jump href="#place" label="Посадка" />
        <Jump href="#norm" label="Норма кросу" />
      </nav>

      <LightingCard houses={houses} />
      <PremixCard houses={houses} />
      <PlaceCard houses={houses} />
      <NormCard houses={houses} />
    </div>
  );
}

function Jump({ href, label }: { href: string; label: string }) {
  const id = href.replace(/^#/, "");
  return (
    <Link
      to="/tools"
      hash={id}
      className="inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
    >
      {label}
    </Link>
  );
}

function pickHouse(houses: HouseOverview[], id: string): HouseOverview | null {
  const n = Number(id);
  return houses.find((h) => h.house.id === n) ?? houses[0] ?? null;
}

function LightingCard({ houses }: { houses: HouseOverview[] }) {
  const [houseId, setHouseId] = useState("");
  const house = pickHouse(houses, houseId);
  const [age, setAge] = useState("14");
  const [lengthM, setLengthM] = useState("100");
  const [widthM, setWidthM] = useState("12");
  const [lampId, setLampId] = useState(LAMP_TYPES[0].id);
  const [price, setPrice] = useState("6.5");
  const live = houses.find((h) => String(h.house.id) === houseId) ?? house;

  const program = lightingProgram(Number(age) || 0);
  const area = Math.max(0, (Number(lengthM) || 0) * (Number(widthM) || 0));
  const lamp = LAMP_TYPES.find((l) => l.id === lampId) ?? LAMP_TYPES[0];
  const plan = lampPlan(area, program.lux, lamp);
  const kwh = lightEnergyKwh(plan, program.lightH);
  const uah = (Number(price.replace(",", ".")) || 0) * kwh;

  function takeHouse(h: HouseOverview) {
    setHouseId(String(h.house.id));
    setAge(String(h.ageDays));
    if (h.house.areaM2 > 0) {
      setWidthM("12");
      setLengthM(String(Math.max(1, Math.round(h.house.areaM2 / 12))));
    }
  }

  return (
    <Card id="light" className="scroll-mt-24 space-y-4">
      <div>
        <CardTitle>Освітлення</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Години світла і люкс на добу за програмою кросу. Кількість LED — з площі залу.
        </p>
      </div>
      {houses.length ? <HousePick houses={houses} value={houseId} onChange={takeHouse} /> : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field label="Доба" value={age} onChange={setAge} />
        <Field label="Довжина, м" value={lengthM} onChange={setLengthM} />
        <Field label="Ширина, м" value={widthM} onChange={setWidthM} />
        <div>
          <Label>Світильник</Label>
          <Select value={lampId} onChange={(e) => setLampId(e.target.value)}>
            {LAMP_TYPES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {live?.flock ? (
        <p className="text-xs text-muted">
          {live.house.name} · {live.ageDays} доба · {fmtInt(live.house.areaM2)} м²
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi k="Світло" v={`${program.lightH} год`} s={`${program.darkH} год темряви`} />
        <Kpi k="Люкс" v={`${program.lux}–${program.luxMax}`} s="на рівні птаха" />
        <Kpi k="Світильників" v={fmtInt(plan.count)} s={`${fmtNum(plan.wPerM2, 2)} Вт/м²`} />
        <Kpi k="За добу" v={`${fmtNum(kwh, 1)} кВт·год`} s={uah ? `${fmtInt(uah)} ₴` : undefined} />
      </div>
      <p className="text-sm text-muted">{program.note}</p>
      <div>
        <Label>Ціна електроенергії, ₴/кВт·год</Label>
        <Input className="max-w-40" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
    </Card>
  );
}

function PremixCard({ houses }: { houses: HouseOverview[] }) {
  const [houseId, setHouseId] = useState("");
  const house = pickHouse(houses, houseId);
  const [breed, setBreed] = useState(house?.flock?.breed ?? BREEDS[0].name);
  const [head, setHead] = useState("20000");
  const [productId, setProductId] = useState(PREMIX_PRODUCTS[1].id);
  const [incl, setIncl] = useState(String(PREMIX_PRODUCTS[1].inclusionPct));
  const [bag, setBag] = useState(String(PREMIX_PRODUCTS[1].bagKg));
  const [price, setPrice] = useState("");

  const rows = useMemo(
    () =>
      cyclePremix({
        breed,
        placed: Number(head) || 0,
        inclusionPct: Number(String(incl).replace(",", ".")) || 0,
        bagKg: Number(String(bag).replace(",", ".")) || 25,
        pricePerKg: price ? Number(String(price).replace(",", ".")) : undefined,
      }),
    [breed, head, incl, bag, price],
  );
  const cycle = rows.find((r) => r.phase === "cycle");

  function takeHouse(h: HouseOverview) {
    setHouseId(String(h.house.id));
    if (h.flock) {
      setBreed(h.flock.breed);
      setHead(String(h.flock.chicksPlaced));
    }
  }

  function setProduct(id: string) {
    setProductId(id);
    const p = PREMIX_PRODUCTS.find((x) => x.id === id);
    if (p && p.id !== "custom") {
      setIncl(String(p.inclusionPct));
      setBag(String(p.bagKg));
    }
  }

  return (
    <Card id="premix" className="scroll-mt-24 space-y-4">
      <div>
        <CardTitle>Замовлення преміксу</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Скільки кілограмів і мішків треба на фазу і на весь тур. GREENFEED 1% / 2,5% / 5% або свій відсоток.
        </p>
      </div>
      {houses.length ? <HousePick houses={houses} value={houseId} onChange={takeHouse} /> : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
        <Field label="Посадка, гол." value={head} onChange={setHead} />
        <div>
          <Label>Продукт</Label>
          <Select value={productId} onChange={(e) => setProduct(e.target.value)}>
            {PREMIX_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <Field label="Включення, %" value={incl} onChange={setIncl} />
        <Field label="Мішок, кг" value={bag} onChange={setBag} />
        <Field label="Ціна, ₴/кг" value={price} onChange={setPrice} />
      </div>
      {cycle ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi k="Корм за тур" v={`${fmtInt(cycle.feedKg)} кг`} />
          <Kpi k="Премікс" v={`${fmtNum(cycle.premixKg, 0)} кг`} />
          <Kpi k="Мішків" v={fmtInt(cycle.bags)} s={`${bag} кг`} />
          <Kpi k="Сума" v={cycle.cost != null ? `${fmtInt(cycle.cost)} ₴` : "—"} s="якщо вказали ціну" />
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-subtle">
            <tr>
              <th className="py-2 pr-3 font-medium">Фаза</th>
              <th className="py-2 pr-3 font-medium">Добі</th>
              <th className="py-2 pr-3 font-medium">Корм, кг</th>
              <th className="py-2 pr-3 font-medium">Премікс, кг</th>
              <th className="py-2 font-medium">Мішків</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.phase} className="border-t border-border">
                <td className="py-2 pr-3 font-medium">
                  {r.phase === "cycle" ? "Весь тур" : FEED_PHASES.find((p) => p.id === r.phase)?.label}
                </td>
                <td className="py-2 pr-3 tabular-nums text-muted">
                  {r.fromDay}–{r.toDay}
                </td>
                <td className="py-2 pr-3 tabular-nums">{fmtInt(r.feedKg)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmtNum(r.premixKg, 0)}</td>
                <td className={cn("py-2 tabular-nums", r.phase === "cycle" ? "font-medium" : "")}>
                  {fmtInt(r.bags)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PlaceCard({ houses }: { houses: HouseOverview[] }) {
  const [houseId, setHouseId] = useState("");
  const house = pickHouse(houses, houseId);
  const [lengthM, setLengthM] = useState("100");
  const [widthM, setWidthM] = useState("12");
  const [count, setCount] = useState("1");
  const [kgM2, setKgM2] = useState(String(DEFAULT_NORMS.densityLimitKgM2));
  const [weight, setWeight] = useState(house?.flock ? String(house.flock.targetWeightG) : "2800");
  const [mort, setMort] = useState("4");

  const plan = placePlan({
    lengthM: Number(lengthM) || 0,
    widthM: Number(widthM) || 0,
    houses: Number(count) || 1,
    targetKgM2: Number(String(kgM2).replace(",", ".")) || 0,
    targetWeightG: Number(weight) || 2800,
    mortPct: Number(String(mort).replace(",", ".")) || 0,
  });

  function takeHouse(h: HouseOverview) {
    setHouseId(String(h.house.id));
    if (h.house.areaM2 > 0) {
      setWidthM("12");
      setLengthM(String(Math.max(1, Math.round(h.house.areaM2 / 12))));
    }
    if (h.flock) setWeight(String(h.flock.targetWeightG));
  }

  return (
    <Card id="place" className="scroll-mt-24 space-y-4">
      <div>
        <CardTitle>Посадка на площу</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Скільки курчат садити, щоб на забої вийти на ліміт кг/м². Ніпелі — 12 гол./шт., годівниці — 60 гол./шт.
        </p>
      </div>
      {houses.length ? <HousePick houses={houses} value={houseId} onChange={takeHouse} /> : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field label="Довжина, м" value={lengthM} onChange={setLengthM} />
        <Field label="Ширина, м" value={widthM} onChange={setWidthM} />
        <Field label="Пташників" value={count} onChange={setCount} />
        <Field label="Ліміт кг/м²" value={kgM2} onChange={setKgM2} />
        <Field label="Маса здачі, г" value={weight} onChange={setWeight} />
        <Field label="Падіж, %" value={mort} onChange={setMort} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi k="Садити" v={fmtInt(plan.placed)} s="гол. на всі зали" />
        <Kpi k="На здачі" v={fmtInt(plan.soldHead)} s={`${fmtInt(plan.liveKg)} кг живої`} />
        <Kpi k="Ніпелів" v={fmtInt(plan.nipples)} s="12 гол. на ніпель" />
        <Kpi k="Годівниць" v={fmtInt(plan.pans)} s="60 гол. на таріль" />
      </div>
      <p className="text-sm text-muted">
        Корисна площа {fmtNum(plan.totalAreaM2, 0)} м² · {fmtNum(plan.birdsPerM2, 1)} гол./м² на посадці.
      </p>
    </Card>
  );
}

function NormCard({ houses }: { houses: HouseOverview[] }) {
  const [houseId, setHouseId] = useState("");
  const house = pickHouse(houses, houseId);
  const [breed, setBreed] = useState(house?.flock?.breed ?? BREEDS[0].name);
  const [age, setAge] = useState("21");
  const [head, setHead] = useState("17500");
  const std = getStandard(Number(age) || 0, breed);
  const light = lightingProgram(Number(age) || 0);
  const headN = Number(head) || 0;
  const feedKg = (std.feedGPerBird * headN) / 1000;
  const waterL = (std.waterMlPerBird * headN) / 1000;

  function takeHouse(h: HouseOverview) {
    setHouseId(String(h.house.id));
    setAge(String(h.ageDays));
    setHead(String(h.head));
    if (h.flock) setBreed(h.flock.breed);
  }

  return (
    <Card id="norm" className="scroll-mt-24 space-y-4">
      <div>
        <CardTitle>Норма кросу на добу</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Маса, корм, вода, температура і світло з таблиці породи. Помножено на ваше поголівʼя.
        </p>
      </div>
      {houses.length ? <HousePick houses={houses} value={houseId} onChange={takeHouse} /> : null}
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
        <Field label="Доба" value={age} onChange={setAge} />
        <Field label="Поголівʼя" value={head} onChange={setHead} />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Kpi k="Маса" v={`${fmtInt(std.weightG)} г`} s={`+${fmtNum(std.dailyGainG, 0)} г/добу`} />
        <Kpi k="Корм" v={`${fmtNum(std.feedGPerBird, 0)} г/гол.`} s={`${fmtInt(feedKg)} кг на залу`} />
        <Kpi k="Вода" v={`${fmtInt(std.waterMlPerBird)} мл`} s={`${fmtInt(waterL)} л на залу`} />
        <Kpi k="FCR" v={fmtNum(std.fcr, 3)} s={`падіж ${fmtNum(std.cumMortPct, 2)}% накопич.`} />
        <Kpi k="Температура" v={`${fmtNum(std.tempMin, 0)}–${fmtNum(std.tempMax, 0)} °C`} />
        <Kpi k="Вологість" v={`${std.humidityMin}–${std.humidityMax} %`} />
        <Kpi k="Світло" v={`${light.lightH} год`} s={`${light.lux}–${light.luxMax} лк`} />
        <Kpi k="Корм накопич." v={`${fmtInt(std.cumFeedG)} г`} s="на голову з посадки" />
      </div>
    </Card>
  );
}

function HousePick({
  houses,
  value,
  onChange,
}: {
  houses: HouseOverview[];
  value: string;
  onChange: (h: HouseOverview) => void;
}) {
  return (
    <div>
      <Label>Взяти з пташника</Label>
      <Select
        value={value}
        onChange={(e) => {
          const h = houses.find((x) => String(x.house.id) === e.target.value);
          if (h) onChange(h);
        }}
      >
        <option value="">Оберіть пташник</option>
        {houses.map((h) => (
          <option key={h.house.id} value={h.house.id}>
            {h.house.name} · {h.flock?.breed} · {h.ageDays} д. · {fmtInt(h.head)} гол.
          </option>
        ))}
      </Select>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Kpi({ k, v, s }: { k: string; v: string; s?: string }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-bg px-3 py-3">
      <p className="text-[11px] uppercase leading-snug tracking-wider text-subtle">{k}</p>
      <p className="mt-1.5 font-display text-2xl tabular-nums tracking-tight">{v}</p>
      {s ? <p className="mt-1 text-xs text-muted">{s}</p> : null}
    </div>
  );
}
