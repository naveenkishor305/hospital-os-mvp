"use client";

import { PlusCircle, Stethoscope } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button, Panel, PanelBody, PanelHeader, SelectField, StatusBadge, TextField } from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  poctEquipmentRoster,
  prototypeEquipmentCheckouts,
  wardOptions,
  type EquipmentCheckout,
} from "@/data/facility-operations/clinical-equipment";

type CheckoutDraft = { equipment: string; ward: string; staff: string };
const initialDraft: CheckoutDraft = { equipment: poctEquipmentRoster[0], ward: wardOptions[0], staff: "" };

const statusLabel: Record<EquipmentCheckout["status"], string> = {
  "checked-out": "Checked out",
  reprocessing: "Reprocessing",
  available: "Available",
};

const statusTone: Record<EquipmentCheckout["status"], "warning" | "information" | "success"> = {
  "checked-out": "warning",
  reprocessing: "information",
  available: "success",
};

export function ClinicalEquipmentWorkspace() {
  const [checkouts, setCheckouts] = useState<EquipmentCheckout[]>(prototypeEquipmentCheckouts);
  const [draft, setDraft] = useState<CheckoutDraft>(initialDraft);
  const [error, setError] = useState<string>();

  const activeCheckouts = checkouts.filter((item) => item.status !== "available").length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.staff.trim()) {
      setError("Enter the staff member checking out the equipment.");
      return;
    }
    setCheckouts((current) => [
      { id: `eq-${Date.now()}`, equipment: draft.equipment, ward: draft.ward, staff: draft.staff, checkedOutAt: "just now", status: "checked-out" },
      ...current,
    ]);
    setDraft({ ...initialDraft, equipment: draft.equipment, ward: draft.ward });
    setError(undefined);
  }

  function checkIn(id: string) {
    setCheckouts((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "reprocessing" } : item)),
    );
  }

  function markReprocessed(id: string) {
    setCheckouts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Clinical equipment operations"
        title="Point-of-care equipment check-out & reprocessing"
        description="Ward-level equipment check-out/check-in with between-patient reprocessing, distinct from biomedical's registered-asset lifecycle."
      />

      <MetricsRow
        metrics={[
          { label: "Equipment in use", value: String(activeCheckouts), icon: Stethoscope, tone: "information", detail: "Checked out or reprocessing" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Equipment tracker</p>
          </div>
        </PanelHeader>
        <ul aria-label="Point-of-care equipment">
          {checkouts.map((item) => (
            <li key={item.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">{item.equipment}</p>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {item.ward} · {item.staff} · {item.checkedOutAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={statusTone[item.status]}>{statusLabel[item.status]}</StatusBadge>
                  {item.status === "checked-out" ? (
                    <Button size="sm" variant="secondary" onClick={() => checkIn(item.id)}>
                      Check in
                    </Button>
                  ) : null}
                  {item.status === "reprocessing" ? (
                    <Button size="sm" variant="secondary" onClick={() => markReprocessed(item.id)}>
                      Mark reprocessed
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Check out equipment</p>
          </div>
        </PanelHeader>
        <form onSubmit={handleSubmit} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <SelectField
              id="eq-equipment"
              label="Equipment"
              value={draft.equipment}
              onChange={(event) => setDraft({ ...draft, equipment: event.target.value })}
            >
              {poctEquipmentRoster.map((equipment) => (
                <option key={equipment}>{equipment}</option>
              ))}
            </SelectField>
            <SelectField id="eq-ward" label="Ward" value={draft.ward} onChange={(event) => setDraft({ ...draft, ward: event.target.value })}>
              {wardOptions.map((ward) => (
                <option key={ward}>{ward}</option>
              ))}
            </SelectField>
            <TextField
              id="eq-staff"
              label="Staff member"
              value={draft.staff}
              error={error}
              onChange={(event) => {
                setDraft({ ...draft, staff: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Nurse Kavitha"
            />
            <Button type="submit" size="sm" startIcon={<PlusCircle aria-hidden="true" size={14} />} className="md:col-span-2 md:w-fit">
              Check out
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
