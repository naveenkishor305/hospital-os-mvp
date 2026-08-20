"use client";

import { BarChart3, Building2, CheckCircle2, HeartHandshake, Network } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Button,
  HierarchyTree,
  MetricTile,
  Panel,
  PanelBody,
  PanelHeader,
  RankedBarList,
  SelectField,
  StatusBadge,
  TextField,
  VarianceIndicator,
  type HierarchyNode,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  addChildToHierarchy,
  businessUnits,
  flattenHierarchy,
  prototypeDepartmentVolume,
  prototypeGuestRequests,
  prototypeOrgHierarchy,
  prototypeScorecard,
  type GuestRequest,
} from "@/data/enterprise";

type DepartmentDraft = {
  name: string;
  parentId: string;
  businessUnit: string;
};

function AddDepartmentForm({
  hierarchy,
  onAdd,
}: {
  hierarchy: HierarchyNode[];
  onAdd: (draft: DepartmentDraft) => void;
}) {
  const parentOptions = flattenHierarchy(hierarchy);
  const [draft, setDraft] = useState<DepartmentDraft>({
    name: "",
    parentId: parentOptions[0]?.id ?? "",
    businessUnit: businessUnits[0],
  });
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Enter a department name.");
      return;
    }
    onAdd(draft);
    setDraft({ name: "", parentId: draft.parentId, businessUnit: draft.businessUnit });
    setError(undefined);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 border-t border-border-subtle p-4 md:px-5">
      <p className="text-xs font-semibold text-ink-primary">Add a department</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="ent-dept-name"
          label="Department name"
          value={draft.name}
          error={error}
          onChange={(event) => {
            setDraft({ ...draft, name: event.target.value });
            setError(undefined);
          }}
          placeholder="e.g. Ambulatory Surgery Center"
        />
        <SelectField
          id="ent-dept-parent"
          label="Reports to"
          value={draft.parentId}
          onChange={(event) => setDraft({ ...draft, parentId: event.target.value })}
        >
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {"— ".repeat(option.depth)}
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id="ent-dept-unit"
          label="Business unit"
          value={draft.businessUnit}
          onChange={(event) => setDraft({ ...draft, businessUnit: event.target.value })}
          className="sm:col-span-2"
        >
          {businessUnits.map((unit) => (
            <option key={unit}>{unit}</option>
          ))}
        </SelectField>
      </div>
      <Button type="submit" size="sm">
        Add department
      </Button>
    </form>
  );
}

function GuestRequestsPanel({
  requests,
  onResolve,
}: {
  requests: GuestRequest[];
  onResolve: (id: string) => void;
}) {
  return (
    <Panel className="mt-6">
      <PanelHeader>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
            Patient support &amp; hospitality
          </p>
          <h2 className="mt-2 text-lg font-semibold text-ink-primary">
            Guest &amp; amenity requests
          </h2>
        </div>
        <StatusBadge>{requests.filter((r) => r.status === "open").length} open</StatusBadge>
      </PanelHeader>
      <ul aria-label="Guest and amenity requests">
        {requests.map((request) => (
          <li key={request.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-primary">{request.guest}</p>
                <p className="mt-1 text-xs text-ink-secondary">{request.request}</p>
                <StatusBadge className="mt-2">{request.category}</StatusBadge>
              </div>
              {request.status === "resolved" ? (
                <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
                  Resolved
                </StatusBadge>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onResolve(request.id)}>
                  Mark resolved
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function EnterpriseWorkspace() {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>(prototypeOrgHierarchy);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>(prototypeGuestRequests);

  function addDepartment(draft: DepartmentDraft) {
    setHierarchy((current) =>
      addChildToHierarchy(current, draft.parentId, {
        id: `dept-${Date.now()}`,
        label: draft.name,
        meta: draft.businessUnit,
      }),
    );
  }

  function resolveGuestRequest(id: string) {
    setGuestRequests((current) =>
      current.map((request) => (request.id === id ? { ...request, status: "resolved" } : request)),
    );
  }

  const openGuestRequests = guestRequests.filter((r) => r.status === "open").length;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Enterprise administration & ancillary services analytics"
        title="Enterprise &amp; analytics"
        description="Organizational structure and cross-department performance sit on the same platform as clinical screens — an explorable hierarchy, ranked volume, and an executive scorecard."
      />

      <MetricsRow
        metrics={[
          { label: "Departments", value: String(flattenHierarchy(hierarchy).length - 1), icon: Building2, tone: "information", detail: "Across 3 business units" },
          { label: "Active facilities", value: "1", icon: Network, tone: "information", detail: "Multi-site ready" },
          { label: "Executive KPIs tracked", value: String(prototypeScorecard.length), icon: BarChart3, tone: "success", detail: "Updated hourly" },
          { label: "Open guest requests", value: String(openGuestRequests), icon: HeartHandshake, tone: openGuestRequests > 0 ? "warning" : "success", detail: "Hospitality & support services" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Enterprise administration
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Organization hierarchy
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <HierarchyTree nodes={hierarchy} />
          </PanelBody>
          <AddDepartmentForm hierarchy={hierarchy} onAdd={addDepartment} />
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Ancillary services analytics
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Department volume
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <RankedBarList items={prototypeDepartmentVolume} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Executive scorecard
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Cross-department KPIs
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {prototypeScorecard.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              comparison={
                <VarianceIndicator value={metric.variance} sentiment={metric.sentiment} />
              }
            />
          ))}
        </PanelBody>
      </Panel>

      <GuestRequestsPanel requests={guestRequests} onResolve={resolveGuestRequest} />
    </div>
  );
}
