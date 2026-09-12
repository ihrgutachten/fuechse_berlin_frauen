"use client";

import { useState } from "react";
import { NICKNAME_ERROR, NICKNAME_HINT, NICKNAME_PATTERN } from "@/lib/tippspiel";

type Props = {
  defaultValue?: string;
  error?: string | null;
};

export function NicknameField({ defaultValue = "", error = null }: Props) {
  const [localError, setLocalError] = useState<string | null>(null);
  const shown = error ?? localError;

  return (
    <div className="max-w-md">
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
        pattern={NICKNAME_PATTERN}
        title={NICKNAME_ERROR}
        defaultValue={defaultValue}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="z. B. RevierFuchs"
        aria-describedby="nickname-hint"
        aria-invalid={shown ? true : undefined}
        onInvalid={(event) => {
          event.currentTarget.setCustomValidity(NICKNAME_ERROR);
          setLocalError(NICKNAME_ERROR);
        }}
        onInput={(event) => {
          event.currentTarget.setCustomValidity("");
          setLocalError(null);
        }}
        className="mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]"
      />
      <p id="nickname-hint" className="mt-1.5 text-xs leading-relaxed text-[var(--fb-text-faint)]">
        {NICKNAME_HINT}
      </p>
      {shown ? (
        <p className="mt-2 text-sm text-[var(--fb-away)]" role="alert">
          {shown}
        </p>
      ) : null}
    </div>
  );
}
