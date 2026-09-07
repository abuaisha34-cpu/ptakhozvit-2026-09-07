export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="9" className="fill-primary" />
      <rect x="8" y="6.5" width="16" height="19" rx="2.5" className="fill-primary-fg" />
      <rect x="13.2" y="4.8" width="5.6" height="3.2" rx="1.2" className="fill-primary-fg" />
      <path
        d="M11.2 20.4c.2-3.2 2.1-5.6 4.8-5.8 1.9-.1 3.4 1 4.2 2.6.5 1 .6 2.2.4 3.3l-.2 1.2H11.4l-.2-1.3z"
        className="fill-primary"
        opacity="0.92"
      />
      <path d="M19.6 16.2c.7-.15 1.5.2 1.8.9" className="stroke-primary-fg" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="20.7" cy="16.05" r="0.7" className="fill-[#e24b3a]" />
      <path d="M12.2 22.4h7.6" className="stroke-accent" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.2 12.2h5.4M12.2 14.4h4.2" className="stroke-primary/35" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function BroilerField({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 120" className={className} aria-hidden="true" fill="none">
      <path d="M0 88h360" className="stroke-border-strong" strokeWidth="1" />
      <path d="M18 88V58l28-18 28 18v30" className="stroke-fg/40" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M32 88v-16h28v16" className="stroke-primary" strokeWidth="1.4" />
      <path d="M92 88V52l36-22 36 22v36" className="stroke-fg/55" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M112 88V64h32v24" className="stroke-primary" strokeWidth="1.5" />
      <path d="M188 88V60l26-16 26 16v28" className="stroke-fg/40" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M202 88v-14h24v14" className="stroke-primary" strokeWidth="1.4" />
      <circle cx="78" cy="96" r="3.2" className="fill-primary/70" />
      <circle cx="168" cy="98" r="4" className="fill-accent" />
      <circle cx="248" cy="96" r="3" className="fill-primary/50" />
      <path d="M280 88V62l22-14 22 14v26" className="stroke-fg/35" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark className="size-8 shrink-0" />
      <span className="leading-none">
        <span className="block font-display text-[17px] font-semibold tracking-tight text-fg">
          ПтахоЗвіт
        </span>
        {!compact ? (
          <span className="mt-0.5 block text-[11px] tracking-wide text-muted">
            Бройлер · фабрики · пташники
          </span>
        ) : null}
      </span>
    </span>
  );
}
