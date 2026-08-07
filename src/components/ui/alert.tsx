import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LockKeyhole,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import type { StatusTone } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";

const alertIcons = {
  neutral: Info,
  information: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  critical: ShieldAlert,
  restricted: LockKeyhole,
};

export type AlertProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> & {
  tone?: StatusTone;
  title: ReactNode;
};

export function Alert({
  tone = "information",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const Icon = alertIcons[tone];
  const interruptive = tone === "critical" || tone === "error";

  return (
    <div
      className={cn("spine-alert", className)}
      data-tone={tone}
      role={interruptive ? "alert" : "status"}
      {...props}
    >
      <Icon
        aria-hidden="true"
        size={18}
        className="spine-alert__icon"
      />

      <div className="min-w-0">
        <div className="spine-alert__title">{title}</div>
        {children ? (
          <div className="spine-alert__message">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
