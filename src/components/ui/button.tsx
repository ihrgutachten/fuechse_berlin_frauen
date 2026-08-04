import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost" | "on-dark";
  className?: string;
  type?: "button" | "submit";
};

const variants = {
  solid:
    "bg-[var(--fb-accent)] text-white hover:bg-[var(--fb-accent-hover)]",
  outline:
    "border border-[var(--fb-accent)] text-[var(--fb-accent)] hover:bg-[var(--fb-green-100)]",
  ghost: "text-[var(--fb-accent)] hover:bg-[var(--fb-soft)]",
  "on-dark":
    "bg-[var(--fb-green-500)] text-[var(--fb-green-950)] hover:bg-[var(--fb-green-300)]",
};

export function Button({
  href,
  children,
  variant = "solid",
  className,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-[var(--fb-radius)] px-4 py-2.5 text-sm font-semibold transition",
    variants[variant],
    className,
  );

  if (href) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
