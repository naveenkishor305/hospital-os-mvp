import {
  Activity,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";

export type PatientContextBarProps = {
  name: string;
  age: number;
  sex: string;
  mrn: string;
  encounter: string;
  location: string;
  clinician: string;
  allergies?: string[];
  verifiedAt: string;
};

export function PatientContextBar({
  name,
  age,
  sex,
  mrn,
  encounter,
  location,
  clinician,
  allergies = [],
  verifiedAt,
}: PatientContextBarProps) {
  return (
    <section
      aria-labelledby="active-patient-title"
      className="overflow-hidden rounded-lg border border-border-default bg-surface shadow-sm"
    >
      <h2 id="active-patient-title" className="sr-only">
        Active patient context
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-5 p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-selected text-action">
            <UserRound aria-hidden="true" size={20} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink-primary">
                {name}
              </p>

              <StatusBadge
                tone="success"
                icon={<ShieldCheck aria-hidden="true" size={13} />}
              >
                Identity verified
              </StatusBadge>

              {allergies.map((allergy) => (
                <StatusBadge key={allergy} tone="warning">
                  {allergy} allergy
                </StatusBadge>
              ))}
            </div>

            <p className="spine-mono mt-2 text-[11px] text-ink-tertiary">
              {age} years · {sex} · MRN {mrn}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-right sm:grid-cols-3">
          <div>
            <dt className="text-[9px] uppercase tracking-[0.08em] text-ink-tertiary">
              Encounter
            </dt>
            <dd className="spine-mono mt-1 text-[10px] text-ink-primary">
              {encounter}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-[0.08em] text-ink-tertiary">
              Location
            </dt>
            <dd className="mt-1 text-[10px] text-ink-primary">
              {location}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] uppercase tracking-[0.08em] text-ink-tertiary">
              Clinician
            </dt>
            <dd className="mt-1 text-[10px] text-ink-primary">
              {clinician}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-surface-subtle px-4 py-2.5">
        <span className="flex items-center gap-2 text-[10px] text-ink-secondary">
          <Activity aria-hidden="true" size={13} className="text-action" />
          Context persists across results, orders and documentation
        </span>
        <span className="spine-mono text-[9px] text-ink-tertiary">
          Last verified {verifiedAt}
        </span>
      </div>
    </section>
  );
}
