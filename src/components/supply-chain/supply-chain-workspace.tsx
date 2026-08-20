import { AlertTriangle, Boxes, ClipboardList, Truck } from "lucide-react";

import {
  DispatchBoard,
  InventoryLevelGauge,
  Panel,
  PanelBody,
  PanelHeader,
  SupplierComparisonMatrix,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeInventoryLevels,
  prototypeProcurementColumns,
  sourcingCandidates,
  sourcingCriteria,
} from "@/data/supply-chain";

export function SupplyChainWorkspace() {
  const openTickets = prototypeProcurementColumns.reduce(
    (sum, column) => sum + column.tickets.length,
    0,
  );
  const belowMin = prototypeInventoryLevels.filter((item) => item.current < item.min).length;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Supply chain & procurement"
        title="Supply chain & procurement"
        description="Supplier evaluation, par-level inventory and warehouse dispatch work all reuse the same primitives — a weighted comparison matrix, a level gauge, and a kanban dispatch board."
      />

      <MetricsRow
        metrics={[
          { label: "Open procurement tickets", value: String(openTickets), icon: ClipboardList, tone: "information", detail: "1 urgent" },
          { label: "Items below safety stock", value: String(belowMin), icon: AlertTriangle, tone: belowMin > 0 ? "warning" : "success", detail: "Reorder triggered" },
          { label: "Active suppliers evaluated", value: String(sourcingCandidates.length), icon: Boxes, tone: "information", detail: "RFx round 2" },
          { label: "Shipments in transit", value: "6", icon: Truck, tone: "information", detail: "2 arriving today" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Inventory replenishment
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Par level status</h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 sm:grid-cols-1">
            {prototypeInventoryLevels.map((item) => (
              <InventoryLevelGauge key={item.id} {...item} />
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Vendor sourcing
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Supplier evaluation
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <SupplierComparisonMatrix criteria={sourcingCriteria} candidates={sourcingCandidates} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Warehouse operations
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Receiving, dispatch &amp; cycle counts
            </h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <DispatchBoard columns={prototypeProcurementColumns} />
        </PanelBody>
      </Panel>
    </div>
  );
}
