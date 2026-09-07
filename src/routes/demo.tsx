import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { startDemoSession } from "@/lib/start-demo";

export const Route = createFileRoute("/demo")({ component: DemoPage });

function DemoPage() {
  const { isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || started.current) return;
    started.current = true;
    void startDemoSession()
      .then(() => navigate({ to: "/" }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Не вдалося відкрити демо");
      });
  }, [isPending, navigate]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <Wordmark />
        <h1 className="mt-8 font-display text-3xl font-medium tracking-tight">Демо-ферма</h1>
        {error ? (
          <>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-[12px] bg-primary px-4 text-sm font-medium text-primary-fg"
              >
                На вхід
              </Link>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Ще раз
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Відкриваємо навчальну ферму з живими звітами…</p>
        )}
      </div>
    </main>
  );
}
