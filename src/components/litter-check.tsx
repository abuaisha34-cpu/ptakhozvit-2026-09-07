import { StatusBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DROPPING_LOOKS,
  LITTER_STATES,
  buildLitterAdvice,
  droppingLabel,
  litterLabel,
  parseDroppingLook,
  parseLitterState,
  type DroppingLook,
  type LitterState,
} from "@/lib/broiler/litter";
import { cn } from "@/lib/utils";

export function LitterCheck({
  look,
  state,
  ageDays,
  previousLook,
  previousState,
  onLook,
  onState,
}: {
  look: string;
  state: string;
  ageDays: number;
  previousLook?: string | null;
  previousState?: string | null;
  onLook: (id: DroppingLook) => void;
  onState: (id: LitterState) => void;
}) {
  const advice = buildLitterAdvice(parseDroppingLook(look), parseLitterState(state), ageDays);
  const yesterday =
    previousLook || previousState
      ? `Учора: ${droppingLabel(previousLook)} · ${litterLabel(previousState)}`
      : null;

  return (
    <Card className="space-y-5">
      <div>
        <CardTitle>Послід і підстилка</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Обовʼязково. Оберіть, як виглядає послід і який стан підстилки в залі — тоді зʼявляться
          дії для технолога і ветеринара.
        </p>
        {yesterday ? <p className="mt-2 text-xs text-subtle">{yesterday}</p> : null}
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
          Вигляд посліду
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Вигляд посліду">
          {DROPPING_LOOKS.map((o) => (
            <Choice
              key={o.id}
              selected={look === o.id}
              label={o.label}
              onClick={() => onLook(o.id)}
            />
          ))}
        </div>
        {look ? (
          <p className="mt-2 text-xs text-muted">{DROPPING_LOOKS.find((o) => o.id === look)?.hint}</p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle">
          Стан підстилки
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Стан підстилки">
          {LITTER_STATES.map((o) => (
            <Choice
              key={o.id}
              selected={state === o.id}
              label={o.label}
              onClick={() => onState(o.id)}
            />
          ))}
        </div>
        {state ? (
          <p className="mt-2 text-xs text-muted">{LITTER_STATES.find((o) => o.id === state)?.hint}</p>
        ) : null}
      </fieldset>

      {advice ? (
        <div className="space-y-3 rounded-[16px] bg-bg p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={advice.severity} />
            <p className="text-sm text-muted">
              {advice.lookLabel} · {advice.litterLabel}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdviceCol title="Технологічний підхід" items={advice.tech} />
            <AdviceCol title="Ветеринарний підхід" items={advice.vet} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Оберіть обидва пункти — рекомендації зʼявляться одразу.</p>
      )}
    </Card>
  );
}

function Choice({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-[12px] px-3 text-left text-sm transition-colors duration-150",
        selected ? "bg-primary text-primary-fg" : "bg-bg text-fg hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}

function AdviceCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((t) => (
          <li key={t} className="text-sm leading-relaxed text-fg">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
