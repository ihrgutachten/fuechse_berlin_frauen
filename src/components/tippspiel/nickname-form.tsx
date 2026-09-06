"use client";

import { useActionState } from "react";
import { saveNickname, type ActionState } from "@/lib/tippspiel-actions";

type Props = {
  initialNickname?: string;
  initialMarketing?: boolean;
};

export function NicknameForm({ initialNickname = "", initialMarketing = false }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveNickname, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          htmlFor="nickname"
          className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]"
        >
          Anzeigename
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          minLength={3}
          maxLength={20}
          defaultValue={initialNickname}
          autoComplete="nickname"
          placeholder="z. B. RevierFuchs"
          className="mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]"
        />
        <p className="mt-1.5 text-xs text-[var(--fb-text-faint)]">
          3-20 Zeichen, wird in der Rangliste gezeigt.
        </p>
      </div>
      <label className="flex items-start gap-2 text-sm text-[var(--fb-text-muted)]">
        <input
          type="checkbox"
          name="marketing"
          defaultChecked={initialMarketing}
          className="mt-1"
        />
        <span>
          Ich will Infos zu Heimspielen und Partner-Angeboten per E-Mail. Kann ich jederzeit
          abbestellen.
        </span>
      </label>

      {state?.ok === false ? (
        <p className="text-sm text-[var(--fb-away)]" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-[var(--fb-accent)]">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)] disabled:opacity-60"
      >
        {pending ? "Speichern…" : "Name speichern"}
      </button>
    </form>
  );
}
