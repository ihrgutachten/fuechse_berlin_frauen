import Image from "next/image";
import { cn } from "@/lib/format";

type ClubLogoProps = {
  name: string;
  short: string;
  logo: string;
  hasLogo: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10 md:h-12 md:w-12",
  lg: "h-14 w-14",
};

export function ClubLogo({
  name,
  short,
  logo,
  hasLogo,
  size = "md",
  className,
}: ClubLogoProps) {
  if (hasLogo) {
    return (
      <Image
        src={logo}
        alt={`Logo ${name}`}
        width={96}
        height={96}
        className={cn("object-contain", sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      title={`${name} — Logo folgt`}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-dashed border-[var(--fb-border)] bg-[var(--fb-soft)] text-[10px] font-bold uppercase tracking-wide text-[var(--fb-text-faint)]",
        sizes[size],
        className,
      )}
    >
      {short.slice(0, 3)}
    </span>
  );
}
