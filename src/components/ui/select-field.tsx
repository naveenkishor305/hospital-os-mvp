import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SelectFieldProps =
  SelectHTMLAttributes<HTMLSelectElement> & {
    id: string;
    label: string;
    description?: string;
    error?: string;
    fieldClassName?: string;
  };

export function SelectField({
  id,
  label,
  description,
  error,
  className,
  fieldClassName,
  children,
  ...props
}: SelectFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("spine-field", fieldClassName)}>
      <label className="spine-field__label" htmlFor={id}>
        {label}
      </label>

      {description ? (
        <p id={descriptionId} className="spine-field__description">
          {description}
        </p>
      ) : null}

      <div className="spine-select-wrap">
        <select
          id={id}
          className={cn("spine-select", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...props}
        >
          {children}
        </select>

        <ChevronDown
          aria-hidden="true"
          size={16}
          className="spine-select-wrap__icon"
        />
      </div>

      {error ? (
        <p
          id={errorId}
          className="spine-field__message"
          data-error="true"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
