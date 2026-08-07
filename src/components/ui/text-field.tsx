import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/cn";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
  endAdornment?: ReactNode;
  appearance?: "default" | "login";
  fieldClassName?: string;
};

export function TextField({
  id,
  label,
  description,
  error,
  endAdornment,
  appearance = "default",
  className,
  fieldClassName,
  ...props
}: TextFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div
      className={cn("spine-field", fieldClassName)}
      data-appearance={appearance}
    >
      <label className="spine-field__label" htmlFor={id}>
        {label}
      </label>

      {description ? (
        <p id={descriptionId} className="spine-field__description">
          {description}
        </p>
      ) : null}

      <div className="spine-input-wrap">
        <input
          id={id}
          className={cn("spine-input", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...props}
        />

        {endAdornment ? (
          <span className="spine-field__adornment">
            {endAdornment}
          </span>
        ) : null}
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
