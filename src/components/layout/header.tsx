import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";

/**
 * Two-tier header (Herren-inspired):
 * green nav + white strip (~5% taller); crest in-flow left, nav immediately after.
 * Combined: mobile 7.2rem (3.5+3.7), md+ 8.2rem (4+4.2) — keep MobileNav in sync.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-[210] overflow-visible">
      <div className="relative overflow-visible">
        {/* Green navigation bar — 56px / 64px */}
        <div className="fb-nav-pattern overflow-visible border-b border-white/10 text-white">
          <div className="flex h-14 w-full items-center gap-3 px-[var(--fb-gutter)] md:h-16 md:gap-4">
            {/* Logo left — hangs into white bar below; sizes unchanged */}
            <Link
              href="/"
              className="relative z-[220] shrink-0 self-start pt-1.5 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)] md:pt-2"
            >
              <Image
                src="/logo-fuechse-berlin-frauen.png"
                alt="Füchse Berlin Frauen"
                width={200}
                height={225}
                priority
                className="h-[5.75rem] w-auto md:h-[6.75rem]"
              />
            </Link>

            {/* Nav directly after logo (left-aligned, Herren-style) */}
            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label="Hauptnavigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[var(--fb-radius)] px-2 py-1.5 font-[family-name:var(--fb-font-nav)] text-[1.1375rem] font-semibold uppercase leading-none tracking-wide text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2 self-center">
              <Link
                href="/matchday"
                className="hidden rounded-[var(--fb-radius)] bg-[var(--fb-green-500)] px-3 py-1.5 font-[family-name:var(--fb-font-nav)] text-sm font-semibold uppercase text-[var(--fb-green-950)] transition hover:bg-[var(--fb-green-300)] sm:inline-flex"
              >
                Live
              </Link>
              <MobileNav />
            </div>
          </div>
        </div>

        {/* White brand strip — height unchanged */}
        <div
          className="h-[3.7rem] border-b border-[var(--fb-border)] bg-white md:h-[4.2rem]"
          aria-hidden
        />
      </div>
    </header>
  );
}
