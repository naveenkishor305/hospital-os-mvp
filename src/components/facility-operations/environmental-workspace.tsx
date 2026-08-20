"use client";

import { PlusCircle, SprayCan } from "lucide-react";
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
  housekeepingLocations,
  nextHousekeepingStatus,
  prototypeHousekeepingTickets,
} from "@/data/facility-operations/environmental";

const columnDefs: { status: RequestTicket["status"]; label: string }[] = [
  { status: "new", label: "New" },
  { status: "assigned", label: "Assigned" },
  { status: "verified", label: "Verified" },
];

export function EnvironmentalWorkspace() {
  const [tickets, setTickets] = useState<RequestTicket[]>(prototypeHousekeepingTickets);
  const [location, setLocation] = useState(housekeepingLocations[0]);
  const [priority, setPriority] = useState<RequestTicket["priority"]>("standard");

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTickets((current) => [
      { id: `evs-${Date.now()}`, title: "Housekeeping request", location, priority, status: "new", requestedAt: "just now" },
      ...current,
    ]);
  }

  function advance(ticket: RequestTicket) {
    const next = nextHousekeepingStatus(ticket.status);
    if (!next) {
      setTickets((current) => current.filter((item) => item.id !== ticket.id));
      return;
    }
    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id ? { ...item, status: next, assignee: item.assignee ?? "Housekeeping team A" } : item,
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
        eyebrow="Environmental services & housekeeping"
        title="Housekeeping & isolation decontamination"
        description="Routine and isolation-room terminal cleans, tracked from request through verification."
      />

      <MetricsRow
        metrics={[
          { label: "Open housekeeping requests", value: String(tickets.length), icon: SprayCan, tone: "information", detail: "Includes isolation terminal cleans" },
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
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">New housekeeping request</p>
          </div>
        </PanelHeader>
        <form onSubmit={submitRequest} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <SelectField id="evs-location" label="Location" value={location} onChange={(event) => setLocation(event.target.value)}>
              {housekeepingLocations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </SelectField>
            <SelectField
              id="evs-priority"
              label="Priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as RequestTicket["priority"])}
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
