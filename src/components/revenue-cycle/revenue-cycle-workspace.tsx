import { AlertTriangle, FileWarning, ReceiptIndianRupee, Wallet } from "lucide-react";

import {
  AgingReceivablesLadder,
  Panel,
  PanelBody,
  PanelHeader,
  ProcessStageTracker,
  StatusBadge,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import { prototypeAgingBuckets, prototypeClaims, prototypeDenials } from "@/data/revenue-cycle";

export function RevenueCycleWorkspace() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Financial operations & revenue cycle"
        title="Revenue cycle management"
        description="Claim lifecycle status, accounts receivable aging and denial recovery all reuse the same platform primitives as clinical workflows."
      />

      <MetricsRow
        metrics={[
          { label: "Claims in flight", value: String(prototypeClaims.length), icon: ReceiptIndianRupee, tone: "information", detail: "1 blocked on adjudication" },
          { label: "Total receivables", value: "₹7,11,000", icon: Wallet, tone: "information", detail: "58% current" },
          { label: "Open denials", value: String(prototypeDenials.length), icon: FileWarning, tone: "warning", detail: "₹62,450 at risk" },
          { label: "90+ day receivables", value: "₹39,000", icon: AlertTriangle, tone: "critical", detail: "Needs collection action" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Claim submission &amp; adjudication
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">Claim lifecycle</h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-6">
          {prototypeClaims.map((claim) => (
            <div key={claim.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">
                  {claim.patient} · {claim.payer}
                </p>
                <StatusBadge>{claim.amount}</StatusBadge>
              </div>
              <ProcessStageTracker stages={claim.stages} />
            </div>
          ))}
        </PanelBody>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Accounts receivable
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Aging summary</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <AgingReceivablesLadder buckets={prototypeAgingBuckets} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Denial management
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Open denials</h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {prototypeDenials.map((denial) => (
              <div
                key={denial.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{denial.patient}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{denial.reason}</p>
                </div>
                <div className="text-right">
                  <StatusBadge tone="warning">{denial.category}</StatusBadge>
                  <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">{denial.amount}</p>
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
