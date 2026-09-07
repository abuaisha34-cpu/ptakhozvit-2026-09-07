import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check } from "lucide-react";
import type { FactoryOverview } from "@/lib/broiler/types";
import { addDaysISO, cn, fmtDateShort, fmtInt } from "@/lib/utils";

export function TodayBoard({
  factories,
  today,
}: {
  factories: FactoryOverview[];
  today: string;
}) {
  const houses = factories.flatMap((f) =>
    f.houses
      .filter((h) => h.flock && h.flock.status !== "closed")
      .map((h) => ({ factory: f.site.name, house: h })),
  );
  if (!houses.length) return null;
  const due = addDaysISO(today, -1);
  const missing = houses.filter((h) => h.house.missingToday).length;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">
            Звіт за попередню добу · {fmtDateShort(due)}
          </p>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight">Пташники</h2>
        </div>
        <p className={cn("text-sm", missing ? "text-warn" : "text-ok")}>
          {missing ? `Немає звіту за вчора: ${missing}` : "Звіти за вчора здано"}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {houses.map(({ factory, house: h }) => (
          <Link
            key={h.house.id}
            to="/report"
            search={{ house: h.house.id, date: due }}
            className={cn(
              "flex items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 shadow-[var(--shadow-border)]",
              h.missingToday ? "bg-warn/10" : "bg-surface",
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">
                {factories.length > 1 ? `${factory} · ` : ""}
                {h.house.name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {h.ageDays} доба · {fmtInt(h.head)} гол.
                {h.missingToday ? " · немає звіту за вчора" : ` · ${fmtInt(h.avgWeightG)} г`}
              </p>
            </div>
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full",
                h.missingToday ? "bg-warn/20 text-warn" : "bg-ok/15 text-ok",
              )}
            >
              {h.missingToday ? (
                <AlertTriangle className="size-4" strokeWidth={2} />
              ) : (
                <Check className="size-4" strokeWidth={2.2} />
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
