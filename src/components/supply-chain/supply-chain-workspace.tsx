"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, Boxes, ClipboardList, PackagePlus, Truck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Button,
  DispatchBoard,
  InventoryLevelGauge,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  SupplierComparisonMatrix,
  TextField,
  type RequestTicket,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  nextTicketStatus,
  prototypeInventoryLevels,
  prototypeProcurementTickets,
  procurementColumnDefs,
  requisitionPriorities,
  sourcingCandidates,
  sourcingCriteria,
  warehouseLocations,
  type ProcurementTicket,
} from "@/data/supply-chain";

type InventoryItem = (typeof prototypeInventoryLevels)[number];

type RequisitionDraft = {
  item: string;
  quantity: string;
  location: string;
  priority: ProcurementTicket["priority"];
};

const initialRequisition: RequisitionDraft = {
  item: "",
  quantity: "",
  location: warehouseLocations[0],
  priority: "standard",
};

function RequisitionForm({
  draft,
  onChange,
  onConfirm,
  onCancel,
}: {
  draft: RequisitionDraft;
  onChange: (draft: RequisitionDraft) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.item.trim()) {
      setError("Enter what needs to be ordered.");
      return;
    }
    onConfirm();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Purchasing
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Raise a new requisition
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 md:grid-cols-2">
          <TextField
            id="scm-req-item"
            label="Item"
            value={draft.item}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, item: event.target.value });
              setError(undefined);
            }}
            fieldClassName="md:col-span-2"
            placeholder="e.g. Surgical gloves — size M"
          />
          <TextField
            id="scm-req-quantity"
            label="Quantity"
            value={draft.quantity}
            onChange={(event) => onChange({ ...draft, quantity: event.target.value })}
            placeholder="e.g. 200 boxes"
          />
          <SelectField
            id="scm-req-location"
            label="Delivery location"
            value={draft.location}
            onChange={(event) => onChange({ ...draft, location: event.target.value })}
          >
            {warehouseLocations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </SelectField>
          <SelectField
            id="scm-req-priority"
            label="Priority"
            value={draft.priority}
            onChange={(event) =>
              onChange({ ...draft, priority: event.target.value as ProcurementTicket["priority"] })
            }
          >
            {requisitionPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </SelectField>
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onCancel}>
          Back to board
        </Button>
        <Button type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
          Submit requisition
        </Button>
      </div>
    </form>
  );
}

function InventoryPanel({
  items,
  onReorder,
}: {
  items: InventoryItem[];
  onReorder: (item: InventoryItem) => void;
}) {
  return (
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
        {items.map((item) => (
          <div key={item.id}>
            <InventoryLevelGauge {...item} />
            {item.current < item.min ? (
              <Button size="sm" variant="secondary" className="mt-2" onClick={() => onReorder(item)}>
                Reorder now
              </Button>
            ) : null}
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

export function SupplyChainWorkspace() {
  const [inventory] = useState<InventoryItem[]>(prototypeInventoryLevels);
  const [tickets, setTickets] = useState<ProcurementTicket[]>(prototypeProcurementTickets);
  const [mode, setMode] = useState<"board" | "requisition">("board");
  const [draft, setDraft] = useState<RequisitionDraft>(initialRequisition);

  const openTickets = tickets.length;
  const belowMin = inventory.filter((item) => item.current < item.min).length;

  function addTicket(ticket: ProcurementTicket) {
    setTickets((current) => [ticket, ...current]);
  }

  function handleReorder(item: InventoryItem) {
    addTicket({
      id: `po-${Date.now()}`,
      title: `Reorder — ${item.label}`,
      location: "Central Warehouse",
      priority: item.current < item.min * 0.5 ? "urgent" : "high",
      status: "new",
      requestedAt: "just now",
    });
  }

  function handleAdvance(ticket: RequestTicket) {
    const next = nextTicketStatus(ticket.status as ProcurementTicket["status"]);
    if (!next) {
      setTickets((current) => current.filter((item) => item.id !== ticket.id));
      return;
    }
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? { ...item, status: next, assignee: item.assignee ?? "Warehouse team A" }
          : item,
      ),
    );
  }

  function handleRequisitionConfirmed() {
    addTicket({
      id: `po-${Date.now()}`,
      title: draft.quantity ? `${draft.item} · ${draft.quantity}` : draft.item,
      location: draft.location,
      priority: draft.priority,
      status: "new",
      requestedAt: "just now",
    });
    setDraft(initialRequisition);
    setMode("board");
  }

  if (mode === "requisition") {
    return (
      <div className="spine-page-container py-7 md:py-9">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          Raise a new requisition
        </h1>
        <div className="mt-6">
          <RequisitionForm
            draft={draft}
            onChange={setDraft}
            onConfirm={handleRequisitionConfirmed}
            onCancel={() => setMode("board")}
          />
        </div>
      </div>
    );
  }

  const columns = procurementColumnDefs.map((column) => ({
    status: column.status,
    label: column.label,
    tickets: tickets.filter((ticket) => ticket.status === column.status),
  }));

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Supply chain & procurement"
        title="Supply chain & procurement"
        description="Supplier evaluation, par-level inventory and warehouse dispatch work all reuse the same primitives — a weighted comparison matrix, a level gauge, and a kanban dispatch board."
        action={
          <Button startIcon={<PackagePlus aria-hidden="true" size={15} />} onClick={() => setMode("requisition")}>
            New requisition
          </Button>
        }
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
        <InventoryPanel items={inventory} onReorder={handleReorder} />

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
          <StatusBadge>{tickets.length} tickets</StatusBadge>
        </PanelHeader>
        <PanelBody>
          <DispatchBoard
            columns={columns}
            renderAction={(ticket) => (
              <Button size="sm" variant="secondary" onClick={() => handleAdvance(ticket)}>
                {ticket.status === "verified" ? "Close" : "Advance"}
              </Button>
            )}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}
