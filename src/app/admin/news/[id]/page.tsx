import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsEditor } from "@/components/admin/news-editor";
import { getNewsById } from "@/lib/news-db";

export const metadata = { title: "Beitrag bearbeiten" };

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const item = await getNewsById(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <Link
        href="/admin/news"
        className="text-sm font-semibold text-[var(--fb-accent)] hover:underline"
      >
        ← News
      </Link>
      <h1 className="mt-6 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Beitrag bearbeiten
      </h1>
      <div className="mt-8">
        <NewsEditor initial={item} />
      </div>
    </div>
  );
}
