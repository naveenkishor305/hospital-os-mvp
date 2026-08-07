import {
  CircleDashed,
  LockKeyhole,
  SearchX,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { Panel, PanelBody } from "@/components/ui/panel";

export type SystemStateKind =
  | "loading"
  | "empty"
  | "no-results"
  | "error"
  | "restricted"
  | "critical";

const stateConfig: Record<
  SystemStateKind,
  { icon: typeof CircleDashed; iconClassName: string }
> = {
  loading: { icon: CircleDashed, iconClassName: "bg-info-surface text-info" },
  empty: { icon: SearchX, iconClassName: "bg-surface-subtle text-ink-secondary" },
  "no-results": { icon: SearchX, iconClassName: "bg-surface-subtle text-ink-secondary" },
  error: { icon: XCircle, iconClassName: "bg-error-surface text-error" },
  restricted: { icon: LockKeyhole, iconClassName: "bg-restricted-surface text-restricted" },
  critical: { icon: ShieldAlert, iconClassName: "bg-critical-surface text-critical" },
};

export type SystemStateProps = {
  kind: SystemStateKind;
  title: string;
  description: string;
  preserved?: string;
  nextStep?: string;
  escalation?: string;
  action?: ReactNode;
};

export function SystemState({
  kind,
  title,
  description,
  preserved,
  nextStep,
  escalation,
  action,
}: SystemStateProps) {
  const { icon: Icon, iconClassName } = stateConfig[kind];
  const isLoading = kind === "loading";
  const isInterruptive = kind === "error" || kind === "critical";

  return (
    <Panel
      elevation="flat"
      role={isInterruptive ? "alert" : "status"}
      aria-live={isLoading ? "polite" : undefined}
      className="h-full"
    >
      <PanelBody className="flex h-full flex-col items-start">
        <span
          className={`grid size-10 place-items-center rounded-full ${iconClassName}`}
        >
          {isLoading ? (
            <span className="spine-spinner" aria-hidden="true" />
          ) : (
            <Icon aria-hidden="true" size={19} />
          )}
        </span>

        <h3 className="mt-4 text-sm font-semibold text-ink-primary">
          {title}
        </h3>
        <p className="mt-2 text-xs leading-5 text-ink-secondary">
          {description}
        </p>

        {preserved || nextStep || escalation ? (
          <dl className="mt-4 grid gap-2 border-l-2 border-border-default pl-3 text-[11px] leading-4 text-ink-secondary">
            {preserved ? (
              <div>
                <dt className="font-semibold text-ink-primary">Preserved</dt>
                <dd>{preserved}</dd>
              </div>
            ) : null}
            {nextStep ? (
              <div>
                <dt className="font-semibold text-ink-primary">Next action</dt>
                <dd>{nextStep}</dd>
              </div>
            ) : null}
            {escalation ? (
              <div>
                <dt className="font-semibold text-ink-primary">Escalation</dt>
                <dd>{escalation}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {action ? <div className="mt-5">{action}</div> : null}
      </PanelBody>
    </Panel>
  );
}
