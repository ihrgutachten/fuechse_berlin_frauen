import { getSql } from "@/lib/db";

export type NewsCategory = "spielbericht" | "vorbericht" | "verletzung";
export type NewsStatus = "entwurf" | "veroeffentlicht";

export const NEWS_CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: "spielbericht", label: "Spielbericht" },
  { id: "vorbericht", label: "Vorbericht" },
  { id: "verletzung", label: "Verletzung" },
];

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  spielbericht: "Spielbericht",
  vorbericht: "Vorbericht",
  verletzung: "Verletzung",
};

export type NewsRecord = {
  id: string;
  slug: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string | null;
  coverCredit: string | null;
  status: NewsStatus;
  authorEmail: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  cover_credit: string | null;
  status: string;
  author_email: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function isCategory(value: string): value is NewsCategory {
  return value === "spielbericht" || value === "vorbericht" || value === "verletzung";
}

function toIso(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function mapNews(row: NewsRow): NewsRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: isCategory(row.category) ? row.category : "spielbericht",
    excerpt: row.excerpt,
    bodyHtml: row.body_html,
    coverUrl: row.cover_url,
    coverCredit: row.cover_credit,
    status: row.status === "veroeffentlicht" ? "veroeffentlicht" : "entwurf",
    authorEmail: row.author_email,
    publishedAt: toIso(row.published_at),
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date().toISOString(),
  };
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS news (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'spielbericht',
          excerpt TEXT NOT NULL DEFAULT '',
          body_html TEXT NOT NULL DEFAULT '',
          cover_url TEXT,
          cover_credit TEXT,
          status TEXT NOT NULL DEFAULT 'entwurf',
          author_email TEXT,
          published_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS news_status_published_at ON news (status, published_at DESC)`;
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const sql = getSql();
  const root = slugify(base) || "beitrag";
  if (!sql) return root;
  let candidate = root;
  let n = 2;
  for (;;) {
    const rows = (await sql`SELECT id FROM news WHERE slug = ${candidate} LIMIT 1`) as Array<{
      id: string;
    }>;
    const row = rows[0];
    if (!row || (ignoreId && row.id === ignoreId)) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
}

/** Anzahl Beiträge. null, wenn keine DB konfiguriert ist. */
export async function getNewsCount(): Promise<number | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM news`) as Array<{ count: number }>;
  return rows[0]?.count ?? 0;
}

/** Alle Beiträge für das Backend (Entwürfe und veröffentlichte). */
export async function listAllNews(): Promise<NewsRecord[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM news
    ORDER BY COALESCE(published_at, created_at) DESC
  `) as NewsRow[];
  return rows.map(mapNews);
}

/** Nur veröffentlichte Beiträge für die öffentliche Seite. */
export async function listPublishedNews(): Promise<NewsRecord[]> {
  const sql = getSql();
  if (!sql) return [];
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM news
    WHERE status = 'veroeffentlicht'
    ORDER BY published_at DESC NULLS LAST
  `) as NewsRow[];
  return rows.map(mapNews);
}

export async function getNewsById(id: string): Promise<NewsRecord | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`SELECT * FROM news WHERE id = ${id} LIMIT 1`) as NewsRow[];
  return rows[0] ? mapNews(rows[0]) : null;
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsRecord | null> {
  const sql = getSql();
  if (!sql) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM news WHERE slug = ${slug} AND status = 'veroeffentlicht' LIMIT 1
  `) as NewsRow[];
  return rows[0] ? mapNews(rows[0]) : null;
}

export type NewsInput = {
  title: string;
  category: NewsCategory;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string | null;
  coverCredit: string | null;
  status: NewsStatus;
  authorEmail: string | null;
};

export async function createNews(input: NewsInput): Promise<{ ok: boolean; id?: string }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title);
  const publishedAt = input.status === "veroeffentlicht" ? new Date().toISOString() : null;
  await sql`
    INSERT INTO news (
      id, slug, title, category, excerpt, body_html,
      cover_url, cover_credit, status, author_email, published_at
    ) VALUES (
      ${id}, ${slug}, ${input.title}, ${input.category}, ${input.excerpt}, ${input.bodyHtml},
      ${input.coverUrl}, ${input.coverCredit}, ${input.status}, ${input.authorEmail}, ${publishedAt}
    )
  `;
  return { ok: true, id };
}

export async function updateNews(id: string, input: NewsInput): Promise<{ ok: boolean }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  const existing = await getNewsById(id);
  if (!existing) return { ok: false };
  const slug = await uniqueSlug(input.title, id);
  const publishedAt =
    input.status === "veroeffentlicht"
      ? (existing.publishedAt ?? new Date().toISOString())
      : null;
  await sql`
    UPDATE news SET
      slug = ${slug},
      title = ${input.title},
      category = ${input.category},
      excerpt = ${input.excerpt},
      body_html = ${input.bodyHtml},
      cover_url = ${input.coverUrl},
      cover_credit = ${input.coverCredit},
      status = ${input.status},
      author_email = ${input.authorEmail},
      published_at = ${publishedAt},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return { ok: true };
}

export async function deleteNews(id: string): Promise<{ ok: boolean }> {
  const sql = getSql();
  if (!sql) return { ok: false };
  await ensureSchema();
  await sql`DELETE FROM news WHERE id = ${id}`;
  return { ok: true };
}
