import { useNavigate } from "@tanstack/react-router";
import { Bell, BookOpen, ClipboardList, Scale, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/server/fns";
import type { Notice } from "@/lib/broiler/types";
import { cn } from "@/lib/utils";

function ago(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const sec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (sec < 45) return "щойно";
  if (sec < 3600) return `${Math.round(sec / 60)} хв`;
  if (sec < 86_400) return `${Math.round(sec / 3600)} год`;
  const days = Math.round(sec / 86_400);
  return days === 1 ? "учора" : `${days} дн.`;
}

export function NoticeBell({ className }: { className?: string }) {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);

  async function refresh() {
    try {
      const data = await getNotifications();
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      /* session may still be booting */
    }
  }

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 25_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function openItem(n: Notice) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
      void markNotificationRead({ data: { id: n.id } });
    }
    setOpen(false);
    if (n.href) {
      const url = new URL(n.href, "https://ptakhozvit.local");
      const org = Number(url.searchParams.get("org"));
      if (url.pathname.startsWith("/houses/")) {
        const houseId = url.pathname.split("/")[2] ?? "";
        await navigate({ to: "/houses/$houseId", params: { houseId } });
      } else if (url.pathname === "/team") {
        await navigate({
          to: "/team",
          search: Number.isFinite(org) && org > 0 ? { org } : {},
        });
      } else if (url.pathname === "/guide") {
        await navigate({ to: "/guide" });
      } else if (url.pathname === "/feed") {
        await navigate({ to: "/feed" });
      }
    }
  }

  async function readAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    await markAllNotificationsRead();
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={unread ? `Сповіщення, ${unread} нових` : "Сповіщення"}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void refresh();
        }}
        className="relative grid size-11 place-items-center rounded-[12px] text-muted hover:bg-surface-2 hover:text-fg"
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-fg">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] bg-surface shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="font-display text-sm font-medium tracking-tight">Сповіщення</p>
            {unread > 0 ? (
              <button
                type="button"
                className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                onClick={() => void readAll()}
              >
                Усі прочитані
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">Поки тихо. Тут зʼявляться нові звіти і запити в команду.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const Icon =
                  n.kind === "join"
                    ? UserPlus
                    : n.kind === "density"
                      ? Scale
                      : n.kind === "handbook"
                        ? BookOpen
                        : ClipboardList;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2",
                        n.read ? "opacity-70" : "",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                          n.read ? "bg-bg text-muted" : "bg-primary/15 text-primary",
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-fg">{n.title}</span>
                          <span className="shrink-0 text-[11px] text-subtle">{ago(n.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{n.body}</span>
                      </span>
                      {n.read ? null : <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
