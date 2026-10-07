"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { sanitizeRichText, htmlToPlainText } from "@/lib/sanitize";
import {
  createNews,
  updateNews,
  deleteNews,
  getNewsById,
  type NewsCategory,
  type NewsStatus,
} from "@/lib/news-db";

export type NewsFormInput = {
  id?: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  bodyHtml: string;
  coverUrl: string | null;
  coverCredit: string | null;
  status: NewsStatus;
};

export type SaveResult = { ok: false; error: string };

async function requireAdmin(): Promise<{ email: string | null } | null> {
  const session = await getSession();
  if (!session?.user?.admin) return null;
  return { email: session.user.email ?? null };
}

export async function saveNews(input: NewsFormInput): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Keine Berechtigung." };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Titel fehlt." };

  const bodyHtml = sanitizeRichText(input.bodyHtml ?? "");
  const plain = htmlToPlainText(bodyHtml);
  const excerpt = (input.excerpt?.trim() || plain).slice(0, 200);
  const status: NewsStatus = input.status === "veroeffentlicht" ? "veroeffentlicht" : "entwurf";

  const payload = {
    title,
    category: input.category,
    excerpt,
    bodyHtml,
    coverUrl: input.coverUrl?.trim() || null,
    coverCredit: input.coverCredit?.trim() || null,
    status,
    authorEmail: admin.email,
  };

  if (input.id) {
    const res = await updateNews(input.id, payload);
    if (!res.ok) return { ok: false, error: "Speichern fehlgeschlagen." };
  } else {
    const res = await createNews(payload);
    if (!res.ok) return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  redirect("/admin/news");
}

export async function removeNews(id: string): Promise<SaveResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Keine Berechtigung." };

  const existing = await getNewsById(id);
  await deleteNews(id);

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
  if (existing?.slug) revalidatePath(`/news/${existing.slug}`);
  redirect("/admin/news");
}
