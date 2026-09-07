import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyStartCard, FactoryJumpNav, FactorySummary } from "@/components/factory-summary";
import { ExportButtons } from "@/components/export-buttons";
import { LoginScreen } from "@/components/login-screen";
import { HouseCompare } from "@/components/house-compare";
import { TodayBoard } from "@/components/today-board";
import { VetBoard } from "@/components/vet-board";
import { dashboardWorkbook } from "@/lib/export-report";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDashboard } from "@/lib/server/fns";
import { useAsync } from "@/lib/use-async";
import { addDaysISO, fmtDateShort } from "@/lib/utils";
import { canManageFlocks, dashboardTitle, isPlatformAdmin } from "@/lib/broiler/roles";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (!user) return <LoginScreen />;
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { data, error, loading } = useAsync(() => getDashboard(), []);

  if (loading) return <DashSkeleton />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  if (isPlatformAdmin(data.profile) && !data.profile.orgId) {
    return <Navigate to="/holdings" />;
  }

  const { factories, today, profile, thresholds } = data;
  const due = addDaysISO(today, -1);
  const title = dashboardTitle(profile, factories[0]?.site.name);
  const hasFlocks = factories.some((f) => f.activeHouses > 0);
  const many = factories.length > 1;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">
            Звіт за попередню добу · {fmtDateShort(due)}
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
          {many ? (
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Окреме зведення по кожній фабриці: поголівʼя, падіж, маса, корм і відхилення не змішуються.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasFlocks ? (
            <ExportButtons
              spec={dashboardWorkbook(factories, { today, orgName: profile.orgName })}
            />
          ) : null}
          <Link
            to="/report"
            className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Щоденний звіт
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {!hasFlocks ? (
        <EmptyStartCard canPlace={canManageFlocks(profile)} noFactories={factories.length === 0} />
      ) : profile.role === "veterinarian" ? (
        <VetBoard factories={factories} today={today} />
      ) : (
        <TodayBoard factories={factories} today={today} />
      )}

      {hasFlocks && profile.role !== "veterinarian"
        ? factories.map((factory) => (
            <HouseCompare key={`cmp-${factory.site.id}`} houses={factory.houses} />
          ))
        : null}

      {many ? <FactoryJumpNav factories={factories} /> : null}

      {profile.role === "veterinarian" ? null : (
        <div className="space-y-6">
          {factories.map((factory) => (
            <FactorySummary
              key={factory.site.id}
              factory={factory}
              thresholds={thresholds}
              headingLevel="h2"
              showSiteLink={many}
              showHeading
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-surface" />
      <div className="h-48 animate-pulse rounded-[24px] bg-surface" />
      <div className="h-48 animate-pulse rounded-[24px] bg-surface" />
    </div>
  );
}
