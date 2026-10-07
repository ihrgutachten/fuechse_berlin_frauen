import { getNews, getNewsBySlug, type NewsItem } from "@/lib/data";
import {
  listPublishedNews,
  getPublishedNewsBySlug,
  CATEGORY_LABEL,
  type NewsRecord,
} from "@/lib/news-db";

/**
 * Einheitliche Sicht auf News für die öffentlichen Seiten.
 * Vereint die alten statischen Artikel (news.json) mit Ninas DB-Beiträgen.
 */
export type PublicNews = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  coverLabel: string;
  cover?: string;
  coverCredit?: string;
  bodyHtml: string;
  source: "static" | "db";
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fromStatic(n: NewsItem): PublicNews {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    publishedAt: n.publishedAt,
    category: n.category,
    coverLabel: n.coverLabel,
    cover: n.cover,
    coverCredit: n.coverCredit,
    // Statische Absätze als simple Absatz-Tags rendern.
    bodyHtml: n.body.map((p) => `<p>${escapeHtml(p)}</p>`).join(""),
    source: "static",
  };
}

function fromDb(n: NewsRecord): PublicNews {
  const label = CATEGORY_LABEL[n.category];
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    publishedAt: n.publishedAt ?? n.createdAt,
    category: label,
    coverLabel: label,
    cover: n.coverUrl ?? undefined,
    coverCredit: n.coverCredit ?? undefined,
    bodyHtml: n.bodyHtml,
    source: "db",
  };
}

export async function getMergedNews(): Promise<PublicNews[]> {
  const db = await listPublishedNews();
  const all = [...getNews().map(fromStatic), ...db.map(fromDb)];
  return all.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export async function getMergedNewsBySlug(slug: string): Promise<PublicNews | null> {
  const db = await getPublishedNewsBySlug(slug);
  if (db) return fromDb(db);
  const stat = getNewsBySlug(slug);
  return stat ? fromStatic(stat) : null;
}
