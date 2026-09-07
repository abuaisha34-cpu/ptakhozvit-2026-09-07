import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultTreatmentCalendar, newTreatmentEvent, type TreatmentEvent } from "@/lib/broiler/treatments";
import { cn, todayISO } from "@/lib/utils";

export function TreatmentCalendarCard({
  title,
  hint,
  items,
  canEdit,
  ageDays,
  flockMode,
  onSave,
}: {
  title: string;
  hint: string;
  items: TreatmentEvent[];
  canEdit: boolean;
  ageDays?: number;
  flockMode?: boolean;
  onSave?: (items: TreatmentEvent[]) => Promise<void>;
}) {
  const [rows, setRows] = useState(items);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function patch(id: string, part: Partial<TreatmentEvent>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...part } : r)));
    setMsg(null);
  }

  async function save() {
    if (!onSave) return;
    setBusy(true);
    setErr(null);
    try {
      await onSave(rows.filter((r) => r.name.trim()));
      setMsg("Календар збережено");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не збережено");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <p className="mt-2 text-sm text-muted">{hint}</p>
      {canEdit ? (
        <div className="mt-4 space-y-2">
          {rows.map((r) => {
            const reached = ageDays != null && ageDays >= r.day;
            return (
              <div key={r.id} className="grid gap-2 rounded-[14px] bg-bg px-3 py-2 sm:grid-cols-[4.5rem_1fr_auto_auto]">
                <Input
                  type="number"
                  min={0}
                  max={80}
                  value={r.day}
                  aria-label="Доба"
                  onChange={(e) => patch(r.id, { day: Number(e.target.value) })}
                />
                <Input
                  value={r.name}
                  aria-label="Обробка"
                  onChange={(e) => patch(r.id, { name: e.target.value })}
                />
                {flockMode ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={r.done}
                      onChange={(e) =>
                        patch(r.id, {
                          done: e.target.checked,
                          doneDate: e.target.checked ? r.doneDate || todayISO() : null,
                        })
                      }
                    />
                    Зроблено
                  </label>
                ) : (
                  <span className="text-xs text-subtle">{reached ? "термін" : ""}</span>
                )}
                <Button type="button" size="sm" variant="ghost" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>
                  Прибрати
                </Button>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setRows((p) => [...p, newTreatmentEvent({ day: (p.at(-1)?.day ?? 0) + 7 })])}
            >
              Додати обробку
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRows(defaultTreatmentCalendar())}>
              Типовий графік
            </Button>
            <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
              {busy ? "…" : "Зберегти календар"}
            </Button>
          </div>
          {err ? <p className="text-sm text-bad">{err}</p> : null}
          {msg ? <p className="text-sm text-ok">{msg}</p> : null}
        </div>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map((v) => {
            const reached = ageDays != null && ageDays >= v.day;
            return (
              <li key={v.id} className="flex items-start justify-between gap-3">
                <span className={cn(v.done ? "text-ok" : reached ? "text-muted" : "text-fg")}>
                  Доба {v.day} · {v.name}
                  {v.notes ? ` — ${v.notes}` : ""}
                </span>
                <span className="text-xs text-subtle">
                  {v.done ? `зроблено${v.doneDate ? ` ${v.doneDate}` : ""}` : reached ? "термін минув" : "заплановано"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
