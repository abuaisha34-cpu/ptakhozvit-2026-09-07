import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { createBackupOwner, createOrganization, getHoldings, getPlatformStaff, resetDemo, setPlatformAdmin, setPlatformOwner } from "@/lib/server/fns";
import { staffLabel } from "@/lib/broiler/roles";
import type { DemoStats } from "@/lib/broiler/types";
import { useAsync } from "@/lib/use-async";
import { fmtInt } from "@/lib/utils";

export const Route = createFileRoute("/holdings/")({ component: Holdings });

function Holdings() {
  const { data, error, loading, setData } = useAsync(() => getHoldings(), []);
  if (loading) return <div className="h-48 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">{staffLabel(data.profile)}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight md:text-4xl">Господарства</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Хазяїн і адміністратор системи відкривають господарства. Кожне отримує свій код — передайте
          його технологу компанії. Люди не можуть створити господарство самі.
        </p>
      </header>

      <DemoPromo
        stats={data.demo}
        onDone={async () => {
          setData(await getHoldings());
        }}
      />

      {data.holdings.length === 0 ? (
        <Card>
          <CardTitle>Поки порожньо</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Відкрийте перше господарство нижче і віддайте код головному технологу цієї компанії.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.holdings.map((h) => (
            <Link
              key={h.id}
              to="/holdings/$orgId"
              params={{ orgId: String(h.id) }}
              className="block rounded-[20px] bg-surface p-4 shadow-[var(--shadow-border)] transition-colors hover:bg-surface-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-medium tracking-tight">
                    {h.name}
                    {h.isDemo ? (
                      <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-sans font-medium text-primary">
                        демо
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {h.factoryCount} фабр. · {h.houseCount} пташн. · {fmtInt(h.head)} гол.
                    {h.technoName ? ` · ${h.technoName}` : ""}
                  </p>
                  <p className="mt-1 font-display text-sm tracking-[0.16em] text-fg">Код {h.inviteCode}</p>
                </div>
                <span className="inline-flex h-11 items-center gap-1 text-sm text-muted">
                  Відкрити
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <OwnerCreate
        onDone={async () => {
          setData(await getHoldings());
        }}
      />

      <SysAdmins canAssign={data.profile.isOwner} />
      {data.profile.isOwner ? <BackupOwner /> : null}
    </div>
  );
}

function DemoPromo({ stats, onDone }: { stats: DemoStats; onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ptakhozvit.com.ua";
  const link = `${origin}/demo`;

  return (
    <Card>
      <CardTitle>Демо для реклами</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Посилання відкриває навчальну ферму з чотирма пташниками і звітами. Гості не бачать ваших
        компаній і не стають хазяїном сайту. Скидання повертає вітрину до типових цифр.
      </p>
      <p className="mt-3 break-all font-display text-sm tracking-wide text-fg">{link}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat k="Гостей спробували" v={fmtInt(stats.guests)} s="окремі люди, що відкрили /demo" />
        <Stat k="За 7 днів" v={fmtInt(stats.guests7d)} s="унікальні за тиждень" />
        <Stat k="Відкриттів" v={fmtInt(stats.visits)} s={`${fmtInt(stats.visits24h)} за добу`} />
        <Stat
          k="Останній захід"
          v={stats.lastVisit ? fmtWhen(stats.lastVisit) : "ще нікого"}
          s={`${fmtInt(stats.visits7d)} відкриттів за тиждень`}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setMsg("Посилання скопійовано");
            } catch {
              setMsg(link);
            }
          }}
        >
          Копіювати посилання
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMsg(null);
            try {
              await resetDemo();
              await onDone();
              setMsg("Вітрину оновлено");
            } catch (err) {
              setMsg(err instanceof Error ? err.message : "Помилка");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "…" : "Оновити демо-дані"}
        </Button>
      </div>
      {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
    </Card>
  );
}

function OwnerCreate({ onDone }: { onDone: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [factoryName, setFactoryName] = useState("Фабрика 1");
  const [houseCount, setHouseCount] = useState("2");
  const [capacity, setCapacity] = useState("9000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; code: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await createOrganization({
        data: {
          name,
          factoryName,
          houseCount: Number(houseCount) || 1,
          capacity: Number(capacity) || 9000,
        },
      });
      const saved = name.trim();
      setCreated({ name: saved, code: res.inviteCode });
      setName("");
      setFactoryName("Фабрика 1");
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardTitle className="flex items-center gap-2">
        <Building2 className="size-4" strokeWidth={1.75} />
        Нове господарство
      </CardTitle>
      <p className="mt-2 text-sm text-muted">
        Відкриваєте ви. Код віддайте технологу компанії — він зареєструється і введе його.
      </p>
      {created ? (
        <p className="mt-3 rounded-[12px] bg-ok/15 px-3 py-2 text-sm text-ok">
          «{created.name}» відкрито. Код{" "}
          <span className="font-display tracking-[0.16em] text-fg">{created.code}</span>
        </p>
      ) : null}
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="own-org">Назва компанії</Label>
          <Input id="own-org" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="own-factory">Перша фабрика</Label>
          <Input
            id="own-factory"
            value={factoryName}
            onChange={(e) => setFactoryName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="own-houses">Пташників</Label>
            <Input
              id="own-houses"
              inputMode="numeric"
              value={houseCount}
              onChange={(e) => setHouseCount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="own-cap">Місткість / пташник</Label>
            <Input
              id="own-cap"
              inputMode="numeric"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-bad">{error}</p> : null}
        <Button type="submit" disabled={busy || name.trim().length < 2}>
          {busy ? "Створення…" : "Відкрити господарство"}
        </Button>
      </form>
    </Card>
  );
}

function SysAdmins({ canAssign }: { canAssign: boolean }) {
  const { data, error, loading, setData } = useAsync(() => getPlatformStaff(), []);
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const people = data?.people ?? [];
  const admins = people.filter((p) => p.isOwner || p.isAdmin);
  const candidates = people.filter((p) => !p.isOwner && !p.isAdmin);

  async function toggle(userId: string, admin: boolean) {
    setBusy(userId);
    setMsg(null);
    try {
      await setPlatformAdmin({ data: { userId, admin } });
      setData(await getPlatformStaff());
      setPick("");
      setMsg(admin ? "Призначено адміністратора" : "Знято з адміністраторів");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Помилка");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div className="h-32 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;

  return (
    <Card>
      <CardTitle>Адміністратори системи</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Бачать усі господарства, як хазяїн: коди, посадки, команду. Не замінюють хазяїна
        сайту. Це не роль у господарстві — доступ на весь сайт.
      </p>
      <ul className="mt-4 space-y-2">
        {admins.map((p) => (
          <li
            key={p.userId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{p.fullName || p.email || "Користувач"}</p>
              <p className="text-xs text-muted">
                {p.isOwner ? "Хазяїн сайту" : "Адміністратор системи"}
                {p.orgName ? ` · ${p.orgName}` : ""}
                {p.email && p.fullName ? ` · ${p.email}` : ""}
              </p>
            </div>
            {canAssign && p.isAdmin && !p.isOwner ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy === p.userId}
                onClick={() => void toggle(p.userId, false)}
              >
                Зняти
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      {canAssign ? (
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (pick) void toggle(pick, true);
          }}
        >
          <div className="min-w-56 flex-1">
            <Label htmlFor="sys-admin">Призначити з зареєстрованих</Label>
            <Select id="sys-admin" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">Оберіть користувача</option>
              {candidates.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.fullName || p.email || p.userId}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={!pick || Boolean(busy)}>
            Призначити
          </Button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted">Зняти чи додати адміністратора може лише хазяїн сайту.</p>
      )}
      {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
      {canAssign && !candidates.length ? (
        <p className="mt-2 text-sm text-muted">Немає інших зареєстрованих користувачів.</p>
      ) : null}
    </Card>
  );
}

function BackupOwner() {
  const { data, error, loading, setData } = useAsync(() => getPlatformStaff(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Запасний хазяїн");
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const owners = (data?.people ?? []).filter((p) => p.isOwner);
  const others = (data?.people ?? []).filter((p) => !p.isOwner);

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await createBackupOwner({ data: { email, password, name } });
      setEmail("");
      setPassword("");
      setData(await getPlatformStaff());
      setMsg("Запасний запис створено.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Не створено");
    } finally {
      setBusy(false);
    }
  }

  async function appoint() {
    if (!pick) return;
    setBusy(true);
    setMsg(null);
    try {
      await setPlatformOwner({ data: { userId: pick, owner: true } });
      setPick("");
      setData(await getPlatformStaff());
      setMsg("Призначено запасного хазяїна");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Помилка");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userId: string) {
    setBusy(true);
    setMsg(null);
    try {
      await setPlatformOwner({ data: { userId, owner: false } });
      setData(await getPlatformStaff());
      setMsg("Знято права хазяїна");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Помилка");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="h-32 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;

  return (
    <Card>
      <CardTitle>Запасний хазяїн сайту</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Окремий вхід з тими самими правами: усі господарства, коди, команда. Якщо Google не відкриється —
        заходьте поштою і паролем. Не більше трьох хазяїнів.
      </p>
      <ul className="mt-4 space-y-2">
        {owners.map((p) => (
          <li
            key={p.userId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-bg px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{p.fullName || p.email || "Хазяїн"}</p>
              <p className="text-xs text-muted">{p.email}</p>
            </div>
            {owners.length > 1 && p.userId !== data?.profile.userId ? (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => void revoke(p.userId)}>
                Зняти
              </Button>
            ) : (
              <span className="text-xs text-subtle">повний доступ</span>
            )}
          </li>
        ))}
      </ul>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(e) => void create(e)}>
        <div className="sm:col-span-2">
          <Label htmlFor="bo-name">Імʼя в системі</Label>
          <Input id="bo-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bo-email">Пошта для входу</Label>
          <Input
            id="bo-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="backup@…"
          />
        </div>
        <div>
          <Label htmlFor="bo-pass">Пароль (від 10 символів)</Label>
          <Input
            id="bo-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy || email.trim().length < 5 || password.length < 10}>
            {busy ? "…" : "Створити запасний запис"}
          </Button>
        </div>
      </form>
      {others.length ? (
        <form
          className="mt-4 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void appoint();
          }}
        >
          <div className="min-w-56 flex-1">
            <Label htmlFor="bo-pick">Або призначити вже зареєстрованого</Label>
            <Select id="bo-pick" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">Оберіть</option>
              {others.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.fullName || p.email || p.userId}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={!pick || busy}>
            Зробити хазяїном
          </Button>
        </form>
      ) : null}
      {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
    </Card>
  );
}

function Stat({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-[14px] bg-bg px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">{k}</p>
      <p className="mt-1 font-display text-lg font-medium tracking-tight text-fg">{v}</p>
      <p className="mt-0.5 text-xs text-muted">{s}</p>
    </div>
  );
}

function fmtWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  }).format(d);
}
