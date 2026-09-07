import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/holdings")({ component: Page });

function Page() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
