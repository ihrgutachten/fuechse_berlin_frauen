"use client";

import { useActionState } from "react";
import { saveNickname, type ActionState } from "@/lib/tippspiel-actions";
import { NicknameField } from "@/components/tippspiel/nickname-field";

type Props = {
  initialNickname?: string;
  initialMarketing?: boolean;
};

export function NicknameForm({ initialNickname = "", initialMarketing = false }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveNickname, null);

  return (
    <form action={action} className="space-y-4">
      <NicknameField
        defaultValue={initialNickname}
        error={state?.ok === false ? state.error : null}
      />
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
