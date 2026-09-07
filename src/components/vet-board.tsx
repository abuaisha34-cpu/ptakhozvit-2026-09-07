import { Link } from "@tanstack/react-router";
import type { FactoryOverview } from "@/lib/broiler/types";
import { droppingLabel, litterLabel } from "@/lib/broiler/litter";
import { formatDose } from "@/lib/broiler/water-meds";
import { cn, fmtInt, fmtPct } from "@/lib/utils";

export function VetBoard({ factories, today }: { factories: FactoryOverview[]; today: string }) {
  const houses = factories.flatMap((f) =>
    f.houses
      .filter((h) => h.flock && h.flock.status !== "closed")
      .map((h) => ({ factory: f.site.name, many: factories.length > 1, house: h })),
  );
  if (!houses.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Ветеринарний огляд · {today}</p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-tight">Падіж, послід, випоювання</h2>
      </div>
      <div className="grid gap-2">
        {houses.map(({ factory, many, house: h }) => (
          <Link
            key={h.house.id}
            to="/houses/$houseId"
            params={{ houseId: String(h.house.id) }}
            className={cn(
              "rounded-[18px] bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
              h.dayMortPct > 0.25 || h.missingToday ? "border border-warn/40" : "",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {many ? `${factory} · ` : ""}
                  {h.house.name}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {h.ageDays} доба · {fmtInt(h.head)} гол.
                </p>
              </div>
              <p className={cn("tabular-nums text-sm", h.dayMortPct > 0.25 ? "text-bad" : "text-muted")}>
                падіж {fmtPct(h.dayMortPct, 2)}
              </p>
            </div>
            <p className="mt-2 text-sm text-fg">
              {h.droppingLook || h.litterState
                ? `${droppingLabel(h.droppingLook)} · ${litterLabel(h.litterState)}`
                : "послід не вказано"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {h.meds.length ? h.meds.map((m) => formatDose(m)).join("; ") : "випоювання немає"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
