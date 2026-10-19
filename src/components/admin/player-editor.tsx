"use client";

import { useState, useTransition } from "react";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { savePlayer } from "@/app/admin/team/actions";
import { PLAYER_POSITIONS } from "@/lib/player-positions";
import type { PlayerRecord, PlayerRole } from "@/lib/players-db";

type Props = { initial?: PlayerRecord | null };

const labelClass =
  "text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]";
const inputClass =
  "mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]";

export function PlayerEditor({ initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [number, setNumber] = useState(initial?.number != null ? String(initial.number) : "");
  const [role, setRole] = useState<PlayerRole>(initial?.role ?? "spielerin");
  const [position, setPosition] = useState(initial?.position || "RL");
  const [funktion, setFunktion] = useState(initial?.role === "spielerin" ? "" : (initial?.positionLabel ?? ""));
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [nationality, setNationality] = useState(initial?.nationality ?? "");
  const [birthPlace, setBirthPlace] = useState(initial?.birthPlace ?? "");
  const [height, setHeight] = useState(initial?.height ?? "");
  const [joined, setJoined] = useState(initial?.joined ?? "");
  const [previousClubs, setPreviousClubs] = useState(initial?.previousClubs ?? "");
  const [patron, setPatron] = useState(initial?.patron ?? "");
  const [patronUrl, setPatronUrl] = useState(initial?.patronUrl ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.photo || null);
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const knownPosition = PLAYER_POSITIONS.some((item) => item.id === position);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await savePlayer({
        id: initial?.id,
        name,
        number,
        role,
        position,
        funktion,
        nickname,
        birthPlace,
        joined,
        height,
        previousClubs,
        patron,
        patronUrl,
        photo,
        nationality,
        bio,
        active,
      });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div>
        <p className={labelClass}>Foto</p>
        <div className="mt-1.5">
          <CoverImageUpload
            value={photo}
            onChange={setPhoto}
            aspect={3 / 4}
            label="Foto wählen"
            hint="Zuschnitt im Format 3:4"
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className={labelClass}>Nummer</span>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              inputMode="numeric"
              className={inputClass}
            />
          </label>
          <label>
            <span className={labelClass}>Rolle</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              className={inputClass}
            >
              <option value="spielerin">Spielerin</option>
              <option value="coach">Trainerin</option>
              <option value="staff">Team</option>
            </select>
          </label>
          {role === "spielerin" ? (
            <label className="sm:col-span-2">
              <span className={labelClass}>Position</span>
              <select value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
                {!knownPosition && position ? <option value={position}>{position}</option> : null}
                {PLAYER_POSITIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="sm:col-span-2">
              <span className={labelClass}>Funktion</span>
              <input value={funktion} onChange={(e) => setFunktion(e.target.value)} className={inputClass} />
            </label>
          )}
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--fb-green-700)]"
          />
          Aktiv im Kader
        </label>
        <p className="text-sm text-[var(--fb-text-muted)]">
          Inaktiv heißt: nicht mehr auf der Teamseite. In dieser Liste wird das Foto grau, der Eintrag bleibt.
        </p>

        <div className="grid gap-4 border-t border-[var(--fb-border)] pt-5 sm:grid-cols-2">
          <p className={`sm:col-span-2 ${labelClass}`}>Profil</p>
          <Field label="Spitzname" value={nickname} onChange={setNickname} />
          <Field label="Nationalität" value={nationality} onChange={setNationality} />
          <Field label="Geburtsort" value={birthPlace} onChange={setBirthPlace} />
          <Field label="Größe" value={height} onChange={setHeight} />
          <Field label="Dabei seit" value={joined} onChange={setJoined} />
          <label className="sm:col-span-2">
            <span className={labelClass}>Frühere Vereine</span>
            <input value={previousClubs} onChange={(e) => setPreviousClubs(e.target.value)} className={inputClass} />
          </label>
          <Field label="Patenschaft" value={patron} onChange={setPatron} />
          <Field label="Link zur Patenschaft" value={patronUrl} onChange={setPatronUrl} />
          <label className="sm:col-span-2">
            <span className={labelClass}>Kurztext</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputClass} />
          </label>
        </div>

        {error ? <p className="text-sm font-semibold text-[var(--fb-away)]">{error}</p> : null}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-[var(--fb-radius)] bg-[var(--fb-green-700)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Speichert …" : "Speichern"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </label>
  );
}
