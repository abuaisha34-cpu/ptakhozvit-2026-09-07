import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import type { WaterMedDose } from "@/lib/broiler/water-meds";
import {
  WATER_MED_GROUPS,
  WATER_MEDS,
  unitLabel,
  waterMedById,
} from "@/lib/broiler/water-meds";

export type MedDraft = {
  uid: string;
  prepId: string;
  conc: string;
  customName: string;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function draftsFromDoses(doses: WaterMedDose[]): MedDraft[] {
  return doses.map((d) => ({
    uid: uid(),
    prepId: d.prepId,
    conc: String(d.conc),
    customName: d.prepId === "custom" ? d.name : "",
  }));
}

export function WaterMedsField({
  none,
  rows,
  onNone,
  onRows,
}: {
  none: boolean;
  rows: MedDraft[];
  onNone: (v: boolean) => void;
  onRows: (rows: MedDraft[]) => void;
}) {
  function setRow(uid: string, patch: Partial<MedDraft>) {
    onRows(rows.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  }

  return (
    <Card>
      <CardTitle>Випоювання</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Які препарати стоять у воду сьогодні і яка концентрація на 1 м³. Список розділений по групах.
      </p>

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={none}
          onChange={(e) => onNone(e.target.checked)}
        />
        Випоювання сьогодні немає
      </label>

      {none ? (
        <p className="mt-3 text-xs text-muted">У журнал піде відмітка, що воду не медикаментували.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => {
            const item = waterMedById(row.prepId);
            return (
              <div key={row.uid} className="rounded-[16px] bg-bg p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end">
                  <div>
                    <Label>Препарат</Label>
                    <Select
                      value={row.prepId}
                      onChange={(e) => {
                        const next = e.target.value;
                        const cat = waterMedById(next);
                        setRow(row.uid, {
                          prepId: next,
                          customName: next === "custom" ? row.customName : "",
                          conc: row.conc || (cat?.typical.match(/\d+/)?.[0] ?? ""),
                        });
                      }}
                    >
                      <option value="">Оберіть зі списку</option>
                      {WATER_MED_GROUPS.map((g) => (
                        <optgroup key={g.id} label={g.label}>
                          {WATER_MEDS.filter((p) => p.group === g.id).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>На 1 м³</Label>
                    <div className="relative">
                      <Input
                        inputMode="decimal"
                        value={row.conc}
                        onChange={(e) => setRow(row.uid, { conc: e.target.value })}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-subtle">
                      {item ? unitLabel(item.unit) : "мл або г"}
                      {item?.typical ? ` · ${item.typical}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Прибрати"
                    onClick={() => onRows(rows.filter((r) => r.uid !== row.uid))}
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </Button>
                </div>
                {row.prepId === "custom" ? (
                  <div className="mt-2">
                    <Label>Назва препарату</Label>
                    <Input
                      value={row.customName}
                      onChange={(e) => setRow(row.uid, { customName: e.target.value })}
                      placeholder="Як на етикетці"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onRows([...rows, { uid: uid(), prepId: "", conc: "", customName: "" }])
            }
          >
            <Plus className="size-4" strokeWidth={1.75} />
            Додати препарат
          </Button>
        </div>
      )}
    </Card>
  );
}
