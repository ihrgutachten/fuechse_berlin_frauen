import Link from "next/link";
import { listAllNews, CATEGORY_LABEL } from "@/lib/news-db";
import { isDatabaseConfigured } from "@/lib/db";
import { formatNewsDate } from "@/lib/format";

export const metadata = { title: "News verwalten" };

export default async function AdminNewsPage() {
  const items = await listAllNews();
  const dbReady = isDatabaseConfigured();

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
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
        <div className="mt-8 overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--fb-border)] bg-[var(--fb-soft)] text-xs uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-muted)]">
              <tr>
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--fb-border)] last:border-0 hover:bg-[var(--fb-soft)]"
                >
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/news/${item.id}`} className="hover:text-[var(--fb-accent)]">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--fb-text-muted)]">
                    {CATEGORY_LABEL[item.category]}
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-[var(--fb-text-muted)]">
                    {formatNewsDate(item.publishedAt ?? item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
