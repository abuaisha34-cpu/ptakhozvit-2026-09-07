import { Minus, Plus, Delete } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./input";

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  unit?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  required?: boolean;
  forecast?: string;
  onApplyForecast?: () => void;
};

function parseVal(raw: string): number {
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatVal(n: number, decimals: number): string {
  if (decimals <= 0) return String(Math.round(n));
  return n.toFixed(decimals).replace(/\.?0+$/, "");
}


export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  min = 0,
  max = 1_000_000,
  step = 1,
  decimals = 0,
  required,
  forecast,
  onApplyForecast,
}: Props) {
  const [pad, setPad] = useState(false);
  const holdRef = useRef<number | null>(null);
  const delayRef = useRef<number | null>(null);

  const applyDelta = useCallback(
    (dir: 1 | -1) => {
      const current = value === "" ? 0 : parseVal(value);
      const next = Math.min(max, Math.max(min, current + dir * step));
      onChange(formatVal(next, decimals));
    },
    [decimals, max, min, onChange, step, value],
  );

  const stopHold = useCallback(() => {
    if (holdRef.current) window.clearInterval(holdRef.current);
    if (delayRef.current) window.clearTimeout(delayRef.current);
    holdRef.current = null;
    delayRef.current = null;
  }, []);

  const startHold = (dir: 1 | -1) => {
    applyDelta(dir);
    delayRef.current = window.setTimeout(() => {
      holdRef.current = window.setInterval(() => applyDelta(dir), 70);
    }, 380);
  };

  useEffect(() => () => stopHold(), [stopHold]);

  useEffect(() => {
    if (!pad) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPad(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pad]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex h-14 items-stretch overflow-hidden rounded-[16px] bg-surface shadow-[var(--shadow-border)]">
        <button
          type="button"
          aria-label="Менше"
          className="grid w-12 shrink-0 place-items-center text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.98] md:w-14"
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <Minus className="size-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col items-center justify-center px-1"
          onClick={() => setPad(true)}
        >
          <span className="w-full truncate text-center font-display text-2xl tabular-nums leading-none tracking-tight text-fg">
            {value === "" ? "—" : value}
          </span>
          {unit ? <span className="mt-0.5 text-[11px] text-subtle">{unit}</span> : null}
        </button>
        <button
          type="button"
          aria-label="Більше"
          className="grid w-12 shrink-0 place-items-center text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.98] md:w-14"
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
        >
          <Plus className="size-5" strokeWidth={1.75} />
        </button>
      </div>
      {hint ? <p className="mt-1 text-[11px] text-subtle">{hint}</p> : null}
      {forecast && onApplyForecast ? (
        <button
          type="button"
          className="mt-1 text-[11px] font-medium text-primary"
          onClick={onApplyForecast}
        >
          Прогноз {forecast} · підставити
        </button>
      ) : null}

      {pad ? (
        <Keypad
          label={label}
          unit={unit}
          value={value}
          required={required}
          decimals={decimals}
          min={min}
          max={max}
          forecast={forecast}
          onChange={onChange}
          onClose={() => setPad(false)}
        />
      ) : null}
    </div>
  );
}

function Keypad({
  label,
  unit,
  value,
  required,
  decimals,
  min,
  max,
  forecast,
  onChange,
  onClose,
}: {
  label: string;
  unit?: string;
  value: string;
  required?: boolean;
  decimals: number;
  min: number;
  max: number;
  forecast?: string;
  onChange: (next: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);

  function push(ch: string) {
    setDraft((prev) => {
      if (ch === "." && (decimals <= 0 || prev.includes("."))) return prev;
      if (prev === "0" && ch !== ".") return ch;
      if (prev === "" && ch === ".") return "0.";
      const next = `${prev}${ch}`;
      const [int, frac = ""] = next.split(".");
      if (frac.length > decimals) return prev;
      if (int.length > 7) return prev;
      return next;
    });
  }

  function backspace() {
    setDraft((prev) => prev.slice(0, -1));
  }

  function confirm() {
    if (draft === "" && required) return;
    if (draft === "") {
      onChange("");
      onClose();
      return;
    }
    const n = Math.min(max, Math.max(min, parseVal(draft)));
    onChange(formatVal(n, decimals));
    onClose();
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", decimals > 0 ? "." : "", "0", "del"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-fg/25"
        aria-label="Закрити"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-t-[28px] bg-surface p-5 shadow-[var(--shadow-border-hover)] sm:rounded-[28px]">
        <p className="text-xs font-medium tracking-wide text-muted">{label}</p>
        <p className="mt-2 font-display text-5xl tabular-nums tracking-tight text-fg">
          {draft === "" ? "0" : draft}
          {unit ? <span className="ml-2 font-sans text-base text-subtle">{unit}</span> : null}
        </p>
        {forecast ? (
          <button
            type="button"
            className="mt-3 h-11 w-full rounded-[14px] bg-primary/10 text-sm font-medium text-primary"
            onClick={() => setDraft(forecast.replace(",", "."))}
          >
            Прогноз кросу {forecast}
            {unit ? ` ${unit}` : ""}
          </button>
        ) : null}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {keys.map((k, i) => {
            if (!k) return <div key={`empty-${i}`} />;
            if (k === "del") {
              return (
                <button
                  key="del"
                  type="button"
                  className="grid h-14 place-items-center rounded-[16px] bg-surface-2 text-fg transition-transform duration-150 active:scale-[0.98]"
                  onClick={backspace}
                  aria-label="Стерти"
                >
                  <Delete className="size-5" strokeWidth={1.75} />
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                className="h-14 rounded-[16px] bg-bg text-xl tabular-nums text-fg transition-transform duration-150 active:scale-[0.98]"
                onClick={() => push(k)}
              >
                {k === "." ? "," : k}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 h-12 w-full rounded-[16px] bg-primary text-sm font-medium text-primary-fg"
          onClick={confirm}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
