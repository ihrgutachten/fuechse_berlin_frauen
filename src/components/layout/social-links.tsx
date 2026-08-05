import type { ReactNode } from "react";
import social from "@/data/social.json";
import { cn } from "@/lib/format";

type SocialId = "instagram" | "facebook" | "tiktok";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2.2c3.2 0 3.6.01 4.85.07 1.17.05 1.97.24 2.67.51.73.28 1.36.66 1.98 1.28.62.62 1 1.25 1.28 1.98.27.7.46 1.5.51 2.67.06 1.25.07 1.65.07 4.85s-.01 3.6-.07 4.85c-.05 1.17-.24 1.97-.51 2.67a5.5 5.5 0 0 1-1.28 1.98 5.5 5.5 0 0 1-1.98 1.28c-.7.27-1.5.46-2.67.51-1.25.06-1.65.07-4.85.07s-3.6-.01-4.85-.07c-1.17-.05-1.97-.24-2.67-.51a5.5 5.5 0 0 1-1.98-1.28 5.5 5.5 0 0 1-1.28-1.98c-.27-.7-.46-1.5-.51-2.67C2.21 15.6 2.2 15.2 2.2 12s.01-3.6.07-4.85c.05-1.17.24-1.97.51-2.67.28-.73.66-1.36 1.28-1.98.62-.62 1.25-1 1.98-1.28.7-.27 1.5-.46 2.67-.51C8.4 2.21 8.8 2.2 12 2.2Zm0 1.62c-3.15 0-3.52.01-4.76.07-.98.04-1.51.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.3.88-.35 1.86-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.3 1.86.35 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.98-.04 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.3-.88.35-1.86.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.98-.21-1.51-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.3-1.86-.35-1.24-.06-1.61-.07-4.76-.07Zm0 2.9a5.28 5.28 0 1 1 0 10.56 5.28 5.28 0 0 1 0-10.56Zm0 1.62a3.66 3.66 0 1 0 0 7.32 3.66 3.66 0 0 0 0-7.32Zm5.4-2.1a1.23 1.23 0 1 1-2.47 0 1.23 1.23 0 0 1 2.47 0Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.55c0-.93.26-1.56 1.59-1.56H16.8V4.14C16.4 4.09 15.1 4 13.6 4 10.5 4 8.4 5.9 8.4 9.2v2.4H5.7v3.2h2.7V22h5.1Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.03-2.76V9.36a6.34 6.34 0 1 0 5.48 6.29V9.39a8.2 8.2 0 0 0 4.77 1.52V7.46a4.85 4.85 0 0 1-1-.77Z" />
    </svg>
  );
}

const iconMap: Record<SocialId, () => ReactNode> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
};

type SocialLinksProps = {
  className?: string;
  linkClassName?: string;
};

export function SocialLinks({ className, linkClassName }: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)} aria-label="Social Media">
      {social.map((item) => {
        const Icon = iconMap[item.id as SocialId];
        return (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              title={item.label}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/85 transition hover:border-white/40 hover:bg-white/15 hover:text-white",
                linkClassName,
              )}
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
