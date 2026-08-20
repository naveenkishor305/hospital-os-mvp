import {
  ArrowRight,
  Copy,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";

import {
  Alert,
  Button,
  IconButton,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  SystemState,
  TextField,
} from "@naveenkishor305/spine-ui";

export const metadata: Metadata = {
  title: "Spine Component Inventory",
};

const colorTokens = [
  ["Action", "var(--action)"],
  ["Selected", "var(--selected)"],
  ["Information", "var(--info)"],
  ["Success", "var(--success)"],
  ["Warning", "var(--warning)"],
  ["Critical", "var(--critical)"],
  ["Restricted", "var(--restricted)"],
  ["Focus", "var(--focus)"],
];

export default function DesignSystemPage() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
          Spine internal foundation
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          Component inventory
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-secondary">
          This protected route is the implementation reference for Nadi.
          Product screens should compose these primitives instead of introducing
          new hardcoded colors, focus styles or state language.
        </p>
      </div>

      <Panel className="mt-7">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Foundations
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Semantic color tokens
            </h2>
          </div>
          <StatusBadge>Spine v1.0</StatusBadge>
        </PanelHeader>
        <PanelBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {colorTokens.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-md border border-border-subtle p-3"
            >
              <span
                aria-hidden="true"
                className="size-9 rounded-md border border-black/5"
                style={{ backgroundColor: value }}
              />
              <div>
                <p className="text-xs font-semibold text-ink-primary">
                  {label}
                </p>
                <p className="spine-mono mt-1 text-[9px] text-ink-tertiary">
                  semantic token
                </p>
              </div>
            </div>
          ))}
        </PanelBody>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Actions
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Clear task hierarchy
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button endIcon={<ArrowRight aria-hidden="true" size={14} />}>
                Continue registration
              </Button>
              <Button
                variant="secondary"
                startIcon={<UserRound aria-hidden="true" size={14} />}
              >
                Open patient record
              </Button>
              <Button variant="tertiary">View history</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="critical"
                startIcon={<ShieldAlert aria-hidden="true" size={14} />}
              >
                Cancel clinical order
              </Button>
              <Button disabled>Unavailable action</Button>
              <IconButton
                label="Copy patient identifier"
                icon={<Copy aria-hidden="true" size={16} />}
              />
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Fields
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Persistent labels and recovery
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="patient-search-preview"
              label="Patient search"
              description="Search by MRN, mobile number or full name."
              placeholder="Enter patient details"
            />
            <SelectField
              id="facility-preview"
              label="Facility"
              defaultValue="main-opd"
            >
              <option value="main-opd">Main facility · OPD</option>
              <option value="diagnostics">Diagnostics centre</option>
            </SelectField>
            <TextField
              id="validation-preview"
              label="Mobile number"
              defaultValue="98765"
              error="Enter the complete 10-digit mobile number."
            />
            <TextField
              id="readonly-preview"
              label="Medical record number"
              defaultValue="HOS-024718"
              readOnly
            />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Status and feedback
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Meaning is never communicated by color alone
            </h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success" showDot>Confirmed</StatusBadge>
            <StatusBadge tone="information" showDot>In progress</StatusBadge>
            <StatusBadge tone="warning" showDot>Needs review</StatusBadge>
            <StatusBadge tone="critical" showDot>Critical</StatusBadge>
            <StatusBadge tone="restricted" showDot>Restricted</StatusBadge>
            <StatusBadge showDot>Draft</StatusBadge>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <Alert tone="information" title="Previous consultation available">
              Review the note before beginning a new assessment.
            </Alert>
            <Alert tone="success" title="Identity verification recorded">
              Two patient identifiers were confirmed at 10:28.
            </Alert>
            <Alert tone="warning" title="Medication interaction requires review">
              Resolve the warning before the order can be signed.
            </Alert>
            <Alert tone="critical" title="Critical potassium result">
              Meera Nair · Acknowledge and assign clinical action by 10:45.
            </Alert>
          </div>
        </PanelBody>
      </Panel>

      <section aria-labelledby="system-states-title" className="mt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Recovery patterns
            </p>
            <h2
              id="system-states-title"
              className="mt-2 text-lg font-semibold text-ink-primary"
            >
              Loading, empty, error, restricted and critical states
            </h2>
          </div>
          <StatusBadge tone="success">Reusable</StatusBadge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SystemState
            kind="loading"
            title="Loading appointments"
            description="Today’s OPD schedule is being retrieved."
          />
          <SystemState
            kind="empty"
            title="Queue complete"
            description="All assigned identity checks have been completed."
            action={<Button variant="secondary" size="sm">View completed work</Button>}
          />
          <SystemState
            kind="error"
            title="Registration could not sync"
            description="The service did not accept the latest change."
            preserved="The encrypted draft remains on this device."
            nextStep="Reconnect and retry synchronization."
            escalation="Contact the shift administrator if care is time-critical."
          />
          <SystemState
            kind="restricted"
            title="Approval required"
            description="Your role cannot cancel a completed encounter."
            preserved="The prepared reason has been saved."
            nextStep="Request approval from the OPD supervisor."
          />
          <SystemState
            kind="critical"
            title="Action blocked offline"
            description="Final signing is unavailable until patient context is synchronized."
            preserved="The unsigned note and selected patient remain available."
            nextStep="Restore connectivity and confirm the server version."
          />
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border-subtle bg-surface p-4 text-xs leading-5 text-ink-secondary">
        <Search aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-action" />
        This inventory is intentionally implementation-focused. The separate
        public Spine repository remains the full design-system documentation.
      </div>
    </div>
  );
}
