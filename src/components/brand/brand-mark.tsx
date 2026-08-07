import Image from "next/image";

import { cn } from "@/lib/cn";

export type BrandMarkProps = {
  size?: "sm" | "md";
  className?: string;
};

export type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  tone?: "primary" | "inverse";
  className?: string;
  priority?: boolean;
};

export function BrandMark({
  size = "md",
  className,
}: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden",
        size === "md" ? "size-11" : "size-9",
        className,
      )}
    >
      <Image
        src="/brand/nadi-icon.svg"
        alt=""
        fill
        sizes={size === "md" ? "44px" : "36px"}
        unoptimized
      />
    </span>
  );
}

export function BrandLogo({
  size = "md",
  tone = "primary",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={
        tone === "inverse"
          ? "/brand/nadi-logo-mono.svg"
          : "/brand/nadi-logo-primary.svg"
      }
      alt="Nadi — hospital operating system"
      width={720}
      height={200}
      priority={priority}
      unoptimized
      className={cn(
        "h-auto shrink-0",
        size === "sm" && "w-[220px]",
        size === "md" && "w-[280px]",
        size === "lg" && "w-[340px]",
        tone === "inverse" && "brightness-0 invert",
        className,
      )}
    />
  );
}
