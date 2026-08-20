import type { ComponentType, ReactNode } from "react";

import { StatusBadge, type StatusTone } from "@naveenkishor305/spine-ui";

type IconComponent = ComponentType<{
  size?: number;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export function ModulePageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">{eyebrow}</p>
          <StatusBadge>Prototype · illustrative records</StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">{description}</p>
      </div>
      {action}
    </div>
  );
}

export type ModuleMetric = {
  label: string;
  value: string;
  icon: IconComponent;
  tone: StatusTone;
  detail: string;
};

export function MetricsRow({ metrics }: { metrics: ModuleMetric[] }) {
  return (
    <section aria-label="Key metrics" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className="rounded-lg border border-border-subtle bg-surface p-5 shadow-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-secondary">{metric.label}</p>
                <p className="spine-mono mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink-primary">
                  {metric.value}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                <Icon aria-hidden="true" size={17} />
              </span>
            </div>
            <StatusBadge tone={metric.tone} className="mt-4">
              {metric.detail}
            </StatusBadge>
          </div>
        );
      })}
    </section>
  );
}
