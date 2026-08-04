"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, secondaryLinks } from "@/components/layout/nav-links";
import { cn } from "@/lib/format";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-[var(--fb-radius)] border border-white/20 text-white"
      >
        <span className="sr-only">Menü</span>
        <span className="flex flex-col gap-1.5">
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition",
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
              "block h-0.5 w-5 bg-current transition",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </span>
      </button>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-[var(--fb-green-950)]/98 px-[var(--fb-gutter)] pt-24 transition",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1" aria-label="Mobilnavigation">
          {[...navLinks, ...secondaryLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "border-b border-white/10 py-3 font-[family-name:var(--fb-font-display)] text-2xl uppercase tracking-wide text-white",
                pathname === link.href && "text-[var(--fb-green-300)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
