"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { navLinks, secondaryLinks } from "@/components/layout/nav-links";
import { cn } from "@/lib/format";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const menu =
    mounted &&
    createPortal(
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-[7.2rem] z-[200] overflow-y-auto overscroll-contain bg-[var(--fb-green-950)] px-[var(--fb-gutter)] pb-10 pt-2 text-white transition-opacity duration-200 md:top-[8.2rem] lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav aria-label="Mobilnavigation">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block border-b border-white/10 py-3.5 font-[family-name:var(--fb-font-nav)] text-[1.65rem] font-semibold uppercase leading-none tracking-wide text-white",
                    pathname === link.href && "text-[var(--fb-green-300)]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-col gap-1 border-t border-white/15 pt-5">
            {secondaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block py-2.5 text-base font-medium text-white/75",
                    pathname === link.href && "text-[var(--fb-green-300)]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/matchday"
                className="mt-4 inline-flex rounded-[var(--fb-radius)] bg-[var(--fb-green-500)] px-4 py-2.5 text-sm font-semibold text-[var(--fb-green-950)]"
              >
                Live / Matchday
              </Link>
            </li>
          </ul>
        </nav>
      </div>,
      document.body,
    );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[210] flex h-10 w-10 items-center justify-center rounded-[var(--fb-radius)] border border-white/20 text-white"
      >
        <span className="sr-only">Menü</span>
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span
            className={cn(
              "block h-0.5 w-5 origin-center bg-current transition",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 origin-center bg-current transition",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </span>
      </button>
      {menu}
    </div>
  );
}
