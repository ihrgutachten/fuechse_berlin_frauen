"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { CoverImageUpload } from "@/components/admin/cover-image-upload";
import { saveNews, removeNews } from "@/app/admin/news/actions";
import {
  NEWS_CATEGORIES,
  type NewsCategory,
  type NewsRecord,
  type NewsStatus,
} from "@/lib/news-db";

type Props = { initial?: NewsRecord | null };

const labelClass =
  "text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]";
const inputClass =
  "mt-1.5 w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--fb-accent)] focus:ring-2 focus:ring-[var(--fb-green-100)]";

export function NewsEditor({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<NewsCategory>(initial?.category ?? "spielbericht");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.coverUrl ?? null);
  const [coverCredit, setCoverCredit] = useState(initial?.coverCredit ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(status: NewsStatus) {
    setError(null);
    startTransition(async () => {
      const res = await saveNews({
        id: initial?.id,
        title,
        category,
        excerpt,
        bodyHtml,
        coverUrl,
        coverCredit: coverCredit || null,
        status,
      });
      // Bei Erfolg leitet die Action per redirect um; hier landen wir nur im Fehlerfall.
      if (res && !res.ok) setError(res.error);
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!window.confirm("Diesen Beitrag wirklich löschen?")) return;
    setError(null);
    startTransition(async () => {
      const res = await removeNews(initial.id);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div>
          <label htmlFor="title" className={labelClass}>
            Titel
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="z. B. Deutlicher Heimsieg gegen Rostock"
          />
        </div>

        <div>
          <span className={labelClass}>Text</span>
          <div className="mt-1.5">
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className={labelClass}>
            Kurzfassung (optional)
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Wird in der Übersicht gezeigt. Leer lassen für automatische Kurzfassung."
          />
        </div>
      </div>

      <aside className="space-y-5">
        <div>
          <label htmlFor="category" className={labelClass}>
            Kategorie
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as NewsCategory)}
            className={inputClass}
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Titelbild</span>
          <div className="mt-1.5">
            <CoverImageUpload value={coverUrl} onChange={setCoverUrl} />
          </div>
        </div>

        <div>
          <label htmlFor="coverCredit" className={labelClass}>
            Bildnachweis (optional)
          </label>
          <input
            id="coverCredit"
            value={coverCredit}
            onChange={(e) => setCoverCredit(e.target.value)}
            className={inputClass}
            placeholder="Vorname Nachname"
          />
        </div>

        {error ? (
          <p className="rounded-[var(--fb-radius)] border border-[var(--fb-away)] bg-[var(--fb-away-soft)] px-3 py-2 text-sm">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => submit("veroeffentlicht")}
            disabled={pending}
            className="w-full rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)] disabled:opacity-60"
          >
            {pending ? "Speichert …" : "Veröffentlichen"}
          </button>
          <button
            type="button"
            onClick={() => submit("entwurf")}
            disabled={pending}
            className="w-full rounded-[var(--fb-radius)] border border-[var(--fb-border)] px-4 py-3 text-sm font-semibold transition hover:border-[var(--fb-accent)] disabled:opacity-60"
          >
            Als Entwurf speichern
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            disabled={pending}
            className="w-full rounded-[var(--fb-radius)] px-4 py-2 text-sm font-semibold text-[var(--fb-text-muted)] hover:text-[var(--fb-ink)]"
          >
            Abbrechen
          </button>
          {initial?.id ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="w-full rounded-[var(--fb-radius)] px-4 py-2 text-sm font-semibold text-[var(--fb-away)] hover:underline"
            >
              Beitrag löschen
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
