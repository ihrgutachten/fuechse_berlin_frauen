import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/lib/data";
import { cn, formatNewsDate } from "@/lib/format";

type NewsCardProps = {
  item: NewsItem;
  className?: string;
};

export function NewsCard({ item, className }: NewsCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white transition hover:border-[var(--fb-accent)]",
        className,
      )}
    >
      <Link href={`/news/${item.slug}`} className="flex flex-1 flex-col">
        <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-gradient-to-br from-[var(--fb-green-900)] to-[var(--fb-green-600)] p-4">
          {item.cover ? (
            <Image
              src={item.cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
          <span className="relative rounded-[var(--fb-radius)] bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {item.coverLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fb-accent)]">
            {item.category} · {formatNewsDate(item.publishedAt)}
          </p>
          <h3 className="mt-2 font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase leading-snug tracking-tight text-[var(--fb-ink)] group-hover:text-[var(--fb-accent)]">
            {item.title}
          </h3>
          <p className="mt-2 flex-1 text-sm text-[var(--fb-text-muted)]">{item.excerpt}</p>
          <span className="mt-4 text-sm font-semibold text-[var(--fb-accent)]">Weiterlesen</span>
        </div>
      </Link>
    </article>
  );
}
