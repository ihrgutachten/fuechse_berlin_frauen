"use client";

import { useActionState, useState } from "react";
import { savePrediction, type ActionState } from "@/lib/tippspiel-actions";
import { TIPPSPIEL_MAX_GOALS } from "@/lib/tippspiel";
import { cn } from "@/lib/format";

type Props = {
  matchId: string;
  homeLabel: string;
  awayLabel: string;
  initialHome: number | null;
  initialAway: number | null;
  needsNickname?: boolean;
};

export function PredictionForm({
  matchId,
  homeLabel,
  awayLabel,
  initialHome,
  initialAway,
  needsNickname = false,
}: Props) {
  const [home, setHome] = useState(initialHome ?? 25);
  const [away, setAway] = useState(initialAway ?? 25);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    savePrediction,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="homeScore" value={home} />
      <input type="hidden" name="awayScore" value={away} />

      {needsNickname ? (
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
            autoComplete="nickname"
            placeholder="z. B. RevierFuchs"
            className="mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]"
          />
          <p className="mt-1.5 text-xs text-[var(--fb-text-faint)]">
            3-20 Zeichen, steht in der Rangliste. Danach gleich den Tipp speichern.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="min-w-0 flex-1">
        <div className="grid max-w-md grid-cols-[1fr_auto_1fr] items-end gap-3 sm:max-w-lg">
          <ScoreStepper label={homeLabel} value={home} onChange={setHome} />
          <p className="pb-3 font-[family-name:var(--fb-font-display)] text-2xl font-extrabold text-[var(--fb-text-faint)]">
            :
          </p>
          <ScoreStepper label={awayLabel} value={away} onChange={setAway} />
        </div>
        {state?.ok === false ? (
          <p className="mt-3 text-sm text-[var(--fb-away)]" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.ok === true ? (
          <p className="mt-3 text-sm text-[var(--fb-accent)]">{state.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)] disabled:opacity-60 md:w-auto md:min-w-48 md:py-4"
      >
        {pending ? "Speichern…" : initialHome != null ? "Tipp ändern" : "Tipp speichern"}
      </button>
      </div>
    </form>
  );
}

function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 truncate text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2">
        <StepperButton
          label={`Weniger Tore ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </StepperButton>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={TIPPSPIEL_MAX_GOALS}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isFinite(n)) return;
            onChange(Math.min(TIPPSPIEL_MAX_GOALS, Math.max(0, Math.round(n))));
          }}
          className="h-16 w-16 rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white text-center font-[family-name:var(--fb-font-display)] text-3xl font-extrabold tabular-nums text-[var(--fb-ink)] outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]"
          aria-label={`Tore ${label}`}
        />
        <StepperButton
          label={`Mehr Tore ${label}`}
          onClick={() => onChange(Math.min(TIPPSPIEL_MAX_GOALS, value + 1))}
        >
          +
        </StepperButton>
      </div>
    </div>
  );
}

function StepperButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--fb-border)] bg-[var(--fb-soft)] text-lg font-bold text-[var(--fb-ink)] transition hover:border-[var(--fb-accent)] hover:bg-[var(--fb-green-100)]",
      )}
    >
      {children}
    </button>
  );
}
