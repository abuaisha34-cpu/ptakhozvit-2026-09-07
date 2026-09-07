import { FileDown, FileSpreadsheet, Table2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { WorkbookSpec } from "@/lib/export-report";
import { toTsv } from "@/lib/sheets-tsv";

function specToTsv(spec: WorkbookSpec): string {
  return spec.sheets
    .map((sheet) => toTsv(sheet.columns, sheet.rows, spec.title, spec.subtitle ? `${spec.subtitle} · ${sheet.name}` : sheet.name))
    .join("\n");
}

export function ExportButtons({
  spec,
  disabled,
}: {
  spec: WorkbookSpec | null;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<"xlsx" | "pdf" | "sheets" | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const off = disabled || !spec || spec.sheets.every((s) => s.rows.length === 0);

  async function run(kind: "xlsx" | "pdf") {
    if (!spec) return;
    setBusy(kind);
    setHint(null);
    try {
      const mod = await import("@/lib/export-report");
      if (kind === "xlsx") await mod.downloadExcel(spec);
      else await mod.downloadPdf(spec);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Не вдалося сформувати файл");
    } finally {
      setBusy(null);
    }
  }

  async function toSheets() {
    if (!spec) return;
    setBusy("sheets");
    setHint(null);
    try {
      const text = specToTsv(spec);
      await navigator.clipboard.writeText(text);
      window.open("https://docs.google.com/spreadsheets/create", "_blank", "noopener,noreferrer");
      setHint("Таблицю Google скопійовано. Вставте в клітинку A1 (Ctrl+V або Cmd+V).");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Не вдалося скопіювати в буфер");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={off || busy !== null} onClick={() => void run("xlsx")}>
          <FileSpreadsheet className="size-4" strokeWidth={1.75} />
          {busy === "xlsx" ? "Excel…" : "Excel"}
        </Button>
        <Button variant="secondary" disabled={off || busy !== null} onClick={() => void run("pdf")}>
          <FileDown className="size-4" strokeWidth={1.75} />
          {busy === "pdf" ? "PDF…" : "PDF"}
        </Button>
        <Button variant="secondary" disabled={off || busy !== null} onClick={() => void toSheets()}>
          <Table2 className="size-4" strokeWidth={1.75} />
          {busy === "sheets" ? "Sheets…" : "Google Sheets"}
        </Button>
      </div>
      {hint ? <p className="max-w-sm text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
