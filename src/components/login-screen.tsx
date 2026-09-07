import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Wordmark, BroilerField } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.trim(),
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (err) throw new Error(err.message);
      }
      await authClient.getSession();
      navigate({ to: "/" });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Не вдалося увійти";
      if (/invalid origin/i.test(raw)) {
        setError("Цей домен ще не прийнято для входу. Опублікуйте сайт і спробуйте ще раз.");
      } else if (/invalid email or password/i.test(raw)) {
        setError(
          "Невірні пошта або пароль. Якщо реєструвались через Google — натисніть Google, пароля ще немає.",
        );
      } else {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSocial(providerId: string) {
    setSocialBusy(providerId);
    setError(null);
    try {
      await signIn(providerId, {
        callbackURL: "/",
        errorCallbackURL: "/login",
      });
    } catch (err) {
      setSocialBusy(null);
      setError(err instanceof Error ? err.message : "Google не відкрився — дозвольте спливаючі вікна.");
    }
  }

  return (
    <main className="min-h-dvh bg-bg text-fg md:grid md:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#eef8e8] via-[#f6fbf2] to-[#fff8e8] px-10 py-10 pb-28 md:flex">
        <Wordmark />
        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl font-medium tracking-tight">
            Світло, корм і жива маса — щодня по кожному пташнику.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Кожна компанія бачить лише свої фабрики і звіти. Керівник подає звіт по пташнику.
            Технолог бачить відхилення від норми кросу, падіж, конверсію і прогноз.
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-subtle">Крос · жива маса · корм · вода · FCR</p>
        </div>
        <BroilerField className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-80" />
      </section>

      <section className="flex min-h-dvh flex-col justify-center px-5 py-10 md:px-12">
        <div className="mx-auto w-full max-w-sm">
          <p className="mb-4 rounded-[16px] bg-primary/10 px-4 py-3 text-sm text-fg">
            Раніше заходили через Google — пароль не потрібен. Натисніть{" "}
            <strong>Увійти через Google</strong> і оберіть той самий Gmail.
          </p>
          <div className="md:hidden">
            <Wordmark />
          </div>
          <h1 className="mt-8 font-display text-3xl font-medium tracking-tight md:mt-0">
            {mode === "in" ? "Вхід" : "Реєстрація"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Якщо раніше заходили через Google — пароль не потрібен. Натисніть Google і оберіть
            той самий Gmail.
          </p>

          <Link
            to="/demo"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-[14px] bg-primary text-sm font-medium text-primary-fg"
          >
            Дивитись демо ферми
          </Link>
          <p className="mt-2 text-xs text-muted">
            Без реєстрації. Навчальна фабрика з чотирма пташниками, звітами і прогнозом кг/м².
            Ваші бойові дані не видно.
          </p>

          {authEnabled ? (
            <div className="mt-8 grid gap-2">
              {GROK_PROVIDERS.filter((p) => p.idp === "google").map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  className="h-12 w-full text-base"
                  disabled={socialBusy !== null}
                  onClick={() => void onSocial(p.providerId)}
                >
                  {socialBusy === p.providerId ? "Відкривається Google…" : "Увійти через Google"}
                </Button>
              ))}
              {GROK_PROVIDERS.filter((p) => p.idp !== "google").map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={socialBusy !== null}
                  onClick={() => void onSocial(p.providerId)}
                >
                  {socialBusy === p.providerId ? "Відкривається…" : `Увійти через ${p.label}`}
                </Button>
              ))}
            </div>
          ) : null}
          {error && socialBusy === null && !busy ? (
            <p className="mt-3 text-sm text-bad">{error}</p>
          ) : null}

          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-muted">
              Маю пароль — увійти поштою
            </summary>
            <p className="mt-2 text-xs text-muted">
              Через Google пароля ще немає. Після входу його можна задати в розділі Профіль.
            </p>

          {authEnabled ? (
            <form className="mt-3 space-y-4" onSubmit={onSubmit}>
              {mode === "up" ? (
                <div>
                  <Label htmlFor="name">ПІБ</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              ) : null}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Мінімум 8 символів"
                />
              </div>
              {error ? <p className="text-sm text-bad">{error}</p> : null}
              <Button type="submit" variant="secondary" className="w-full" disabled={busy}>
                {busy ? "Зачекайте…" : mode === "in" ? "Увійти поштою" : "Створити обліковий запис"}
              </Button>
            </form>
          ) : (
            <p className="mt-8 text-sm text-muted">Вхід вимкнено.</p>
          )}
          </details>

          <button
            type="button"
            className="mt-4 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
          >
            {mode === "in" ? "Немає облікового запису — зареєструватися" : "Вже є запис — увійти"}
          </button>
        </div>
      </section>
    </main>
  );
}
