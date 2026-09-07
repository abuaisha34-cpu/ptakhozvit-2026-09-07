import { getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  evaluateDeviations,
  fcrAtSale,
  forecastCycle,
  forecastDensity,
  saleAvgWeightG,
  snapshotFromSeries,
  statusFromDeviations,
  type Forecast,
} from "@/lib/broiler/calc";
import { getStandard, startWeight } from "@/lib/broiler/standards";
import { humidityFromNorms, type OrgNorms, DEFAULT_NORMS } from "@/lib/broiler/handbook";
import { activeWithdrawals, defaultTreatmentCalendar, parseTreatmentCalendar, type TreatmentEvent } from "@/lib/broiler/treatments";
import {
  evaluateFeed,
  feedPhaseLabel,
  parseFeedValues,
  type FeedPhase,
} from "@/lib/broiler/feed";
import { buildClimateAdvice } from "@/lib/broiler/climate";
import {
  parseDroppingLook,
  parseLitterState,
} from "@/lib/broiler/litter";
import {
  parseWaterMeds,
  type WaterMedDose,
  type WaterMedGroupId,
  type WaterMedUnit,
} from "@/lib/broiler/water-meds";
import { generateInviteCode, generateSheetsToken, isInviteCodeFormat, normalizeInviteCode } from "@/lib/broiler/org";
import { loadWeather, searchPlaces as geocodePlaces } from "@/lib/server/weather";
import type {
  CostSettings,
  DailyReport,
  DashboardData,
  FactoryDetail,
  FactoryOverview,
  Flock,
  DemoStats,
  HoldingSummary,
  House,
  HouseDetail,
  HouseOverview,
  JournalEvent,
  Notice,
  PeriodRow,
  PlatformPerson,
  Profile,
  RecycleBin,
  ReportFormPrefill,
  Role,
  Site,
  TeamMember,
  TrendPoint,
  FeedAnalysis,
} from "@/lib/broiler/types";
import { addDaysISO, diffDays, eachDateISO, num, round, todayISO, yesterdayISO } from "@/lib/utils";
import {
  assertCanAccessSite,
  assertCanManageFlocks,
  assertPlatformAdmin,
  assertPlatformOwner,
  assertSiteOfOrg,
  assertTechnologist,
  ensureCostSettings,
  ensureProfile,
  insertFactory,
  insertOrganization,
  loadCostSettings,
  loadHouseById,
  loadHouses,
  loadSiteById,
  loadSites,
  resolveOrgId,
  visibleSiteIds,
} from "./authz";
import { notifyDensity, notifyHandbookQuestion, notifyJoinRequest, notifyNewReport } from "./notify";
import { writeJournal } from "./journal";
import { archiveFlock, archiveOrgFlocks, archiveReport, ensureRecycleTables, listRecycleBin, restoreFlockRow, restoreReportRow } from "./recycle";
import { copyOrgCalendarToFlock, loadFlockTreatmentCalendar, loadOrgTreatmentCalendar, saveFlockTreatmentCalendar, saveOrgTreatmentCalendar } from "./treatment-cal";
import { ensureOrgNorms, loadHandbook, saveOrgNorms } from "./handbook";
import { ensureDemoOrg, resetDemoOrg } from "./demo-seed";
import { canDeleteReports, canEditTreatments, canManageFlocks, canManageOps, factoryRequired, factorySelectable, hasTechAccess, isDemoUser, isPlatformAdmin, roleLabel, seesAllFactories } from "@/lib/broiler/roles";

type FlockRow = {
  id: number;
  site_id: number;
  house_id: number;
  code: string;
  breed: string;
  placed_at: string;
  chicks_placed: number;
  chick_cost_uah: string | number;
  target_days: number;
  target_weight_g: number;
  status: string;
  closed_at: string | null;
  slaughter_head: number | null;
  slaughter_weight_g: number | null;
};

type ReportRow = {
  id: number;
  flock_id: number;
  report_date: string;
  age_days: number;
  head_start: number;
  mortality: number;
  culled: number;
  head_end: number;
  avg_weight_g: number;
  feed_kg: string | number;
  water_l: string | number | null;
  temp_min: string | number | null;
  temp_max: string | number | null;
  humidity_pct: string | number | null;
  dropping_look: string | null;
  litter_state: string | null;
  notes: string;
  submitted_by: string;
  sold_head: number | null;
  sold_weight_kg: string | number | null;
  dropping_photo?: string | null;
};

async function siteOrgId(sql: Sql, siteId: number): Promise<number> {
  const rec = await loadSiteById(sql, siteId);
  if (!rec) throw new Error("Фабрику не знайдено");
  return rec.orgId;
}

function mapFlock(r: FlockRow): Flock {
  return {
    id: r.id,
    siteId: r.site_id,
    houseId: r.house_id,
    code: r.code,
    breed: r.breed,
    placedAt: r.placed_at,
    chicksPlaced: r.chicks_placed,
    chickCostUah: num(r.chick_cost_uah),
    targetDays: r.target_days,
    targetWeightG: r.target_weight_g,
    status: r.status === "closed" ? "closed" : "active",
    closedAt: r.closed_at,
    slaughterHead: r.slaughter_head == null ? null : Number(r.slaughter_head),
    slaughterWeightG: r.slaughter_weight_g == null ? null : Number(r.slaughter_weight_g),
  };
}

function mapReport(r: ReportRow): DailyReport {
  return {
    id: r.id,
    flockId: r.flock_id,
    reportDate: r.report_date,
    ageDays: r.age_days,
    headStart: r.head_start,
    mortality: r.mortality,
    culled: r.culled,
    headEnd: r.head_end,
    avgWeightG: r.avg_weight_g,
    feedKg: num(r.feed_kg),
    waterL: r.water_l == null ? null : num(r.water_l),
    tempMin: r.temp_min == null ? null : num(r.temp_min),
    tempMax: r.temp_max == null ? null : num(r.temp_max),
    humidityPct: r.humidity_pct == null ? null : num(r.humidity_pct),
    droppingLook: r.dropping_look ?? null,
    litterState: r.litter_state ?? null,
    notes: r.notes ?? "",
    submittedBy: r.submitted_by,
    soldHead: Number(r.sold_head ?? 0),
    soldWeightKg: num(r.sold_weight_kg),
    meds: [],
    droppingPhoto: r.dropping_photo ?? null,
  };
}

function houseLabel(site: Site, house: House): string {
  const short = site.name.replace(/^Фабрика\s+/, "");
  return `${short} · ${house.name}`;
}

async function sessionHint(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<{ name: string | null; email: string | null }> {
  try {
    const rows = await sql.query<{ name: string | null; email: string | null }>(
      `select name, email from "user" where id = $1`,
      [userId],
    );
    return { name: rows[0]?.name ?? null, email: rows[0]?.email ?? null };
  } catch {
    return { name: null, email: null };
  }
}

async function rebuildReportHeads(
  sql: Awaited<ReturnType<typeof getSql>>,
  flockId: number,
): Promise<void> {
  const flocks = await sql.query<{ chicks_placed: number }>(
    "select chicks_placed from flocks where id = $1",
    [flockId],
  );
  if (!flocks[0]) return;
  const reports = await sql.query<{
    id: number;
    mortality: number;
    culled: number;
    sold_head: number;
  }>(
    `select id, mortality, culled, coalesce(sold_head, 0) as sold_head from daily_reports
      where flock_id = $1 order by report_date, id`,
    [flockId],
  );
  let head = flocks[0].chicks_placed;
  for (const r of reports) {
    const headStart = head;
    const headEnd = Math.max(0, headStart - r.mortality - r.culled - (r.sold_head ?? 0));
    await sql.query("update daily_reports set head_start = $2, head_end = $3 where id = $1", [
      r.id,
      headStart,
      headEnd,
    ]);
    head = headEnd;
  }
}

async function syncFlockStatus(
  sql: Awaited<ReturnType<typeof getSql>>,
  flockId: number,
): Promise<{ closed: boolean; soldHead: number; soldWeightKg: number; saleAvgG: number }> {
  const last = await sql.query<{ report_date: string; head_end: number }>(
    `select report_date, head_end from daily_reports
      where flock_id = $1 order by report_date desc, id desc limit 1`,
    [flockId],
  );
  const sums = await sql.query<{ sold_head: string | number; sold_kg: string | number }>(
    `select coalesce(sum(sold_head), 0) as sold_head,
            coalesce(sum(sold_weight_kg), 0) as sold_kg
       from daily_reports where flock_id = $1`,
    [flockId],
  );
  const soldHead = Math.round(num(sums[0]?.sold_head));
  const soldWeightKg = num(sums[0]?.sold_kg);
  const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
  const remaining = last[0]?.head_end ?? 1;
  if (last[0] && remaining <= 0) {
    await sql.query(
      `update flocks
          set status = 'closed',
              closed_at = $2,
              slaughter_head = $3,
              slaughter_weight_g = $4
        where id = $1`,
      [flockId, last[0].report_date, soldHead || null, saleAvgG ? Math.round(saleAvgG) : null],
    );
    return { closed: true, soldHead, soldWeightKg, saleAvgG };
  }
  await sql.query(
    `update flocks
        set status = 'active',
            closed_at = null,
            slaughter_head = $2,
            slaughter_weight_g = $3
      where id = $1`,
    [flockId, soldHead || null, saleAvgG ? Math.round(saleAvgG) : null],
  );
  return { closed: false, soldHead, soldWeightKg, saleAvgG };
}

const FLOCK_COLS = `id, site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah,
            target_days, target_weight_g, status, closed_at, slaughter_head, slaughter_weight_g`;

async function loadActiveFlocks(sql: Awaited<ReturnType<typeof getSql>>, siteIds: number[]) {
  if (!siteIds.length) return [] as Flock[];
  const ph = siteIds.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await sql.query<FlockRow>(
    `select ${FLOCK_COLS}
       from flocks
      where status = 'active' and site_id in (${ph})
      order by placed_at desc`,
    siteIds,
  );
  return rows.map(mapFlock);
}

async function loadFlocksForHouse(
  sql: Awaited<ReturnType<typeof getSql>>,
  houseId: number,
): Promise<Flock[]> {
  const rows = await sql.query<FlockRow>(
    `select ${FLOCK_COLS}
       from flocks
      where house_id = $1
      order by case when status = 'active' then 0 else 1 end, placed_at desc`,
    [houseId],
  );
  return rows.map(mapFlock);
}

async function loadFlockForHouse(
  sql: Awaited<ReturnType<typeof getSql>>,
  houseId: number,
): Promise<Flock | null> {
  const rows = await sql.query<FlockRow>(
    `select ${FLOCK_COLS}
       from flocks
      where house_id = $1
      order by case when status = 'active' then 0 else 1 end, placed_at desc
      limit 1`,
    [houseId],
  );
  return rows[0] ? mapFlock(rows[0]) : null;
}

async function loadReportsForFlocks(
  sql: Awaited<ReturnType<typeof getSql>>,
  flockIds: number[],
): Promise<Map<number, DailyReport[]>> {
  const map = new Map<number, DailyReport[]>();
  if (!flockIds.length) return map;
  const ph = flockIds.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await sql.query<ReportRow>(
    `select id, flock_id, report_date, age_days, head_start, mortality, culled, head_end,
            avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
            dropping_look, litter_state, notes, submitted_by,
            coalesce(sold_head, 0) as sold_head, coalesce(sold_weight_kg, 0) as sold_weight_kg,
            dropping_photo
       from daily_reports where flock_id in (${ph}) order by report_date asc`,
    flockIds,
  );
  for (const r of rows) {
    const list = map.get(r.flock_id) ?? [];
    list.push(mapReport(r));
    map.set(r.flock_id, list);
  }
  const reportIds = rows.map((r) => r.id);
  if (reportIds.length) {
    const ph = reportIds.map((_, i) => `$${i + 1}`).join(", ");
    const medRows = await sql.query<{
      report_id: number;
      prep_id: string;
      group_id: string;
      name: string;
      conc: string | number;
      unit: string;
    }>(
      `select report_id, prep_id, group_id, name, conc, unit
         from daily_report_meds
        where report_id in (${ph})
        order by sort_order, id`,
      reportIds,
    );
    const byReport = new Map<number, WaterMedDose[]>();
    for (const m of medRows) {
      const unit: WaterMedUnit = m.unit === "ml" ? "ml" : "g";
      const group = m.group_id as WaterMedGroupId;
      const list = byReport.get(m.report_id) ?? [];
      list.push({
        prepId: m.prep_id,
        group,
        name: m.name,
        conc: num(m.conc),
        unit,
      });
      byReport.set(m.report_id, list);
    }
    for (const list of map.values()) {
      for (const report of list) {
        report.meds = byReport.get(report.id) ?? [];
      }
    }
  }
  return map;
}

async function replaceReportMeds(
  sql: Awaited<ReturnType<typeof getSql>>,
  reportId: number,
  meds: WaterMedDose[],
): Promise<void> {
  await sql.query("delete from daily_report_meds where report_id = $1", [reportId]);
  for (let i = 0; i < meds.length; i += 1) {
    const m = meds[i];
    await sql.query(
      `insert into daily_report_meds (report_id, prep_id, group_id, name, conc, unit, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [reportId, m.prepId, m.group, m.name, m.conc, m.unit, i],
    );
  }
}

function cumFeed(reports: DailyReport[], upto?: string): number {
  return reports
    .filter((r) => (upto ? r.reportDate <= upto : true))
    .reduce((s, r) => s + r.feedKg, 0);
}

function saleTotals(reports: DailyReport[], flock: Flock | null) {
  const soldHead = reports.reduce((s, r) => s + r.soldHead, 0);
  const soldWeightKg = reports.reduce((s, r) => s + r.soldWeightKg, 0);
  const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
  const lastSale = [...reports].reverse().find((r) => r.soldHead > 0) ?? null;
  const saleFcr =
    flock && lastSale
      ? fcrAtSale({
          cumFeedKg: cumFeed(reports, lastSale.reportDate),
          cumSoldWeightKg: reports
            .filter((r) => r.reportDate <= lastSale.reportDate)
            .reduce((s, r) => s + r.soldWeightKg, 0),
          remainingHead: lastSale.headEnd,
          remainingAvgG: lastSale.avgWeightG || saleAvgG,
          placed: flock.chicksPlaced,
          breed: flock.breed,
        })
      : 0;
  return { soldHead, soldWeightKg, saleAvgG, saleFcr };
}

function recentAdg(reports: DailyReport[]): number {
  if (reports.length < 2) return 0;
  const last = reports.slice(-4);
  const first = last[0];
  const end = last[last.length - 1];
  const days = Math.max(1, end.ageDays - first.ageDays);
  return (end.avgWeightG - first.avgWeightG) / days;
}

function buildHouseOverview(
  site: Site,
  house: House,
  flock: Flock | null,
  reports: DailyReport[],
  today: string,
  costs: CostSettings,
  norms: OrgNorms = DEFAULT_NORMS,
): HouseOverview {
  const last = reports[reports.length - 1] ?? null;
  const due = addDaysISO(today, -1);
  const reportDue = Boolean(flock && flock.status !== "closed" && flock.placedAt <= due);
  const missingToday = reportDue && (!last || last.reportDate < due);
  const label = houseLabel(site, house);
  const thresholds = {
    feedPct: costs.feedAlertPct,
    waterPct: costs.waterAlertPct,
    weightPct: costs.weightAlertPct,
  };
  if (!flock || !last) {
    return {
      site,
      house,
      flock,
      lastReportDate: last?.reportDate ?? null,
      missingToday: reportDue && !last,
      head: flock?.chicksPlaced ?? 0,
      ageDays: 0,
      avgWeightG: 0,
      stdWeightG: getStandard(0, flock?.breed).weightG,
      weightDeltaPct: null,
      feedKg: 0,
      feedGPerBird: 0,
      stdFeedGPerBird: 0,
      feedDeltaPct: null,
      waterMlPerBird: null,
      stdWaterMlPerBird: getStandard(0, flock?.breed).waterMlPerBird,
      waterDeltaPct: null,
      dayMortPct: 0,
      cumMortPct: 0,
      stdCumMortPct: 0,
      fcr: 0,
      stdFcr: 0,
      epef: 0,
      soldHead: 0,
      soldWeightKg: 0,
      saleAvgG: 0,
      saleFcr: 0,
      dayDead: 0,
      lastHeadStart: 0,
      status: reportDue && !last ? "warn" : "ok",
      deviations: reportDue && !last
        ? [
            {
              id: `${house.id}-empty`,
              severity: "warn",
              siteId: site.id,
              siteName: label,
              flockId: flock!.id,
              title: "Немає звіту за попередню добу",
              detail: `${label}: посадку відкрито, звіту за вчора ще немає.`,
              metric: "звіт",
              actual: 0,
              standard: 1,
              deltaPct: -100,
            },
          ]
        : [],
      forecast: null,
      density: null,
      droppingLook: last?.droppingLook ?? null,
      litterState: last?.litterState ?? null,
      meds: last?.meds ?? [],
    };
  }

  const prev = reports.length > 1 ? reports[reports.length - 2] : null;
  const feedToDate = cumFeed(reports);
  const snap = snapshotFromSeries({
    placed: flock.chicksPlaced,
    ageDays: last.ageDays,
    head: last.headEnd,
    mortality: last.mortality,
    culled: last.culled,
    headStart: last.headStart,
    avgWeightG: last.avgWeightG,
    prevWeightG: prev?.avgWeightG ?? getStandard(Math.max(0, last.ageDays - 1), flock.breed).weightG,
    feedKg: last.feedKg,
    cumFeedKg: feedToDate,
    waterL: last.waterL,
    tempMin: last.tempMin,
    tempMax: last.tempMax,
    humidity: last.humidityPct,
    breed: flock.breed,
    soldHead: reports.reduce((s, r) => s + r.soldHead, 0),
    soldWeightKg: reports.reduce((s, r) => s + r.soldWeightKg, 0),
  });
  const rh = humidityFromNorms(snap.ageDays, norms);
  snap.standard.humidityMin = rh.min;
  snap.standard.humidityMax = rh.max;
  const deviations = evaluateDeviations({
    siteId: site.id,
    siteName: label,
    flockId: flock.id,
    snap,
    missingToday,
    reportDate: last.reportDate,
    thresholds,
    droppingLook: last.droppingLook,
    litterState: last.litterState,
  });
  const density = forecastDensity({
    head: last.headEnd,
    avgWeightG: last.avgWeightG,
    ageDays: last.ageDays,
    areaM2: house.areaM2,
    recentAdgG: recentAdg(reports),
    breed: flock.breed,
    reportDate: last.reportDate,
    limitKgM2: norms.densityLimitKgM2,
    warnDays: norms.densityWarnDays,
  });
  if (density.warn) {
    deviations.push({
      id: `${flock.id}-density`,
      severity: density.reached ? "critical" : "warn",
      siteId: site.id,
      siteName: label,
      flockId: flock.id,
      title: density.reached
        ? `Щільність ${density.kgM2} кг/м² (ліміт ${density.limitKgM2})`
        : `До ${density.limitKgM2} кг/м² лишилось ${density.daysToLimit} діб`,
      detail: density.reached
        ? `${label}: жива маса ${density.kgM2} кг/м² при ліміті ${density.limitKgM2} кг/м².`
        : `${label}: зараз ${density.kgM2} кг/м². ${density.limitKgM2} кг/м² — на ${density.reachAgeDays} добу (${density.reachDate}).`,
      metric: "кг/м²",
      actual: density.kgM2,
      standard: density.limitKgM2,
      deltaPct: density.limitKgM2 ? ((density.kgM2 - density.limitKgM2) / density.limitKgM2) * 100 : null,
    });
  }
  const fc: Forecast = forecastCycle({
    chicksPlaced: flock.chicksPlaced,
    chickCostUah: flock.chickCostUah,
    cumFeedKg: feedToDate,
    feedPriceUah: costs.feedPriceUah,
    otherPerBirdUah: costs.otherPerBirdUah,
    gasPerBirdUah: costs.gasPerBirdUah,
    medsPerBirdUah: costs.medsPerBirdUah,
    liveWeightPriceUah: costs.liveWeightPriceUah,
    head: last.headEnd,
    avgWeightG: last.avgWeightG,
    ageDays: last.ageDays,
    targetDays: flock.targetDays,
    targetWeightG: flock.targetWeightG,
    recentAdgG: recentAdg(reports),
    breed: flock.breed,
    soldHead: reports.reduce((s, r) => s + r.soldHead, 0),
    soldWeightKg: reports.reduce((s, r) => s + r.soldWeightKg, 0),
  });
  const weightDeltaPct = snap.standard.weightG
    ? ((snap.avgWeightG - snap.standard.weightG) / snap.standard.weightG) * 100
    : null;
  const feedDeltaPct = snap.standard.feedGPerBird
    ? ((snap.feedGPerBird - snap.standard.feedGPerBird) / snap.standard.feedGPerBird) * 100
    : null;
  const waterDeltaPct =
    snap.waterMlPerBird != null && snap.standard.waterMlPerBird
      ? ((snap.waterMlPerBird - snap.standard.waterMlPerBird) / snap.standard.waterMlPerBird) * 100
      : null;

  return {
    site,
    house,
    flock,
    lastReportDate: last.reportDate,
    missingToday,
    head: snap.head,
    ageDays: snap.ageDays,
    avgWeightG: snap.avgWeightG,
    stdWeightG: snap.standard.weightG,
    weightDeltaPct,
    feedKg: snap.feedKg,
    feedGPerBird: snap.feedGPerBird,
    stdFeedGPerBird: snap.standard.feedGPerBird,
    feedDeltaPct,
    waterMlPerBird: snap.waterMlPerBird,
    stdWaterMlPerBird: snap.standard.waterMlPerBird,
    waterDeltaPct,
    dayMortPct: snap.dayMortPct,
    cumMortPct: snap.cumMortPct,
    stdCumMortPct: snap.standard.cumMortPct,
    fcr: snap.fcr,
    stdFcr: snap.standard.fcr,
    epef: snap.epef,
    ...saleTotals(reports, flock),
    status: statusFromDeviations(deviations),
    deviations,
    forecast: fc,
    density,
    droppingLook: last.droppingLook,
    litterState: last.litterState,
    meds: last.meds,
    dayDead: last.mortality + last.culled,
    lastHeadStart: last.headStart,
  };
}

function buildTrend(flocks: Flock[], reportsMap: Map<number, DailyReport[]>): TrendPoint[] {
  const seriesMap = new Map<
    string,
    {
      date: string;
      wSum: number;
      wHead: number;
      stdSum: number;
      mort: number;
      headStart: number;
      feed: number;
      stdFeed: number;
      gainW: number;
    }
  >();
  for (const flock of flocks) {
    const reports = reportsMap.get(flock.id) ?? [];
    const recent = reports.slice(-14);
    for (const r of recent) {
      const std = getStandard(r.ageDays, flock.breed);
      const cur = seriesMap.get(r.reportDate) ?? {
        date: r.reportDate,
        wSum: 0,
        wHead: 0,
        stdSum: 0,
        mort: 0,
        headStart: 0,
        feed: 0,
        stdFeed: 0,
        gainW: 0,
      };
      cur.wSum += r.avgWeightG * r.headEnd;
      cur.wHead += r.headEnd;
      cur.stdSum += std.weightG * r.headEnd;
      cur.mort += r.mortality + r.culled;
      cur.headStart += r.headStart;
      cur.feed += r.feedKg;
      cur.stdFeed += (std.feedGPerBird * r.headStart) / 1000;
      cur.gainW += Math.max(0, r.avgWeightG - startWeight(flock.breed)) * flock.chicksPlaced;
      seriesMap.set(r.reportDate, cur);
    }
  }
  return [...seriesMap.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date,
      ageLabel: r.date.slice(5),
      weight: r.wHead ? r.wSum / r.wHead : 0,
      stdWeight: r.wHead ? r.stdSum / r.wHead : 0,
      mortPct: r.headStart ? (r.mort / r.headStart) * 100 : 0,
      fcr: r.gainW > 0 ? r.feed / (r.gainW / 1000) : 0,
      feedKg: round(r.feed, 1),
      stdFeedKg: round(r.stdFeed, 1),
      feedGPerBird: r.headStart ? round((r.feed * 1000) / r.headStart, 1) : 0,
      stdFeedGPerBird: r.headStart ? round((r.stdFeed * 1000) / r.headStart, 1) : 0,
    }));
}

function rollupFactory(site: Site, houses: HouseOverview[], series: TrendPoint[]): FactoryOverview {
  const active = houses.filter((h) => h.flock);
  const head = houses.reduce((s, h) => s + h.head, 0);
  const placed = houses.reduce((s, h) => s + (h.flock?.chicksPlaced ?? 0), 0);
  const dayMortality = houses.reduce((s, h) => s + h.dayDead, 0);
  const morningHead = houses.reduce((s, h) => s + (h.lastHeadStart || 0), 0);
  const weightSum = houses.reduce((s, h) => s + h.avgWeightG * h.head, 0);
  const fcrParts = houses.filter((h) => h.fcr > 0);
  const fcr =
    fcrParts.length > 0
      ? fcrParts.reduce((s, h) => s + h.fcr * h.head, 0) / fcrParts.reduce((s, h) => s + h.head, 0)
      : 0;
  const epefParts = houses.filter((h) => h.epef > 0);
  const epef =
    epefParts.length > 0
      ? epefParts.reduce((s, h) => s + h.epef * h.head, 0) / epefParts.reduce((s, h) => s + h.head, 0)
      : 0;
  const feedKg = houses.reduce((s, h) => s + h.feedKg, 0);
  const feedParts = houses.filter((h) => h.feedGPerBird > 0 && h.head > 0);
  const feedHead = feedParts.reduce((s, h) => s + h.head, 0);
  const feedGPerBird = feedHead
    ? feedParts.reduce((s, h) => s + h.feedGPerBird * h.head, 0) / feedHead
    : 0;
  const stdFeedGPerBird = feedHead
    ? feedParts.reduce((s, h) => s + h.stdFeedGPerBird * h.head, 0) / feedHead
    : 0;
  const feedDeltaPct = stdFeedGPerBird
    ? ((feedGPerBird - stdFeedGPerBird) / stdFeedGPerBird) * 100
    : null;
  const soldHead = houses.reduce((s, h) => s + h.soldHead, 0);
  const soldWeightKg = houses.reduce((s, h) => s + h.soldWeightKg, 0);
  const deviations = houses.flatMap((h) => h.deviations);
  const forecasts = houses.filter((h) => h.forecast);
  const projectedCost = forecasts.reduce((s, h) => s + (h.forecast?.projectedCost ?? 0), 0);
  const projectedRevenue = forecasts.reduce((s, h) => s + (h.forecast?.projectedRevenue ?? 0), 0);
  const projectedProfit = projectedRevenue - projectedCost;
  const projectedLiveKg = forecasts.reduce((s, h) => {
    const f = h.forecast;
    if (!f) return s;
    return s + (f.projectedHead * f.projectedWeightG) / 1000;
  }, 0);
  const remaining = forecasts.length
    ? Math.max(...forecasts.map((h) => h.forecast?.remainingDays ?? 0))
    : 0;
  const projectedHead = forecasts.reduce((s, h) => s + (h.forecast?.projectedHead ?? 0), 0);
  const projectedWeightG = projectedHead
    ? Math.round(
        forecasts.reduce((s, h) => s + (h.forecast?.projectedWeightG ?? 0) * (h.forecast?.projectedHead ?? 0), 0) /
          projectedHead,
      )
    : 0;
  const forecast: Forecast | null = forecasts.length
    ? {
        costToDate: forecasts.reduce((s, h) => s + (h.forecast?.costToDate ?? 0), 0),
        costPerKgLive: head && weightSum ? projectedCost / Math.max(0.001, (head * (weightSum / head)) / 1000) : 0,
        inventoryValue: forecasts.reduce((s, h) => s + (h.forecast?.inventoryValue ?? 0), 0),
        marginToDate: forecasts.reduce((s, h) => s + (h.forecast?.marginToDate ?? 0), 0),
        profitabilityToDate: projectedCost > 0 ? (projectedProfit / projectedCost) * 100 : 0,
        remainingDays: remaining,
        projectedHead,
        projectedWeightG,
        projectedFeedKg: forecasts.reduce((s, h) => s + (h.forecast?.projectedFeedKg ?? 0), 0),
        projectedCost,
        projectedCostPerKg: projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0,
        projectedRevenue,
        projectedProfit,
        projectedProfitability: projectedCost > 0 ? (projectedProfit / projectedCost) * 100 : 0,
        projectedEpef: epef,
        projectedFcr: projectedHead
          ? forecasts.reduce((s, h) => s + (h.forecast?.projectedFcr ?? 0) * (h.forecast?.projectedHead ?? 0), 0) /
            projectedHead
          : 0,
      }
    : null;

  return {
    site,
    houses,
    head: Math.round(head),
    placed,
    activeHouses: active.length,
    missingToday: houses.filter((h) => h.missingToday).length,
    avgWeightG: head ? Math.round(weightSum / head) : 0,
    dayMortality: Math.round(dayMortality),
    dayMortPct: morningHead ? (dayMortality / morningHead) * 100 : 0,
    morningHead: Math.round(morningHead),
    fcr,
    epef,
    feedKg: round(feedKg, 1),
    feedGPerBird: round(feedGPerBird, 1),
    stdFeedGPerBird: round(stdFeedGPerBird, 1),
    feedDeltaPct,
    soldHead,
    soldWeightKg: round(soldWeightKg, 1),
    status: statusFromDeviations(deviations),
    forecast,
    deviations,
    series,
    weather: null,
    weatherPlace: null,
    climate: null,
  };
}

async function loadFactoryOverviews(
  sql: Awaited<ReturnType<typeof getSql>>,
  sites: Site[],
  today: string,
  costs: CostSettings,
  norms: OrgNorms = DEFAULT_NORMS,
): Promise<FactoryOverview[]> {
  const siteIds = sites.map((s) => s.id);
  const houses = await loadHouses(sql, siteIds);
  const flocks = await loadActiveFlocks(sql, siteIds);
  const reportsMap = await loadReportsForFlocks(
    sql,
    flocks.map((f) => f.id),
  );
  const overviews = await Promise.all(
    sites.map(async (site) => {
      const siteHouses = houses.filter((h) => h.siteId === site.id);
      const siteFlocks = flocks.filter((f) => f.siteId === site.id);
      const houseViews = siteHouses.map((house) => {
        const flock = siteFlocks.find((f) => f.houseId === house.id) ?? null;
        const reports = flock ? (reportsMap.get(flock.id) ?? []) : [];
        return buildHouseOverview(site, house, flock, reports, today, costs, norms);
      });
      const factory = rollupFactory(site, houseViews, buildTrend(siteFlocks, reportsMap));
      return attachFactoryWeather(factory, today, norms);
    }),
  );
  return overviews;
}

async function attachFactoryWeather(
  factory: FactoryOverview,
  date: string,
  norms: OrgNorms = DEFAULT_NORMS,
): Promise<FactoryOverview> {
  const { site } = factory;
  if (site.lat == null || site.lon == null) return factory;
  try {
    const w = await loadWeather({
      lat: site.lat,
      lon: site.lon,
      place: site.geoName ?? site.name,
      date,
    });
    if (!w) return factory;
    const youngest = factory.houses
      .filter((h) => h.flock)
      .slice()
      .sort((a, b) => a.ageDays - b.ageDays)[0];
    const std = youngest?.flock ? getStandard(youngest.ageDays, youngest.flock.breed) : null;
    const climate =
      youngest && std
        ? buildClimateAdvice({
            ageDays: youngest.ageDays,
            houseTempMin: std.tempMin,
            houseTempMax: std.tempMax,
            outdoor: w.selected,
            upcoming: w.days,
            norms,
          })
        : null;
    return { ...factory, weather: w.selected, weatherPlace: w.place, climate };
  } catch {
    return factory;
  }
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const sites = await loadSites(sql, profile.orgId);
    const ids = await visibleSiteIds(sql, profile);
    const houses = await loadHouses(sql, ids);
    return { profile, sites: sites.filter((s) => ids.includes(s.id)), houses, today: todayISO() };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardData> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const today = todayISO();
    const allSites = await loadSites(sql, profile.orgId);
    const ids = await visibleSiteIds(sql, profile);
    const sites = allSites.filter((s) => ids.includes(s.id));
    const costs = await loadCostSettings(sql, profile.orgId);
    const norms = profile.orgId ? await ensureOrgNorms(sql, profile.orgId) : DEFAULT_NORMS;
    const factories = await loadFactoryOverviews(sql, sites, today, costs, norms);

    const head = factories.reduce((s, o) => s + o.head, 0);
    const placed = factories.reduce((s, o) => s + o.placed, 0);
    const dayMortality = factories.reduce((s, o) => s + o.dayMortality, 0);
    const morningHead = factories.reduce((s, o) => s + o.morningHead, 0);
    const weightSum = factories.reduce((s, o) => s + o.avgWeightG * o.head, 0);
    const fcrParts = factories.filter((o) => o.fcr > 0);
    const fcr =
      fcrParts.length > 0
        ? fcrParts.reduce((s, o) => s + o.fcr * o.head, 0) / fcrParts.reduce((s, o) => s + o.head, 0)
        : 0;
    const epefParts = factories.filter((o) => o.epef > 0);
    const epef =
      epefParts.length > 0
        ? epefParts.reduce((s, o) => s + o.epef * o.head, 0) / epefParts.reduce((s, o) => s + o.head, 0)
        : 0;
    const costPerKgParts = factories.filter((o) => o.forecast && o.forecast.projectedCostPerKg > 0);
    const costPerKg =
      costPerKgParts.length > 0
        ? costPerKgParts.reduce((s, o) => s + (o.forecast?.projectedCostPerKg ?? 0) * o.head, 0) /
          costPerKgParts.reduce((s, o) => s + o.head, 0)
        : 0;
    const projectedProfit = factories.reduce((s, o) => s + (o.forecast?.projectedProfit ?? 0), 0);
    const projectedCost = factories.reduce((s, o) => s + (o.forecast?.projectedCost ?? 0), 0);
    const projectedLiveKg = factories.reduce((s, o) => {
      const f = o.forecast;
      if (!f) return s;
      return s + (f.projectedHead * f.projectedWeightG) / 1000;
    }, 0);

    return {
      profile,
      today,
      factories,
      totals: {
        head: Math.round(head),
        placed,
        dayMortality: Math.round(dayMortality),
        dayMortPct: morningHead ? (dayMortality / morningHead) * 100 : 0,
        avgWeightG: head ? Math.round(weightSum / head) : 0,
        fcr,
        epef,
        costPerKg,
        projectedProfit,
        projectedProfitability: projectedCost > 0 ? (projectedProfit / projectedCost) * 100 : 0,
        projectedCostPerKg: projectedLiveKg > 0 ? projectedCost / projectedLiveKg : 0,
      },
      thresholds: {
        feedPct: costs.feedAlertPct,
        waterPct: costs.waterAlertPct,
        weightPct: costs.weightAlertPct,
      },
    };
  });

export const getCostTool = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const today = todayISO();
    if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) {
      return {
        profile,
        factories: [] as FactoryOverview[],
        costs: await loadCostSettings(sql, null),
        canEdit: false,
        today,
      };
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const allSites = await loadSites(sql, orgId);
    const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? { ...profile, orgId } : profile);
    const sites = allSites.filter((s) => ids.includes(s.id));
    const costs = await loadCostSettings(sql, orgId);
    const norms = await ensureOrgNorms(sql, orgId);
    const factories = sites.length ? await loadFactoryOverviews(sql, sites, today, costs, norms) : [];
    return {
      profile,
      factories,
      costs,
      canEdit: hasTechAccess(profile) && !isDemoUser(profile),
      today,
    };
  });

export const getSiteDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { siteId: number }) => data)
  .handler(async ({ context, data }): Promise<FactoryDetail> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    await assertSiteOfOrg(sql, profile, data.siteId);
    const rec = await loadSiteById(sql, data.siteId);
    if (!rec) throw new Error("Фабрику не знайдено");
    const sites = await loadSites(sql, rec.orgId);
    const site = sites.find((s) => s.id === data.siteId);
    if (!site) throw new Error("Фабрику не знайдено");
    const today = todayISO();
    const costs = await loadCostSettings(sql, rec.orgId);
    const norms = await ensureOrgNorms(sql, rec.orgId);
    const [factory] = await loadFactoryOverviews(sql, [site], today, costs, norms);
    if (!factory) throw new Error("Фабрику не знайдено");
    return {
      profile,
      factory,
      today,
      thresholds: {
        feedPct: costs.feedAlertPct,
        waterPct: costs.waterAlertPct,
        weightPct: costs.weightAlertPct,
      },
    };
  });

export const getHouseDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { houseId: number; flockId?: number }) => data)
  .handler(async ({ context, data }): Promise<HouseDetail> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const house = await loadHouseById(sql, data.houseId);
    if (!house) throw new Error("Пташник не знайдено");
    await assertSiteOfOrg(sql, profile, house.siteId);
    const rec = await loadSiteById(sql, house.siteId);
    if (!rec) throw new Error("Фабрику не знайдено");
    const site = rec;
    const today = todayISO();
    const costs = await loadCostSettings(sql, rec.orgId);
    const norms = await ensureOrgNorms(sql, rec.orgId);
    const allFlocks = await loadFlocksForHouse(sql, house.id);
    const flock =
      (data.flockId ? allFlocks.find((f) => f.id === data.flockId) : null) ??
      allFlocks.find((f) => f.status === "active") ??
      allFlocks[0] ??
      null;
    const pastFlocks = allFlocks.filter((f) => f.id !== flock?.id);
    const reportsMap = await loadReportsForFlocks(sql, flock ? [flock.id] : []);
    const reports = flock ? (reportsMap.get(flock.id) ?? []) : [];
    const overview = buildHouseOverview(site, house, flock, reports, today, costs, norms);
    let runningFeed = 0;
    let runningStdFeed = 0;
    const series = reports.map((r) => {
      runningFeed += r.feedKg;
      const std = getStandard(r.ageDays, flock?.breed);
      const stdFeedKg = (std.feedGPerBird * r.headStart) / 1000;
      runningStdFeed += stdFeedKg;
      const chick = startWeight(flock?.breed);
      const fcr =
        flock && r.avgWeightG > chick
          ? runningFeed / ((flock.chicksPlaced * (r.avgWeightG - chick)) / 1000)
          : 0;
      const waterMl = r.waterL != null && r.headStart ? (r.waterL * 1000) / r.headStart : null;
      return {
        date: r.reportDate,
        ageDays: r.ageDays,
        weight: r.avgWeightG,
        stdWeight: std.weightG,
        mort: r.mortality + r.culled,
        dayMortPct: r.headStart ? ((r.mortality + r.culled) / r.headStart) * 100 : 0,
        fcr,
        feedKg: round(r.feedKg, 1),
        stdFeedKg: round(stdFeedKg, 1),
        feedGPerBird: r.headStart ? round((r.feedKg * 1000) / r.headStart, 1) : 0,
        stdFeedGPerBird: std.feedGPerBird,
        cumFeedKg: round(runningFeed, 1),
        stdCumFeedKg: round(runningStdFeed, 1),
        waterL: r.waterL,
        stdWaterL: round((std.waterMlPerBird * r.headStart) / 1000, 1),
        waterMlPerBird: waterMl != null ? round(waterMl, 0) : null,
        stdWaterMlPerBird: std.waterMlPerBird,
        tempMin: r.tempMin,
        tempMax: r.tempMax,
        head: r.headEnd,
        soldHead: r.soldHead,
        soldWeightKg: r.soldWeightKg,
        saleAvgG: saleAvgWeightG(r.soldHead, r.soldWeightKg),
      };
    });
    const treatments = flock
      ? await loadFlockTreatmentCalendar(sql, flock.id, rec.orgId)
      : await loadOrgTreatmentCalendar(sql, rec.orgId);
    return { profile, site, house, flock, pastFlocks, overview, reports, series, treatments, canEditTreatments: canEditTreatments(profile) };
  });

export const getReportPrefill = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { houseId?: number; siteId?: number; reportDate?: string } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<ReportFormPrefill> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const today = todayISO();
    const due = yesterdayISO();
    let orgId = profile.orgId;
    if (isPlatformAdmin(profile) && data.houseId) {
      const found = await loadHouseById(sql, data.houseId);
      if (found) {
        const rec = await loadSiteById(sql, found.siteId);
        if (rec) orgId = rec.orgId;
      }
    } else if (isPlatformAdmin(profile) && data.siteId) {
      const rec = await loadSiteById(sql, data.siteId);
      if (rec) orgId = rec.orgId;
    }
    const allSites = await loadSites(sql, orgId);
    const ids = isPlatformAdmin(profile) && orgId ? allSites.map((s) => s.id) : await visibleSiteIds(sql, profile);
    const sites = allSites.filter((s) => ids.includes(s.id));
    const houses = await loadHouses(sql, ids);
    let house =
      (data.houseId ? houses.find((h) => h.id === data.houseId) : null) ??
      (data.siteId ? houses.find((h) => h.siteId === data.siteId) : null) ??
      (profile.siteId ? houses.find((h) => h.siteId === profile.siteId) : null) ??
      houses[0] ??
      null;
    if (house) assertCanAccessSite(profile, house.siteId);
    const flock = house ? await loadFlockForHouse(sql, house.id) : null;
    const reportsMap = await loadReportsForFlocks(sql, flock ? [flock.id] : []);
    const reports = flock ? (reportsMap.get(flock.id) ?? []) : [];
    const minDate = flock?.placedAt ?? null;
    const horizon =
      flock?.status === "closed" && flock.closedAt && flock.closedAt < due ? flock.closedAt : due;
    const maxDate = today;
    const missingDates = flock
      ? eachDateISO(flock.placedAt, horizon).filter((d) => !reports.some((r) => r.reportDate === d))
      : [];
    let reportDate = data.reportDate && /^\d{4}-\d{2}-\d{2}$/.test(data.reportDate) ? data.reportDate : "";
    if (minDate && reportDate && reportDate < minDate) reportDate = minDate;
    if (reportDate && reportDate > maxDate) reportDate = maxDate;
    if (!reportDate) reportDate = missingDates[0] ?? due;
    if (minDate && reportDate < minDate) reportDate = minDate;
    if (reportDate > maxDate) reportDate = maxDate;
    const existing = reports.find((r) => r.reportDate === reportDate) ?? null;
    const existingToday = reports.find((r) => r.reportDate === today) ?? null;
    const previous =
      reports
        .filter((r) => r.reportDate < reportDate)
        .sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0] ?? null;
    const ageDays = flock ? Math.max(0, diffDays(flock.placedAt, reportDate)) : 0;
    const std = getStandard(ageDays, flock?.breed);
    const costs = await loadCostSettings(sql, orgId);
    const norms = orgId ? await ensureOrgNorms(sql, orgId) : DEFAULT_NORMS;
    const rh = humidityFromNorms(ageDays, norms);
    const prior = reports.filter((r) => r.reportDate < reportDate);
    const site = house ? sites.find((s) => s.id === house.siteId) ?? null : null;
    let weather = null as ReportFormPrefill["weather"];
    let weatherError: string | null = null;
    if (site?.lat != null && site?.lon != null) {
      try {
        weather = await loadWeather({
          lat: site.lat,
          lon: site.lon,
          place: site.geoName ?? site.name,
          date: reportDate,
        });
      } catch (err) {
        weatherError = err instanceof Error ? err.message : "Немає прогнозу";
      }
    }
    return {
      profile,
      sites,
      houses,
      house,
      flock,
      previous,
      existing,
      existingToday,
      today,
      reportDate,
      minDate,
      maxDate,
      missingDates,
      ageDays,
      std: flock
        ? {
            weightG: std.weightG,
            feedGPerBird: std.feedGPerBird,
            waterMlPerBird: std.waterMlPerBird,
            dailyMortPct: std.dailyMortPct,
            dailyGainG: std.dailyGainG,
            tempMin: std.tempMin,
            tempMax: std.tempMax,
            humidityMin: rh.min,
            humidityMax: rh.max,
          }
        : null,
      weather,
      weatherError,
      density:
        house && flock && (existing || previous)
          ? forecastDensity({
              head: (existing ?? previous)!.headEnd,
              avgWeightG: (existing ?? previous)!.avgWeightG,
              ageDays: (existing ?? previous)!.ageDays,
              areaM2: house.areaM2,
              recentAdgG: recentAdg(reports),
              breed: flock.breed,
              reportDate: (existing ?? previous)!.reportDate,
              limitKgM2: norms.densityLimitKgM2,
              warnDays: norms.densityWarnDays,
            })
          : null,
      thresholds: {
        feedPct: costs.feedAlertPct,
        waterPct: costs.waterAlertPct,
        weightPct: costs.weightAlertPct,
      },
      cumFeedBefore: prior.reduce((s, r) => s + r.feedKg, 0),
      priorSoldHead: prior.reduce((s, r) => s + r.soldHead, 0),
      priorSoldKg: prior.reduce((s, r) => s + r.soldWeightKg, 0),
      chickG: startWeight(flock?.breed),
      withdrawal: activeWithdrawals(
        reports.map((r) => ({ date: r.reportDate, meds: r.meds })),
        reportDate,
      ),
    };
  });

export const saveDailyReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    houseId: number;
    reportDate: string;
    mortality: number;
    culled: number;
    avgWeightG: number;
    feedKg: number;
    waterL: number | null;
    tempMin: number | null;
    tempMax: number | null;
    humidityPct: number | null;
    droppingLook: string;
    litterState: string;
    notes: string;
    soldHead?: number;
    soldWeightKg?: number;
    medsNone?: boolean;
    meds?: unknown;
    droppingPhoto?: string | null;
  }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const house = await loadHouseById(sql, data.houseId);
    if (!house) throw new Error("Пташник не знайдено");
    await assertSiteOfOrg(sql, profile, house.siteId);
    const flock = await loadFlockForHouse(sql, house.id);
    if (!flock) throw new Error("Немає посадки в цьому пташнику");
    const look = parseDroppingLook(data.droppingLook);
    const litter = parseLitterState(data.litterState);
    if (!look || !litter) throw new Error("Вкажіть вигляд посліду і стан підстилки");
    const meds = data.medsNone ? [] : parseWaterMeds(data.meds);
    if (!data.medsNone && meds.length === 0) {
      throw new Error("Вкажіть препарати на випоюванні або позначте, що випоювання немає");
    }
    const today = todayISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reportDate)) throw new Error("Некоректна дата звіту");
    if (data.reportDate < flock.placedAt) {
      throw new Error("Дата звіту не може бути раніше посадки");
    }
    if (data.reportDate > today) {
      throw new Error("Не можна подати звіт на майбутнє");
    }
    const reportsMap = await loadReportsForFlocks(sql, [flock.id]);
    const reports = reportsMap.get(flock.id) ?? [];
    const existing = reports.find((r) => r.reportDate === data.reportDate);
    if (
      flock.status === "closed" &&
      flock.closedAt &&
      data.reportDate > flock.closedAt &&
      !existing
    ) {
      throw new Error("Посадку вже здано. Відредагуйте звіт продажу або відкрийте нову посадку");
    }
    const ageDays = Math.max(0, diffDays(flock.placedAt, data.reportDate));
    const previous =
      reports
        .filter((r) => r.reportDate < data.reportDate)
        .sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0] ?? null;
    const headStart = previous?.headEnd ?? flock.chicksPlaced;
    const mort = Math.max(0, Math.round(data.mortality));
    const culled = Math.max(0, Math.round(data.culled));
    const sold = Math.max(0, Math.round(data.soldHead ?? 0));
    const soldKg = Math.max(0, Number(data.soldWeightKg ?? 0));
    if (mort + culled >= headStart) throw new Error("Падіж не може перевищувати поголів'я");
    if (mort + culled + sold > headStart) {
      throw new Error("Продаж не може перевищувати залишок після падежу");
    }
    if (sold > 0 && soldKg <= 0) throw new Error("Вкажіть загальну вагу продажу");
    if (soldKg > 0 && sold <= 0) throw new Error("Вкажіть кількість проданих голів");
    if (!Number.isFinite(data.avgWeightG) || data.avgWeightG < 0) {
      throw new Error("Вкажіть середню масу");
    }
    if (!Number.isFinite(data.feedKg) || data.feedKg < 0) {
      throw new Error("Вкажіть корм");
    }
    if (data.humidityPct != null && (data.humidityPct < 10 || data.humidityPct > 100)) {
      throw new Error("Вологість має бути від 10 до 100%");
    }
    const saleAvg = saleAvgWeightG(sold, soldKg);
    const headEnd = headStart - mort - culled - sold;
    let avgWeightG = Math.round(data.avgWeightG || 0);
    if (saleAvg && (headEnd === 0 || !avgWeightG)) avgWeightG = Math.round(saleAvg);
    if (avgWeightG <= 0) throw new Error("Вкажіть середню масу");
    const photoRaw = data.droppingPhoto;
    const photo =
      photoRaw === ""
        ? null
        : typeof photoRaw === "string" && photoRaw.startsWith("data:image/") && photoRaw.length < 180_000
          ? photoRaw
          : existing?.droppingPhoto ?? null;
    let reportId = existing?.id ?? 0;
    if (existing) {
      await sql.query(
        `update daily_reports set
           age_days = $1, head_start = $2, mortality = $3, culled = $4, head_end = $5,
           avg_weight_g = $6, feed_kg = $7, water_l = $8, temp_min = $9, temp_max = $10,
           humidity_pct = $11, dropping_look = $12, litter_state = $13, notes = $14, submitted_by = $15,
           sold_head = $16, sold_weight_kg = $17, dropping_photo = $18, updated_at = now()
         where id = $19`,
        [
          ageDays,
          headStart,
          mort,
          culled,
          headEnd,
          avgWeightG,
          data.feedKg,
          data.waterL,
          data.tempMin,
          data.tempMax,
          data.humidityPct,
          look,
          litter,
          data.notes.trim(),
          context.userId,
          sold,
          soldKg,
          photo,
          existing.id,
        ],
      );
    } else {
      let inserted: { id: number }[];
      try {
        inserted = await sql.query<{ id: number }>(
        `insert into daily_reports (
           flock_id, report_date, age_days, head_start, mortality, culled, head_end,
           avg_weight_g, feed_kg, water_l, temp_min, temp_max, humidity_pct,
           dropping_look, litter_state, notes, submitted_by,
           sold_head, sold_weight_kg, dropping_photo
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         returning id`,
        [
          flock.id,
          data.reportDate,
          ageDays,
          headStart,
          mort,
          culled,
          headEnd,
          avgWeightG,
          data.feedKg,
          data.waterL,
          data.tempMin,
          data.tempMax,
          data.humidityPct,
          look,
          litter,
          data.notes.trim(),
          context.userId,
          sold,
          soldKg,
          photo,
        ],
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (/unique|duplicate/i.test(msg)) {
          throw new Error("Звіт за цю дату вже є — відкрийте його і змініть");
        }
        throw err;
      }
      reportId = inserted[0]?.id ?? 0;
      const site = await loadSiteById(sql, house.siteId);
      if (site) {
        await notifyNewReport(sql, {
          orgId: site.orgId,
          siteId: site.id,
          houseId: house.id,
          houseName: house.name,
          siteName: site.name,
          reportDate: data.reportDate,
          actor: profile,
        });
      }
    }
    if (reportId) await replaceReportMeds(sql, reportId, meds);
    {
      const siteForLog = await loadSiteById(sql, house.siteId);
      if (siteForLog) {
        await writeJournal(sql, {
          orgId: siteForLog.orgId,
          siteId: siteForLog.id,
          actor: profile,
          action: existing ? "update" : "create",
          entity: "report",
          summary: existing
            ? `Змінено звіт ${data.reportDate} · ${siteForLog.name}, ${house.name}`
            : `Створено звіт ${data.reportDate} · ${siteForLog.name}, ${house.name}`,
          href: `/houses/${house.id}`,
        });
      }
    }
    await rebuildReportHeads(sql, flock.id);
    const status = await syncFlockStatus(sql, flock.id);
    const afterMap = await loadReportsForFlocks(sql, [flock.id]);
    const after = afterMap.get(flock.id) ?? [];
    const saved = after.find((r) => r.reportDate === data.reportDate);
    if (!existing && saved) {
      const siteRec = await loadSiteById(sql, house.siteId);
      const norms = siteRec ? await ensureOrgNorms(sql, siteRec.orgId) : DEFAULT_NORMS;
      const dens = forecastDensity({
        head: saved.headEnd,
        avgWeightG: saved.avgWeightG,
        ageDays: saved.ageDays,
        areaM2: house.areaM2,
        recentAdgG: recentAdg(after),
        breed: flock.breed,
        reportDate: saved.reportDate,
        limitKgM2: norms.densityLimitKgM2,
        warnDays: norms.densityWarnDays,
      });
      if (dens.warn) {
        const site = await loadSiteById(sql, house.siteId);
        if (site) {
          await notifyDensity(sql, {
            orgId: site.orgId,
            siteId: site.id,
            houseId: house.id,
            houseName: house.name,
            siteName: site.name,
            density: dens,
          });
        }
      }
    }
    const savedId = saved?.id ?? existing?.id ?? 0;
    const due = addDaysISO(today, -1);
    const horizon = status.closed && saved ? saved.reportDate : due;
    const remainingDates = eachDateISO(flock.placedAt, horizon).filter(
      (d) => !after.some((r) => r.reportDate === d),
    );
    const cumSoldKg = after
      .filter((r) => r.reportDate <= data.reportDate)
      .reduce((s, r) => s + r.soldWeightKg, 0);
    const saleFcr =
      sold > 0
        ? fcrAtSale({
            cumFeedKg: cumFeed(after, data.reportDate),
            cumSoldWeightKg: cumSoldKg,
            remainingHead: saved?.headEnd ?? headEnd,
            remainingAvgG: saved?.avgWeightG || saleAvg,
            placed: flock.chicksPlaced,
            breed: flock.breed,
          })
        : 0;
    return {
      ok: true,
      id: savedId,
      headEnd: saved?.headEnd ?? headEnd,
      nextDate: remainingDates[0] ?? null,
      missingLeft: remainingDates.length,
      soldHead: sold,
      soldWeightKg: soldKg,
      saleAvgG: saleAvg,
      saleFcr,
      closed: status.closed,
    };
  });

export const getPeriodReport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { from: string; to: string; siteId?: number | null; orgId?: number }) => data)
  .handler(async ({ context, data }): Promise<{ profile: Profile; rows: PeriodRow[]; sites: Site[] }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const orgId = data.orgId
      ? await resolveOrgId(sql, profile, data.orgId)
      : isPlatformAdmin(profile)
        ? profile.orgId
        : profile.orgId;
    const allSites = await loadSites(sql, orgId);
    const vis = isPlatformAdmin(profile) && orgId
      ? allSites.map((s) => s.id)
      : await visibleSiteIds(sql, profile);
    const ids = vis;
    const siteFilter = data.siteId && ids.includes(data.siteId) ? [data.siteId] : ids;
    if (!siteFilter.length) return { profile, rows: [], sites: [] };
    const ph = siteFilter.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await sql.query<{
      report_date: string;
      site_id: number;
      site_name: string;
      house_id: number;
      house_name: string;
      age_days: number;
      mortality: number;
      culled: number;
      head_end: number;
      avg_weight_g: number;
      feed_kg: string | number;
      notes: string;
      chicks_placed: number;
      breed: string;
      cum_feed: string | number;
      sold_head: number;
      sold_weight_kg: string | number;
      cum_sold_kg: string | number;
    }>(
      `select r.report_date, s.id as site_id, s.name as site_name,
              h.id as house_id, h.name as house_name,
              r.age_days, r.mortality, r.culled,
              r.head_end, r.avg_weight_g, r.feed_kg, r.notes, f.chicks_placed, f.breed,
              coalesce(r.sold_head, 0) as sold_head, coalesce(r.sold_weight_kg, 0) as sold_weight_kg,
              (select coalesce(sum(x.feed_kg),0) from daily_reports x
                where x.flock_id = r.flock_id and x.report_date <= r.report_date) as cum_feed,
              (select coalesce(sum(x.sold_weight_kg),0) from daily_reports x
                where x.flock_id = r.flock_id and x.report_date <= r.report_date) as cum_sold_kg
         from daily_reports r
         join flocks f on f.id = r.flock_id
         join houses h on h.id = f.house_id
         join sites s on s.id = f.site_id
        where s.id in (${ph})
          and r.report_date between $${siteFilter.length + 1} and $${siteFilter.length + 2}
        order by r.report_date desc, s.sort_order, h.sort_order`,
      [...siteFilter, data.from, data.to],
    );
    const mapped: PeriodRow[] = rows.map((r) => {
      const cum = num(r.cum_feed);
      const soldHead = Number(r.sold_head ?? 0);
      const soldWeightKg = num(r.sold_weight_kg);
      const saleAvgG = saleAvgWeightG(soldHead, soldWeightKg);
      const remainingAvg = r.avg_weight_g || saleAvgG;
      const saleFcr =
        soldHead > 0
          ? fcrAtSale({
              cumFeedKg: cum,
              cumSoldWeightKg: num(r.cum_sold_kg),
              remainingHead: r.head_end,
              remainingAvgG: remainingAvg,
              placed: r.chicks_placed,
              breed: r.breed,
            })
          : r.avg_weight_g > startWeight(r.breed)
            ? cum / ((r.chicks_placed * (r.avg_weight_g - startWeight(r.breed))) / 1000)
            : 0;
      const chick = startWeight(r.breed);
      const fcr =
        r.avg_weight_g > chick ? cum / ((r.chicks_placed * (r.avg_weight_g - chick)) / 1000) : 0;
      return {
        date: r.report_date,
        siteId: r.site_id,
        siteName: r.site_name,
        houseId: r.house_id,
        houseName: r.house_name,
        ageDays: r.age_days,
        mortality: r.mortality,
        culled: r.culled,
        head: r.head_end,
        avgWeightG: r.avg_weight_g,
        feedKg: num(r.feed_kg),
        fcr,
        soldHead,
        soldWeightKg,
        saleAvgG,
        saleFcr,
        notes: r.notes,
      };
    });
    return {
      profile,
      rows: mapped,
      sites: allSites.filter((s) => ids.includes(s.id)),
    };
  });

export const getTeam = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<{ profile: Profile; members: TeamMember[]; sites: Site[]; inviteCode: string | null }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const sites = await loadSites(sql, orgId);
    const orgRows = await sql.query<{ invite_code: string }>(
      "select invite_code from organizations where id = $1",
      [orgId],
    );
    const rows = await sql.query<{
      user_id: string;
      role: string;
      site_id: number | null;
      full_name: string | null;
      email: string | null;
      created_at: string;
    }>(
      "select user_id, role, site_id, full_name, email, created_at from staff_profiles where org_id = $1 order by created_at",
      [orgId],
    );
    const members: TeamMember[] = rows.map((r) => ({
      userId: r.user_id,
      role: r.role as Role,
      siteId: r.site_id,
      siteName: sites.find((s) => s.id === r.site_id)?.name ?? null,
      fullName: r.full_name,
      email: r.email,
      createdAt: String(r.created_at),
    }));
    return { profile, members, sites, inviteCode: orgRows[0]?.invite_code ?? null };
  });

export const assignStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    userId: string;
    role: Role;
    siteId: number | null;
    fullName?: string;
    email?: string;
    orgId?: number;
  }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    if (data.userId === context.userId && !isPlatformAdmin(profile) && hasTechAccess(profile) && data.role !== profile.role) {
      throw new Error("Не можна зняти з себе роль з повним доступом");
    }
    if (factoryRequired(data.role) && !data.siteId) {
      throw new Error("Призначте фабрику керівнику");
    }
    const siteId = factorySelectable(data.role) ? data.siteId : null;
    if (siteId) await assertSiteOfOrg(sql, profile, siteId);
    const fullName = data.fullName?.trim() || null;
    const email = data.email?.trim().toLowerCase() || null;
    if (email) {
      const taken = await sql.query<{ id: string }>(
        `select id from "user" where lower(email) = $1 and id <> $2`,
        [email, data.userId],
      );
      if (taken[0]) throw new Error("Цей email уже зайнятий");
    }
    const updated = await sql.query<{ user_id: string }>(
      `update staff_profiles
          set role = $2,
              site_id = $3,
              full_name = coalesce($4, full_name),
              email = coalesce($5, email)
        where user_id = $1 and org_id = $6
        returning user_id`,
      [data.userId, data.role, siteId, fullName, email, orgId],
    );
    if (!updated[0]) throw new Error("Користувача не знайдено в цьому господарстві");
    if (fullName || email) {
      await sql.query(
        `update "user"
            set name = coalesce($2, name),
                email = coalesce($3, email),
                "updatedAt" = now()
          where id = $1`,
        [data.userId, fullName, email],
      );
    }
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "assign",
      entity: "staff",
      summary: `Призначено: ${fullName || email || data.userId} · ${roleLabel(data.role)}${
        siteId ? ` · фабрика №${siteId}` : ""
      }`,
      href: `/team?org=${orgId}`,
    });
    return { ok: true };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { fullName: string; email: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    await ensureProfile(sql, context.userId, hint);
    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    if (!fullName) throw new Error("Вкажіть ПІБ");
    if (!email || !email.includes("@")) throw new Error("Вкажіть коректний email");
    const taken = await sql.query<{ id: string }>(
      `select id from "user" where lower(email) = $1 and id <> $2`,
      [email, context.userId],
    );
    if (taken[0]) throw new Error("Цей email уже зайнятий");
    await sql.query(
      "update staff_profiles set full_name = $2, email = $3 where user_id = $1",
      [context.userId, fullName, email],
    );
    await sql.query(
      `update "user" set name = $2, email = $3, "updatedAt" = now() where id = $1`,
      [context.userId, fullName, email],
    );
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (!canManageFlocks(profile)) {
      throw new Error("Немає права керувати посадками");
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const allSites = await loadSites(sql, orgId);
    const sites =
      isPlatformAdmin(profile) || (seesAllFactories(profile) && profile.orgId === orgId)
        ? allSites
        : allSites.filter((s) => s.id === profile.siteId);
    const ids = sites.map((s) => s.id);
    const houses = await loadHouses(sql, ids);
    const flocks = await loadActiveFlocks(sql, ids);
    const costs = canManageOps(profile) ? await loadCostSettings(sql, orgId) : null;
    const orgRows = await sql.query<{ name: string }>("select name from organizations where id = $1", [
      orgId,
    ]);
    return { profile, costs, sites, houses, flocks, orgId, orgName: orgRows[0]?.name ?? null };
  });

export const saveCosts = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: CostSettings & { orgId?: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isDemoUser(profile)) throw new Error("Демо не змінює параметри собівартості");
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    await ensureCostSettings(sql, orgId);
    await sql.query(
      `update cost_settings set
         feed_price_uah = $1, chick_price_uah = $2, live_weight_price_uah = $3,
         other_per_bird_uah = $4, gas_per_bird_uah = $5, meds_per_bird_uah = $6,
         feed_alert_pct = $8, water_alert_pct = $9, weight_alert_pct = $10,
         updated_at = now(), updated_by = $7
       where org_id = $11`,
      [
        data.feedPriceUah,
        data.chickPriceUah,
        data.liveWeightPriceUah,
        data.otherPerBirdUah,
        data.gasPerBirdUah,
        data.medsPerBirdUah,
        context.userId,
        data.feedAlertPct,
        data.waterAlertPct,
        data.weightAlertPct,
        orgId,
      ],
    );
    return { ok: true };
  });

export const saveSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; name: string; location: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    await assertSiteOfOrg(sql, profile, data.id);
    const orgId = await siteOrgId(sql, data.id);
    await sql.query("update sites set name = $2, location = $3 where id = $1 and org_id = $4", [
      data.id,
      data.name.trim(),
      data.location.trim(),
      orgId,
    ]);
    await writeJournal(sql, {
      orgId,
      siteId: data.id,
      actor: profile,
      action: "update",
      entity: "site",
      summary: `Змінено фабрику «${data.name.trim()}»`,
      href: `/sites/${data.id}`,
    });
    return { ok: true };
  });

export const searchPlaces = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    return geocodePlaces(data.query);
  });

export const saveSiteGeo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { siteId: number; geoName: string; geoAdmin: string | null; lat: number; lon: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertCanManageFlocks(profile, data.siteId);
    await assertSiteOfOrg(sql, profile, data.siteId);
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lon)) {
      throw new Error("Некоректні координати");
    }
    const name = data.geoName.trim();
    if (!name) throw new Error("Вкажіть населений пункт");
    const orgId = await siteOrgId(sql, data.siteId);
    await sql.query(
      "update sites set geo_name = $2, geo_admin = $3, lat = $4, lon = $5 where id = $1 and org_id = $6",
      [data.siteId, name, data.geoAdmin?.trim() || null, data.lat, data.lon, orgId],
    );
    return { ok: true };
  });

export const saveHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; name: string; capacity: number; areaM2?: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const houseRows = await sql.query<{ site_id: number; org_id: number }>(
      `select h.site_id, s.org_id from houses h
         join sites s on s.id = h.site_id
        where h.id = $1`,
      [data.id],
    );
    if (!houseRows[0]) throw new Error("Пташник не знайдено");
    await assertSiteOfOrg(sql, profile, houseRows[0].site_id);
    const orgId = houseRows[0].org_id;
    const cap = Math.max(0, Math.round(data.capacity));
    const area =
      data.areaM2 != null && Number.isFinite(data.areaM2)
        ? Math.max(0, Math.round(data.areaM2))
        : Math.round(cap / 18);
    await sql.query("update houses set name = $2, capacity = $3, area_m2 = $4 where id = $1", [
      data.id,
      data.name.trim(),
      cap,
      area,
    ]);
    await writeJournal(sql, {
      orgId,
      siteId: houseRows[0].site_id,
      actor: profile,
      action: "update",
      entity: "house",
      summary: `Змінено пташник «${data.name.trim()}»`,
      href: `/houses/${data.id}`,
    });
    return { ok: true };
  });

export const addHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { siteId: number; capacity: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    await assertSiteOfOrg(sql, profile, data.siteId);
    const existing = await loadHouses(sql, [data.siteId]);
    const n = existing.length + 1;
    const cap = Math.max(1000, Math.round(data.capacity));
    const rows = await sql.query<{ id: number }>(
      `insert into houses (site_id, code, name, capacity, area_m2, sort_order)
       values ($1, $2, $3, $4, $5, $6) returning id`,
      [data.siteId, `H${n}`, `Пташник ${n}`, cap, Math.round(cap / 18), n],
    );
    await sql.query(
      `update sites set houses = (select count(*) from houses where site_id = $1),
                        capacity = (select coalesce(sum(capacity),0) from houses where site_id = $1)
        where id = $1`,
      [data.siteId],
    );
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, data.siteId),
      siteId: data.siteId,
      actor: profile,
      action: "create",
      entity: "house",
      summary: `Додано пташник ${n}`,
      href: `/houses/${rows[0].id}`,
    });
    return { ok: true, id: rows[0].id };
  });

async function refreshSiteHouseStats(sql: Awaited<ReturnType<typeof getSql>>, siteId: number) {
  await sql.query(
    `update sites set houses = (select count(*) from houses where site_id = $1),
                      capacity = (select coalesce(sum(capacity),0) from houses where site_id = $1)
      where id = $1`,
    [siteId],
  );
}

export const deleteHouse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { houseId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const house = await sql.query<{ id: number; site_id: number; name: string }>(
      "select id, site_id, name from houses where id = $1",
      [data.houseId],
    );
    if (!house[0]) throw new Error("Пташник не знайдено");
    await assertSiteOfOrg(sql, profile, house[0].site_id);
    const flocks = await sql.query<{ id: number; code: string }>(
      "select id, code from flocks where house_id = $1",
      [data.houseId],
    );
    if (flocks[0]) {
      throw new Error(
        `У «${house[0].name}» є посадка ${flocks.map((f) => f.code).join(", ")}. Спочатку відправте її в кошик у Параметрах, тоді можна прибрати пташник.`,
      );
    }
    const count = await sql.query<{ c: number }>(
      "select count(*)::int as c from houses where site_id = $1",
      [house[0].site_id],
    );
    if ((count[0]?.c ?? 0) <= 1) {
      throw new Error("На фабриці має лишитися хоча б один пташник");
    }
    await sql.query("delete from houses where id = $1", [data.houseId]);
    await refreshSiteHouseStats(sql, house[0].site_id);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, house[0].site_id),
      siteId: house[0].site_id,
      actor: profile,
      action: "delete",
      entity: "house",
      summary: `Прибрано зайвий пташник «${house[0].name}»`,
    });
    return { ok: true };
  });

export const setSiteHouseCount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { siteId: number; houseCount: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    await assertSiteOfOrg(sql, profile, data.siteId);
    const want = Math.min(24, Math.max(1, Math.round(data.houseCount)));
    const houses = await sql.query<{ id: number; name: string; capacity: number; sort_order: number }>(
      "select id, name, capacity, sort_order from houses where site_id = $1 order by sort_order, id",
      [data.siteId],
    );
    const current = houses.length;
    if (want === current) return { ok: true, added: 0, removed: 0 };
    if (want > current) {
      const cap = houses.at(-1)?.capacity || 9000;
      for (let i = current + 1; i <= want; i += 1) {
        await sql.query(
          `insert into houses (site_id, code, name, capacity, area_m2, sort_order)
           values ($1, $2, $3, $4, $5, $6)`,
          [data.siteId, `H${i}`, `Пташник ${i}`, cap, Math.round(cap / 18), i],
        );
      }
      await refreshSiteHouseStats(sql, data.siteId);
      await writeJournal(sql, {
        orgId: await siteOrgId(sql, data.siteId),
        siteId: data.siteId,
        actor: profile,
        action: "update",
        entity: "site",
        summary: `Кількість пташників змінено з ${current} на ${want}`,
      });
      return { ok: true, added: want - current, removed: 0 };
    }
    const occupied = await sql.query<{ house_id: number; code: string }>(
      "select house_id, code from flocks where house_id = any($1::int[])",
      [houses.map((h) => h.id)],
    );
    const busy = new Set(occupied.map((r) => r.house_id));
    const extras = [...houses].reverse();
    const toDrop: number[] = [];
    for (const h of extras) {
      if (houses.length - toDrop.length <= want) break;
      if (busy.has(h.id)) continue;
      toDrop.push(h.id);
    }
    if (houses.length - toDrop.length > want) {
      const blockers = extras.filter((h) => busy.has(h.id) && !toDrop.includes(h.id)).map((h) => h.name);
      throw new Error(
        `Не можна зменшити до ${want}: зайняті ${blockers.join(", ")}. Відправте їхні посадки в кошик, тоді повторіть.`,
      );
    }
    for (const id of toDrop) {
      await sql.query("delete from houses where id = $1", [id]);
    }
    await refreshSiteHouseStats(sql, data.siteId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, data.siteId),
      siteId: data.siteId,
      actor: profile,
      action: "update",
      entity: "site",
      summary: `Кількість пташників змінено з ${current} на ${want}`,
    });
    return { ok: true, added: 0, removed: toDrop.length };
  });

export const placeFlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    houseId: number;
    placedAt: string;
    chicksPlaced: number;
    chickCostUah: number;
    targetDays: number;
    targetWeightG: number;
    breed: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const house = await loadHouseById(sql, data.houseId);
    if (!house) throw new Error("Пташник не знайдено");
    await assertSiteOfOrg(sql, profile, house.siteId);
    assertCanManageFlocks(profile, house.siteId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.placedAt)) throw new Error("Некоректна дата посадки");
    if (data.placedAt > todayISO()) throw new Error("Дата посадки не може бути в майбутньому");
    const chicks = Math.round(data.chicksPlaced);
    if (chicks < 1) throw new Error("Вкажіть поголівʼя посадки");
    await sql.query(
      "update flocks set status = 'closed', closed_at = $2 where house_id = $1 and status = 'active'",
      [data.houseId, todayISO()],
    );
    const rec = await loadSiteById(sql, house.siteId);
    const code = `П-${data.placedAt.slice(2, 7).replace("-", "")}-${rec?.code ?? house.siteId}${house.code}`;
    const breed = data.breed.trim() || "Ross 308";
    let rows: { id: number }[];
    try {
      rows = await sql.query<{ id: number }>(
      `insert into flocks (site_id, house_id, code, breed, placed_at, chicks_placed, chick_cost_uah, target_days, target_weight_g, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') returning id`,
      [
        house.siteId,
        house.id,
        code,
        breed,
        data.placedAt,
        chicks,
        data.chickCostUah,
        data.targetDays,
        data.targetWeightG,
      ],
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/unique|duplicate/i.test(msg)) {
        throw new Error("У цьому пташнику вже є активна посадка");
      }
      throw err;
    }
    await writeJournal(sql, {
      orgId: rec?.orgId ?? (await siteOrgId(sql, house.siteId)),
      siteId: house.siteId,
      actor: profile,
      action: "create",
      entity: "flock",
      summary: `Нова посадка ${code} · ${house.name} · ${chicks} гол. · ${breed}`,
      href: `/houses/${house.id}`,
    });
    if (rec?.orgId) {
      await copyOrgCalendarToFlock(sql, rows[0].id, rec.orgId, context.userId);
    }
    return { ok: true, id: rows[0].id, code };
  });

export const saveFlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    flockId: number;
    chicksPlaced: number;
    placedAt: string;
    breed: string;
    chickCostUah?: number;
    targetDays?: number;
    targetWeightG?: number;
  }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const rows = await sql.query<FlockRow>(`select ${FLOCK_COLS} from flocks where id = $1`, [data.flockId]);
    if (!rows[0]) throw new Error("Посадку не знайдено");
    const flock = mapFlock(rows[0]);
    await assertSiteOfOrg(sql, profile, flock.siteId);
    assertCanManageFlocks(profile, flock.siteId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.placedAt)) throw new Error("Некоректна дата посадки");
    if (data.placedAt > todayISO()) throw new Error("Дата посадки не може бути в майбутньому");
    const chicks = Math.round(data.chicksPlaced);
    if (chicks < 1) throw new Error("Вкажіть поголівʼя посадки");
    const breed = data.breed.trim();
    if (!breed) throw new Error("Вкажіть крос");
    const reportsMap = await loadReportsForFlocks(sql, [flock.id]);
    const reports = reportsMap.get(flock.id) ?? [];
    if (reports.some((r) => r.reportDate < data.placedAt)) {
      throw new Error("Є звіти раніше нової дати посадки");
    }
    const spent = reports.reduce((s, r) => s + r.mortality + r.culled + r.soldHead, 0);
    if (chicks <= spent && spent > 0) {
      throw new Error(`Поголівʼя ${chicks} не покриває вже списані ${spent} гол.`);
    }
    await sql.query(
      `update flocks
          set chicks_placed = $2,
              placed_at = $3,
              breed = $4,
              chick_cost_uah = coalesce($5, chick_cost_uah),
              target_days = coalesce($6, target_days),
              target_weight_g = coalesce($7, target_weight_g)
        where id = $1`,
      [
        flock.id,
        chicks,
        data.placedAt,
        breed,
        data.chickCostUah ?? null,
        data.targetDays ?? null,
        data.targetWeightG ?? null,
      ],
    );
    for (const r of reports) {
      await sql.query("update daily_reports set age_days = $2 where id = $1", [
        r.id,
        Math.max(0, diffDays(data.placedAt, r.reportDate)),
      ]);
    }
    await rebuildReportHeads(sql, flock.id);
    await syncFlockStatus(sql, flock.id);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, flock.siteId),
      siteId: flock.siteId,
      actor: profile,
      action: "update",
      entity: "flock",
      summary: `Змінено посадку ${flock.code} · ${chicks} гол. · ${breed} · ${data.placedAt}`,
      href: `/houses/${flock.houseId}`,
    });
    return { ok: true };
  });

export const saveFlockBreed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { flockId: number; breed: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const rows = await sql.query<{ site_id: number }>("select site_id from flocks where id = $1", [
      data.flockId,
    ]);
    if (!rows[0]) throw new Error("Посадку не знайдено");
    await assertSiteOfOrg(sql, profile, rows[0].site_id);
    assertCanManageFlocks(profile, rows[0].site_id);
    const breed = data.breed.trim();
    if (!breed) throw new Error("Вкажіть крос");
    await sql.query("update flocks set breed = $2 where id = $1", [data.flockId, breed]);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, rows[0].site_id),
      siteId: rows[0].site_id,
      actor: profile,
      action: "update",
      entity: "flock",
      summary: `Змінено крос посадки на ${breed}`,
    });
    return { ok: true };
  });

export const deleteFlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { flockId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const rows = await sql.query<{ site_id: number }>("select site_id from flocks where id = $1", [
      data.flockId,
    ]);
    if (!rows[0]) throw new Error("Посадку не знайдено");
    await assertSiteOfOrg(sql, profile, rows[0].site_id);
    assertCanManageFlocks(profile, rows[0].site_id);
    const archived = await archiveFlock(sql, data.flockId, context.userId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, archived.siteId),
      siteId: archived.siteId,
      actor: profile,
      action: "delete",
      entity: "flock",
      summary: `Посадку ${archived.code} відправлено в кошик. Звіти збережено.`,
      href: "/journal",
    });
    return { ok: true };
  });

export const deleteDailyReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { reportId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const peek = await sql.query<{ site_id: number }>(
      `select f.site_id from daily_reports r join flocks f on f.id = r.flock_id where r.id = $1`,
      [data.reportId],
    );
    if (!peek[0]) throw new Error("Звіт не знайдено");
    await assertSiteOfOrg(sql, profile, peek[0].site_id);
    if (!canDeleteReports(profile)) {
      throw new Error("Видалити звіт може головний технолог, партнер або адміністратор");
    }
    const archived = await archiveReport(sql, data.reportId, context.userId);
    await rebuildReportHeads(sql, archived.flockId);
    await syncFlockStatus(sql, archived.flockId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, archived.siteId),
      siteId: archived.siteId,
      actor: profile,
      action: "delete",
      entity: "report",
      summary: `Звіт ${archived.reportDate} у кошику. Можна повернути з журналу.`,
      href: "/journal",
    });
    return { ok: true };
  });

export const wipeOperations = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    if (isDemoUser(profile)) {
      throw new Error("Демо не очищає вітрину. Хазяїн сайту оновлює її в розділі Господарства.");
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const n = await archiveOrgFlocks(sql, orgId, context.userId);
    await sql.query("update cost_settings set ops_reset = 1 where org_id = $1", [orgId]);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "delete",
      entity: "org",
      summary: n
        ? `Посадки (${n}) відправлено в кошик. Звіти можна повернути з журналу.`
        : "Посадок не було",
    });
    return { ok: true };
  });

export const getRecycleBin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<{ profile: Profile; bin: RecycleBin }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const empty = { flocks: [] as RecycleBin["flocks"], reports: [] as RecycleBin["reports"] };
    if (isDemoUser(profile)) return { profile, bin: empty };
    if (!canManageFlocks(profile) && !canDeleteReports(profile) && !isPlatformAdmin(profile)) {
      return { profile, bin: empty };
    }
    if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) {
      return { profile, bin: empty };
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? { ...profile, orgId } : profile);
    return { profile, bin: await listRecycleBin(sql, ids) };
  });

export const restoreFlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { flockId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isDemoUser(profile)) throw new Error("Демо не відновлює посадки");
    await ensureRecycleTables(sql);
    const peek = await sql.query<{ site_id: number }>("select site_id from recycle_flocks where id = $1", [
      data.flockId,
    ]);
    if (!peek[0]) throw new Error("У кошику цієї посадки немає");
    await assertSiteOfOrg(sql, profile, peek[0].site_id);
    assertCanManageFlocks(profile, peek[0].site_id);
    const restored = await restoreFlockRow(sql, data.flockId);
    await rebuildReportHeads(sql, data.flockId);
    if (restored.status === "active") await syncFlockStatus(sql, data.flockId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, restored.siteId),
      siteId: restored.siteId,
      actor: profile,
      action: "restore",
      entity: "flock",
      summary:
        restored.status === "closed"
          ? `Повернуто посадку ${restored.code} в архів пташника — зараз там уже є активна`
          : `Повернуто посадку ${restored.code} з кошика`,
      href: `/houses/${restored.houseId}`,
    });
    return { ok: true, status: restored.status, houseId: restored.houseId };
  });

export const restoreReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { reportId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isDemoUser(profile)) throw new Error("Демо не відновлює звіти");
    await ensureRecycleTables(sql);
    const peek = await sql.query<{ flock_id: number }>("select flock_id from recycle_reports where id = $1", [
      data.reportId,
    ]);
    if (!peek[0]) throw new Error("У кошику цього звіту немає");
    const flock = await sql.query<{ site_id: number }>("select site_id from flocks where id = $1", [
      peek[0].flock_id,
    ]);
    const siteId = flock[0]?.site_id;
    if (siteId) {
      await assertSiteOfOrg(sql, profile, siteId);
    }
    if (!canDeleteReports(profile) && !canManageFlocks(profile)) {
      throw new Error("Повернути звіт може технолог або керівник дільниці");
    }
    const restored = await restoreReportRow(sql, data.reportId);
    await rebuildReportHeads(sql, restored.flockId);
    await syncFlockStatus(sql, restored.flockId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, restored.siteId),
      siteId: restored.siteId,
      actor: profile,
      action: "restore",
      entity: "report",
      summary: `Повернуто звіт ${restored.reportDate} з кошика`,
      href: `/houses/${restored.houseId}`,
    });
    return { ok: true, houseId: restored.houseId };
  });

export const getHoldings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ profile: Profile; holdings: HoldingSummary[]; demo: DemoStats }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const rows = await sql.query<{
      id: number;
      name: string;
      invite_code: string;
      created_at: string;
      factories: number;
      houses: number;
      staff: number;
      techno: string | null;
      is_demo: boolean;
    }>(
      `select o.id, o.name, o.invite_code, o.created_at,
              (select count(*)::int from sites s where s.org_id = o.id) as factories,
              (select count(*)::int from houses h join sites s on s.id = h.site_id where s.org_id = o.id) as houses,
              (select count(*)::int from staff_profiles p where p.org_id = o.id) as staff,
              (select coalesce(p.full_name, p.email)
                 from staff_profiles p
                where p.org_id = o.id and p.role = 'technologist'
                order by p.created_at
                limit 1) as techno,
              coalesce(o.is_demo, false) as is_demo
         from organizations o
        order by o.is_demo desc, o.created_at desc, o.id desc`,
    );
    const today = todayISO();
    const holdings: HoldingSummary[] = [];
    for (const r of rows) {
      const sites = await loadSites(sql, r.id);
      const costs = await loadCostSettings(sql, r.id);
      const norms = await ensureOrgNorms(sql, r.id);
      const factories = await loadFactoryOverviews(sql, sites, today, costs, norms);
      const head = factories.reduce((s, f) => s + f.head, 0);
      holdings.push({
        id: r.id,
        name: r.name,
        inviteCode: r.invite_code,
        createdAt: String(r.created_at).slice(0, 10),
        factoryCount: Number(r.factories),
        houseCount: Number(r.houses),
        staffCount: Number(r.staff),
        head,
        technoName: r.techno,
        isDemo: Boolean(r.is_demo),
      });
    }
    const demoRows = await sql.query<{
      guests: number;
      guests_7d: number;
      visits: number;
      visits_24h: number;
      visits_7d: number;
      last_visit: string | Date | null;
    }>(
      `select
         (select count(*)::int from staff_profiles where is_demo = true) as guests,
         (select count(distinct user_id)::int from demo_visits
           where created_at > now() - interval '7 days') as guests_7d,
         (select count(*)::int from demo_visits) as visits,
         (select count(*)::int from demo_visits
           where created_at > now() - interval '1 day') as visits_24h,
         (select count(*)::int from demo_visits
           where created_at > now() - interval '7 days') as visits_7d,
         (select max(created_at) from demo_visits) as last_visit`,
    );
    const d = demoRows[0];
    const last = d?.last_visit ? String(d.last_visit) : null;
    const demo: DemoStats = {
      guests: Number(d?.guests ?? 0),
      guests7d: Number(d?.guests_7d ?? 0),
      visits: Number(d?.visits ?? 0),
      visits24h: Number(d?.visits_24h ?? 0),
      visits7d: Number(d?.visits_7d ?? 0),
      lastVisit: last,
    };
    return { profile, holdings, demo };
  });

export const getHoldingDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const orgRows = await sql.query<{ id: number; name: string; invite_code: string }>(
      "select id, name, invite_code from organizations where id = $1",
      [orgId],
    );
    if (!orgRows[0]) throw new Error("Господарство не знайдено");
    const staffRows = await sql.query<{ c: string | number }>(
      "select count(*)::int as c from staff_profiles where org_id = $1",
      [orgId],
    );
    const today = todayISO();
    const sites = await loadSites(sql, orgId);
    const costs = await loadCostSettings(sql, orgId);
    const norms = await ensureOrgNorms(sql, orgId);
    const factories = await loadFactoryOverviews(sql, sites, today, costs, norms);
    return {
      profile,
      org: { id: orgRows[0].id, name: orgRows[0].name, inviteCode: orgRows[0].invite_code },
      staffCount: num(staffRows[0]?.c),
      factories,
      today,
      thresholds: {
        feedPct: costs.feedAlertPct,
        waterPct: costs.waterAlertPct,
        weightPct: costs.weightAlertPct,
      },
    };
  });

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    name: string;
    factoryName: string;
    location?: string;
    houseCount: number;
    capacity: number;
  }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    if (isDemoUser(profile)) throw new Error("Демо-доступ не створює господарства");
    const { orgId, inviteCode } = await insertOrganization(sql, context.userId, data.name);
    const factory = await insertFactory(sql, orgId, {
      name: data.factoryName,
      location: data.location,
      houseCount: data.houseCount,
      capacity: data.capacity,
    });
    await writeJournal(sql, {
      orgId,
      siteId: factory.siteId,
      actor: profile,
      action: "create",
      entity: "org",
      summary: `Створено господарство «${data.name.trim()}» і фабрику «${data.factoryName.trim()}»`,
      href: `/holdings/${orgId}`,
    });
    return { ok: true, orgId, inviteCode, siteId: factory.siteId, siteCode: factory.code };
  });

export const joinOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (profile.orgId) throw new Error("Ви вже в господарстві");
    if (isDemoUser(profile)) throw new Error("Демо-доступ не входить у робочі господарства");
    if (isPlatformAdmin(profile)) {
      throw new Error("Хазяїн і адміністратор системи не входять за кодом — відкрийте господарство зі списку");
    }
    const code = normalizeInviteCode(data.code);
    if (!isInviteCodeFormat(code)) throw new Error("Код запрошення — 6 символів");
    await sql.query("insert into join_attempts (user_id) values ($1)", [context.userId]);
    const recent = await sql.query<{ c: string | number }>(
      `select count(*)::int as c from join_attempts
        where user_id = $1 and created_at > now() - interval '15 minutes'`,
      [context.userId],
    );
    if (num(recent[0]?.c) > 8) throw new Error("Забагато спроб. Зачекайте 15 хвилин.");
    const orgs = await sql.query<{ id: number; name: string; is_demo: boolean }>(
      "select id, name, coalesce(is_demo, false) as is_demo from organizations where invite_code = $1",
      [code],
    );
    if (!orgs[0]) throw new Error("Код запрошення не знайдено");
    const role = orgs[0].is_demo ? "technologist" : "pending";
    await sql.query(
      `update staff_profiles
          set org_id = $2, role = $3, site_id = null, is_demo = $4, is_owner = false, is_admin = false
        where user_id = $1`,
      [context.userId, orgs[0].id, role, orgs[0].is_demo],
    );
    if (orgs[0].is_demo) {
      return { ok: true, orgId: orgs[0].id, orgName: orgs[0].name };
    }
    await notifyJoinRequest(sql, {
      orgId: orgs[0].id,
      orgName: orgs[0].name,
      actor: { ...profile, orgId: orgs[0].id, orgName: orgs[0].name },
    });
    await writeJournal(sql, {
      orgId: orgs[0].id,
      actor: { ...profile, orgId: orgs[0].id, orgName: orgs[0].name },
      action: "join",
      entity: "staff",
      summary: `Заявка в господарство «${orgs[0].name}»`,
      href: `/team?org=${orgs[0].id}`,
    });
    return { ok: true, orgId: orgs[0].id, orgName: orgs[0].name };
  });

export const enterDemo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isPlatformAdmin(profile) && !isDemoUser(profile)) {
      throw new Error(
        "Ви хазяїн сайту. Відкрийте демо в режимі інкогніто або оновіть вітрину в Господарствах.",
      );
    }
    if (profile.orgId && !isDemoUser(profile)) {
      throw new Error("Ви вже в робочому господарстві. Для демо відкрийте посилання в інкогніто.");
    }
    const { orgId } = await ensureDemoOrg(sql);
    await sql.query(
      `update staff_profiles
          set org_id = $2,
              role = 'technologist',
              site_id = null,
              is_demo = true,
              is_owner = false,
              is_admin = false,
              full_name = coalesce(nullif(full_name, ''), 'Гість демо')
        where user_id = $1`,
      [context.userId, orgId],
    );
    await sql.query("insert into demo_visits (user_id) values ($1)", [context.userId]);
    return { ok: true, orgId };
  });

export const resetDemo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const orgId = await resetDemoOrg(sql);
    return { ok: true, orgId };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; orgId?: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    if (data.userId === context.userId) throw new Error("Не можна виключити себе");
    const rows = await sql.query<{ user_id: string; is_owner: boolean; full_name: string | null; email: string | null }>(
      `select user_id, coalesce(is_owner, false) as is_owner, full_name, email
         from staff_profiles where user_id = $1 and org_id = $2`,
      [data.userId, orgId],
    );
    if (!rows[0]) throw new Error("Користувача не знайдено в цьому господарстві");
    if (rows[0].is_owner) throw new Error("Хазяїна сайту не можна виключити з господарства");
    await sql.query(
      `update staff_profiles
          set org_id = null, role = 'pending', site_id = null
        where user_id = $1 and org_id = $2`,
      [data.userId, orgId],
    );
    const who = rows[0].full_name || rows[0].email || data.userId;
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "assign",
      entity: "staff",
      summary: `Виключено з господарства: ${who}`,
      href: "/team",
    });
    return { ok: true };
  });

export const saveOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; orgId?: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const name = data.name.trim();
    if (name.length < 2) throw new Error("Вкажіть назву господарства");
    await sql.query("update organizations set name = $2 where id = $1", [orgId, name]);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "update",
      entity: "org",
      summary: `Змінено назву господарства на «${name}»`,
      href: `/holdings/${orgId}`,
    });
    return { ok: true };
  });

export const addSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; location?: string; houseCount: number; capacity: number; orgId?: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const factory = await insertFactory(sql, orgId, data);
    await writeJournal(sql, {
      orgId,
      siteId: factory.siteId,
      actor: profile,
      action: "create",
      entity: "site",
      summary: `Додано фабрику «${data.name.trim()}»`,
      href: `/sites/${factory.siteId}`,
    });
    return { ok: true, id: factory.siteId, code: factory.code };
  });

export const rotateInviteCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    let lastError: unknown;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const inviteCode = generateInviteCode();
      try {
        const rows = await sql.query<{ invite_code: string }>(
          "update organizations set invite_code = $2 where id = $1 returning invite_code",
          [orgId, inviteCode],
        );
        if (!rows[0]) throw new Error("Господарство не знайдено");
        await writeJournal(sql, {
          orgId,
          actor: profile,
          action: "update",
          entity: "invite",
          summary: "Оновлено код запрошення господарства",
          href: `/holdings/${orgId}`,
        });
        return { ok: true, inviteCode: rows[0].invite_code };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Не вдалося оновити код");
  });

export const deleteOrganization = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId: number; confirmName: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const rows = await sql.query<{ name: string }>("select name from organizations where id = $1", [
      orgId,
    ]);
    if (!rows[0]) throw new Error("Господарство не знайдено");
    if (rows[0].name.trim() !== data.confirmName.trim()) {
      throw new Error("Назва не збігається — видалення скасовано");
    }
    await sql.query(
      `update staff_profiles
          set org_id = null,
              site_id = null,
              role = case when is_owner then role else 'pending' end
        where org_id = $1`,
      [orgId],
    );
    await sql.query("delete from organizations where id = $1", [orgId]);
    return { ok: true };
  });

const JOURNAL_ACTIONS = new Set(["create", "update", "delete", "join", "assign", "restore"]);
const JOURNAL_ENTITIES = new Set(["report", "flock", "house", "site", "staff", "org", "invite", "feed"]);

export const getJournal = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { from: string; to: string; siteId?: number | null; orgId?: number; action?: string }) => data)
  .handler(async ({ context, data }): Promise<{ profile: Profile; events: JournalEvent[]; sites: Site[] }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) {
      return { profile, events: [], sites: [] };
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const sites = await loadSites(sql, orgId);
    const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? { ...profile, orgId } : profile);
    const siteFilter =
      data.siteId && ids.includes(data.siteId) ? [data.siteId] : ids;
    if (!siteFilter.length && !isPlatformAdmin(profile)) {
      return { profile, events: [], sites: [] };
    }
    const params: unknown[] = [orgId, data.from, data.to];
    let sqlExtra = "";
    if (siteFilter.length) {
      const ph = siteFilter.map((_, i) => `$${params.length + 1 + i}`).join(", ");
      sqlExtra += ` and (site_id is null or site_id in (${ph}))`;
      params.push(...siteFilter);
    }
    if (data.action && JOURNAL_ACTIONS.has(data.action)) {
      params.push(data.action);
      sqlExtra += ` and action = $${params.length}`;
    }
    const rows = await sql.query<{
      id: number;
      org_id: number;
      site_id: number | null;
      actor_user_id: string;
      actor_name: string;
      actor_role: string | null;
      action: string;
      entity: string;
      summary: string;
      href: string | null;
      created_at: string;
    }>(
      `select id, org_id, site_id, actor_user_id, actor_name, actor_role, action, entity, summary, href, created_at
         from journal_events
        where org_id = $1
          and created_at >= $2::date
          and created_at < ($3::date + interval '1 day')
          ${sqlExtra}
        order by created_at desc, id desc
        limit 400`,
      params,
    );
    return {
      profile,
      sites: sites.filter((s) => ids.includes(s.id)),
      events: rows.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        siteId: r.site_id,
        actorUserId: r.actor_user_id,
        actorName: r.actor_name,
        actorRole: r.actor_role,
        action: JOURNAL_ACTIONS.has(r.action) ? (r.action as JournalEvent["action"]) : "update",
        entity: JOURNAL_ENTITIES.has(r.entity) ? (r.entity as JournalEvent["entity"]) : "org",
        summary: r.summary,
        href: r.href,
        createdAt: String(r.created_at),
      })),
    };
  });

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ items: Notice[]; unread: number }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    await ensureProfile(sql, context.userId, hint);
    const rows = await sql.query<{
      id: number;
      org_id: number;
      kind: string;
      title: string;
      body: string;
      href: string | null;
      read_at: string | null;
      created_at: string;
    }>(
      `select id, org_id, kind, title, body, href, read_at, created_at
         from notifications
        where user_id = $1
        order by created_at desc
        limit 40`,
      [context.userId],
    );
    const unreadRows = await sql.query<{ c: string | number }>(
      "select count(*)::int as c from notifications where user_id = $1 and read_at is null",
      [context.userId],
    );
    return {
      unread: num(unreadRows[0]?.c),
      items: rows.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        kind:
          r.kind === "join"
            ? "join"
            : r.kind === "density"
              ? "density"
              : r.kind === "handbook"
                ? "handbook"
                : "report",
        title: r.title,
        body: r.body,
        href: r.href,
        read: Boolean(r.read_at),
        createdAt: String(r.created_at),
      })),
    };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `update notifications
          set read_at = coalesce(read_at, now())
        where id = $1 and user_id = $2`,
      [data.id, context.userId],
    );
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query(
      `update notifications
          set read_at = now()
        where user_id = $1 and read_at is null`,
      [context.userId],
    );
    return { ok: true };
  });

export const getHandbook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) {
      return { profile, articles: [], norms: DEFAULT_NORMS, canEdit: true, treatments: defaultTreatmentCalendar() };
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const canEdit = hasTechAccess(profile);
    const [articles, norms, treatments] = await Promise.all([
      loadHandbook(sql, orgId, canEdit),
      ensureOrgNorms(sql, orgId),
      loadOrgTreatmentCalendar(sql, orgId),
    ]);
    return { profile, articles, norms, canEdit, treatments };
  });

export const saveOrgHandbookNorms = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number; norms: OrgNorms }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const n = data.norms;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const norms: OrgNorms = {
      humidityPlaceMin: clamp(Number(n.humidityPlaceMin) || 50, 20, 90),
      humidityPlaceMax: clamp(Number(n.humidityPlaceMax) || 55, 20, 95),
      humidityEarlyUntil: Math.round(clamp(Number(n.humidityEarlyUntil) || 14, 1, 28)),
      humidityEarlyMin: clamp(Number(n.humidityEarlyMin) || 50, 20, 90),
      humidityEarlyMax: clamp(Number(n.humidityEarlyMax) || 60, 20, 95),
      humidityLateMin: clamp(Number(n.humidityLateMin) || 50, 20, 90),
      humidityLateMax: clamp(Number(n.humidityLateMax) || 70, 20, 95),
      densityLimitKgM2: clamp(Number(n.densityLimitKgM2) || 42, 20, 60),
      densityWarnDays: Math.round(clamp(Number(n.densityWarnDays) || 5, 1, 14)),
    };
    if (norms.humidityPlaceMin > norms.humidityPlaceMax) {
      throw new Error("Вологість посадки: мін не може бути вищим за макс");
    }
    await saveOrgNorms(sql, orgId, norms, context.userId);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "update",
      entity: "org",
      summary: "Оновлено нормативи вологості і щільності",
      href: "/guide",
    });
    return { ok: true, norms };
  });

export const saveOrgTreatments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number; items: TreatmentEvent[] }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (!hasTechAccess(profile) || isDemoUser(profile)) {
      throw new Error("Шаблон календаря змінює головний технолог");
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const items = parseTreatmentCalendar(data.items) ?? [];
    const saved = await saveOrgTreatmentCalendar(sql, orgId, items, context.userId);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "update",
      entity: "org",
      summary: "Оновлено шаблон календаря обробок",
      href: "/guide",
    });
    return { ok: true, items: saved };
  });

export const saveFlockTreatments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { flockId: number; items: TreatmentEvent[] }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isDemoUser(profile)) throw new Error("Демо не змінює календар");
    const rows = await sql.query<{ site_id: number; house_id: number }>(
      "select site_id, house_id from flocks where id = $1",
      [data.flockId],
    );
    if (!rows[0]) throw new Error("Посадку не знайдено");
    await assertSiteOfOrg(sql, profile, rows[0].site_id);
    if (!canEditTreatments(profile)) {
      throw new Error("Календар змінює технолог або ветлікар");
    }
    const items = parseTreatmentCalendar(data.items) ?? [];
    const saved = await saveFlockTreatmentCalendar(sql, data.flockId, items, context.userId);
    await writeJournal(sql, {
      orgId: await siteOrgId(sql, rows[0].site_id),
      siteId: rows[0].site_id,
      actor: profile,
      action: "update",
      entity: "flock",
      summary: "Змінено календар обробок посадки",
      href: `/houses/${rows[0].house_id}`,
    });
    return { ok: true, items: saved };
  });

export const saveHandbookArticle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      orgId?: number;
      id: number;
      question: string;
      answerTech: string;
      answerVet: string;
      category: string;
      hidden?: boolean;
      priority?: boolean;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const question = data.question.trim();
    if (question.length < 8) throw new Error("Сформулюйте питання");
    await sql.query(
      `update handbook_articles
          set question = $3,
              answer_tech = $4,
              answer_vet = $5,
              category = $6,
              hidden = $7,
              priority = coalesce($8, priority),
              status = 'published',
              updated_at = now()
        where id = $1 and org_id = $2`,
      [
        data.id,
        orgId,
        question,
        data.answerTech.trim(),
        data.answerVet.trim(),
        data.category,
        Boolean(data.hidden),
        data.priority == null ? null : Boolean(data.priority),
      ],
    );
    return { ok: true };
  });

export const setHandbookPriority = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number; id: number; priority: boolean }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertTechnologist(profile);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    await sql.query(
      `update handbook_articles set priority = $3, updated_at = now() where id = $1 and org_id = $2`,
      [data.id, orgId, data.priority],
    );
    return { ok: true };
  });

export const askHandbookQuestion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number; category: string; question: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const question = data.question.trim();
    if (question.length < 8) throw new Error("Напишіть питання повністю");
    const slug = `q-${Date.now().toString(36)}`;
    await sql.query(
      `insert into handbook_articles
         (org_id, slug, category, question, answer_tech, answer_vet, sort_order, status, asked_by)
       values ($1,$2,$3,$4,'','',900,'question',$5)`,
      [orgId, slug, data.category, question, context.userId],
    );
    await notifyHandbookQuestion(sql, { orgId, question, actor: profile });
    return { ok: true };
  });

export const getFeedTool = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }): Promise<{
    profile: Profile;
    sites: Site[];
    analyses: FeedAnalysis[];
  }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (isPlatformAdmin(profile) && !data.orgId && !profile.orgId) {
      return { profile, sites: [], analyses: [] };
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const allSites = await loadSites(sql, orgId);
    const ids = await visibleSiteIds(sql, isPlatformAdmin(profile) ? { ...profile, orgId } : profile);
    const sites = allSites.filter((s) => ids.includes(s.id));
    const rows = await sql.query<{
      id: number;
      site_id: number | null;
      phase: string;
      name: string;
      lab_date: string | null;
      values_json: string;
      score: number;
      severity: string;
      headline: string;
      submitted_by: string;
      created_at: string;
    }>(
      `select id, site_id, phase, name, lab_date, values_json, score, severity, headline, submitted_by, created_at
         from feed_analyses
        where org_id = $1
        order by created_at desc
        limit 40`,
      [orgId],
    );
    const analyses: FeedAnalysis[] = rows
      .filter((r) => !r.site_id || ids.includes(r.site_id))
      .map((r) => {
        let values = {};
        try {
          values = JSON.parse(r.values_json || "{}");
        } catch {
          values = {};
        }
        return {
          id: r.id,
          siteId: r.site_id,
          siteName: sites.find((s) => s.id === r.site_id)?.name ?? null,
          phase: (r.phase as FeedPhase) ?? "starter",
          name: r.name,
          labDate: r.lab_date,
          values: parseFeedValues(values),
          score: Number(r.score) || 0,
          severity: (["ok", "watch", "warn", "critical"].includes(r.severity)
            ? r.severity
            : "ok") as FeedAnalysis["severity"],
          headline: r.headline,
          submittedBy: r.submitted_by,
          createdAt: String(r.created_at),
        };
      });
    return { profile, sites, analyses };
  });

export const saveFeedAnalysis = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      orgId?: number;
      siteId?: number | null;
      phase: string;
      name: string;
      labDate?: string | null;
      values: unknown;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const phase = data.phase as FeedPhase;
    if (!["prestarter", "starter", "grower", "finisher"].includes(phase)) {
      throw new Error("Оберіть фазу раціону");
    }
    const values = parseFeedValues(data.values);
    const verdict = evaluateFeed(phase, values);
    if (!verdict) throw new Error("Вкажіть хоча б один показник з протоколу");
    let siteId: number | null = data.siteId && data.siteId > 0 ? data.siteId : null;
    if (siteId) {
      await assertSiteOfOrg(sql, profile, siteId);
    }
    const name = data.name.trim().slice(0, 80) || `${feedPhaseLabel(phase)} · ${todayISO()}`;
    const labDate =
      data.labDate && /^\d{4}-\d{2}-\d{2}$/.test(data.labDate) ? data.labDate : null;
    const rows = await sql.query<{ id: number }>(
      `insert into feed_analyses
         (org_id, site_id, phase, name, lab_date, values_json, score, severity, headline, submitted_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning id`,
      [
        orgId,
        siteId,
        phase,
        name,
        labDate,
        JSON.stringify(values),
        verdict.score,
        verdict.severity,
        verdict.headline,
        context.userId,
      ],
    );
    await writeJournal(sql, {
      orgId,
      siteId,
      actor: profile,
      action: "create",
      entity: "feed",
      summary: `Аналіз корму «${name}»: ${verdict.score} · ${verdict.headline}`,
      href: "/feed",
    });
    return { ok: true, id: rows[0]?.id ?? 0, verdict };
  });

export const deleteFeedAnalysis = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number; id: number }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const rows = await sql.query<{ submitted_by: string; name: string }>(
      "select submitted_by, name from feed_analyses where id = $1 and org_id = $2",
      [data.id, orgId],
    );
    const row = rows[0];
    if (!row) throw new Error("Аналіз не знайдено");
    if (!hasTechAccess(profile) && row.submitted_by !== context.userId) {
      throw new Error("Можна видалити лише свій аналіз");
    }
    await sql.query("delete from feed_analyses where id = $1 and org_id = $2", [data.id, orgId]);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "delete",
      entity: "feed",
      summary: `Видалено аналіз корму «${row.name}»`,
      href: "/feed",
    });
    return { ok: true };
  });

export const getPlatformStaff = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ profile: Profile; people: PlatformPerson[] }> => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformAdmin(profile);
    const rows = await sql.query<{
      user_id: string;
      full_name: string | null;
      email: string | null;
      is_owner: boolean;
      is_admin: boolean;
      org_name: string | null;
    }>(
      `select p.user_id, p.full_name, p.email,
              coalesce(p.is_owner, false) as is_owner,
              coalesce(p.is_admin, false) as is_admin,
              o.name as org_name
         from staff_profiles p
         left join organizations o on o.id = p.org_id
        order by p.is_owner desc, p.is_admin desc, p.created_at`,
    );
    return {
      profile,
      people: rows.map((r) => ({
        userId: r.user_id,
        fullName: r.full_name,
        email: r.email,
        isOwner: Boolean(r.is_owner),
        isAdmin: Boolean(r.is_admin),
        orgName: r.org_name,
      })),
    };
  });

export const setPlatformAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; admin: boolean }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformOwner(profile);
    if (data.userId === context.userId) {
      throw new Error("Хазяїн сайту вже має повний доступ");
    }
    const rows = await sql.query<{
      user_id: string;
      is_owner: boolean;
      full_name: string | null;
      email: string | null;
    }>(
      "select user_id, coalesce(is_owner, false) as is_owner, full_name, email from staff_profiles where user_id = $1",
      [data.userId],
    );
    const row = rows[0];
    if (!row) throw new Error("Користувача не знайдено");
    if (row.is_owner) throw new Error("Хазяїна сайту не можна змінити цим призначенням");
    const demo = await sql.query<{ is_demo: boolean }>(
      "select coalesce(is_demo, false) as is_demo from staff_profiles where user_id = $1",
      [data.userId],
    );
    if (demo[0]?.is_demo) throw new Error("Демо-гостя не призначають адміністратором");
    await sql.query("update staff_profiles set is_admin = $2 where user_id = $1", [
      data.userId,
      data.admin,
    ]);
    const who = row.full_name || row.email || data.userId;
    if (profile.orgId) {
      await writeJournal(sql, {
        orgId: profile.orgId,
        actor: profile,
        action: "assign",
        entity: "staff",
        summary: data.admin
          ? `Призначено адміністратора системи: ${who}`
          : `Знято роль адміністратора системи: ${who}`,
        href: "/holdings",
      });
    }
    return { ok: true };
  });

const MAX_OWNERS = 3;

async function ownerCount(sql: Awaited<ReturnType<typeof getSql>>): Promise<number> {
  const rows = await sql.query<{ c: number }>(
    "select count(*)::int as c from staff_profiles where coalesce(is_owner, false) = true",
  );
  return Number(rows[0]?.c ?? 0);
}

export const createBackupOwner = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { email: string; password: string; name: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformOwner(profile);
    try {
      await sql.query("drop index if exists staff_profiles_one_owner_idx");
    } catch (err) {
      console.error("[owner] drop unique index", err);
    }
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim() || "Запасний хазяїн";
    const password = data.password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Вкажіть справжню пошту");
    if (password.length < 10) throw new Error("Пароль щонайменше 10 символів");
    if (password.length > 72) throw new Error("Пароль занадто довгий");
    if ((await ownerCount(sql)) >= MAX_OWNERS) {
      throw new Error("Уже є максимум запасних хазяїнів");
    }
    throw new Error(
      "Зареєструйте запасний вхід на сторінці /login (пошта і пароль), потім призначте цього користувача хазяїном у списку нижче.",
    );
  });

export const setPlatformOwner = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { userId: string; owner: boolean }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    assertPlatformOwner(profile);
    try {
      await sql.query("drop index if exists staff_profiles_one_owner_idx");
    } catch (err) {
      console.error("[owner] drop unique index", err);
    }
    if (data.userId === context.userId && !data.owner) {
      throw new Error("Не можна зняти права з себе. Спочатку увійдіть запасним записом.");
    }
    const rows = await sql.query<{
      user_id: string;
      is_owner: boolean;
      is_demo: boolean;
      full_name: string | null;
      email: string | null;
    }>(
      `select user_id, coalesce(is_owner, false) as is_owner, coalesce(is_demo, false) as is_demo,
              full_name, email
         from staff_profiles where user_id = $1`,
      [data.userId],
    );
    const row = rows[0];
    if (!row) throw new Error("Користувача не знайдено");
    if (row.is_demo) throw new Error("Демо-гостя не роблять хазяїном");
    if (data.owner) {
      if ((await ownerCount(sql)) >= MAX_OWNERS) throw new Error("Уже є максимум хазяїнів сайту");
      await sql.query(
        "update staff_profiles set is_owner = true, is_admin = true where user_id = $1",
        [data.userId],
      );
    } else {
      if ((await ownerCount(sql)) <= 1) throw new Error("Має лишитися хоча б один хазяїн сайту");
      await sql.query("update staff_profiles set is_owner = false where user_id = $1", [data.userId]);
    }
    const who = row.full_name || row.email || data.userId;
    if (profile.orgId) {
      await writeJournal(sql, {
        orgId: profile.orgId,
        actor: profile,
        action: "assign",
        entity: "staff",
        summary: data.owner ? `Призначено запасного хазяїна: ${who}` : `Знято права хазяїна: ${who}`,
        href: "/holdings",
      });
    }
    return { ok: true };
  });

function publicOrigin(): string {
  try {
    const req = getRequest();
    const xf = req?.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = (xf || req?.headers.get("host") || "").split(":")[0]?.trim();
    if (!host || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return "https://ptakhozvit.com.ua";
    }
    const proto = req?.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  } catch {
    return "https://ptakhozvit.com.ua";
  }
}

async function ensureSheetsToken(sql: Sql, orgId: number): Promise<string> {
  const rows = await sql.query<{ sheets_token: string | null }>(
    "select sheets_token from organizations where id = $1",
    [orgId],
  );
  if (rows[0]?.sheets_token) return rows[0].sheets_token;
  for (let i = 0; i < 8; i += 1) {
    const token = generateSheetsToken();
    try {
      const updated = await sql.query<{ sheets_token: string }>(
        `update organizations set sheets_token = $2
          where id = $1 and sheets_token is null
          returning sheets_token`,
        [orgId, token],
      );
      if (updated[0]?.sheets_token) return updated[0].sheets_token;
    } catch {
      /* unique clash */
    }
  }
  throw new Error("Не вдалося створити посилання для Google Sheets");
}

export const getSheetsIntegration = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (!canManageOps(profile) && !isPlatformAdmin(profile)) {
      throw new Error("Лише технолог, партнер або адміністратор");
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const token = await ensureSheetsToken(sql, orgId);
    const origin = publicOrigin();
    const todayUrl = `${origin}/api/sheets/${token}?kind=today`;
    const periodUrl = `${origin}/api/sheets/${token}?kind=period`;
    return {
      profile,
      token,
      origin,
      feeds: [
        {
          kind: "today" as const,
          label: "Зведення на сьогодні",
          url: todayUrl,
          formula: `=IMPORTDATA("${todayUrl}")`,
        },
        {
          kind: "period" as const,
          label: "Щоденні звіти за 14 діб",
          url: periodUrl,
          formula: `=IMPORTDATA("${periodUrl}")`,
        },
      ],
    };
  });

export const rotateSheetsToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId?: number } | undefined) => data ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hint = await sessionHint(sql, context.userId);
    const profile = await ensureProfile(sql, context.userId, hint);
    if (!canManageOps(profile) && !isPlatformAdmin(profile)) {
      throw new Error("Лише технолог, партнер або адміністратор");
    }
    const orgId = await resolveOrgId(sql, profile, data.orgId);
    const token = generateSheetsToken();
    await sql.query("update organizations set sheets_token = $2 where id = $1", [orgId, token]);
    await writeJournal(sql, {
      orgId,
      actor: profile,
      action: "update",
      entity: "org",
      summary: "Оновлено посилання для Google Sheets",
      href: "/settings",
    });
    return { ok: true, token };
  });

