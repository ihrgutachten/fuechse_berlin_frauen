import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--fb-green-950)]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[var(--fb-container)] items-center justify-between gap-4 px-[var(--fb-gutter)] md:h-16">
        <Link href="/" className="group flex min-w-0 flex-col leading-none">
          <span className="font-[family-name:var(--fb-font-display)] text-xl font-extrabold uppercase tracking-[0.04em] md:text-2xl">
            Füchse Berlin
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fb-green-300)]">
            Frauen
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--fb-radius)] px-2.5 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/matchday"
            className="hidden rounded-[var(--fb-radius)] bg-[var(--fb-green-500)] px-3 py-1.5 text-sm font-semibold text-[var(--fb-green-950)] transition hover:bg-[var(--fb-green-300)] sm:inline-flex"
          >
            Live
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
