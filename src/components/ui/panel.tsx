import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type PanelProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: "raised" | "flat";
};

export function Panel({
  elevation = "raised",
  className,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn("spine-panel", className)}
      data-elevation={elevation}
      {...props}
    />
  );
}

export function PanelHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("spine-panel__header", className)}
      {...props}
    />
  );
}

export function PanelBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("spine-panel__body", className)}
      {...props}
    />
  );
}
