import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { getNews, getNewsBySlug } from "@/lib/data";
import { formatNewsDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getNews().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  return { title: item?.title ?? "News" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <PageHero eyebrow={`${item.category} · ${formatNewsDate(item.publishedAt)}`} title={item.title} />
      <article className="mx-auto max-w-3xl px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="mb-8 aspect-[16/9] rounded-[var(--fb-radius-lg)] bg-gradient-to-br from-[var(--fb-green-900)] to-[var(--fb-green-600)]" />
        <p className="text-lg text-[var(--fb-text-muted)]">{item.excerpt}</p>
        <p className="mt-6 text-[var(--fb-text-muted)]">
          Vollständiger Artikeltext folgt über CMS. Dies ist ein Layout-Platzhalter für die News-Detailseite.
        </p>
        <div className="mt-8">
          <Button href="/news" variant="outline">
            Alle News
          </Button>
        </div>
      </article>
    </>
  );
}
