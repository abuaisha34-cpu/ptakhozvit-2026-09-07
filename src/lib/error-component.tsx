import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

function isStaleChunk(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i.test(
    msg,
  );
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const stale = isStaleChunk(error);

  useEffect(() => {
    if (!stale || typeof window === "undefined") return;
    const key = "ptz-chunk-reload";
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }, [stale]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-bad" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-xl font-medium">
        {stale ? "Потрібно оновити додаток" : "Щось пішло не так"}
      </h1>
      <p className="max-w-md text-sm text-muted">
        {stale
          ? "Це стара копія на телефоні. Відкрийте ptakhozvit.com.ua і додайте на головний екран знову."
          : error.message || "Оновіть сторінку і спробуйте ще раз."}
      </p>
      <button
        type="button"
        className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-fg"
        onClick={() => {
          window.location.href = "https://ptakhozvit.com.ua/";
        }}
      >
        Відкрити ПтахоЗвіт
      </button>
    </main>
  );
}
