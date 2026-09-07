import { useEffect } from "react";

/** After a deploy, a cached PWA still asks for old hashed JS. Reload once. */
export function StaleChunkReload() {
  useEffect(() => {
    const key = "ptz-chunk-reload";
    const reloadOnce = () => {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    };

    const onVite = (event: Event) => {
      event.preventDefault();
      reloadOnce();
    };
    window.addEventListener("vite:preloadError", onVite);
    window.addEventListener("unhandledrejection", (event) => {
      const msg = String((event.reason as { message?: string })?.message ?? event.reason ?? "");
      if (/dynamically imported module|Loading chunk/i.test(msg)) reloadOnce();
    });
    return () => window.removeEventListener("vite:preloadError", onVite);
  }, []);
  return null;
}
