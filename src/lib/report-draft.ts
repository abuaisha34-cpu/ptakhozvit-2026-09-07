export type ReportDraft = {
  houseId: number;
  reportDate: string;
  mortality: string;
  culled: string;
  weight: string;
  feed: string;
  water: string;
  tMin: string;
  tMax: string;
  hum: string;
  notes: string;
  soldHead: string;
  soldKg: string;
  droppingLook: string;
  litterState: string;
  medsNone: boolean;
  medRows: Array<{ prepId: string; conc: string; customName: string }>;
  droppingPhoto: string | null;
  savedAt: number;
};

const prefix = "ptahozvit.draft.v1.";

function key(houseId: number, reportDate: string): string {
  return `${prefix}${houseId}.${reportDate}`;
}

export function loadReportDraft(houseId: number, reportDate: string): ReportDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(houseId, reportDate));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReportDraft;
    if (parsed.houseId !== houseId || parsed.reportDate !== reportDate) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveReportDraft(draft: ReportDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(draft.houseId, draft.reportDate), JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function clearReportDraft(houseId: number, reportDate: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(houseId, reportDate));
}
