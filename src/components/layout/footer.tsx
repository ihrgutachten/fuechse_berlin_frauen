import Image from "next/image";
import Link from "next/link";
import { navLinks, secondaryLinks } from "@/components/layout/nav-links";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--fb-border)] bg-[var(--fb-green-950)] text-white">
      <div className="mx-auto grid max-w-[var(--fb-container)] gap-8 px-[var(--fb-gutter)] py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex">
            <Image
              src="/logo-fuechse-berlin-frauen.png"
              alt="Füchse Berlin Frauen"
              width={140}
              height={160}
              className="h-16 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Frauen-Handball aus Berlin. 2. Bundesliga. Revier Charlottenburg.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-green-300)]">
            Navigation
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {navLinks.slice(0, 6).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[var(--fb-ls-label)] text-[var(--fb-green-300)]">
            Verein
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {secondaryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sponsoren" className="hover:text-white">
                Sponsor werden
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-[var(--fb-gutter)] py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Füchse Berlin Frauen · Platzhalter-Impressum folgt
      </div>
    </footer>
  );
}
