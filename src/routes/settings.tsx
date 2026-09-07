import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { NumberField } from "@/components/ui/number-field";
import { addHouse, addSite, deleteFlock, deleteHouse, getSettings, getSheetsIntegration, placeFlock, rotateSheetsToken, saveCosts, saveFlock, saveHouse, saveOrganization, saveSite, setSiteHouseCount, wipeOperations } from "@/lib/server/fns";
import type { CostSettings, Flock, House, Profile, Site } from "@/lib/broiler/types";
import { BREEDS, breedByName } from "@/lib/broiler/standards";
import { canManageFlocks, canManageOps, isDemoUser } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";
import { todayISO } from "@/lib/utils";
import { GeoPicker } from "@/components/weather-panel";
type SettingsSearch = { org?: number };

export const Route = createFileRoute("/settings")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function Page() {
  return (
    <AppShell>
      <Settings />
    </AppShell>
  );
}

function Settings() {
  const { org } = Route.useSearch();
  const { data, error, loading, setData } = useAsync(() => getSettings({ data: { orgId: org } }), [org]);
  const [msg, setMsg] = useState<string | null>(null);

  if (loading) return <div className="h-48 animate-pulse rounded-[24px] bg-surface" />;
  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl font-medium">Параметри</h1>
        <p className="mt-3 text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">
          {canManageOps(data.profile) ? "Параметри" : "Посадки"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {canManageOps(data.profile)
            ? "Господарство, фабрики, пороги відхилень і посадки. Населений пункт фабрики потрібен для прогнозу погоди в щоденному звіті."
            : "Відкрийте посадку, змініть поголівʼя або крос. Вкажіть місто фабрики — у звіті зʼявиться прогноз і рекомендації мікроклімату."}
        </p>
      </header>
      {msg ? <p className="text-sm text-ok">{msg}</p> : null}

      {canManageOps(data.profile) ? (
        <OrgForm
          name={data.orgName ?? data.profile.orgName ?? ""}
          orgId={org}
          onSaved={async () => {
            setData(await getSettings({ data: { orgId: org } }));
            setMsg("Назву господарства оновлено");
          }}
        />
      ) : null}

      {canManageOps(data.profile) ? <SheetsCard orgId={org} /> : null}

      {data.costs ? (
      <CostsForm
        initial={data.costs}
        orgId={org}
        canEdit={!isDemoUser(data.profile)}
        onSaved={async () => {
          setData(await getSettings({ data: { orgId: org } }));
          setMsg("Параметри оновлено");
        }}
      />
      ) : null}

      {canManageOps(data.profile) ? (
        <AddFactoryForm
          orgId={org}
          onSaved={async (name) => {
            setData(await getSettings({ data: { orgId: org } }));
            setMsg(`Фабрику «${name}» додано`);
          }}
        />
      ) : null}

      {data.sites.map((s) => (
        <FactoryBlock
          key={s.id}
          site={s}
          houses={data.houses.filter((h) => h.siteId === s.id)}
          flocks={data.flocks}
          profile={data.profile}
          onSaved={async (text) => {
            setData(await getSettings({ data: { orgId: org } }));
            setMsg(text);
          }}
        />
      ))}

      {data.sites.length > 0 ? (
      <PlaceForm
        sites={data.sites}
        houses={data.houses}
        onSaved={async (code) => {
          setData(await getSettings({ data: { orgId: org } }));
          setMsg(`Відкрито посадку ${code}`);
        }}
      />
      ) : null}

      {canManageOps(data.profile) && !isDemoUser(data.profile) ? (
        <WipeBlock
          orgId={org}
          onWiped={async () => {
            setData(await getSettings({ data: { orgId: org } }));
            setMsg("Усі посадки і звіти видалено. Фабрики та пташники лишились.");
          }}
        />
      ) : null}
    </div>
  );
}

function CostsForm({
  initial,
  orgId,
  canEdit,
  onSaved,
}: {
  initial: CostSettings;
  orgId?: number;
  canEdit: boolean;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    feedAlertPct: String(initial.feedAlertPct),
    waterAlertPct: String(initial.waterAlertPct),
    weightAlertPct: String(initial.weightAlertPct),
  });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setForm({
      feedAlertPct: String(initial.feedAlertPct),
      waterAlertPct: String(initial.waterAlertPct),
      weightAlertPct: String(initial.weightAlertPct),
    });
  }, [initial]);

  return (
    <Card>
      <CardTitle>Пороги відхилень</CardTitle>
      <p className="mt-2 text-sm text-muted">Коли факт корму, води або маси відходить від норми кросу.</p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canEdit) return;
          setBusy(true);
          try {
            await saveCosts({
              data: {
                ...initial,
                feedAlertPct: Number(form.feedAlertPct) || 8,
                waterAlertPct: Number(form.waterAlertPct) || 10,
                weightAlertPct: Number(form.weightAlertPct) || 6,
                orgId,
              },
            });
            await onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        <NumberField
          label="Поріг корму"
          unit="%"
          value={form.feedAlertPct}
          onChange={(v) => setForm({ ...form, feedAlertPct: v })}
          step={1}
          hint="Сповіщення, якщо |факт − норма| ≥ цього %"
        />
        <NumberField
          label="Поріг води"
          unit="%"
          value={form.waterAlertPct}
          onChange={(v) => setForm({ ...form, waterAlertPct: v })}
          step={1}
          hint="Споживання води відносно норми кросу"
        />
        <NumberField
          label="Поріг маси"
          unit="%"
          value={form.weightAlertPct}
          onChange={(v) => setForm({ ...form, weightAlertPct: v })}
          step={1}
          hint="Відставання живої маси від норми кросу"
        />
        <div className="md:col-span-3">
          {canEdit ? (
            <Button type="submit" disabled={busy}>
              {busy ? "Збереження…" : "Зберегти пороги"}
            </Button>
          ) : (
            <p className="text-sm text-muted">У демо пороги не змінюються.</p>
          )}
        </div>
      </form>
    </Card>
  );
}

function OrgForm({
  name: initial,
  orgId,
  onSaved,
}: {
  name: string;
  orgId?: number;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <Card>
      <CardTitle>Господарство</CardTitle>
      <form
        className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await saveOrganization({ data: { name, orgId } });
            await onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label htmlFor="org-rename">Назва компанії</Label>
          <Input id="org-rename" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" variant="secondary" disabled={busy || name.trim().length < 2}>
            Зберегти
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AddFactoryForm({
  orgId,
  onSaved,
}: {
  orgId?: number;
  onSaved: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [houseCount, setHouseCount] = useState("2");
  const [capacity, setCapacity] = useState("9000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardTitle>Нова фабрика</CardTitle>
      <p className="mt-2 text-sm text-muted">Додайте майданчик цього господарства — чужі компанії його не побачать.</p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await addSite({
              data: {
                name,
                location,
                houseCount: Number(houseCount) || 1,
                capacity: Number(capacity) || 9000,
                orgId,
              },
            });
            const saved = name.trim();
            setName("");
            setLocation("");
            await onSaved(saved);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Помилка");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="md:col-span-2">
          <Label htmlFor="new-factory">Назва</Label>
          <Input id="new-factory" value={name} onChange={(e) => setName(e.target.value)} placeholder="Фабрика «Схід»" />
        </div>
        <div>
          <Label htmlFor="new-houses">Пташників</Label>
          <Input id="new-houses" inputMode="numeric" value={houseCount} onChange={(e) => setHouseCount(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="new-cap">Місткість / пташник</Label>
          <Input id="new-cap" inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <div className="md:col-span-4">
          <Label htmlFor="new-loc">Розташування</Label>
          <Input id="new-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Корпус, район" />
        </div>
        {error ? <p className="md:col-span-4 text-sm text-bad">{error}</p> : null}
        <div className="md:col-span-4">
          <Button type="submit" disabled={busy || name.trim().length < 2}>
            {busy ? "Додавання…" : "Додати фабрику"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FactoryBlock({
  site,
  houses,
  flocks,
  profile,
  onSaved,
}: {
  site: Site;
  houses: House[];
  flocks: Flock[];
  profile: Profile;
  onSaved: (msg: string) => Promise<void>;
}) {
  const [name, setName] = useState(site.name);
  const [location, setLocation] = useState(site.location);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wantHouses, setWantHouses] = useState(String(houses.length));
  const [countBusy, setCountBusy] = useState(false);
  const [countErr, setCountErr] = useState<string | null>(null);
  const structure = canManageOps(profile);

  return (
    <Card className="space-y-4">
      <CardTitle>{site.name}</CardTitle>
      {structure ? (
      <form
        className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await saveSite({ data: { id: site.id, name, location } });
            await onSaved("Фабрику оновлено");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label>Назва фабрики</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Розташування</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" variant="secondary" disabled={busy}>
            Зберегти
          </Button>
        </div>
      </form>
      ) : (
        <p className="text-sm text-muted">{site.location}</p>
      )}
      {canManageFlocks(profile) ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Населений пункт для погоди</p>
          <p className="mt-1 mb-2 text-sm text-muted">
            {site.geoName
              ? `${site.geoName}${site.geoAdmin ? `, ${site.geoAdmin}` : ""}`
              : "Ще не вказано — прогноз у звіті не підтягнеться."}
          </p>
          <GeoPicker
            siteId={site.id}
            current={site.geoName}
            onSaved={() => onSaved("Населений пункт збережено")}
          />
        </div>
      ) : site.geoName ? (
        <p className="text-sm text-muted">
          Погода: {site.geoName}
          {site.geoAdmin ? `, ${site.geoAdmin}` : ""}
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-subtle">Пташники</p>
        {structure ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setCountBusy(true);
              setCountErr(null);
              try {
                const res = await setSiteHouseCount({
                  data: { siteId: site.id, houseCount: Number(wantHouses) || houses.length },
                });
                const msg =
                  res.added
                    ? `Додано ${res.added} пташник(и)`
                    : res.removed
                      ? `Прибрано ${res.removed} зайвих порожніх`
                      : "Кількість уже така";
                await onSaved(msg);
              } catch (err) {
                setCountErr(err instanceof Error ? err.message : "Не змінено");
              } finally {
                setCountBusy(false);
              }
            }}
          >
            <div>
              <Label htmlFor={`houses-${site.id}`}>Має бути пташників</Label>
              <Input
                id={`houses-${site.id}`}
                inputMode="numeric"
                className="w-24"
                value={wantHouses}
                onChange={(e) => setWantHouses(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" disabled={countBusy}>
              {countBusy ? "…" : "Виправити кількість"}
            </Button>
            {countErr ? <p className="w-full text-sm text-bad">{countErr}</p> : null}
            <p className="w-full text-xs text-muted">
              Зараз {houses.length}. Зайві порожні приберуться, потрібні — додадуться. Пташник із посадкою не
              видалиться.
            </p>
          </form>
        ) : null}
        {houses.map((h) => {
          const flock = flocks.find((f) => f.houseId === h.id && f.status === "active");
          return (
            <HouseRow
              key={h.id}
              house={h}
              flock={flock ?? null}
              canEditHouse={structure}
              onSaved={onSaved}
              onDelete={
                structure
                  ? async () => {
                      if (!window.confirm(`Прибрати «${h.name}» з фабрики? Посадку з кошика можна буде повернути лише якщо пташник лишиться.`))
                        return;
                      await deleteHouse({ data: { houseId: h.id } });
                      await onSaved(`«${h.name}» прибрано`);
                    }
                  : undefined
              }
            />
          );
        })}
        {structure ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={adding}
          onClick={async () => {
            setAdding(true);
            try {
              await addHouse({ data: { siteId: site.id, capacity: 9000 } });
              await onSaved("Пташник додано");
            } finally {
              setAdding(false);
            }
          }}
        >
          {adding ? "…" : "Додати пташник"}
        </Button>
        ) : null}
      </div>
    </Card>
  );
}

function HouseRow({
  house,
  flock,
  canEditHouse,
  onSaved,
  onDelete,
}: {
  house: House;
  flock: Flock | null;
  canEditHouse: boolean;
  onSaved: (msg: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(house.name);
  const [capacity, setCapacity] = useState(String(house.capacity));
  const [areaM2, setAreaM2] = useState(String(house.areaM2 || Math.round(house.capacity / 18)));
  const [breed, setBreed] = useState(flock?.breed ?? BREEDS[0].name);
  const [chicks, setChicks] = useState(String(flock?.chicksPlaced ?? 9000));
  const [placedAt, setPlacedAt] = useState(flock?.placedAt ?? todayISO());
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBreed(flock?.breed ?? BREEDS[0].name);
    setChicks(String(flock?.chicksPlaced ?? 9000));
    setPlacedAt(flock?.placedAt ?? todayISO());
  }, [flock?.breed, flock?.chicksPlaced, flock?.placedAt]);
  return (
    <div className="space-y-2 rounded-[16px] bg-bg p-3">
      {canEditHouse ? (
      <form
        className="grid gap-2 md:grid-cols-[1fr_7rem_7rem_auto_auto] md:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await saveHouse({
              data: {
                id: house.id,
                name,
                capacity: Number(capacity) || 0,
                areaM2: Number(areaM2) || 0,
              },
            });
            await onSaved("Пташник оновлено");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label>Пташник</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Гол.</Label>
          <Input
            inputMode="numeric"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            aria-label="Місткість"
          />
        </div>
        <div>
          <Label>м²</Label>
          <Input
            inputMode="numeric"
            value={areaM2}
            onChange={(e) => setAreaM2(e.target.value)}
            aria-label="Площа м²"
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={busy}>
          Ок
        </Button>
        {onDelete && !flock ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onDelete();
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "Не прибрано");
              } finally {
                setBusy(false);
              }
            }}
          >
            Прибрати
          </Button>
        ) : null}
      </form>
      ) : (
        <p className="text-sm font-medium text-fg">
          {house.name}
          <span className="ml-2 text-xs font-normal text-muted">
            місткість {house.capacity}
            {house.areaM2 > 0 ? ` · ${house.areaM2} м²` : ""}
          </span>
        </p>
      )}
      {flock ? (
        <form
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_8rem_9rem_auto_auto] lg:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveFlock({
                data: {
                  flockId: flock.id,
                  chicksPlaced: Number(chicks) || 0,
                  placedAt,
                  breed,
                  chickCostUah: flock.chickCostUah,
                  targetDays: flock.targetDays,
                  targetWeightG: flock.targetWeightG,
                },
              });
              await onSaved(`Посадку ${house.name} оновлено · ${chicks} гол.`);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <Label>Крос</Label>
            <Select
              value={breed}
              aria-label="Крос"
              onChange={(e) => setBreed(e.target.value)}
            >
              {BREEDS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
              {BREEDS.some((b) => b.name === breed) ? null : <option value={breed}>{breed}</option>}
            </Select>
          </div>
          <div>
            <Label htmlFor={`chicks-${house.id}`}>Поголівʼя</Label>
            <Input
              id={`chicks-${house.id}`}
              inputMode="numeric"
              value={chicks}
              onChange={(e) => setChicks(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`placed-${house.id}`}>Дата посадки</Label>
            <Input
              id={`placed-${house.id}`}
              type="date"
              value={placedAt}
              onChange={(e) => setPlacedAt(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? "…" : "Зберегти"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(`Надіслати посадку ${flock.code} в кошик? Звіти можна повернути в Журналі.`)) return;
              setBusy(true);
              try {
                await deleteFlock({ data: { flockId: flock.id } });
                await onSaved("Посадку відправлено в кошик");
              } finally {
                setBusy(false);
              }
            }}
          >
            Видалити
          </Button>
          <p className="sm:col-span-2 lg:col-span-5 text-xs text-muted">
            {flock.code}. Зміна поголівʼя перерахує залишок у всіх звітах цієї посадки.
          </p>
        </form>
      ) : (
        <p className="text-xs text-muted">Немає посадки — відкрийте нижче.</p>
      )}
    </div>
  );
}

function PlaceForm({
  sites,
  houses,
  onSaved,
}: {
  sites: Site[];
  houses: House[];
  onSaved: (code: string) => Promise<void>;
}) {
  const [siteId, setSiteId] = useState(String(sites[0]?.id ?? ""));
  const housesOfSite = houses.filter((h) => String(h.siteId) === siteId);
  const [houseId, setHouseId] = useState(String(housesOfSite[0]?.id ?? ""));
  const [placedAt, setPlacedAt] = useState(todayISO());
  const [chicks, setChicks] = useState("9000");
  const [days, setDays] = useState("42");
  const [weight, setWeight] = useState("2800");
  const [breed, setBreed] = useState(BREEDS[0].name);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const next = houses.filter((h) => String(h.siteId) === siteId);
    if (!next.some((h) => String(h.id) === houseId)) {
      setHouseId(String(next[0]?.id ?? ""));
    }
  }, [siteId, houses, houseId]);

  return (
    <Card>
      <CardTitle>Нова посадка</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Посадка відкривається в обраному пташнику на вказану дату. Норми корму, води і маси
        беруться з обраного кросу. Поточна активна посадка цього пташника буде закрита.
      </p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const res = await placeFlock({
              data: {
                houseId: Number(houseId),
                placedAt,
                chicksPlaced: Number(chicks),
                chickCostUah: 0,
                targetDays: Number(days),
                targetWeightG: Number(weight),
                breed,
              },
            });
            await onSaved(res.code);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label htmlFor="place-site">Фабрика</Label>
          <Select id="place-site" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="place-house">Пташник</Label>
          <Select id="place-house" value={houseId} onChange={(e) => setHouseId(e.target.value)}>
            {housesOfSite.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="place-breed">Крос</Label>
          <Select
            id="place-breed"
            value={breed}
            onChange={(e) => {
              const next = e.target.value;
              setBreed(next);
              const meta = breedByName(next);
              setDays(String(meta.targetDays));
              setWeight(String(meta.targetWeightG));
            }}
          >
            {BREEDS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="placed-at">Дата посадки</Label>
          <Input id="placed-at" type="date" value={placedAt} onChange={(e) => setPlacedAt(e.target.value)} />
        </div>
        <NumberField label="Поголівʼя" unit="гол." value={chicks} onChange={setChicks} step={50} />
        <NumberField label="Цільова доба" unit="діб" value={days} onChange={setDays} step={1} min={20} max={56} />
        <NumberField label="Цільова маса" unit="г" value={weight} onChange={setWeight} step={50} />
        <div className="md:col-span-3">
          <Button type="submit" disabled={busy || !houseId}>
            {busy ? "…" : "Відкрити посадку"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function WipeBlock({ orgId, onWiped }: { orgId?: number; onWiped: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Card>
      <CardTitle>Чистий старт</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Ховає всі посадки в кошик. Звіти не знищуються — їх можна повернути в Журналі. Фабрики,
        пташники і користувачі лишаються.
      </p>
      <Button
        className="mt-4"
        variant="danger"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm("Надіслати всі посадки в кошик? Звіти можна буде повернути з Журналу.")) return;
          setBusy(true);
          try {
            await wipeOperations({ data: { orgId } });
            await onWiped();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "…" : "Очистити всі звіти і посадки"}
      </Button>
    </Card>
  );
}

function SheetsCard({ orgId }: { orgId?: number }) {
  const { data, error, loading, setData } = useAsync(
    () => getSheetsIntegration({ data: { orgId } }),
    [orgId],
  );
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
  }

  async function rotate() {
    if (!window.confirm("Старе посилання перестане працювати в усіх таблицях. Продовжити?")) return;
    setBusy(true);
    try {
      await rotateSheetsToken({ data: { orgId } });
      setData(await getSheetsIntegration({ data: { orgId } }));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;

  return (
    <Card>
      <CardTitle>Google Sheets</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Жива таблиця підтягує цифри з сайту. Створіть Google Таблицю, вставте формулу в A1. Google
        оновлює її сама. Кнопка «Google Sheets» на звітах ще й копіює поточний вигляд у буфер.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-fg">
        <li>Відкрийте нову таблицю</li>
        <li>Вставте формулу в клітинку A1</li>
        <li>За потреби Файл → Імпорт, якщо формула заблокована політикою домену</li>
      </ol>
      <div className="mt-4 space-y-3">
        {data.feeds.map((f) => (
          <div key={f.kind} className="rounded-[16px] bg-bg p-3">
            <p className="text-sm font-medium">{f.label}</p>
            <code className="mt-1 block break-all text-[11px] text-muted">{f.formula}</code>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => void copy(f.formula, f.kind)}>
                {copied === f.kind ? "Скопійовано" : "Копіювати формулу"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open("https://docs.google.com/spreadsheets/create", "_blank", "noopener,noreferrer")}
              >
                Створити таблицю
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-4" variant="ghost" disabled={busy} onClick={() => void rotate()}>
        {busy ? "…" : "Оновити посилання"}
      </Button>
    </Card>
  );
}

