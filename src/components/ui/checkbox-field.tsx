import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  error?: string;
};

export function CheckboxField({
  id,
  label,
  description,
  error,
  className,
  ...props
}: CheckboxFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-10 items-start gap-3 rounded-md border border-border-default bg-surface px-3 py-2.5 text-xs text-ink-primary transition-colors hover:border-action",
          error && "border-error",
          className,
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-action"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        <span className="min-w-0">
          <span className="font-semibold">{label}</span>
          {description ? (
            <span
              id={descriptionId}
              className="mt-1 block leading-5 text-ink-secondary"
            >
              {description}
            </span>
          ) : null}
        </span>
      </label>
      {error ? (
        <p
          id={errorId}
          className="mt-1.5 text-xs font-semibold text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
