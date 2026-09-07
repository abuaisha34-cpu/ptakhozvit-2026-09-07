import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { InstallCard } from "@/components/install-app";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { getMe, saveMyProfile } from "@/lib/server/fns";
import { setMyPassword } from "@/lib/server/set-password";
import { staffLabel } from "@/lib/broiler/roles";
import { useAsync } from "@/lib/use-async";

export const Route = createFileRoute("/account")({ component: Page });

function Page() {
  return (
    <AppShell>
      <Account />
    </AppShell>
  );
}

function Account() {
  const { data, error, loading, setData } = useAsync(() => getMe(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState<"profile" | "pass" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setName(data.profile.fullName ?? "");
    setEmail(data.profile.email ?? "");
  }, [data]);

  if (loading) return <div className="h-48 animate-pulse rounded-[24px] bg-surface" />;
  if (error) return <p className="text-sm text-bad">{error}</p>;
  if (!data) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy("profile");
    setMsg(null);
    setErr(null);
    try {
      await saveMyProfile({ data: { fullName: name, email } });
      setData(await getMe());
      setMsg("Профіль збережено");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Не збережено");
    } finally {
      setBusy(null);
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    setPassErr(null);
    if (password !== password2) {
      setPassErr("Паролі не збігаються");
      return;
    }
    setBusy("pass");
    try {
      await setMyPassword({ data: { password } });
      setPassword("");
      setPassword2("");
      setPassMsg("Пароль збережено. Ним можна входити на своєму домені.");
    } catch (e2) {
      setPassErr(e2 instanceof Error ? e2.message : "Не збережено");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Обліковий запис</h1>
        <p className="mt-2 text-sm text-muted">
          {staffLabel(data.profile)}
          {data.sites.length === 1 ? ` · ${data.sites[0].name}` : ""}
        </p>
      </header>

      <InstallCard />

      <Card>
        <CardTitle>ПІБ і логін</CardTitle>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="me-name">ПІБ</Label>
            <Input id="me-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="me-email">Email (логін)</Label>
            <Input
              id="me-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {msg ? <p className="text-sm text-ok">{msg}</p> : null}
          {err ? <p className="text-sm text-bad">{err}</p> : null}
          <Button type="submit" disabled={busy !== null}>
            {busy === "profile" ? "Збереження…" : "Зберегти"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Пароль для свого домену</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Якщо зайшли через Google — пароля ще немає. Задайте його тут, потім на
          цьому домені входьте поштою Google і цим паролем.
        </p>
        <form className="mt-4 space-y-3" onSubmit={onPassword}>
          <div>
            <Label htmlFor="me-pass">Новий пароль</Label>
            <Input
              id="me-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="me-pass2">Ще раз</Label>
            <Input
              id="me-pass2"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {passMsg ? <p className="text-sm text-ok">{passMsg}</p> : null}
          {passErr ? <p className="text-sm text-bad">{passErr}</p> : null}
          <Button type="submit" disabled={busy !== null || password.length < 8}>
            {busy === "pass" ? "Збереження…" : "Задати пароль"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
