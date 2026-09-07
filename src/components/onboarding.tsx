import { useState, type FormEvent } from "react";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { joinOrganization } from "@/lib/server/fns";
import { signOut } from "@/lib/auth/client";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false);

  return (
    <div className="min-h-dvh bg-bg px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <Wordmark />
        <h1 className="mt-10 font-display text-3xl font-medium tracking-tight">Код господарства</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Нове господарство відкриває лише хазяїн сайту. Вам потрібен код саме вашої компанії —
          чужий код не підійде.
        </p>

        <div className="mt-6">
          <JoinForm onDone={onDone} />
        </div>

        <button
          type="button"
          disabled={out}
          onClick={() => {
            setOut(true);
            void signOut("/login").catch(() => setOut(false));
          }}
          className="mt-8 text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {out ? "Вихід…" : "Вийти"}
        </button>
      </div>
    </div>
  );
}

function JoinForm({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await joinOrganization({ data: { code } });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося приєднатися");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <Label htmlFor="invite">Код запрошення</Label>
        <Input
          id="invite"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="K7MP2Q"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={12}
          required
        />
        <p className="mt-1.5 text-xs text-muted">Шість символів. Кожне господарство має свій код.</p>
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy || code.trim().length < 6}>
        {busy ? "Перевірка…" : "Приєднатися"}
      </Button>
    </form>
  );
}
