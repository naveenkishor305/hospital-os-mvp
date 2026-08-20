"use client";

import { HandMetal, PlusCircle, ShieldAlert } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button, IsolationTypeBadge, Panel, PanelBody, PanelHeader, SelectField, TextField } from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  handHygieneCompliance,
  isolationRoomOptions,
  prototypeIsolationRooms,
  type IsolationRoom,
} from "@/data/facility-operations/infection-prevention";

type OrderDraft = { room: string; patient: string; type: IsolationRoom["type"] };
const initialDraft: OrderDraft = { room: isolationRoomOptions[0], patient: "", type: "contact" };

export function InfectionPreventionWorkspace() {
  const [rooms, setRooms] = useState<IsolationRoom[]>(prototypeIsolationRooms);
  const [draft, setDraft] = useState<OrderDraft>(initialDraft);
  const [error, setError] = useState<string>();

  const complianceRate = Math.round((handHygieneCompliance.compliant / handHygieneCompliance.observed) * 100);

  function dischargeRoom(id: string) {
    setRooms((current) => current.filter((room) => room.id !== id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.patient.trim()) {
      setError("Enter the patient's name.");
      return;
    }
    setRooms((current) => [
      { id: `iso-${Date.now()}`, room: draft.room, type: draft.type, patient: draft.patient },
      ...current,
    ]);
    setDraft({ ...initialDraft, room: draft.room });
    setError(undefined);
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Infection prevention operations"
        title="Isolation precautions & IPC compliance"
        description="Active isolation orders by precaution type, plus hand hygiene compliance monitoring."
      />

      <MetricsRow
        metrics={[
          { label: "Active isolation rooms", value: String(rooms.length), icon: ShieldAlert, tone: "warning", detail: "Contact, droplet, airborne & protective" },
          { label: "Hand hygiene compliance", value: `${complianceRate}%`, icon: HandMetal, tone: complianceRate >= 90 ? "success" : "warning", detail: `${handHygieneCompliance.compliant} / ${handHygieneCompliance.observed} observed` },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Active isolation rooms</p>
          </div>
        </PanelHeader>
        <ul aria-label="Isolation rooms">
          {rooms.map((room) => (
            <li key={room.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{room.room}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{room.patient}</p>
                </div>
                <div className="flex items-center gap-2">
                  <IsolationTypeBadge type={room.type} />
                  <Button size="sm" variant="secondary" onClick={() => dischargeRoom(room.id)}>
                    Discharge from isolation
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">New isolation order</p>
          </div>
        </PanelHeader>
        <form onSubmit={handleSubmit} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <TextField
              id="iso-patient"
              label="Patient name"
              value={draft.patient}
              error={error}
              onChange={(event) => {
                setDraft({ ...draft, patient: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Sunita Verma"
            />
            <SelectField
              id="iso-room"
              label="Room"
              value={draft.room}
              onChange={(event) => setDraft({ ...draft, room: event.target.value })}
            >
              {isolationRoomOptions.map((room) => (
                <option key={room}>{room}</option>
              ))}
            </SelectField>
            <SelectField
              id="iso-type"
              label="Precaution type"
              value={draft.type}
              onChange={(event) => setDraft({ ...draft, type: event.target.value as IsolationRoom["type"] })}
            >
              <option value="contact">Contact</option>
              <option value="droplet">Droplet</option>
              <option value="airborne">Airborne</option>
              <option value="protective">Protective</option>
            </SelectField>
            <Button type="submit" size="sm" startIcon={<PlusCircle aria-hidden="true" size={14} />} className="md:col-span-2 md:w-fit">
              Place isolation order
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
