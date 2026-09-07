import type { DailyReport, FactoryOverview, JournalEvent, PeriodRow } from "@/lib/broiler/types";
import { droppingLabel, litterLabel } from "@/lib/broiler/litter";
import { formatDose } from "@/lib/broiler/water-meds";
import { ACTION_LABEL, ENTITY_LABEL } from "@/lib/export-labels";

export type SheetTable = {
  name: string;
  columns: string[];
  rows: Array<Array<string | number | null | undefined>>;
};

export type WorkbookSpec = {
  filename: string;
  title: string;
  subtitle?: string;
  sheets: SheetTable[];
};

function cell(v: string | number | null | undefined): string | number {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return String(v);
}

function aoa(sheet: SheetTable, title: string, subtitle?: string): (string | number)[][] {
  const out: (string | number)[][] = [[title]];
  if (subtitle) out.push([subtitle]);
  out.push([]);
  out.push(sheet.columns);
  for (const row of sheet.rows) out.push(row.map(cell));
  return out;
}

export async function downloadExcel(spec: WorkbookSpec): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const sheet of spec.sheets) {
    const data = aoa(sheet, spec.title, spec.subtitle);
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = sheet.columns.map((c) => ({ wch: Math.min(36, Math.max(10, c.length + 4)) }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31) || "Аркуш");
  }
  XLSX.writeFile(wb, spec.filename.endsWith(".xlsx") ? spec.filename : `${spec.filename}.xlsx`);
}

let fontReady: Promise<void> | null = null;
const fontB64: { regular?: string; bold?: string } = {};

function bytesToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 0x8000) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 0x8000)));
  }
  return btoa(chunks.join(""));
}

async function ensurePdfFonts(): Promise<void> {
  if (!fontReady) {
    fontReady = (async () => {
      const [regular, bold] = await Promise.all([
        fetch("/fonts/DejaVuSans.ttf").then((r) => r.arrayBuffer()),
        fetch("/fonts/DejaVuSans-Bold.ttf").then((r) => r.arrayBuffer()),
      ]);
      fontB64.regular = bytesToB64(regular);
      fontB64.bold = bytesToB64(bold);
    })();
  }
  await fontReady;
}

export async function downloadPdf(spec: WorkbookSpec): Promise<void> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableMod.default;
  await ensurePdfFonts();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", fontB64.regular ?? "");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fontB64.bold ?? "");
  doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
  doc.setFont("DejaVuSans", "normal");

  spec.sheets.forEach((sheet, i) => {
    if (i > 0) doc.addPage("a4", "landscape");
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(14);
    doc.text("ПтахоЗвіт", 14, 14);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(11);
    doc.text(spec.title, 14, 21);
    if (spec.subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(90);
      doc.text(spec.subtitle, 14, 27);
      doc.setTextColor(20);
    }
    autoTable(doc, {
      startY: spec.subtitle ? 31 : 26,
      head: [sheet.columns],
      body: sheet.rows.map((row) => row.map((v) => (v == null || v === "" ? "—" : String(v)))),
      styles: {
        font: "DejaVuSans",
        fontSize: 7.5,
        cellPadding: 1.6,
        overflow: "linebreak",
        textColor: [22, 52, 28],
      },
      headStyles: {
        font: "DejaVuSans",
        fontStyle: "bold",
        fillColor: [47, 154, 76],
        textColor: 255,
        fontSize: 7.5,
      },
      alternateRowStyles: { fillColor: [246, 251, 242] },
      margin: { left: 10, right: 10 },
    });
    if (spec.sheets.length > 1) {
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text(sheet.name, 14, 8);
      doc.setTextColor(20);
    }
  });

  const name = spec.filename.endsWith(".pdf") ? spec.filename : `${spec.filename}.pdf`;
  doc.save(name.replace(/\.xlsx$/i, ".pdf"));
}

function formatWhen(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(new Date(t));
}

export function periodWorkbook(
  rows: PeriodRow[],
  opts: { from: string; to: string; orgName?: string | null; siteName?: string | null },
): WorkbookSpec {
  const site = opts.siteName ? ` · ${opts.siteName}` : " · усі фабрики";
  return {
    filename: `ptahozvit-${opts.from}-${opts.to}`,
    title: "Щоденні звіти за період",
    subtitle: `${opts.orgName ?? "ПтахоЗвіт"}${site} · ${opts.from} — ${opts.to}`,
    sheets: [
      {
        name: "Звіти",
        columns: [
          "Дата",
          "Фабрика",
          "Пташник",
          "Доба",
          "Падіж",
          "Вибраковка",
          "Поголівʼя",
          "Маса, г",
          "Корм, кг",
          "FCR",
          "Продаж, гол.",
          "Продаж, кг",
          "Середня курка, г",
          "FCR здачі",
          "Примітка",
        ],
        rows: rows.map((r) => [
          r.date,
          r.siteName,
          r.houseName,
          r.ageDays,
          r.mortality,
          r.culled,
          r.head,
          r.avgWeightG,
          Math.round(r.feedKg * 10) / 10,
          Number(r.fcr.toFixed(3)),
          r.soldHead || "",
          r.soldWeightKg || "",
          r.saleAvgG ? Math.round(r.saleAvgG) : "",
          r.saleFcr ? Number(r.saleFcr.toFixed(3)) : "",
          r.notes,
        ]),
      },
    ],
  };
}

export function houseWorkbook(input: {
  siteName: string;
  houseName: string;
  flockCode?: string | null;
  breed?: string | null;
  placedAt?: string | null;
  reports: DailyReport[];
}): WorkbookSpec {
  const reports = [...input.reports].sort((a, b) => a.reportDate.localeCompare(b.reportDate));
  return {
    filename: `ptahozvit-${input.houseName.replaceAll(" ", "-")}-${reports.at(-1)?.reportDate ?? "zvit"}`,
    title: `${input.siteName} · ${input.houseName}`,
    subtitle: [
      input.flockCode,
      input.breed,
      input.placedAt ? `посадка ${input.placedAt}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    sheets: [
      {
        name: "Щоденні звіти",
        columns: [
          "Дата",
          "Доба",
          "На початок",
          "Падіж",
          "Вибраковка",
          "На кінець",
          "Маса, г",
          "Корм, кг",
          "Вода, л",
          "t° мін",
          "t° макс",
          "Вологість, %",
          "Послід",
          "Підстилка",
          "Випоювання",
          "Продаж, гол.",
          "Продаж, кг",
          "Примітка",
        ],
        rows: reports.map((r) => [
          r.reportDate,
          r.ageDays,
          r.headStart,
          r.mortality,
          r.culled,
          r.headEnd,
          r.avgWeightG,
          Math.round(r.feedKg * 10) / 10,
          r.waterL ?? "",
          r.tempMin ?? "",
          r.tempMax ?? "",
          r.humidityPct ?? "",
          droppingLabel(r.droppingLook),
          litterLabel(r.litterState),
          r.meds.length ? r.meds.map((m) => formatDose(m)).join("; ") : "немає",
          r.soldHead || "",
          r.soldWeightKg || "",
          r.notes,
        ]),
      },
    ],
  };
}

export function journalWorkbook(
  events: JournalEvent[],
  opts: { from: string; to: string; orgName?: string | null },
): WorkbookSpec {
  return {
    filename: `ptahozvit-zhurnal-${opts.from}-${opts.to}`,
    title: "Журнал змін",
    subtitle: `${opts.orgName ?? "ПтахоЗвіт"} · ${opts.from} — ${opts.to}`,
    sheets: [
      {
        name: "Журнал",
        columns: ["Час", "Дія", "Обʼєкт", "Хто", "Що"],
        rows: events.map((e) => [
          formatWhen(e.createdAt),
          ACTION_LABEL[e.action] ?? e.action,
          ENTITY_LABEL[e.entity] ?? e.entity,
          e.actorName,
          e.summary,
        ]),
      },
    ],
  };
}

export function dashboardWorkbook(
  factories: FactoryOverview[],
  opts: { today: string; orgName?: string | null },
): WorkbookSpec {
  const houses = factories.flatMap((f) =>
    f.houses.map((h) => ({
      site: f.site.name,
      house: h.house.name,
      flock: h.flock?.code ?? "",
      age: h.ageDays,
      head: h.head,
      weight: h.avgWeightG,
      mort: h.dayMortPct,
      fcr: h.fcr,
      feed: h.feedKg,
      density: h.density?.kgM2 ?? "",
      status: h.status,
    })),
  );
  return {
    filename: `ptahozvit-zvedennya-${opts.today}`,
    title: "Зведення виробництва",
    subtitle: `${opts.orgName ?? "ПтахоЗвіт"} · ${opts.today}`,
    sheets: [
      {
        name: "Фабрики",
        columns: [
          "Фабрика",
          "Поголівʼя",
          "Посаджено",
          "Активні пташники",
          "Немає звіту",
          "Маса, г",
          "Падіж доби, гол.",
          "Падіж доби, %",
          "FCR",
          "Корм доби, кг",
          "Продаж, гол.",
          "Продаж, кг",
        ],
        rows: factories.map((f) => [
          f.site.name,
          f.head,
          f.placed,
          f.activeHouses,
          f.missingToday,
          Math.round(f.avgWeightG),
          f.dayMortality,
          Number(f.dayMortPct.toFixed(3)),
          Number(f.fcr.toFixed(3)),
          Math.round(f.feedKg),
          f.soldHead,
          Math.round(f.soldWeightKg),
        ]),
      },
      {
        name: "Пташники",
        columns: [
          "Фабрика",
          "Пташник",
          "Посадка",
          "Доба",
          "Поголівʼя",
          "Маса, г",
          "Падіж доби, %",
          "FCR",
          "Корм, кг",
          "кг/м²",
          "Статус",
        ],
        rows: houses.map((h) => [
          h.site,
          h.house,
          h.flock,
          h.age,
          h.head,
          h.weight,
          Number(h.mort.toFixed(3)),
          Number(h.fcr.toFixed(3)),
          Math.round(h.feed * 10) / 10,
          h.density === "" ? "" : Number(Number(h.density).toFixed(1)),
          h.status,
        ]),
      },
    ],
  };
}
