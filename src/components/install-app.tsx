import { Share, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

export function useInstallApp() {
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    }
    function onInstalled() {
      setDeferred(null);
      setDone(true);
      setStandalone(true);
    }
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") {
      setDone(true);
      setStandalone(true);
      return true;
    }
    return false;
  }

  return { standalone, ios, canPrompt: Boolean(deferred), done, install };
}

export function InstallCard({ className }: { className?: string }) {
  const { standalone, ios, canPrompt, done, install } = useInstallApp();
  if (standalone || done) {
    return (
      <Card className={className}>
        <CardTitle>Програма на телефоні</CardTitle>
        <p className="mt-2 text-sm text-muted">
          ПтахоЗвіт уже відкритий як програма. Усі розділи ті самі, що на компʼютері.
        </p>
      </Card>
    );
  }
  return (
    <Card className={className}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary/12 text-primary">
          <Smartphone className="size-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <CardTitle>Поставити на телефон</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Це не окремий магазин додатків — той самий сайт стає програмою на екрані. Звіти, корм,
            довідник і прогнози працюють офлайн-іконкою, вхід зберігається.
          </p>
          {canPrompt ? (
            <Button className="mt-4" onClick={() => void install()}>
              Встановити ПтахоЗвіт
            </Button>
          ) : ios ? (
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-fg">
              <li>
                Натисніть <Share className="mx-0.5 inline size-3.5" strokeWidth={2} /> Поділитися в Safari
              </li>
              <li>Оберіть «На екран Домашній»</li>
              <li>Підтвердіть «Додати»</li>
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted">
              У Chrome або Edge: меню браузера → «Встановити додаток» / «Додати на головний екран».
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function InstallBanner({ onOpenMore }: { onOpenMore?: () => void }) {
  const { standalone, canPrompt, install, ios } = useInstallApp();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (standalone) return;
    try {
      if (localStorage.getItem("ptakhozvit-install-hide") === "1") return;
    } catch {
      /* ignore */
    }
    setHidden(false);
  }, [standalone]);

  if (standalone || hidden) return null;

  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-3 rounded-[16px] bg-surface px-3 py-2.5 shadow-[var(--shadow-border)] md:hidden",
      )}
    >
      <Smartphone className="size-5 shrink-0 text-primary" strokeWidth={1.9} />
      <p className="min-w-0 flex-1 text-sm">
        Поставте ПтахоЗвіт на екран — як програма, усі розділи з собою.
      </p>
      <Button
        size="sm"
        onClick={() => {
          if (canPrompt) void install();
          else onOpenMore?.();
        }}
      >
        {canPrompt ? "Встановити" : ios ? "Як" : "Як"}
      </Button>
      <button
        type="button"
        className="grid size-9 shrink-0 place-items-center text-muted"
        aria-label="Сховати"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem("ptakhozvit-install-hide", "1");
          } catch {
            /* ignore */
          }
        }}
      >
        ×
      </button>
    </div>
  );
}
