import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Package,
  Ruler,
  ScrollText,
  Settings2,
  Sun,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  Wheat,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/server/fns";
import {
  groupsFor,
  navItemActive,
  navItemKey,
  type NavDef,
  type NavGroupId,
} from "@/lib/broiler/nav";
import type { Profile, Site } from "@/lib/broiler/types";
import { canManageFlocks, canManageOps, isDemoUser, isPlatformAdmin, staffLabel } from "@/lib/broiler/roles";
import { cn } from "@/lib/utils";
import { Wordmark } from "./brand";
import { InstallBanner, InstallCard } from "./install-app";
import { NoticeBell } from "./notice-bell";
import { Button } from "./ui/button";
import { Onboarding } from "./onboarding";

const MOBILE_PRIMARY = ["/", "/report", "/tools"] as const;
const NAV_OPEN_KEY = "pz-nav";

function iconFor(item: NavDef): LucideIcon {
  if (item.hash === "light") return Sun;
  if (item.hash === "premix") return Package;
  if (item.hash === "place") return LayoutGrid;
  if (item.hash === "norm") return Ruler;
  switch (item.to) {
    case "/":
      return LayoutDashboard;
    case "/report":
      return ClipboardList;
    case "/journal":
      return ScrollText;
    case "/tools":
      return Wrench;
    case "/feed":
      return Wheat;
    case "/guide":
      return BookOpen;
    case "/cost":
      return Wallet;
    case "/forecasts":
      return TrendingUp;
    case "/period":
      return BarChart3;
    case "/holdings":
      return Building2;
    case "/settings":
      return Settings2;
    case "/team":
      return Users;
    default:
      return LayoutDashboard;
  }
}

function readNavOpen(): Partial<Record<NavGroupId, boolean>> {
  try {
    const raw = localStorage.getItem(NAV_OPEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Partial<Record<NavGroupId, boolean>>;
  } catch {
    return {};
  }
}

function writeNavOpen(open: Record<string, boolean>) {
  try {
    localStorage.setItem(NAV_OPEN_KEY, JSON.stringify(open));
  } catch {
    /* ignore quota / private mode */
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [boot, setBoot] = useState<{ profile: Profile; sites: Site[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getMe()
      .then((data) => {
        if (!cancelled) setBoot({ profile: data.profile, sites: data.sites });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Помилка завантаження";
        setError(message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg">
        <Wordmark />
        <p className="text-sm text-muted">Завантаження сесії…</p>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {!boot && !error ? (
          <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg">
            <Wordmark />
            <p className="text-sm text-muted">Завантаження звітів…</p>
          </div>
        ) : error ? (
          <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
            <p className="text-sm text-muted">{error}</p>
          </div>
        ) : boot && !boot.profile.orgId && !isPlatformAdmin(boot.profile) ? (
          <Onboarding
            onDone={() => {
              setBoot(null);
              setError(null);
              void getMe()
                .then((data) => setBoot({ profile: data.profile, sites: data.sites }))
                .catch((err: unknown) => {
                  setError(err instanceof Error ? err.message : "Помилка завантаження");
                });
            }}
          />
        ) : boot?.profile.role === "pending" && !isPlatformAdmin(boot.profile) ? (
          <PendingScreen profile={boot.profile} />
        ) : boot ? (
          <ShellFrame profile={boot.profile}>{children}</ShellFrame>
        ) : null}
      </SignedIn>
    </>
  );
}

function PendingScreen({ profile }: { profile: Profile }) {
  const [out, setOut] = useState(false);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <Wordmark />
      <h1 className="mt-10 max-w-md font-display text-3xl font-medium tracking-tight">
        Очікуєте призначення
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {profile.orgName ? (
          <>
            Запис у господарстві «{profile.orgName}» створено
            {profile.email || profile.fullName ? ` (${profile.email ?? profile.fullName})` : ""}.
            Головний технолог або партнер має призначити роль: керівник фабрики, ветеринар або директор.
          </>
        ) : (
          <>
            Обліковий запис {profile.email ?? profile.fullName ?? ""} створено. Головний
            технолог або партнер має призначити роль.
          </>
        )}
      </p>
      <Button
        className="mt-8"
        variant="secondary"
        disabled={out}
        onClick={() => {
          setOut(true);
          void signOut("/login").catch(() => setOut(false));
        }}
      >
        {out ? "Вихід…" : "Вийти"}
      </Button>
    </div>
  );
}

function ShellFrame({ profile, children }: { profile: Profile; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const groups = useMemo(() => groupsFor(profile), [profile]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const activeGroup = groups.find((g) => g.items.some((i) => navItemActive(i, pathname, hash)))?.id;

  const [open, setOpen] = useState<Partial<Record<NavGroupId, boolean>>>(() => {
    const stored = readNavOpen();
    const next: Partial<Record<NavGroupId, boolean>> = {};
    for (const g of groups) next[g.id] = stored[g.id] ?? true;
    if (activeGroup) next[activeGroup] = true;
    return next;
  });
  const [out, setOut] = useState(false);
  const [more, setMore] = useState(false);
  const label = staffLabel(profile);

  useEffect(() => {
    writeNavOpen(open);
  }, [open]);

  useEffect(() => {
    if (!activeGroup) return;
    setOpen((prev) => (prev[activeGroup] ? prev : { ...prev, [activeGroup]: true }));
  }, [pathname, hash, activeGroup]);

  const primary = MOBILE_PRIMARY.map((to) => flat.find((i) => i.to === to && !i.hash)).filter(
    (x): x is NavDef => Boolean(x),
  );
  const tabs = primary.length ? primary : flat.filter((i) => !i.hash).slice(0, 3);
  const moreActive =
    more || !tabs.some((item) => navItemActive(item, pathname, hash) || (item.to !== "/" && pathname.startsWith(item.to) && !item.hash));

  function toggleGroup(id: NavGroupId) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-dvh bg-bg pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-surface/80 backdrop-blur-md md:flex">
        <div className="shrink-0 px-5 py-4">
          <Wordmark />
          {profile.orgName ? (
            <p className="mt-2 truncate px-0.5 text-xs text-muted">{profile.orgName}</p>
          ) : isPlatformAdmin(profile) ? (
            <p className="mt-2 truncate px-0.5 text-xs text-muted">Усі господарства</p>
          ) : null}
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-2">
          {groups.map((group) => {
            const expanded = open[group.id] !== false;
            return (
              <div key={group.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`nav-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                  className="flex h-8 w-full items-center justify-between rounded-[12px] px-2 text-left text-xs font-medium uppercase tracking-[0.12em] text-subtle transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 text-subtle transition-transform duration-150 ease-[var(--ease-out)]",
                      expanded ? "rotate-0" : "-rotate-90",
                    )}
                    strokeWidth={2}
                  />
                </button>
                {expanded ? (
                  <div id={`nav-${group.id}`} className="mt-0.5 flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <NavRow key={navItemKey(item)} item={item} pathname={pathname} hash={hash} nested={Boolean(item.hash)} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 px-4 py-3">
          <p className="truncate text-sm font-medium text-fg">
            {profile.fullName ?? profile.email ?? "Користувач"}
          </p>
          <p className="truncate text-xs text-muted">{label}</p>
          <Link
            to="/account"
            className="mt-2 block text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Редагувати запис
          </Link>
          <button
            type="button"
            disabled={out}
            onClick={() => {
              setOut(true);
              void signOut("/login").catch(() => setOut(false));
            }}
            className="mt-2 text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            {out ? "Вихід…" : "Вийти"}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between bg-surface/80 px-4 py-3 backdrop-blur-md md:hidden">
        <Wordmark compact />
        <div className="flex items-center gap-2">
          <NoticeBell />
          {canManageOps(profile) && profile.orgId ? (
            <Link to="/team" className="grid size-11 place-items-center text-muted">
              <Users className="size-5" strokeWidth={1.75} />
            </Link>
          ) : null}
          {canManageFlocks(profile) && profile.orgId ? (
            <Link to="/settings" className="grid size-11 place-items-center text-muted" aria-label="Посадки">
              <Settings2 className="size-5" strokeWidth={1.75} />
            </Link>
          ) : null}
          <Link to="/account" className="grid size-11 place-items-center text-muted" aria-label="Профіль">
            <UserRound className="size-5" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed right-6 top-4 z-30 hidden md:block">
        <div className="pointer-events-auto">
          <NoticeBell />
        </div>
      </div>

      <main className="overflow-x-hidden md:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <InstallBanner onOpenMore={() => setMore(true)} />
          {isDemoUser(profile) ? (
            <p className="mb-4 rounded-[16px] bg-primary/10 px-4 py-3 text-sm text-fg">
              Це демонстрація. Дані навчальні, чужих господарств немає. Щоб вести свою ферму —
              вийдіть і зареєструйтесь.
            </p>
          ) : null}
          {children}
        </div>
      </main>

      {more ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-fg/25"
            aria-label="Закрити"
            onClick={() => setMore(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[24px] bg-surface px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-border-hover)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" />
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-medium tracking-tight">Усі розділи</p>
              <button
                type="button"
                className="grid size-11 place-items-center text-muted"
                aria-label="Закрити"
                onClick={() => setMore(false)}
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>
            <nav className="space-y-4">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-subtle">{group.label}</p>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {group.items.map((item) => {
                      const active = navItemActive(item, pathname, hash);
                      const Icon = iconFor(item);
                      return (
                        <Link
                          key={navItemKey(item)}
                          to={item.to}
                          hash={item.hash}
                          onClick={() => setMore(false)}
                          className={cn(
                            "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-[16px] px-2 text-center text-xs font-medium",
                            active ? "bg-primary text-primary-fg" : "bg-bg text-fg",
                          )}
                        >
                          <Icon className="size-5" strokeWidth={active ? 2.1 : 1.75} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="mt-4 space-y-3">
              <InstallCard />
              <div className="flex items-center justify-between rounded-[16px] bg-bg px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{profile.fullName ?? profile.email}</p>
                  <p className="truncate text-xs text-muted">{label}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/account"
                    onClick={() => setMore(false)}
                    className="grid size-11 place-items-center rounded-[12px] text-muted"
                    aria-label="Профіль"
                  >
                    <UserRound className="size-5" strokeWidth={1.75} />
                  </Link>
                  <button
                    type="button"
                    disabled={out}
                    onClick={() => {
                      setOut(true);
                      void signOut("/login").catch(() => setOut(false));
                    }}
                    className="text-xs text-muted underline-offset-4 hover:underline"
                  >
                    {out ? "Вихід…" : "Вийти"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 grid bg-surface/90 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-md md:hidden",
          tabs.length > 2 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {tabs.map((item) => {
          const active = !more && (navItemActive(item, pathname, hash) || (item.to === "/tools" && pathname === "/tools"));
          const Icon = iconFor(item);
          return (
            <Link
              key={navItemKey(item)}
              to={item.to}
              hash={item.hash}
              onClick={() => setMore(false)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[10px] font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              <span
                className={cn("grid size-8 place-items-center rounded-[10px]", active ? "bg-primary/12" : "")}
              >
                <Icon className="size-5" strokeWidth={active ? 2.15 : 1.75} />
              </span>
              {item.to === "/tools" ? "Інструменти" : item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          className={cn(
            "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[10px] font-medium",
            moreActive ? "text-primary" : "text-muted",
          )}
        >
          <span
            className={cn("grid size-8 place-items-center rounded-[10px]", moreActive ? "bg-primary/12" : "")}
          >
            <Menu className="size-5" strokeWidth={moreActive ? 2.15 : 1.75} />
          </span>
          Ще
        </button>
      </nav>
    </div>
  );
}

function NavRow({
  item,
  pathname,
  hash,
  nested,
}: {
  item: NavDef;
  pathname: string;
  hash: string;
  nested?: boolean;
}) {
  const active = navItemActive(item, pathname, hash);
  const Icon = iconFor(item);
  return (
    <Link
      to={item.to}
      hash={item.hash}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-[14px] px-2 text-sm transition-colors duration-150",
        nested && "h-9 pl-3",
        active
          ? "bg-primary text-primary-fg shadow-[0_8px_18px_rgb(47_154_76_/_0.22)]"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-[10px]",
          nested && "size-7 rounded-[8px]",
          active ? "bg-white/15" : "bg-surface-2/80",
        )}
      >
        <Icon className={cn(nested ? "size-3.5" : "size-4")} strokeWidth={active ? 2.1 : 1.75} />
      </span>
      {item.label}
    </Link>
  );
}
