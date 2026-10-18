import Image from "next/image";
import Link from "next/link";
import { listAllNews, CATEGORY_LABEL, type NewsRecord, type NewsStatus } from "@/lib/news-db";
import { isDatabaseConfigured } from "@/lib/db";
import { formatNewsDate } from "@/lib/format";

export const metadata = { title: "News verwalten" };

const SORT_KEYS = ["title", "category", "status", "date"] as const;
type SortKey = (typeof SORT_KEYS)[number];
type SortDir = "asc" | "desc";

const THUMB_W = 250;
const THUMB_H = 167;

function isSortKey(value: string | undefined): value is SortKey {
  return SORT_KEYS.some((key) => key === value);
}

function plainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : " ";
    })
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstWords(item: NewsRecord, count = 20): string {
  const source = plainText(item.bodyHtml) || plainText(item.excerpt);
  if (!source) return "";
  const words = source.split(" ").filter(Boolean);
  return words.slice(0, count).join(" ");
}

function statusLabel(status: NewsStatus): string {
  return status === "veroeffentlicht" ? "Veröffentlicht" : "Entwurf";
}

function compare(a: NewsRecord, b: NewsRecord, sort: SortKey): number {
  if (sort === "title") return a.title.localeCompare(b.title, "de");
  if (sort === "category") {
    return CATEGORY_LABEL[a.category].localeCompare(CATEGORY_LABEL[b.category], "de");
  }
  if (sort === "status") return statusLabel(a.status).localeCompare(statusLabel(b.status), "de");
  const aTime = +new Date(a.publishedAt ?? a.createdAt);
  const bTime = +new Date(b.publishedAt ?? b.createdAt);
  return aTime - bTime;
}

function sortHref(column: SortKey, sort: SortKey, dir: SortDir): string {
  const nextDir: SortDir = sort === column ? (dir === "asc" ? "desc" : "asc") : column === "date" ? "desc" : "asc";
  return `/admin/news?sort=${column}&dir=${nextDir}`;
}

function SortHeader({
  label,
  column,
  sort,
  dir,
}: {
  label: string;
  column: SortKey;
  sort: SortKey;
  dir: SortDir;
}) {
  const active = sort === column;
  return (
    <th
      className="whitespace-nowrap px-4 py-3"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link
        href={sortHref(column, sort, dir)}
        scroll={false}
        className="inline-flex items-center gap-1.5 hover:text-[var(--fb-ink)]"
      >
        {label}
        <span aria-hidden="true" className={active ? "text-[var(--fb-ink)]" : "opacity-40"}>
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const sort: SortKey = isSortKey(params.sort) ? params.sort : "date";
  const dir: SortDir = params.dir === "asc" || params.dir === "desc" ? params.dir : "desc";
  const items = [...(await listAllNews())].sort((a, b) => {
    const result = compare(a, b, sort);
    return dir === "asc" ? result : -result;
  });
  const dbReady = isDatabaseConfigured();

  return (
    <div className="mx-auto w-full max-w-[96rem] px-[var(--fb-gutter)] py-12">
      <Link href="/admin" className="text-sm font-semibold text-[var(--fb-accent)] hover:underline">
        ← Backend
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
            Backend
          </p>
          <h1 className="mt-2 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
            News
          </h1>
        </div>
        <Link
          href="/admin/news/new"
          className="rounded-[var(--fb-radius)] bg-[var(--fb-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--fb-accent-hover)]"
        >
          Neuer Beitrag
        </Link>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-[var(--fb-text-muted)]">
        Hier gepflegte Beiträge erscheinen zusätzlich zu den bestehenden Artikeln auf der
        News-Seite und der Startseite.
      </p>

      {!dbReady ? (
        <p className="mt-8 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-6 text-sm text-[var(--fb-text-muted)]">
          Keine Datenbank verbunden. DATABASE_URL prüfen.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-[var(--fb-radius-lg)] border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] p-6 text-sm text-[var(--fb-text-muted)]">
          Noch keine eigenen Beiträge. Lege den ersten über &bdquo;Neuer Beitrag&ldquo; an.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="border-b border-[var(--fb-border)] bg-[var(--fb-soft)] text-xs uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
              <tr>
                <SortHeader label="Titel" column="title" sort={sort} dir={dir} />
                <SortHeader label="Kategorie" column="category" sort={sort} dir={dir} />
                <SortHeader label="Status" column="status" sort={sort} dir={dir} />
                <SortHeader label="Datum" column="date" sort={sort} dir={dir} />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const preview = firstWords(item);
                const cover = item.coverUrl?.trim() || null;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--fb-border)] last:border-0 hover:bg-[var(--fb-soft)]"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-5">
                        <Link href={`/admin/news/${item.id}`} className="shrink-0">
                          {cover ? (
                            <Image
                              src={cover}
                              alt=""
                              width={THUMB_W}
                              height={THUMB_H}
                              className="h-[167px] w-[250px] rounded-[var(--fb-radius)] object-cover"
                            />
                          ) : (
                            <span className="flex h-[167px] w-[250px] items-center justify-center rounded-[var(--fb-radius)] bg-[var(--fb-soft)] text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
                              Kein Bild
                            </span>
                          )}
                        </Link>
                        <div className="min-w-0 py-1">
                          <Link
                            href={`/admin/news/${item.id}`}
                            className="font-semibold leading-snug hover:text-[var(--fb-accent)]"
                          >
                            {item.title}
                          </Link>
                          {preview ? (
                            <p className="mt-2 font-normal leading-relaxed text-[var(--fb-text-muted)]">
                              {preview}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 align-top text-[var(--fb-text-muted)]">
                      {CATEGORY_LABEL[item.category]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 align-top">
                      {item.status === "veroeffentlicht" ? (
                        <span className="rounded-full bg-[var(--fb-green-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--fb-accent)]">
                          Veröffentlicht
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--fb-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--fb-muted)]">
                          Entwurf
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 align-top text-[var(--fb-text-muted)]">
                      {formatNewsDate(item.publishedAt ?? item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
