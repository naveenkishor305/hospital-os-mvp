import {
  ArrowRight,
  CalendarCheck2,
  Clock3,
  Search,
  ShieldAlert,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/ui/panel";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/ui/status-badge";

export const metadata: Metadata = {
  title: "OPD Overview",
};

const metrics = [
  {
    label: "Arrivals today",
    value: "38",
    detail: "6 waiting for verification",
    icon: UsersRound,
    tone: "information" as StatusTone,
  },
  {
    label: "Consultations active",
    value: "12",
    detail: "4 rooms in use",
    icon: Stethoscope,
    tone: "success" as StatusTone,
  },
  {
    label: "Average wait",
    value: "18 min",
    detail: "2 min below target",
    icon: Clock3,
    tone: "success" as StatusTone,
  },
  {
    label: "Requires attention",
    value: "3",
    detail: "1 identity mismatch",
    icon: ShieldAlert,
    tone: "warning" as StatusTone,
  },
];

const queueRows = [
  {
    time: "10:35",
    patient: "Meera Nair",
    detail: "MRN HOS-024718 · Cardiology",
    task: "Verify allergy before consultation",
    owner: "Reception desk 2",
    status: "Needs verification",
    tone: "warning" as StatusTone,
  },
  {
    time: "10:40",
    patient: "Arjun Menon",
    detail: "MRN HOS-019482 · General medicine",
    task: "Complete clinical handoff",
    owner: "OPD room 4",
    status: "In progress",
    tone: "information" as StatusTone,
  },
  {
    time: "10:50",
    patient: "Farah Khan",
    detail: "MRN HOS-031096 · Orthopaedics",
    task: "Confirm appointment arrival",
    owner: "Reception desk 1",
    status: "Confirmed",
    tone: "success" as StatusTone,
  },
];

export default function OpdOverviewPage() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Integrated outpatient care
            </p>
            <StatusBadge>Prototype data</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            OPD command centre
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
            Coordinate patient arrival, identity verification and clinical
            handoff from one role-aware workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink
            href="/patients"
            variant="secondary"
            startIcon={<Search aria-hidden="true" size={15} />}
          >
            Find patient
          </ButtonLink>
          <ButtonLink
            href="/appointments"
            startIcon={<CalendarCheck2 aria-hidden="true" size={15} />}
          >
            Appointment calendar
          </ButtonLink>
        </div>
      </div>

      <Alert
        tone="information"
        title="Spine foundation is active"
        className="mt-7"
      >
        Patient access, appointment scheduling and queue management now use the
        same governed Spine components. Data remains illustrative and
        session-based in this MVP.
      </Alert>

      <section
        aria-labelledby="opd-metrics-title"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="opd-metrics-title" className="sr-only">
          Today&apos;s OPD metrics
        </h2>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Panel key={metric.label} elevation="flat">
              <PanelBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-ink-secondary">
                      {metric.label}
                    </p>
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
              </PanelBody>
            </Panel>
          );
        })}
      </section>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.55fr]">
        <Panel>
          <PanelHeader>
            <div>
              <div className="flex items-center gap-2 text-action">
                <CalendarCheck2 aria-hidden="true" size={16} />
                <p className="text-xs font-bold uppercase tracking-[0.1em]">
                  Arrival queue
                </p>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Next patient actions
              </h2>
            </div>
            <ButtonLink href="/appointments" variant="tertiary" size="sm">
              View full queue
            </ButtonLink>
          </PanelHeader>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Patient
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Next action
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Owner
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    <span className="sr-only">Open task</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {queueRows.map((row) => (
                  <tr key={`${row.time}-${row.patient}`} className="hover:bg-surface-subtle/60">
                    <td className="spine-mono px-5 py-4 text-xs text-ink-primary">
                      {row.time}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-ink-primary">
                        {row.patient}
                      </p>
                      <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                        {row.detail}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-primary">
                      {row.task}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-secondary">
                      {row.owner}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={row.tone}>
                        {row.status}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="tertiary"
                        size="sm"
                        endIcon={<ArrowRight aria-hidden="true" size={13} />}
                        aria-label={`Open ${row.patient}'s task`}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Handoff readiness
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Identity-first checks
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <ol className="space-y-5">
              {[
                ["01", "Confirm patient", "Use two identifiers before action"],
                ["02", "Check safety markers", "Allergies and alerts stay visible"],
                ["03", "Assign next owner", "Handoffs include role and status"],
              ].map(([number, title, detail]) => (
                <li key={number} className="flex gap-3">
                  <span className="spine-mono grid size-8 shrink-0 place-items-center rounded-md bg-selected text-[10px] font-semibold text-action">
                    {number}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">
                      {title}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-ink-secondary">
                      {detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </PanelBody>
        </Panel>
      </div>

      <section aria-labelledby="patient-context-preview-title" className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Clinical pattern
            </p>
            <h2
              id="patient-context-preview-title"
              className="mt-1 text-lg font-semibold text-ink-primary"
            >
              Persistent patient identity and safety bar
            </h2>
          </div>
          <StatusBadge tone="success">Ready for reuse</StatusBadge>
        </div>

        <PatientContextBar
          name="Meera Nair"
          age={42}
          sex="Female"
          mrn="HOS-024718"
          encounter="OPD-26-08154"
          location="OPD 4"
          clinician="Dr Ananya Rao"
          allergies={["Penicillin"]}
          verifiedAt="10:28"
        />
      </section>
    </div>
  );
}
