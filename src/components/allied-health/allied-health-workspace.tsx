import { ClipboardList, HeartHandshake, Target, Users } from "lucide-react";

import { Panel, PanelBody, PanelHeader, StatusBadge, Timeline } from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeGoalProgress,
  prototypeReferrals,
  prototypeSessionHistory,
} from "@/data/allied-health";

const statusLabel = {
  "pending-assignment": "Pending assignment",
  "in-progress": "In progress",
  completed: "Completed",
} as const;

const statusTone = {
  "pending-assignment": "warning",
  "in-progress": "information",
  completed: "success",
} as const;

export function AlliedHealthWorkspace() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Rehabilitation, nutrition & social work"
        title="Allied health & care coordination"
        description="Referral triage, multidisciplinary goal tracking and session documentation compose from the same table, badge and timeline primitives used across the platform."
      />

      <MetricsRow
        metrics={[
          { label: "Open referrals", value: String(prototypeReferrals.length), icon: ClipboardList, tone: "information", detail: "2 urgent" },
          { label: "Active goals tracked", value: String(prototypeGoalProgress.length), icon: Target, tone: "information", detail: "Avg. 43% complete" },
          { label: "Disciplines engaged", value: "5", icon: Users, tone: "success", detail: "Full multidisciplinary coverage" },
          { label: "Discharge coordination", value: "1", icon: HeartHandshake, tone: "success", detail: "Ready for handoff" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Referral triage
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Discipline referrals
              </h2>
            </div>
            <StatusBadge>{prototypeReferrals.length} referrals</StatusBadge>
          </PanelHeader>
          <ul aria-label="Allied health referrals">
            {prototypeReferrals.map((referral) => (
              <li key={referral.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{referral.patient}</p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {referral.discipline} · {referral.reason}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {referral.priority === "urgent" ? (
                      <StatusBadge tone="critical">Urgent</StatusBadge>
                    ) : null}
                    <StatusBadge tone={statusTone[referral.status]}>
                      {statusLabel[referral.status]}
                    </StatusBadge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Session history
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Suresh Babu · Physiotherapy
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <Timeline entries={prototypeSessionHistory} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Multidisciplinary goals
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Rehabilitation &amp; care plan progress
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {prototypeGoalProgress.map((goal) => (
            <div key={goal.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">
                  {goal.patient} · {goal.goal}
                </p>
                <StatusBadge>{goal.discipline}</StatusBadge>
              </div>
              <div className="h-2 rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-action"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-ink-tertiary">{goal.progress}% toward goal</p>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
