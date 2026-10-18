import { getNews, getNewsBySlug, type NewsItem } from "@/lib/data";
import archiv from "@/data/news-archiv.json";
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
    bodyHtml: n.body.map((p) => `<p>${escapeHtml(p)}</p>`).join(""),
    source: "static",
  };
}

type ArchiveNews = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  coverLabel: string;
  cover?: string;
  coverCredit?: string;
  bodyHtml: string;
};

function fromArchive(n: ArchiveNews): PublicNews {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    publishedAt: n.publishedAt,
    category: "News",
    coverLabel: "News",
    cover: n.cover,
    coverCredit: n.coverCredit,
    bodyHtml: n.bodyHtml,
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
  const bySlug = new Map<string, PublicNews>();
  for (const item of (archiv as ArchiveNews[]).map(fromArchive)) bySlug.set(item.slug, item);
  for (const item of getNews().map(fromStatic)) bySlug.set(item.slug, item);
  for (const item of db.map(fromDb)) bySlug.set(item.slug, item);
  return [...bySlug.values()].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export async function getMergedNewsBySlug(slug: string): Promise<PublicNews | null> {
  const db = await getPublishedNewsBySlug(slug);
  if (db) return fromDb(db);
  const stat = getNewsBySlug(slug);
  if (stat) return fromStatic(stat);
  const archived = (archiv as ArchiveNews[]).find((item) => item.slug === slug);
  return archived ? fromArchive(archived) : null;
}
