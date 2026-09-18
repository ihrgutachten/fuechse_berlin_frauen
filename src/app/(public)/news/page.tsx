import { NewsCard } from "@/components/news/news-card";
import { PageHero } from "@/components/ui/page-hero";
import { getNews } from "@/lib/data";

export const metadata = { title: "News" };

export default function NewsPage() {
  const news = getNews().slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow="Aktuelles"
        title="News"
        description="Die jüngsten Spielberichte und Vorschauen."
      />
      <div className="mx-auto max-w-[var(--fb-container)] px-[var(--fb-gutter)] py-10 md:py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
