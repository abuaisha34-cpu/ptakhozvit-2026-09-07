import type { DensityForecast, Deviation, Forecast, Severity } from "./calc";
import type { WaterMedDose } from "./water-meds";
import type { ClimateAdvice, SiteWeather, WeatherDay } from "./climate";
import type { FeedPhase, FeedValues } from "./feed";
import type { WithdrawalHold } from "./treatments";

export type Role = "technologist" | "partner" | "director" | "veterinarian" | "site_manager" | "pending";

export type Profile = {
  userId: string;
  role: Role;
  siteId: number | null;
  fullName: string | null;
  email: string | null;
  orgId: number | null;
  orgName: string | null;
  inviteCode: string | null;
  isOwner: boolean;
  isAdmin: boolean;
  isDemo: boolean;
};

export type NoticeKind = "report" | "join" | "density" | "handbook";

export type Notice = {
  id: number;
  orgId: number;
  kind: NoticeKind;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type JournalAction = "create" | "update" | "delete" | "join" | "assign" | "restore";
export type JournalEntity = "report" | "flock" | "house" | "site" | "staff" | "org" | "invite" | "feed";

export type JournalEvent = {
  id: number;
  orgId: number;
  siteId: number | null;
  actorUserId: string;
  actorName: string;
  actorRole: string | null;
  action: JournalAction;
  entity: JournalEntity;
  summary: string;
  href: string | null;
  createdAt: string;
};

export type Site = {
  id: number;
  orgId: number;
  code: string;
  name: string;
  location: string;
  houses: number;
  capacity: number;
  sortOrder: number;
  geoName: string | null;
  geoAdmin: string | null;
  lat: number | null;
  lon: number | null;
};

export type House = {
  id: number;
  siteId: number;
  code: string;
  name: string;
  capacity: number;
  areaM2: number;
  sortOrder: number;
};

export type Flock = {
  id: number;
  siteId: number;
  houseId: number;
  code: string;
  breed: string;
  placedAt: string;
  chicksPlaced: number;
  chickCostUah: number;
  targetDays: number;
  targetWeightG: number;
  status: "active" | "closed";
  closedAt: string | null;
  slaughterHead: number | null;
  slaughterWeightG: number | null;
};

export type DailyReport = {
  id: number;
  flockId: number;
  reportDate: string;
  ageDays: number;
  headStart: number;
  mortality: number;
  culled: number;
  headEnd: number;
  avgWeightG: number;
  feedKg: number;
  waterL: number | null;
  tempMin: number | null;
  tempMax: number | null;
  humidityPct: number | null;
  droppingLook: string | null;
  litterState: string | null;
  notes: string;
  submittedBy: string;
  soldHead: number;
  soldWeightKg: number;
  meds: WaterMedDose[];
  droppingPhoto: string | null;
};

export type CostSettings = {
  feedPriceUah: number;
  chickPriceUah: number;
  liveWeightPriceUah: number;
  otherPerBirdUah: number;
  gasPerBirdUah: number;
  medsPerBirdUah: number;
  feedAlertPct: number;
  waterAlertPct: number;
  weightAlertPct: number;
};

export type HouseOverview = {
  site: Site;
  house: House;
  flock: Flock | null;
  lastReportDate: string | null;
  missingToday: boolean;
  head: number;
  ageDays: number;
  avgWeightG: number;
  stdWeightG: number;
  weightDeltaPct: number | null;
  feedKg: number;
  feedGPerBird: number;
  stdFeedGPerBird: number;
  feedDeltaPct: number | null;
  waterMlPerBird: number | null;
  stdWaterMlPerBird: number;
  waterDeltaPct: number | null;
  dayMortPct: number;
  cumMortPct: number;
  stdCumMortPct: number;
  fcr: number;
  stdFcr: number;
  epef: number;
  soldHead: number;
  soldWeightKg: number;
  saleAvgG: number;
  saleFcr: number;
  dayDead: number;
  lastHeadStart: number;
  status: Severity;
  deviations: Deviation[];
  forecast: Forecast | null;
  density: DensityForecast | null;
  droppingLook: string | null;
  litterState: string | null;
  meds: WaterMedDose[];
};

export type TrendPoint = {
  date: string;
  ageLabel: string;
  weight: number;
  stdWeight: number;
  mortPct: number;
  fcr: number;
  feedKg: number;
  stdFeedKg: number;
  feedGPerBird: number;
  stdFeedGPerBird: number;
};

export type AlertThresholdsView = {
  feedPct: number;
  waterPct: number;
  weightPct: number;
};

export type FactoryOverview = {
  site: Site;
  houses: HouseOverview[];
  head: number;
  placed: number;
  activeHouses: number;
  missingToday: number;
  avgWeightG: number;
  dayMortality: number;
  dayMortPct: number;
  morningHead: number;
  fcr: number;
  epef: number;
  feedKg: number;
  feedGPerBird: number;
  stdFeedGPerBird: number;
  feedDeltaPct: number | null;
  soldHead: number;
  soldWeightKg: number;
  status: Severity;
  forecast: Forecast | null;
  deviations: Deviation[];
  series: TrendPoint[];
  weather: WeatherDay | null;
  weatherPlace: string | null;
  climate: ClimateAdvice | null;
};

export type DashboardData = {
  profile: Profile;
  today: string;
  factories: FactoryOverview[];
  totals: {
    head: number;
    placed: number;
    dayMortality: number;
    dayMortPct: number;
    avgWeightG: number;
    fcr: number;
    epef: number;
    costPerKg: number;
    projectedProfit: number;
    projectedProfitability: number;
    projectedCostPerKg: number;
  };
  thresholds: AlertThresholdsView;
};

export type FactoryDetail = {
  profile: Profile;
  factory: FactoryOverview;
  today: string;
  thresholds: AlertThresholdsView;
};

export type HouseDetail = {
  profile: Profile;
  site: Site;
  house: House;
  flock: Flock | null;
  pastFlocks: Flock[];
  overview: HouseOverview | null;
  reports: DailyReport[];
  series: Array<{
    date: string;
    ageDays: number;
    weight: number;
    stdWeight: number;
    mort: number;
    dayMortPct: number;
    fcr: number;
    feedKg: number;
    stdFeedKg: number;
    feedGPerBird: number;
    stdFeedGPerBird: number;
    cumFeedKg: number;
    stdCumFeedKg: number;
    waterL: number | null;
    stdWaterL: number;
    waterMlPerBird: number | null;
    stdWaterMlPerBird: number;
    tempMin: number | null;
    tempMax: number | null;
    head: number;
    soldHead: number;
    soldWeightKg: number;
    saleAvgG: number;
  }>;
  treatments: import("./treatments").TreatmentEvent[];
  canEditTreatments: boolean;
};

export type ReportFormPrefill = {
  profile: Profile;
  sites: Site[];
  houses: House[];
  house: House | null;
  flock: Flock | null;
  previous: DailyReport | null;
  existing: DailyReport | null;
  existingToday: DailyReport | null;
  today: string;
  reportDate: string;
  minDate: string | null;
  maxDate: string;
  missingDates: string[];
  ageDays: number;
  std: {
    weightG: number;
    feedGPerBird: number;
    waterMlPerBird: number;
    dailyMortPct: number;
    dailyGainG: number;
    tempMin: number;
    tempMax: number;
    humidityMin: number;
    humidityMax: number;
  } | null;
  weather: SiteWeather | null;
  weatherError: string | null;
  density: DensityForecast | null;
  thresholds: {
    feedPct: number;
    waterPct: number;
    weightPct: number;
  };
  cumFeedBefore: number;
  priorSoldHead: number;
  priorSoldKg: number;
  chickG: number;
  withdrawal: WithdrawalHold[];
};

export type PeriodRow = {
  date: string;
  siteId: number;
  siteName: string;
  houseId: number;
  houseName: string;
  ageDays: number;
  mortality: number;
  culled: number;
  head: number;
  avgWeightG: number;
  feedKg: number;
  fcr: number;
  soldHead: number;
  soldWeightKg: number;
  saleAvgG: number;
  saleFcr: number;
  notes: string;
};

export type TeamMember = {
  userId: string;
  role: Role;
  siteId: number | null;
  siteName: string | null;
  fullName: string | null;
  email: string | null;
  createdAt: string;
};

export type RecycleFlock = {
  id: number;
  code: string;
  breed: string;
  placedAt: string;
  chicksPlaced: number;
  status: string;
  deletedAt: string;
  houseId: number;
  houseName: string;
  siteId: number;
  siteName: string;
  reportCount: number;
};

export type RecycleReport = {
  id: number;
  reportDate: string;
  ageDays: number;
  avgWeightG: number;
  feedKg: number;
  deletedAt: string;
  flockId: number;
  flockCode: string;
  houseId: number;
  houseName: string;
  siteName: string;
};

export type RecycleBin = {
  flocks: RecycleFlock[];
  reports: RecycleReport[];
};

export type DemoStats = {
  guests: number;
  guests7d: number;
  visits: number;
  visits24h: number;
  visits7d: number;
  lastVisit: string | null;
};

export type HoldingSummary = {
  id: number;
  name: string;
  inviteCode: string;
  createdAt: string;
  factoryCount: number;
  houseCount: number;
  staffCount: number;
  head: number;
  technoName: string | null;
  isDemo: boolean;
};

export type PlatformPerson = {
  userId: string;
  fullName: string | null;
  email: string | null;
  isOwner: boolean;
  isAdmin: boolean;
  orgName: string | null;
};


export type FeedAnalysis = {
  id: number;
  siteId: number | null;
  siteName: string | null;
  phase: FeedPhase;
  name: string;
  labDate: string | null;
  values: FeedValues;
  score: number;
  severity: Severity;
  headline: string;
  submittedBy: string;
  createdAt: string;
};

