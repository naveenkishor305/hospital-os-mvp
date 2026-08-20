"use client";

import { PlusCircle, Truck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Button,
  DispatchBoard,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  type RequestTicket,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  nextTransportStatus,
  prototypeTransportRequests,
  transportRoutes,
  transportTypes,
} from "@/data/facility-operations/transport";

type RequestDraft = { type: string; route: string; priority: RequestTicket["priority"] };
const initialDraft: RequestDraft = { type: transportTypes[0], route: transportRoutes[0], priority: "standard" };

const columnDefs: { status: RequestTicket["status"]; label: string }[] = [
  { status: "new", label: "New" },
  { status: "assigned", label: "Assigned" },
  { status: "in-progress", label: "In progress" },
  { status: "verified", label: "Verified" },
];

export function TransportWorkspace() {
  const [tickets, setTickets] = useState<RequestTicket[]>(prototypeTransportRequests);
  const [draft, setDraft] = useState<RequestDraft>(initialDraft);

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTickets((current) => [
      { id: `trn-${Date.now()}`, title: draft.type, location: draft.route, priority: draft.priority, status: "new", requestedAt: "just now" },
      ...current,
    ]);
    setDraft(initialDraft);
  }

  function advance(ticket: RequestTicket) {
    const next = nextTransportStatus(ticket.status);
    if (!next) {
      setTickets((current) => current.filter((item) => item.id !== ticket.id));
      return;
    }
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id ? { ...item, status: next, assignee: item.assignee ?? "Transport team A" } : item,
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
        eyebrow="Internal transportation & logistics"
        title="Patient & specimen transport dispatch"
        description="Patient transport, specimen courier and internal equipment delivery requests, tracked from request to verification."
      />

      <MetricsRow
        metrics={[
          { label: "Open requests", value: String(tickets.length), icon: Truck, tone: "information", detail: "Patient & specimen transport" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Dispatch board</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">New transport request</p>
          </div>
        </PanelHeader>
        <form onSubmit={submitRequest} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <SelectField
              id="trn-type"
              label="Transport type"
              value={draft.type}
              onChange={(event) => setDraft({ ...draft, type: event.target.value })}
            >
              {transportTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </SelectField>
            <SelectField
              id="trn-route"
              label="Route"
              value={draft.route}
              onChange={(event) => setDraft({ ...draft, route: event.target.value })}
            >
              {transportRoutes.map((route) => (
                <option key={route}>{route}</option>
              ))}
            </SelectField>
            <SelectField
              id="trn-priority"
              label="Priority"
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: event.target.value as RequestTicket["priority"] })}
              className="md:col-span-2"
            >
              <option value="low">Low</option>
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </SelectField>
            <Button type="submit" size="sm" startIcon={<PlusCircle aria-hidden="true" size={14} />} className="md:col-span-2 md:w-fit">
              Submit request
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
