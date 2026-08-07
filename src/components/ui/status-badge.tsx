import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type StatusTone =
  | "neutral"
  | "information"
  | "success"
  | "warning"
  | "error"
  | "critical"
  | "restricted";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  showDot?: boolean;
  icon?: ReactNode;
};

export function StatusBadge({
  tone = "neutral",
  showDot = false,
  icon,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn("spine-badge", className)}
      data-tone={tone}
      {...props}
    >
      {showDot ? (
        <span className="spine-badge__dot" aria-hidden="true" />
      ) : null}
      {icon}
      {children}
    </span>
  );
}
