import Link from "next/link";
import { NewsEditor } from "@/components/admin/news-editor";

export const metadata = { title: "Neuer Beitrag" };

export default function NewNewsPage() {
  return (
    <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-12">
      <Link
        href="/admin/news"
        className="text-sm font-semibold text-[var(--fb-accent)] hover:underline"
      >
        ← News
      </Link>
      <h1 className="mt-6 font-[family-name:var(--fb-font-display)] text-3xl font-bold uppercase tracking-tight">
        Neuer Beitrag
      </h1>
      <div className="mt-8">
        <NewsEditor />
      </div>
    </div>
  );
}
