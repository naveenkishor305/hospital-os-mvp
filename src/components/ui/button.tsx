import type {
  ButtonHTMLAttributes,
  ComponentProps,
  ReactNode,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "critical"
  | "brand";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "spine-button",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="spine-spinner" aria-hidden="true" />
      ) : (
        startIcon
      )}
      <span>{children}</span>
      {!loading ? endIcon : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      data-variant={variant}
      data-size={size}
      className={cn(
        "spine-button",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {startIcon}
      <span>{children}</span>
      {endIcon}
    </Link>
  );
}
