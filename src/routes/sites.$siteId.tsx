import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { FactorySummary } from "@/components/factory-summary";
import { ExportButtons } from "@/components/export-buttons";
import { dashboardWorkbook } from "@/lib/export-report";
import { getSiteDetail } from "@/lib/server/fns";
import { isPlatformAdmin } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";

export const Route = createFileRoute("/sites/$siteId")({ component: Page });

function Page() {
  const { siteId } = Route.useParams();
  return (
    <AppShell>
      <FactoryView siteId={Number(siteId)} />
    </AppShell>
  );
}

function FactoryView({ siteId }: { siteId: number }) {
  const { data, error, loading } = useAsync(() => getSiteDetail({ data: { siteId } }), [siteId]);
  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isPlatformAdmin(data.profile) ? (
          <Link
            to="/holdings/$orgId"
            params={{ orgId: String(data.factory.site.orgId) }}
            className="text-xs text-muted hover:text-fg"
          >
            ← Господарство
          </Link>
        ) : (
          <Link to="/" className="text-xs text-muted hover:text-fg">
            ← Усі фабрики
          </Link>
        )}
        <ExportButtons
          spec={dashboardWorkbook([data.factory], {
            today: data.today,
            orgName: data.profile.orgName,
          })}
        />
      </div>
      <FactorySummary
        factory={data.factory}
        thresholds={data.thresholds}
        housesVariant="cards"
        headingLevel="h1"
      />
    </div>
  );
}
