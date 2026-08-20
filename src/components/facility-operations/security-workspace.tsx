"use client";

import { CheckCircle2, ShieldAlert, UserCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { Button, Panel, PanelBody, PanelHeader, SelectField, StatusBadge, TextField } from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  accessAreas,
  prototypeSecurityIncidents,
  prototypeVisitorBadges,
  type SecurityIncident,
  type VisitorBadge,
} from "@/data/facility-operations/security";

type BadgeDraft = { visitor: string; host: string; area: string };
const initialDraft: BadgeDraft = { visitor: "", host: "", area: accessAreas[0] };

export function SecurityWorkspace() {
  const [badges, setBadges] = useState<VisitorBadge[]>(prototypeVisitorBadges);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(prototypeSecurityIncidents);
  const [draft, setDraft] = useState<BadgeDraft>(initialDraft);
  const [error, setError] = useState<string>();

  const activeBadges = badges.filter((badge) => badge.status === "active").length;
  const openIncidents = incidents.filter((incident) => incident.status === "open").length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.visitor.trim() || !draft.host.trim()) {
      setError("Enter both the visitor's name and their host.");
      return;
    }
    setBadges((current) => [
      { id: `vb-${Date.now()}`, visitor: draft.visitor, host: draft.host, area: draft.area, status: "active", issuedAt: "just now" },
      ...current,
    ]);
    setDraft(initialDraft);
    setError(undefined);
  }

  function revokeBadge(id: string) {
    setBadges((current) => current.map((badge) => (badge.id === id ? { ...badge, status: "revoked" } : badge)));
  }

  function resolveIncident(id: string) {
    setIncidents((current) => current.map((incident) => (incident.id === id ? { ...incident, status: "resolved" } : incident)));
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Security & access control"
        title="Access control & incident response"
        description="Visitor badge issuance, area access and security incident tracking."
      />

      <MetricsRow
        metrics={[
          { label: "Active visitor badges", value: String(activeBadges), icon: UserCheck, tone: "information", detail: "Issued today" },
          { label: "Open incidents", value: String(openIncidents), icon: ShieldAlert, tone: openIncidents > 0 ? "warning" : "success", detail: "Requires follow-up" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Visitor badges</p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Active access</h2>
            </div>
          </PanelHeader>
          <ul aria-label="Visitor badges">
            {badges.map((badge) => (
              <li key={badge.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{badge.visitor}</p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      Host: {badge.host} · {badge.area}
                    </p>
                  </div>
                  {badge.status === "active" ? (
                    <Button size="sm" variant="secondary" onClick={() => revokeBadge(badge.id)}>
                      Revoke
                    </Button>
                  ) : (
                    <StatusBadge tone="neutral">Revoked</StatusBadge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Security incidents</p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Incident log</h2>
            </div>
          </PanelHeader>
          <ul aria-label="Security incidents">
            {incidents.map((incident) => (
              <li key={incident.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{incident.title}</p>
                    <p className="mt-1 text-xs text-ink-secondary">{incident.location}</p>
                  </div>
                  {incident.status === "open" ? (
                    <Button size="sm" variant="secondary" onClick={() => resolveIncident(incident.id)}>
                      Resolve
                    </Button>
                  ) : (
                    <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
                      Resolved
                    </StatusBadge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Issue visitor badge</p>
          </div>
        </PanelHeader>
        <form onSubmit={handleSubmit} noValidate>
          <PanelBody className="grid gap-4 md:grid-cols-2">
            <TextField
              id="badge-visitor"
              label="Visitor name"
              value={draft.visitor}
              error={error}
              onChange={(event) => {
                setDraft({ ...draft, visitor: event.target.value });
                setError(undefined);
              }}
              placeholder="e.g. R. Menon, external contractor"
            />
            <TextField
              id="badge-host"
              label="Hosted by"
              value={draft.host}
              onChange={(event) => setDraft({ ...draft, host: event.target.value })}
              placeholder="e.g. Facilities Manager"
            />
            <SelectField
              id="badge-area"
              label="Access area"
              value={draft.area}
              onChange={(event) => setDraft({ ...draft, area: event.target.value })}
              className="md:col-span-2"
            >
              {accessAreas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </SelectField>
            <Button type="submit" size="sm" className="md:col-span-2 md:w-fit">
              Issue badge
            </Button>
          </PanelBody>
        </form>
      </Panel>
    </div>
  );
}
