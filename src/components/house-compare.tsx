import { Link } from "@tanstack/react-router";
import type { HouseOverview } from "@/lib/broiler/types";
import { cn, fmtInt, fmtNum, fmtPct } from "@/lib/utils";

export function HouseCompare({ houses }: { houses: HouseOverview[] }) {
  const live = houses.filter((h) => h.flock && h.flock.status !== "closed" && h.ageDays > 0);
  if (live.length < 2) return null;
  const byAge = new Map<number, HouseOverview[]>();
  for (const h of live) {
    const bucket = Math.round(h.ageDays / 2) * 2;
    const list = byAge.get(bucket) ?? [];
    list.push(h);
    byAge.set(bucket, list);
  }
  const groups = [...byAge.entries()]
    .map(([age, list]) => ({ age, list }))
    .filter((g) => g.list.length >= 2)
    .sort((a, b) => a.age - b.age);
  if (!groups.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Одне господарство</p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-tight">Порівняння однолітків</h2>
      </div>
      {groups.map((g) => (
        <div key={g.age} className="overflow-x-auto rounded-[20px] bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Пташник · ~{g.age} доба</th>
                <th className="px-4 py-3 font-medium">Маса</th>
                <th className="px-4 py-3 font-medium">vs норма</th>
                <th className="px-4 py-3 font-medium">Падіж доби</th>
                <th className="px-4 py-3 font-medium">Корм г/гол.</th>
              </tr>
            </thead>
            <tbody>
              {g.list
                .slice()
                .sort((a, b) => b.avgWeightG - a.avgWeightG)
                .map((h) => (
                  <tr key={h.house.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <Link to="/houses/$houseId" params={{ houseId: String(h.house.id) }} className="font-medium hover:underline">
                        {h.house.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtInt(h.avgWeightG)} г</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 tabular-nums",
                        h.weightDeltaPct != null && Math.abs(h.weightDeltaPct) > 6 ? "text-warn" : "text-muted",
                      )}
                    >
                      {h.weightDeltaPct == null
                        ? "—"
                        : `${h.weightDeltaPct > 0 ? "+" : ""}${fmtNum(h.weightDeltaPct, 1)}%`}
                    </td>
                    <td className={cn("px-4 py-2.5 tabular-nums", h.dayMortPct > 0.25 ? "text-bad" : "")}>
                      {fmtPct(h.dayMortPct, 2)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtInt(h.feedGPerBird)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
