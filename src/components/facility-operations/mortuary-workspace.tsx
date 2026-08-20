"use client";

import { PlusCircle, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Button,
  CheckboxField,
  ChainOfCustodyTrail,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  TextField,
  type CustodyHandoff,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import { custodyLocations, prototypeCustodyTrail } from "@/data/facility-operations/mortuary";

type HandoffDraft = { to: string; item: string; witness: string; verified: boolean };
const initialDraft: HandoffDraft = { to: custodyLocations[0], item: "", witness: "", verified: false };

export function MortuaryWorkspace() {
  const [trail, setTrail] = useState<CustodyHandoff[]>(prototypeCustodyTrail);
  const [draft, setDraft] = useState<HandoffDraft>(initialDraft);
  const [error, setError] = useState<string>();

  const lastHandoff = trail[trail.length - 1];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.item.trim()) {
      setError("Describe what's being transferred.");
      return;
    }
    setTrail((current) => [
      ...current,
      {
        id: `coc-${Date.now()}`,
        timestamp: "Just now",
        from: lastHandoff?.to ?? "Mortuary intake",
        to: draft.to,
        item: draft.item,
        witness: draft.witness || undefined,
        verified: draft.verified,
      },
    ]);
    setDraft({ ...initialDraft, to: draft.to });
    setError(undefined);
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Mortuary services"
        title="Chain of custody & body release"
        description="Deceased patient intake, cold storage handoffs and body release, tracked as a legally defensible chain of custody."
      />

      <MetricsRow
        metrics={[
          { label: "Custody handoffs recorded", value: String(trail.length), icon: ShieldCheck, tone: "information", detail: "All witnessed" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Chain of custody</p>
          </div>
        </PanelHeader>
        <PanelBody>
          <ChainOfCustodyTrail handoffs={trail} />
        </PanelBody>
      </Panel>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Record next handoff</p>
          </div>
        </PanelHeader>
        <form onSubmit={handleSubmit} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <TextField
              id="coc-item"
              label="Item / body identifier"
              value={draft.item}
              error={error}
              onChange={(event) => {
                setDraft({ ...draft, item: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Body bag #14"
            />
            <SelectField
              id="coc-to"
              label="Transferred to"
              value={draft.to}
              onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            >
              {custodyLocations.map((location) => (
                <option key={location}>{location}</option>
              ))}
            </SelectField>
            <TextField
              id="coc-witness"
              label="Witnessed by"
              value={draft.witness}
              onChange={(event) => setDraft({ ...draft, witness: event.target.value })}
              placeholder="e.g. Mortuary technician"
            />
            <CheckboxField
              id="coc-verified"
              label="Identity and handoff verified by witness"
              checked={draft.verified}
              onChange={(event) => setDraft({ ...draft, verified: event.target.checked })}
              className="md:col-span-2"
            />
            <Button type="submit" size="sm" startIcon={<PlusCircle aria-hidden="true" size={14} />} className="md:col-span-2 md:w-fit">
              Record handoff
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
