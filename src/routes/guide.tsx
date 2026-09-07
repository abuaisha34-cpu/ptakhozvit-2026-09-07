import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CatIcon } from "@/components/cat-icon";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  HANDBOOK_CATEGORIES,
  type HandbookArticle,
  type HandbookCategory,
  type OrgNorms,
} from "@/lib/broiler/handbook";
import {
  askHandbookQuestion,
  getHandbook,
  saveHandbookArticle,
  saveOrgHandbookNorms,
  saveOrgTreatments,
  setHandbookPriority,
} from "@/lib/server/fns";
import { isPlatformAdmin } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import { TreatmentCalendarCard } from "@/components/treatment-calendar";

type GuideSearch = { org?: number };

export const Route = createFileRoute("/guide")({
  component: Page,
  validateSearch: (search: Record<string, unknown>): GuideSearch => {
    const org = Number(search.org);
    return { org: Number.isFinite(org) && org > 0 ? org : undefined };
  },
});

function Page() {
  return (
    <AppShell>
      <Guide />
    </AppShell>
  );
}

function Guide() {
  const { org } = Route.useSearch();
  const { data, error, loading, setData } = useAsync(() => getHandbook({ data: { orgId: org } }), [org]);
  const [cat, setCat] = useState<"all" | HandbookCategory>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const published = useMemo(() => {
    if (!data) return [];
    return data.articles.filter((a) => {
      if (a.status !== "published") return false;
      if (!data.canEdit && a.hidden) return false;
      if (cat !== "all" && a.category !== cat) return false;
      return true;
    });
  }, [data, cat]);
  const questions = data?.articles.filter((a) => a.status === "question") ?? [];
  const featured = published.filter((a) => a.priority);
  const rest = cat === "all" ? published.filter((a) => !a.priority) : published;

  if (loading) return <div className="h-64 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;
  if (isPlatformAdmin(data.profile) && !data.articles.length && !org) {
    return (
      <p className="text-sm text-muted">
        Відкрийте господарство в{" "}
        <Link to="/holdings" className="underline underline-offset-4">
          списку
        </Link>
        , щоб бачити його довідник.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">Щоденні питання</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">Довідник</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Пріоритетні теми зверху. Далі — мікроклімат, послід, вода, корм і падіж. Відповіді окремо:
          технологія і ветеринарія.
          {data.canEdit
            ? " Технолог може закріпити питання зірочкою і замінити будь-яку рекомендацію."
            : " Немає відповіді — поставте питання технологу."}
        </p>
      </header>
      {msg ? <p className="text-sm text-ok">{msg}</p> : null}

      {data.canEdit ? (
        <>
          <NormsCard
            initial={data.norms}
            orgId={org}
            onSaved={async (norms) => {
              setData({ ...data, norms });
              setMsg("Нормативи оновлено. Вони вже діють у звітах і прогнозах.");
            }}
          />
          <TreatmentCalendarCard
            title="Шаблон календаря обробок"
            hint="Це графік для нових посадок. У пташнику технолог або ветлікар може змінити його під конкретну партію."
            items={data.treatments}
            canEdit
            onSave={async (items) => {
              const res = await saveOrgTreatments({ data: { orgId: org, items } });
              setData({ ...data, treatments: res.items });
              setMsg("Шаблон календаря збережено. Нові посадки візьмуть його.");
            }}
          />
        </>
      ) : null}

      {data.canEdit && questions.length ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium tracking-tight">Питання від керівників</h2>
          {questions.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              canEdit
              open={openId === a.id}
              onToggle={() => setOpenId(openId === a.id ? null : a.id)}
              orgId={org}
              onSaved={async () => {
                setData(await getHandbook({ data: { orgId: org } }));
                setMsg("Відповідь опубліковано");
              }}
            />
          ))}
        </section>
      ) : null}

      {cat === "all" && featured.length ? (
        <section>
          <h2 className="font-display text-xl font-medium tracking-tight">Пріоритетні сьогодні</h2>
          <p className="mt-1 text-sm text-muted">Те, що найчастіше питають у залі — відкрийте і дійте.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {featured.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setOpenId(openId === a.id ? null : a.id)}
                className="flex items-start gap-3 rounded-[20px] bg-surface p-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]"
              >
                <CatIcon category={a.category} />
                <span className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wider text-subtle">
                    {HANDBOOK_CATEGORIES.find((c) => c.id === a.category)?.label}
                  </span>
                  <span className="mt-0.5 block font-medium leading-snug text-fg">{a.question}</span>
                </span>
              </button>
            ))}
          </div>
          {openId && featured.some((a) => a.id === openId) ? (
            <div className="mt-3">
              <ArticleCard
                article={featured.find((a) => a.id === openId)!}
                canEdit={data.canEdit}
                open
                onToggle={() => setOpenId(null)}
                orgId={org}
                onSaved={async () => {
                  setData(await getHandbook({ data: { orgId: org } }));
                  setMsg("Рекомендацію оновлено");
                }}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FilterChip active={cat === "all"} onClick={() => setCat("all")} label="Усі" />
        {HANDBOOK_CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={cat === c.id}
            onClick={() => setCat(c.id)}
            label={c.label}
            category={c.id}
          />
        ))}
      </div>

      <div className="space-y-3">
        {rest.map((a) => (
          <ArticleCard
            key={a.id}
            article={a}
            canEdit={data.canEdit}
            open={openId === a.id}
            onToggle={() => setOpenId(openId === a.id ? null : a.id)}
            orgId={org}
            onSaved={async () => {
              setData(await getHandbook({ data: { orgId: org } }));
              setMsg("Рекомендацію оновлено");
            }}
          />
        ))}
      </div>

      <AskCard
        orgId={org}
        onAsked={async () => {
          setData(await getHandbook({ data: { orgId: org } }));
          setMsg("Питання надіслано головному технологу");
        }}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  category,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  category?: HandbookCategory;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
        active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[var(--shadow-border)] hover:text-fg",
      )}
    >
      {category ? <CatIcon category={category} size="sm" className={cn("size-6 rounded-[8px]", active && "bg-white/20 text-primary-fg")} /> : null}
      {label}
    </button>
  );
}

function ArticleCard({
  article,
  canEdit,
  open,
  onToggle,
  orgId,
  onSaved,
}: {
  article: HandbookArticle;
  canEdit: boolean;
  open: boolean;
  onToggle: () => void;
  orgId?: number;
  onSaved: () => Promise<void>;
}) {
  const cat = HANDBOOK_CATEGORIES.find((c) => c.id === article.category)?.label ?? article.category;
  const [edit, setEdit] = useState(false);
  const [question, setQuestion] = useState(article.question);
  const [tech, setTech] = useState(article.answerTech);
  const [vet, setVet] = useState(article.answerVet);
  const [category, setCategory] = useState(article.category);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: FormEvent, hidden = article.hidden) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await saveHandbookArticle({
        data: {
          orgId,
          id: article.id,
          question,
          answerTech: tech,
          answerVet: vet,
          category,
          hidden,
        },
      });
      setEdit(false);
      await onSaved();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Не збережено");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className={article.status === "question" ? "ring-1 ring-warn/40" : ""}>
      <div className="flex items-start gap-3">
        <CatIcon category={article.category} />
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-subtle">{cat}</span>
            {article.priority ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                <Star className="size-3 fill-current" />
                пріоритет
              </span>
            ) : null}
          </span>
          <span className="mt-1 block font-display text-lg font-medium tracking-tight">{article.question}</span>
          {article.hidden ? <span className="mt-1 block text-xs text-muted">Приховано для керівників</span> : null}
          {article.status === "question" ? (
            <span className="mt-1 block text-xs text-warn">Чекає відповіді технолога</span>
          ) : null}
        </button>
        <span className="pt-1 text-xs text-subtle">{open ? "згорнути" : "відкрити"}</span>
      </div>
      {open ? (
        <div className="mt-4 space-y-4">
          {canEdit && edit ? (
            <form className="space-y-3" onSubmit={(e) => void save(e)}>
              <div>
                <Label>Питання</Label>
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>
              <div>
                <Label>Розділ</Label>
                <Select value={category} onChange={(e) => setCategory(e.target.value as HandbookCategory)}>
                  {HANDBOOK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Технологічний підхід</Label>
                <Textarea value={tech} onChange={(e) => setTech(e.target.value)} />
              </div>
              <div>
                <Label>Ветеринарний підхід</Label>
                <Textarea value={vet} onChange={(e) => setVet(e.target.value)} />
              </div>
              {err ? <p className="text-sm text-bad">{err}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy}>
                  Зберегти
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEdit(false)}>
                  Скасувати
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[16px] bg-bg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">Технологія</p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">
                    {article.answerTech || "Ще немає відповіді."}
                  </p>
                </div>
                <div className="rounded-[16px] bg-bg p-3">
                  <p className="text-[11px] uppercase tracking-wider text-subtle">Ветеринарія</p>
                  <p className="mt-2 text-sm leading-relaxed text-fg">
                    {article.answerVet || "Ще немає відповіді."}
                  </p>
                </div>
              </div>
              {canEdit ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => setEdit(true)}>
                    Замінити рекомендацію
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await setHandbookPriority({
                          data: { orgId, id: article.id, priority: !article.priority },
                        });
                        await onSaved();
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <Star className={cn("size-3.5", article.priority && "fill-current text-primary")} />
                    {article.priority ? "Зняти пріоритет" : "У пріоритет"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void save({ preventDefault() {} } as FormEvent, !article.hidden)}
                  >
                    {article.hidden ? "Показати" : "Приховати"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
}

function NormsCard({
  initial,
  orgId,
  onSaved,
}: {
  initial: OrgNorms;
  orgId?: number;
  onSaved: (n: OrgNorms) => Promise<void>;
}) {
  const [n, setN] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  function set<K extends keyof OrgNorms>(key: K, v: string) {
    setN((prev) => ({ ...prev, [key]: Number(v) }));
  }
  return (
    <Card>
      <CardTitle>Нормативи господарства</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Вологість і ліміт кг/м². Після збереження звіти, прогнози і попередження беруть ці цифри, а не
        заводські.
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          try {
            const res = await saveOrgHandbookNorms({ data: { orgId, norms: n } });
            await onSaved(res.norms);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Не збережено");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Num k="RH посадка мін %" v={n.humidityPlaceMin} onChange={(v) => set("humidityPlaceMin", v)} />
        <Num k="RH посадка макс %" v={n.humidityPlaceMax} onChange={(v) => set("humidityPlaceMax", v)} />
        <Num k="Ранній період до доби" v={n.humidityEarlyUntil} onChange={(v) => set("humidityEarlyUntil", v)} />
        <Num k="RH до цієї доби мін" v={n.humidityEarlyMin} onChange={(v) => set("humidityEarlyMin", v)} />
        <Num k="RH до цієї доби макс" v={n.humidityEarlyMax} onChange={(v) => set("humidityEarlyMax", v)} />
        <Num k="RH далі мін" v={n.humidityLateMin} onChange={(v) => set("humidityLateMin", v)} />
        <Num k="RH далі макс" v={n.humidityLateMax} onChange={(v) => set("humidityLateMax", v)} />
        <Num k="Ліміт кг/м²" v={n.densityLimitKgM2} onChange={(v) => set("densityLimitKgM2", v)} />
        <Num k="Попередження за діб" v={n.densityWarnDays} onChange={(v) => set("densityWarnDays", v)} />
        <div className="sm:col-span-2 lg:col-span-3">
          {err ? <p className="mb-2 text-sm text-bad">{err}</p> : null}
          <Button type="submit" disabled={busy}>
            Застосувати нормативи
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Num({ k, v, onChange }: { k: string; v: number; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{k}</Label>
      <Input inputMode="decimal" value={String(v)} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function AskCard({ orgId, onAsked }: { orgId?: number; onAsked: () => Promise<void> }) {
  const [category, setCategory] = useState<HandbookCategory>("health");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Card>
      <CardTitle>Задати питання</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Керівник описує, що турбує сьогодні. Технолог отримає сповіщення і додасть відповідь у довідник.
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          try {
            await askHandbookQuestion({ data: { orgId, category, question } });
            setQuestion("");
            await onAsked();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Не надіслано");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label>Розділ</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as HandbookCategory)}>
            {HANDBOOK_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Питання</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Наприклад: після перепаду нічної температури курчата хриплять, що перевірити першим?"
          />
        </div>
        {err ? <p className="text-sm text-bad">{err}</p> : null}
        <Button type="submit" disabled={busy}>
          Надіслати технологу
        </Button>
      </form>
    </Card>
  );
}
