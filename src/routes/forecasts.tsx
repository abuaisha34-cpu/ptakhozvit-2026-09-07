import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { fmtDateShort, fmtInt, fmtNum } from "@/lib/utils";

export const Route = createFileRoute("/forecasts")({ component: Page });

function Page() {
  return (
    <AppShell>
      <Forecasts />
    </AppShell>
  );
}

function Forecasts() {
  const { data, error, loading } = useAsync(() => getDashboard(), []);
  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">До цільового забою</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Прогноз посадки</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Окремо по кожній фабриці і пташнику: маса, щільність і три конверсії корму — зараз, на здачі і
          прогноз на закриття посадки.
        </p>
      </header>

      <div className="space-y-8">
        {data.factories.map((factory) => {
          const f = factory.forecast;
          const houses = factory.houses;
          return (
            <section key={factory.site.id} className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-medium tracking-tight">{factory.site.name}</h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {factory.activeHouses} активних · {fmtInt(factory.head)} гол.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">Днів до забою</p>
                  <p className="mt-2 font-display text-2xl tabular-nums">
                    {f ? fmtInt(f.remainingDays) : "—"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">Прогноз маси</p>
                  <p className="mt-2 font-display text-2xl tabular-nums">
                    {f ? `${fmtInt(f.projectedWeightG)} г` : "—"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">FCR на закриття</p>
                  <p className="mt-2 font-display text-2xl tabular-nums">
                    {f?.projectedFcr ? fmtNum(f.projectedFcr, 3) : "—"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">EPEF</p>
                  <p className="mt-2 font-display text-2xl tabular-nums">{f ? fmtInt(f.projectedEpef) : "—"}</p>
                </Card>
              </div>

              <div className="overflow-x-auto rounded-[24px] bg-surface shadow-[var(--shadow-border)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-surface-2 text-xs uppercase tracking-wide text-subtle">
                    <tr>
                      <th className="px-4 py-3 font-medium">Пташник</th>
                      <th className="px-4 py-3 font-medium">Посадка</th>
                      <th className="px-4 py-3 font-medium">Доба</th>
                      <th className="px-4 py-3 font-medium">Маса факт / прогноз</th>
                      <th className="px-4 py-3 font-medium">кг/м² · ліміт</th>
                      <th className="px-4 py-3 font-medium">FCR зараз</th>
                      <th className="px-4 py-3 font-medium">FCR здачі</th>
                      <th className="px-4 py-3 font-medium">FCR закриття</th>
                      <th className="px-4 py-3 font-medium">EPEF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {houses.map((s) => {
                      const hf = s.forecast;
                      return (
                        <tr key={s.house.id} className="border-t border-border">
                          <td className="px-4 py-3">
                            <Link
                              to="/houses/$houseId"
                              params={{ houseId: String(s.house.id) }}
                              className="hover:underline"
                            >
                              {s.house.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-muted">
                            {s.flock ? fmtDateShort(s.flock.placedAt) : "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-muted">
                            {s.ageDays}
                            {hf ? ` → ${s.ageDays + hf.remainingDays}` : ""}
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {fmtInt(s.avgWeightG)} / {hf ? fmtInt(hf.projectedWeightG) : "—"} г
                          </td>
                          <td className={s.density?.warn ? "px-4 py-3 tabular-nums text-warn" : "px-4 py-3 tabular-nums"}>
                            {s.density && s.density.areaM2 > 0
                              ? s.density.reached
                                ? `${fmtNum(s.density.kgM2, 1)} · ліміт`
                                : s.density.daysToLimit != null
                                  ? `${fmtNum(s.density.kgM2, 1)} · ${s.density.reachAgeDays} д.`
                                  : fmtNum(s.density.kgM2, 1)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{s.fcr ? fmtNum(s.fcr, 3) : "—"}</td>
                          <td className="px-4 py-3 tabular-nums">
                            {s.soldHead ? fmtNum(s.saleFcr, 3) : "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {hf?.projectedFcr ? fmtNum(hf.projectedFcr, 3) : "—"}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{hf ? fmtInt(hf.projectedEpef) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <Card>
        <CardTitle>Як читати прогноз</CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            FCR = увесь корм з посадки ÷ (жива маса залишку + вага здачі − маса курчат). Падіж не рахується
            як мʼясо, тому погіршує конверсію.
          </li>
          <li>FCR зараз — на останній звіт. FCR здачі — заморожений на день останнього продажу.</li>
          <li>FCR закриття — прогноз на цільову добу кросу від фактичного приросту і витрати корму.</li>
          <li>Маса на забої — від фактичного середнього приросту цієї посадки, не від таблиці кросу.</li>
          <li>EPEF рахується на цільову добу з фактичним падежем і прогнозною конверсією.</li>
        </ul>
      </Card>
    </div>
  );
}
