import { AlertTriangle, Beaker, Pill, ShieldAlert } from "lucide-react";

import {
  Alert,
  ComplianceCountdown,
  InteractionSeverityBadge,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeCriticalResults,
  prototypeDispensingQueue,
  prototypeInteractionAlerts,
} from "@/data/diagnostics-pharmacy-ops";

const classificationLabel = {
  "immediate-emergency": "Immediate emergency",
  urgent: "Urgent",
  important: "Important",
} as const;

const dispensingStatusTone = {
  verification: "warning",
  compounding: "information",
  ready: "success",
  dispensed: "neutral",
} as const;

export function DiagnosticsPharmacyOpsWorkspace() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Clinical diagnostics, therapeutics & pharmacy"
        title="Diagnostics & pharmacy operations"
        description="Critical result escalation, drug interaction grading and controlled-substance dispensing share the same alert and badge language used everywhere else in Hospital OS."
      />

      <MetricsRow
        metrics={[
          { label: "Critical results open", value: String(prototypeCriticalResults.length), icon: Beaker, tone: "critical", detail: "1 unacknowledged" },
          { label: "Interaction alerts", value: String(prototypeInteractionAlerts.length), icon: AlertTriangle, tone: "warning", detail: "1 contraindicated" },
          { label: "Dispensing queue", value: String(prototypeDispensingQueue.length), icon: Pill, tone: "information", detail: "1 ready for pickup" },
          { label: "Controlled substance orders", value: String(prototypeDispensingQueue.filter((d) => d.controlled).length), icon: ShieldAlert, tone: "warning", detail: "Dual sign-off required" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-critical">
                Critical result management
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Escalation queue
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-4">
            {prototypeCriticalResults.map((result) => (
              <Alert
                key={result.id}
                tone={result.classification === "immediate-emergency" ? "critical" : "warning"}
                title={`${result.patient} · ${result.test}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {result.value} · {classificationLabel[result.classification]}
                  </span>
                  {result.acknowledgedBy ? (
                    <StatusBadge tone="success">Acknowledged · {result.acknowledgedBy}</StatusBadge>
                  ) : (
                    <ComplianceCountdown
                      label="Acknowledgement"
                      dueText={`${result.minutesSinceAlert} min since alert`}
                      overdue={result.minutesSinceAlert > 15}
                    />
                  )}
                </div>
              </Alert>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Medication safety
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Drug interaction alerts
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {prototypeInteractionAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{alert.patient}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{alert.pair}</p>
                </div>
                <InteractionSeverityBadge severity={alert.severity} />
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Pharmacy dispensing
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Setting-based dispensing queue
            </h2>
          </div>
          <StatusBadge>{prototypeDispensingQueue.length} orders</StatusBadge>
        </PanelHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                <th scope="col" className="px-5 py-3 font-semibold">Medication</th>
                <th scope="col" className="px-5 py-3 font-semibold">Setting</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {prototypeDispensingQueue.map((request) => (
                <tr key={request.id} className="hover:bg-surface-subtle/60">
                  <td className="px-5 py-4 text-xs font-semibold text-ink-primary">
                    {request.patient}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-primary">
                    {request.medication}
                    {request.controlled ? (
                      <StatusBadge tone="warning" className="ml-2">
                        Controlled
                      </StatusBadge>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-secondary">{request.setting}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={dispensingStatusTone[request.status]}>
                      {request.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
