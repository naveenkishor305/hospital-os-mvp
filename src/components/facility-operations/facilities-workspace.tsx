"use client";

import { Building2, PlusCircle, Wrench } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  AssetLifecycleRecord,
  Button,
  ComplianceCountdown,
  DispatchBoard,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  TextField,
  type RequestTicket,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  nextWorkOrderStatus,
  prototypeBuildingAssets,
  prototypeWorkOrders,
  workOrderLocations,
} from "@/data/facility-operations/facilities";

type WorkOrderDraft = { title: string; location: string; priority: RequestTicket["priority"] };
const initialDraft: WorkOrderDraft = { title: "", location: workOrderLocations[0], priority: "standard" };

const columnDefs: { status: RequestTicket["status"]; label: string }[] = [
  { status: "new", label: "New" },
  { status: "assigned", label: "Assigned" },
  { status: "in-progress", label: "In progress" },
  { status: "verified", label: "Verified" },
];

export function FacilitiesWorkspace() {
  const [tickets, setTickets] = useState<RequestTicket[]>(prototypeWorkOrders);
  const [draft, setDraft] = useState<WorkOrderDraft>(initialDraft);
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Describe the work order before submitting.");
      return;
    }
    setTickets((current) => [
      { id: `wo-${Date.now()}`, title: draft.title, location: draft.location, priority: draft.priority, status: "new", requestedAt: "just now" },
      ...current,
    ]);
    setDraft(initialDraft);
    setError(undefined);
  }

  function advance(ticket: RequestTicket) {
    const next = nextWorkOrderStatus(ticket.status);
    if (!next) {
      setTickets((current) => current.filter((item) => item.id !== ticket.id));
      return;
    }
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id ? { ...item, status: next, assignee: item.assignee ?? "Facilities maintenance" } : item,
      ),
    );
  }

  const columns = columnDefs.map((column) => ({
    status: column.status,
    label: column.label,
    tickets: tickets.filter((ticket) => ticket.status === column.status),
  }));

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Facilities management"
        title="Building systems & work orders"
        description="Building asset registry and preventive/corrective work orders for HVAC, plumbing, electrical and structural systems."
      />

      <MetricsRow
        metrics={[
          { label: "Building assets", value: String(prototypeBuildingAssets.length), icon: Building2, tone: "information", detail: "Plant room & CSSD" },
          { label: "Open work orders", value: String(tickets.length), icon: Wrench, tone: "information", detail: "1 under repair" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Building assets
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">Asset registry</h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {prototypeBuildingAssets.map((asset) => (
            <AssetLifecycleRecord
              key={asset.assetId}
              assetName={asset.assetName}
              assetId={asset.assetId}
              stage={asset.stage}
              location={asset.location}
              nextAction={
                <ComplianceCountdown label={asset.nextActionLabel} dueText={asset.nextActionDue} overdue={asset.overdue} />
              }
            />
          ))}
        </PanelBody>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Work orders
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Preventive &amp; corrective maintenance
            </h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <DispatchBoard
            columns={columns}
            renderAction={(ticket) => (
              <Button size="sm" variant="secondary" onClick={() => advance(ticket)}>
                {ticket.status === "verified" ? "Close" : "Advance"}
              </Button>
            )}
          />
        </PanelBody>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              New work order
            </p>
          </div>
        </PanelHeader>
        <form onSubmit={handleSubmit} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <TextField
              id="wo-title"
              label="What needs attention?"
              value={draft.title}
              error={error}
              onChange={(event) => {
                setDraft({ ...draft, title: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Flickering lights — corridor"
            />
            <SelectField
              id="wo-location"
              label="Location"
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            >
              {workOrderLocations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </SelectField>
            <SelectField
              id="wo-priority"
              label="Priority"
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: event.target.value as RequestTicket["priority"] })}
            >
              <option value="low">Low</option>
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </SelectField>
            <Button type="submit" size="sm" startIcon={<PlusCircle aria-hidden="true" size={14} />} className="md:col-span-2 md:w-fit">
              Submit work order
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
