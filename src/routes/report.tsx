import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { NumberField } from "@/components/ui/number-field";
import { fcrAtSale, saleAvgWeightG } from "@/lib/broiler/calc";
import { houseDailyForecast, type HouseDayForecast } from "@/lib/broiler/standards";
import { WeatherPanel } from "@/components/weather-panel";
import { LitterCheck } from "@/components/litter-check";
import { WaterMedsField, draftsFromDoses, type MedDraft } from "@/components/water-meds";
import { compressPhoto } from "@/lib/compress-photo";
import { clearReportDraft, loadReportDraft, saveReportDraft } from "@/lib/report-draft";
import { canManageFlocks } from "@/lib/broiler/roles";
import { parseWaterMeds, waterMedById } from "@/lib/broiler/water-meds";
import { getReportPrefill, saveDailyReport } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { fmtDate, fmtDateShort, fmtInt, fmtNum, fmtPct } from "@/lib/utils";

type ReportSearch = {
  house?: number;
  date?: string;
};

export const Route = createFileRoute("/report")({
  component: ReportPage,
  validateSearch: (search: Record<string, unknown>): ReportSearch => {
    const house = Number(search.house);
    const date = typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : undefined;
    const out: ReportSearch = {};
    if (Number.isFinite(house) && house > 0) out.house = house;
    if (date) out.date = date;
    return out;
  },
});

function ReportPage() {
  return (
    <AppShell>
      <ReportForm />
    </AppShell>
  );
}

function ReportForm() {
  const search = Route.useSearch();
  const [houseId, setHouseId] = useState<number | undefined>(search.house);
  const [reportDate, setReportDate] = useState<string | undefined>(search.date);
  const [tick, setTick] = useState(0);
  const { data, error, loading } = useAsync(
    () => getReportPrefill({ data: { houseId, reportDate } }),
    [houseId, reportDate, tick],
  );
  const [mortality, setMortality] = useState("");
  const [culled, setCulled] = useState("0");
  const [weight, setWeight] = useState("");
  const [feed, setFeed] = useState("");
  const [water, setWater] = useState("");
  const [tMin, setTMin] = useState("");
  const [tMax, setTMax] = useState("");
  const [hum, setHum] = useState("");
  const [notes, setNotes] = useState("");
  const [soldHead, setSoldHead] = useState("");
  const [soldKg, setSoldKg] = useState("");
  const [droppingLook, setDroppingLook] = useState("");
  const [litterState, setLitterState] = useState("");
  const [medsNone, setMedsNone] = useState(false);
  const [medRows, setMedRows] = useState<MedDraft[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [saleOpen, setSaleOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    if (!houseId && data.house) setHouseId(data.house.id);
    if (!reportDate) {
      setReportDate(data.reportDate);
      return;
    }
    if (data.reportDate !== reportDate) return;
    const src = data.existing;
    if (src) {
      setMortality(String(src.mortality));
      setCulled(String(src.culled));
      setWeight(String(src.avgWeightG));
      setFeed(String(src.feedKg));
      setWater(src.waterL != null ? String(src.waterL) : "");
      setTMin(src.tempMin != null ? String(src.tempMin) : "");
      setTMax(src.tempMax != null ? String(src.tempMax) : "");
      setHum(src.humidityPct != null ? String(src.humidityPct) : "");
      setNotes(src.notes);
      setSoldHead(src.soldHead ? String(src.soldHead) : "");
      setSoldKg(src.soldWeightKg ? String(src.soldWeightKg) : "");
      setDroppingLook(src.droppingLook ?? "");
      setLitterState(src.litterState ?? "");
      setMedsNone(src.meds.length === 0);
      setMedRows(draftsFromDoses(src.meds));
      setPhoto(src.droppingPhoto);
      setSaleOpen(src.soldHead > 0);
    } else {
      setMortality("0");
      setCulled("0");
      setWeight("");
      setFeed("");
      setWater("");
      setTMin("");
      setTMax("");
      setHum("");
      setNotes("");
      setSoldHead("");
      setSoldKg("");
      setDroppingLook("");
      setLitterState("");
      setMedsNone(false);
      setMedRows([]);
      setPhoto(null);
      setSaleOpen(false);
      const draft = houseId && reportDate ? loadReportDraft(houseId, reportDate) : null;
      if (draft) {
        setMortality(draft.mortality);
        setCulled(draft.culled);
        setWeight(draft.weight);
        setFeed(draft.feed);
        setWater(draft.water);
        setTMin(draft.tMin);
        setTMax(draft.tMax);
        setHum(draft.hum);
        setNotes(draft.notes);
        setSoldHead(draft.soldHead);
        setSoldKg(draft.soldKg);
        setDroppingLook(draft.droppingLook);
        setLitterState(draft.litterState);
        setMedsNone(draft.medsNone);
        setMedRows(
          draft.medRows.map((r) => ({
            uid: Math.random().toString(36).slice(2, 9),
            prepId: r.prepId,
            conc: r.conc,
            customName: r.customName,
          })),
        );
        setPhoto(draft.droppingPhoto);
        setSaleOpen(Boolean(draft.soldHead));
      }
    }
  }, [data, houseId, reportDate]);

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!houseId || !reportDate || data?.existing) return;
    const t = window.setTimeout(() => {
      saveReportDraft({
        houseId,
        reportDate,
        mortality,
        culled,
        weight,
        feed,
        water,
        tMin,
        tMax,
        hum,
        notes,
        soldHead,
        soldKg,
        droppingLook,
        litterState,
        medsNone,
        medRows,
        droppingPhoto: photo,
        savedAt: Date.now(),
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [
    houseId,
    reportDate,
    data?.existing,
    mortality,
    culled,
    weight,
    feed,
    water,
    tMin,
    tMax,
    hum,
    notes,
    soldHead,
    soldKg,
    droppingLook,
    litterState,
    medsNone,
    medRows,
    photo,
  ]);

  const live = useMemo(() => {
    const headStart = data?.previous?.headEnd ?? data?.flock?.chicksPlaced ?? 0;
    const m = Number(mortality) || 0;
    const c = Number(culled) || 0;
    const w = Number(weight) || 0;
    const f = Number(feed) || 0;
    const wat = water === "" ? null : Number(water);
    const soldH = Number(soldHead) || 0;
    const soldW = Number(soldKg) || 0;
    const saleAvgG = saleAvgWeightG(soldH, soldW);
    const stdFc = data?.std ? houseDailyForecast(data.std, headStart) : null;
    const stdFeedKg = stdFc?.feedKg ?? 0;
    const stdWaterL = stdFc?.waterL ?? 0;
    const feedG = headStart ? (f * 1000) / headStart : 0;
    const waterMl = wat != null && headStart ? (wat * 1000) / headStart : null;
    const weightDelta =
      data?.std?.weightG && weight !== "" && w > 0
        ? ((w - data.std.weightG) / data.std.weightG) * 100
        : null;
    const feedDelta =
      data?.std?.feedGPerBird && feed !== "" && feedG
        ? ((feedG - data.std.feedGPerBird) / data.std.feedGPerBird) * 100
        : null;
    const waterDelta =
      data?.std?.waterMlPerBird && waterMl != null
        ? ((waterMl - data.std.waterMlPerBird) / data.std.waterMlPerBird) * 100
        : null;
    const headEnd = Math.max(0, headStart - m - c - soldH);
    const cumFeedKg = (data?.cumFeedBefore ?? 0) + f;
    const remainingAvg = w || saleAvgG;
    const saleFcr =
      soldH > 0 && data?.flock
        ? fcrAtSale({
            cumFeedKg,
            cumSoldWeightKg: (data.priorSoldKg ?? 0) + soldW,
            remainingHead: headEnd,
            remainingAvgG: remainingAvg,
            placed: data.flock.chicksPlaced,
            breed: data.flock.breed,
          })
        : 0;
    const oversold = soldH > Math.max(0, headStart - m - c);
    return {
      headStart,
      headEnd,
      dayMort: headStart ? ((m + c) / headStart) * 100 : 0,
      stdFeedKg,
      stdWaterL,
      stdFc,
      w,
      f,
      wat,
      weightDelta,
      feedDelta,
      waterDelta,
      soldH,
      soldW,
      saleAvgG,
      saleFcr,
      cumFeedKg,
      oversold,
      closesFlock: soldH > 0 && headEnd === 0 && !oversold,
    };
  }, [data, mortality, culled, weight, feed, water, soldHead, soldKg]);

  if (loading && !data) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  const prefill = data;
  const selectedId = houseId ?? prefill.house?.id;
  const housesForSite = prefill.houses.filter((h) =>
    selectedId
      ? h.siteId === (prefill.houses.find((x) => x.id === selectedId)?.siteId ?? h.siteId)
      : true,
  );
  const siteIdOfSelected = prefill.houses.find((h) => h.id === selectedId)?.siteId ?? prefill.sites[0]?.id;
  const selectedDate = reportDate ?? prefill.reportDate;
  const skippedBefore =
    prefill.missingDates.length > 0 && prefill.missingDates[0] < selectedDate
      ? prefill.missingDates[0]
      : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const hid = selectedId;
    if (!hid || !prefill.flock) {
      setFormError("Немає активної посадки в цьому пташнику");
      return;
    }
    if (!droppingLook || !litterState) {
      setFormError("Вкажіть вигляд посліду і стан підстилки");
      return;
    }
    if (!weight || Number(weight) <= 0) {
      setFormError("Вкажіть фактичну середню масу або підставте прогноз кросу і скоригуйте");
      return;
    }
    if (feed === "" || Number.isNaN(Number(feed)) || Number(feed) < 0) {
      setFormError("Вкажіть фактичну видачу корму або підставте прогноз і скоригуйте");
      return;
    }
    const meds = medsNone
      ? []
      : parseWaterMeds(
          medRows.map((r) => ({
            prepId: r.prepId,
            conc: Number(String(r.conc).replace(",", ".")),
            name: r.customName,
            unit: waterMedById(r.prepId)?.unit,
          })),
        );
    if (!medsNone && meds.length === 0) {
      setFormError("Додайте препарат на випоюванні або позначте, що випоювання немає");
      return;
    }
    setBusy(true);
    setFormError(null);
    setDone(null);
    try {
      const res = await saveDailyReport({
        data: {
          houseId: hid,
          reportDate: selectedDate,
          mortality: Number(mortality) || 0,
          culled: Number(culled) || 0,
          avgWeightG: Number(weight) || 0,
          feedKg: Number(feed) || 0,
          waterL: water === "" ? null : Number(water),
          tempMin: tMin === "" ? null : Number(tMin),
          tempMax: tMax === "" ? null : Number(tMax),
          humidityPct: hum === "" ? null : Number(hum),
          droppingLook,
          litterState,
          notes,
          soldHead: Number(soldHead) || 0,
          soldWeightKg: Number(soldKg) || 0,
          medsNone,
          meds,
          droppingPhoto: photo,
        },
      });
      if (hid && selectedDate) clearReportDraft(hid, selectedDate);
      const saleBit =
        res.soldHead > 0
          ? ` Продано ${fmtInt(res.soldHead)} гол. · середня ${fmtInt(res.saleAvgG)} г · FCR ${fmtNum(res.saleFcr, 3)}.`
          : "";
      const closedBit = res.closed ? " Посадку закрито." : "";
      if (res.nextDate) {
        setDone(
          `Збережено за ${fmtDateShort(selectedDate)}.${saleBit} Далі ${fmtDateShort(res.nextDate)} — лишилось ${res.missingLeft} діб.`,
        );
        setReportDate(res.nextDate);
      } else {
        setDone(
          `Збережено. Поголівʼя на ранок: ${fmtInt(res.headEnd)} гол.${saleBit}${closedBit}`,
        );
        setTick((n) => n + 1);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не збережено");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">{fmtDate(selectedDate)}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Щоденний звіт</h1>
        <p className="mt-2 text-sm text-muted">
          {data.flock
            ? `${data.house?.name ?? ""} · ${data.flock.breed} · ${data.flock.code} · ${data.ageDays} доба · пос. ${fmtDateShort(data.flock.placedAt)}${
                data.flock.status === "closed" ? " · здано" : ""
              }`
            : canManageFlocks(data.profile)
              ? "Немає активної посадки в цьому пташнику."
              : "Зачекайте, поки керівник або технолог відкриє посадку."}
        </p>
        {!data.flock && canManageFlocks(data.profile) ? (
          <Link
            to="/settings"
            className="mt-3 inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Відкрити посадку
          </Link>
        ) : null}
      </header>

      {offline ? (
        <p className="rounded-[16px] bg-warn/15 px-4 py-3 text-sm text-warn">
          Немає мережі. Цифри лишаються в чернетці на цьому телефоні. Коли зʼявиться звʼязок —
          натисніть «Зберегти» ще раз.
        </p>
      ) : null}

      {data.density && data.density.areaM2 > 0 ? (
        <Card className={data.density.warn ? "border border-warn/40" : ""}>
          <p className="text-[11px] uppercase tracking-wider text-subtle">Жива маса на 1 м²</p>
          <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">
            {fmtNum(data.density.kgM2, 1)}
            <span className="ml-1 font-sans text-sm font-normal text-muted">кг/м²</span>
          </p>
          <p className={`mt-1 text-sm ${data.density.warn ? "text-warn" : "text-muted"}`}>
            {data.density.reached
              ? `Ліміт ${data.density.limitKgM2} кг/м² уже досягнуто.`
              : data.density.daysToLimit != null
                ? `${data.density.limitKgM2} кг/м² — на ${data.density.reachAgeDays} добу (${fmtDateShort(data.density.reachDate!)}), через ${data.density.daysToLimit} діб.`
                : `Площа ${fmtInt(data.density.areaM2)} м² · ліміт ${data.density.limitKgM2} кг/м².`}
          </p>
        </Card>
      ) : data.house && !data.house.areaM2 ? (
        <p className="text-sm text-muted">
          Вкажіть площу пташника в параметрах, щоб рахувати кг/м² і прогноз 42 кг/м².
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {data.sites.length > 1 ? (
          <div>
            <Label htmlFor="factory">Фабрика</Label>
            <Select
              id="factory"
              value={String(siteIdOfSelected ?? "")}
              onChange={(e) => {
                const sid = Number(e.target.value);
                const first = data.houses.find((h) => h.siteId === sid);
                setReportDate(undefined);
                setDone(null);
                if (first) setHouseId(first.id);
              }}
            >
              {data.sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <div>
          <Label htmlFor="house">Пташник</Label>
          <Select
            id="house"
            value={String(selectedId ?? "")}
            onChange={(e) => {
              setReportDate(undefined);
              setDone(null);
              setHouseId(Number(e.target.value));
            }}
          >
            {(data.sites.length > 1 ? housesForSite : data.houses).map((h) => {
              const site = data.sites.find((s) => s.id === h.siteId);
              return (
                <option key={h.id} value={h.id}>
                  {data.sites.length > 1 ? `${h.name}` : `${site?.name ?? ""} · ${h.name}`}
                </option>
              );
            })}
          </Select>
        </div>
        <div className={data.sites.length > 1 ? "sm:col-span-2" : ""}>
          <Label htmlFor="report-date">Дата звіту</Label>
          <Input
            id="report-date"
            type="date"
            value={selectedDate}
            min={data.minDate ?? undefined}
            max={data.maxDate}
            disabled={!data.flock}
            onChange={(e) => {
              setDone(null);
              setReportDate(e.target.value);
            }}
          />
          <p className="mt-1 text-xs text-muted">
            Звіт подають за попередню добу. Сьогоднішню зміну закриваєте завтра. Заднім числом — від
            посадки.
          </p>
        </div>
      </div>

      {siteIdOfSelected ? (
        <WeatherPanel
          siteId={siteIdOfSelected}
          geoName={data.sites.find((s) => s.id === siteIdOfSelected)?.geoName ?? null}
          canSetGeo={canManageFlocks(data.profile)}
          weather={data.weather}
          weatherError={data.weatherError}
          reportDate={selectedDate}
          ageDays={data.ageDays}
          houseTempMin={data.std?.tempMin ?? null}
          houseTempMax={data.std?.tempMax ?? null}
          indoorMin={tMin === "" ? null : Number(tMin)}
          indoorMax={tMax === "" ? null : Number(tMax)}
          indoorHumidity={hum === "" ? null : Number(hum)}
          humidityMin={data.std?.humidityMin ?? null}
          humidityMax={data.std?.humidityMax ?? null}
          onGeoSaved={() => setTick((n) => n + 1)}
        />
      ) : null}

      {data.flock && data.missingDates.length ? (
        <Card>
          <p className="text-sm text-fg">
            Немає звітів за {data.missingDates.length}{" "}
            {data.missingDates.length === 1 ? "добу" : "діб"} від посадки до вчора. Заповніть по черзі —
            після збереження відкриється наступний пропущений день.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.missingDates.slice(0, 8).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDone(null);
                  setReportDate(d);
                }}
                className={`h-11 rounded-[12px] px-3 text-sm ${
                  d === selectedDate ? "bg-primary text-primary-fg" : "bg-bg text-muted"
                }`}
              >
                {fmtDateShort(d)}
              </button>
            ))}
            {data.missingDates.length > 8 ? (
              <span className="self-center text-xs text-muted">+{data.missingDates.length - 8}</span>
            ) : null}
          </div>
        </Card>
      ) : null}

      {skippedBefore ? (
        <p className="text-sm text-warn">
          Раніше за цю дату ще немає звіту ({fmtDateShort(skippedBefore)}). Краще заповнити спочатку
          пропущені дні — інакше поголівʼя не врахує падіж між ними.
        </p>
      ) : null}

      <form className="space-y-5" onSubmit={onSubmit}>
        {data.std && live.stdFc ? (
          <ForecastCard
            breed={data.flock?.breed ?? "крос"}
            ageDays={data.ageDays}
            head={live.headStart}
            forecast={live.stdFc}
            yesterdayG={data.previous?.avgWeightG ?? null}
            applied={
              weight !== "" &&
              Number(weight) === live.stdFc.weightG &&
              feed !== "" &&
              Math.abs(Number(feed) - live.stdFc.feedKg) < 0.05 &&
              water !== "" &&
              Math.abs(Number(water) - live.stdFc.waterL) < 0.5
            }
            onApply={() => {
              const fc = live.stdFc!;
              setWeight(String(fc.weightG));
              setFeed(fc.feedKg % 1 === 0 ? String(Math.round(fc.feedKg)) : fc.feedKg.toFixed(1));
              setWater(String(fc.waterL));
            }}
          />
        ) : null}

        <Card className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
          <p className="col-span-2 text-[11px] uppercase tracking-wider text-subtle md:col-span-3">
            Факт у корпусі
          </p>
          <NumberField
            label="Падіж"
            unit="гол."
            required
            value={mortality}
            onChange={setMortality}
            step={1}
            hint={`норма до ${fmtPct(data.std?.dailyMortPct ?? 0, 2)}`}
          />
          <NumberField label="Вибраковка" unit="гол." value={culled} onChange={setCulled} step={1} />
          <NumberField
            label="Середня маса, факт"
            unit="г"
            required
            value={weight}
            onChange={setWeight}
            step={5}
            forecast={live.stdFc ? String(live.stdFc.weightG) : undefined}
            onApplyForecast={
              live.stdFc
                ? () => setWeight(String(live.stdFc!.weightG))
                : undefined
            }
            hint={live.weightDelta != null ? `відхилення ${deltaLabel(live.weightDelta)}` : undefined}
          />
          <NumberField
            label="Корм, факт"
            unit="кг"
            required
            value={feed}
            onChange={setFeed}
            step={10}
            decimals={1}
            forecast={
              live.stdFc
                ? live.stdFc.feedKg % 1 === 0
                  ? String(Math.round(live.stdFc.feedKg))
                  : live.stdFc.feedKg.toFixed(1)
                : undefined
            }
            onApplyForecast={
              live.stdFc
                ? () =>
                    setFeed(
                      live.stdFc!.feedKg % 1 === 0
                        ? String(Math.round(live.stdFc!.feedKg))
                        : live.stdFc!.feedKg.toFixed(1),
                    )
                : undefined
            }
            hint={live.feedDelta != null ? `відхилення ${deltaLabel(live.feedDelta)}` : undefined}
          />
          <NumberField
            label="Вода, факт"
            unit="л"
            value={water}
            onChange={setWater}
            step={10}
            decimals={1}
            forecast={live.stdFc ? String(live.stdFc.waterL) : undefined}
            onApplyForecast={
              live.stdFc ? () => setWater(String(live.stdFc!.waterL)) : undefined
            }
            hint={live.waterDelta != null ? `відхилення ${deltaLabel(live.waterDelta)}` : undefined}
          />
          <NumberField
            label="Вологість"
            unit="%"
            value={hum}
            onChange={setHum}
            step={1}
            min={0}
            max={100}
            hint={
              data.std
                ? `норма ${fmtNum(data.std.humidityMin, 0)}–${fmtNum(data.std.humidityMax, 0)}%`
                : undefined
            }
          />
          <NumberField
            label="t° мін"
            unit="°C"
            value={tMin}
            onChange={setTMin}
            step={0.5}
            decimals={1}
            min={-5}
            max={45}
            hint={
              data.std
                ? `норма ${fmtNum(data.std.tempMin, 0)}–${fmtNum(data.std.tempMax, 0)} · у залі`
                : undefined
            }
          />
          <NumberField
            label="t° макс"
            unit="°C"
            value={tMax}
            onChange={setTMax}
            step={0.5}
            decimals={1}
            min={-5}
            max={45}
          />
        </Card>

        {data.flock ? (
          <LitterCheck
            look={droppingLook}
            state={litterState}
            ageDays={data.ageDays}
            previousLook={data.previous?.droppingLook}
            previousState={data.previous?.litterState}
            onLook={setDroppingLook}
            onState={setLitterState}
          />
        ) : null}

        {data.flock ? (
          <div className="space-y-2">
            <Label htmlFor="dropping-photo">Фото посліду (бажано)</Label>
            <input
              id="dropping-photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:text-fg"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setPhoto(await compressPhoto(file));
                } catch {
                  setFormError("Не вдалося стиснути фото");
                }
              }}
            />
            {photo ? (
              <img src={photo} alt="Послід" className="mt-2 max-h-40 rounded-[14px] object-cover" />
            ) : null}
          </div>
        ) : null}

        {data.flock ? (
          <div className="space-y-2">
            {data.previous?.meds.length && !medsNone && medRows.length === 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setMedRows(draftsFromDoses(data.previous?.meds ?? []))}
              >
                Випоювання як учора
              </Button>
            ) : null}
            <WaterMedsField none={medsNone} rows={medRows} onNone={setMedsNone} onRows={setMedRows} />
          </div>
        ) : null}

        <Card>
          <CardTitle>Здача птиці</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Окремий крок. Не чіпайте, якщо сьогодні звичайний день вирощування.
          </p>
          {data.withdrawal.length ? (
            <p className="mt-3 text-sm text-warn">
              Каренція: {data.withdrawal.map((w) => `${w.name} ще ${w.daysLeft} діб (до ${w.until})`).join("; ")}.
            </p>
          ) : null}
          {!saleOpen ? (
            <Button className="mt-4" variant="secondary" onClick={() => setSaleOpen(true)}>
              Сьогодні здача
            </Button>
          ) : (
            <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberField
              label="Продано"
              unit="гол."
              value={soldHead}
              onChange={setSoldHead}
              step={10}
              hint={`можна здати до ${fmtInt(Math.max(0, live.headStart - (Number(mortality) || 0) - (Number(culled) || 0)))} гол.`}
            />
            <NumberField
              label="Загальна вага"
              unit="кг"
              value={soldKg}
              onChange={setSoldKg}
              step={10}
              decimals={1}
            />
          </div>
          {live.soldH > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Hint k="Середня курка" v={`${fmtInt(live.saleAvgG)} г`} />
              <Hint k="FCR на продаж" v={live.saleFcr ? fmtNum(live.saleFcr, 3) : "—"} />
              <Hint k="Залишок" v={fmtInt(live.headEnd)} warn={live.oversold} />
              <Hint k="Корм з посадки" v={`${fmtInt(live.cumFeedKg)} кг`} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">Немає здачі сьогодні — залиште порожнім.</p>
          )}
          {live.oversold ? (
            <p className="mt-3 text-sm text-bad">Продаж більший за залишок після падежу.</p>
          ) : null}
          {live.closesFlock ? (
            <p className="mt-3 text-sm text-ok">Залишок 0 — посадку буде закрито після збереження.</p>
          ) : null}
            <Button className="mt-4" variant="ghost" size="sm" onClick={() => { setSaleOpen(false); setSoldHead(""); setSoldKg(""); }}>
              Скасувати здачу
            </Button>
            </>
          )}
        </Card>

        <div>
          <Label htmlFor="notes">Примітка / інцидент</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Що відхилилось від технології, які дії вжито"
          />
        </div>

        <Card className="grid grid-cols-2 gap-3 p-4 text-sm md:grid-cols-3">
          <Hint k="Поголівʼя зранку" v={fmtInt(live.headStart)} />
          <Hint k="Залишок" v={fmtInt(live.headEnd)} />
          <Hint
            k="Падіж %"
            v={fmtPct(live.dayMort, 2)}
            warn={live.dayMort > (data.std?.dailyMortPct ?? 0.12) * 1.8}
          />
          <Hint
            k="Маса vs прогноз"
            v={live.weightDelta == null ? "—" : deltaLabel(live.weightDelta)}
            warn={Math.abs(live.weightDelta ?? 0) >= data.thresholds.weightPct}
          />
          <Hint
            k="Корм vs прогноз"
            v={live.feedDelta == null ? "—" : deltaLabel(live.feedDelta)}
            warn={Math.abs(live.feedDelta ?? 0) >= data.thresholds.feedPct}
          />
          <Hint
            k="Вода vs прогноз"
            v={live.waterDelta == null ? "—" : deltaLabel(live.waterDelta)}
            warn={Math.abs(live.waterDelta ?? 0) >= data.thresholds.waterPct}
          />
        </Card>
        <p className="text-xs text-muted">
          Прогноз {data.flock?.breed ?? "кросу"} на {data.ageDays} добу для {fmtInt(live.headStart)} гол.
          Поріг корму ±{fmtNum(data.thresholds.feedPct, 0)}%, води ±{fmtNum(data.thresholds.waterPct, 0)}%, маси{" "}
          {fmtNum(data.thresholds.weightPct, 0)}%. Сайт не записує прогноз як факт — керівник коригує.
        </p>

        {data.previous ? (
          <p className="text-xs text-muted">
            Попередній день ({fmtDateShort(data.previous.reportDate)}): падіж {data.previous.mortality} гол.,
            маса {fmtInt(data.previous.avgWeightG)} г, корм {fmtNum(data.previous.feedKg, 0)} кг.
          </p>
        ) : (
          <p className="text-xs text-muted">Це перший день посадки — поголівʼя зранку = посадка.</p>
        )}

        {data.existing ? (
          <p className="rounded-[12px] bg-surface-2 px-3 py-2 text-xs text-muted">
            Звіт за {fmtDateShort(selectedDate)} уже є. Збереження замінить падіж, масу, корм, воду, послід і продаж за цей день.
          </p>
        ) : null}

        {formError ? <p className="text-sm text-bad">{formError}</p> : null}
        {done ? <p className="text-sm text-ok">{done}</p> : null}

        <Button type="submit" className="w-full md:w-auto" disabled={busy || !data.flock}>
          {busy
            ? "Збереження…"
            : data.existing
              ? `Оновити звіт за ${fmtDateShort(selectedDate)}`
              : `Подати звіт за ${fmtDateShort(selectedDate)}`}
        </Button>
      </form>
    </div>
  );
}

function deltaLabel(pct: number): string {
  return `${pct > 0 ? "+" : ""}${fmtNum(pct, 1)}%`;
}

function Hint({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-subtle">{k}</p>
      <p className={`mt-1 tabular-nums ${warn ? "text-bad" : "text-fg"}`}>{v}</p>
    </div>
  );
}

function ForecastCard({
  breed,
  ageDays,
  head,
  forecast,
  yesterdayG,
  applied,
  onApply,
}: {
  breed: string;
  ageDays: number;
  head: number;
  forecast: HouseDayForecast;
  yesterdayG: number | null;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-wider text-subtle">
        Прогноз кросу · {breed} · {ageDays} доба
      </p>
      <p className="mt-1 text-sm text-muted">
        На {fmtInt(head)} гол. зранку. Підставте й скоригуйте по вагах, бункеру і лічильнику.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-subtle">Середня маса</p>
          <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">{fmtInt(forecast.weightG)} г</p>
          <p className="mt-0.5 text-[11px] text-muted">+{fmtNum(forecast.dailyGainG, 0)} г/добу</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-subtle">Корм</p>
          <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">{fmtNum(forecast.feedKg, 0)} кг</p>
          <p className="mt-0.5 text-[11px] text-muted">{fmtNum(forecast.feedGPerBird, 0)} г/гол.</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-subtle">Вода</p>
          <p className="mt-1 font-display text-2xl tabular-nums tracking-tight">{fmtNum(forecast.waterL, 0)} л</p>
          <p className="mt-0.5 text-[11px] text-muted">{fmtInt(forecast.waterMlPerBird)} мл/гол.</p>
        </div>
      </div>
      {yesterdayG != null ? (
        <p className="mt-3 text-xs text-muted">Учора факт {fmtInt(yesterdayG)} г.</p>
      ) : null}
      <button
        type="button"
        onClick={onApply}
        disabled={applied}
        className="mt-4 h-11 w-full rounded-[14px] bg-primary/12 text-sm font-medium text-primary disabled:opacity-60"
      >
        {applied ? "Прогноз підставлено — коригуйте факт" : "Підставити прогноз у факт"}
      </button>
    </Card>
  );
}
