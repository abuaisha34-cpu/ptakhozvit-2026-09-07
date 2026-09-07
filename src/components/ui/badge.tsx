import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/broiler/calc";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        "bg-surface-2 text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: Severity }) {
  const map: Record<Severity, { label: string; className: string; dot: string }> = {
    ok: { label: "Норма", className: "bg-ok/12 text-ok", dot: "bg-ok" },
    watch: { label: "Нагляд", className: "bg-watch/12 text-watch", dot: "bg-watch" },
    warn: { label: "Увага", className: "bg-warn/12 text-warn", dot: "bg-warn" },
    critical: { label: "Критично", className: "bg-bad/12 text-bad", dot: "bg-bad" },
  };
  const m = map[status];
  return (
    <Badge className={m.className}>
      <span className={cn("mr-1.5 size-1.5 rounded-full", m.dot)} />
      {m.label}
    </Badge>
  );
}
