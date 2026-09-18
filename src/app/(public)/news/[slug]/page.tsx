import { notFound } from "next/navigation";
import Image from "next/image";
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
        {item.cover ? (
          <figure className="mb-8 overflow-hidden rounded-[var(--fb-radius-lg)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={item.cover}
                alt=""
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
                priority
              />
            </div>
            {item.coverCredit ? (
              <figcaption className="mt-2 text-xs text-[var(--fb-text-faint)]">
                Foto: {item.coverCredit}
              </figcaption>
            ) : null}
          </figure>
        ) : (
          <div className="mb-8 aspect-[16/9] rounded-[var(--fb-radius-lg)] bg-gradient-to-br from-[var(--fb-green-900)] to-[var(--fb-green-600)]" />
        )}
        <div className="space-y-5 text-base leading-relaxed text-[var(--fb-ink)] md:text-lg">
          {item.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/news" variant="outline">
            Alle News
          </Button>
        </div>
      </article>
    </>
  );
}
