import Image from "next/image";
import Link from "next/link";
import { navLinks, secondaryLinks } from "@/components/layout/nav-links";
import { SocialLinks } from "@/components/layout/social-links";

export function Footer() {
  return (
    <footer className="fb-footer-pattern mt-auto border-t border-[var(--fb-border)] text-white">
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
          <SocialLinks className="mt-5" />
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
      <div className="border-t border-white/10 px-[var(--fb-gutter)] py-4">
        <div className="mx-auto flex max-w-[var(--fb-container)] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-xs text-white/50 sm:text-left">
            © {new Date().getFullYear()} Füchse Berlin Frauen · Platzhalter-Impressum folgt
            {" · "}
            <Link href="/login" className="hover:text-white/80">
              login
            </Link>
          </p>
          <a
            href="https://www.alsco-hbf.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex opacity-90 transition hover:opacity-100"
            aria-label="Alsco Handball Bundesliga Frauen — zur Liga-Website"
          >
            <Image
              src="/league/alsco-hbf.svg"
              alt="Alsco Handball Bundesliga Frauen"
              width={72}
              height={82}
              className="h-12 w-auto"
              unoptimized
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
