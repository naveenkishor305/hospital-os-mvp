import { ClipboardList, ShieldCheck, Wrench } from "lucide-react";

import {
  AssetLifecycleRecord,
  ComplianceCountdown,
  DispatchBoard,
  IsolationTypeBadge,
  Panel,
  PanelBody,
  PanelHeader,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeFacilityAssets,
  prototypeFacilityColumns,
  prototypeIsolationRooms,
} from "@/data/facility-operations";

export function FacilityOperationsWorkspace() {
  const openTickets = prototypeFacilityColumns.reduce((sum, column) => sum + column.tickets.length, 0);
  const overdueAssets = prototypeFacilityAssets.filter((asset) => asset.overdue).length;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Environmental services, biomedical, facilities, security, transport, mortuary, hospitality, infection prevention & clinical equipment"
        title="Facility operations"
        description="Ten support-service modules share one shape: intake, dispatch, execution, verification. The same dispatch board and asset lifecycle record cover all of them."
      />

      <MetricsRow
        metrics={[
          { label: "Open service tickets", value: String(openTickets), icon: ClipboardList, tone: "information", detail: "1 urgent" },
          { label: "Assets tracked", value: String(prototypeFacilityAssets.length), icon: Wrench, tone: "information", detail: "1 under repair" },
          { label: "Overdue maintenance", value: String(overdueAssets), icon: Wrench, tone: overdueAssets > 0 ? "critical" : "success", detail: "Calibration overdue" },
          { label: "Active isolation rooms", value: String(prototypeIsolationRooms.length), icon: ShieldCheck, tone: "warning", detail: "Infection prevention monitoring" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Housekeeping, biomedical, transport &amp; security
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Service dispatch board
            </h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <DispatchBoard columns={prototypeFacilityColumns} />
        </PanelBody>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Biomedical &amp; facilities engineering
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Asset lifecycle
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-4">
            {prototypeFacilityAssets.map((asset) => (
              <AssetLifecycleRecord
                key={asset.assetId}
                assetName={asset.assetName}
                assetId={asset.assetId}
                stage={asset.stage}
                location={asset.location}
                nextAction={
                  <ComplianceCountdown
                    label={asset.nextActionLabel}
                    dueText={asset.nextActionDue}
                    overdue={asset.overdue}
                  />
                }
              />
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Infection prevention
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Active isolation rooms
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {prototypeIsolationRooms.map((room) => (
              <div
                key={room.room}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{room.room}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{room.patient}</p>
                </div>
                <IsolationTypeBadge type={room.type} />
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
