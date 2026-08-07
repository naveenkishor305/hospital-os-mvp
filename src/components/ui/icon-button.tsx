import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({
  label,
  icon,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn("spine-icon-button", className)}
      {...props}
    >
      {icon}
    </button>
  );
}
