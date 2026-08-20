import { Activity, HeartPulse, ShieldCheck, Wind } from "lucide-react";

import {
  Panel,
  PanelBody,
  PanelHeader,
  RiskScoreBadge,
  SlotGrid,
  StatusBadge,
  SurgicalSafetyChecklist,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeIcuPatients,
  prototypeTheatreSchedule,
  sofaRiskLevel,
} from "@/data/surgical-critical-care";

const checklistPhases = [
  {
    id: "sign-in",
    label: "Sign-In",
    status: "complete" as const,
    items: [
      { id: "identity", label: "Patient identity, site and procedure confirmed", checked: true },
      { id: "consent", label: "Consent confirmed", checked: true },
    ],
  },
  {
    id: "time-out",
    label: "Time-Out",
    status: "current" as const,
    items: [
      { id: "team", label: "Team introductions complete", checked: true },
      { id: "site", label: "Surgical site and side confirmed aloud", checked: false },
      { id: "antibiotics", label: "Antibiotic prophylaxis given within 60 min", checked: false },
    ],
  },
  {
    id: "sign-out",
    label: "Sign-Out",
    status: "upcoming" as const,
    items: [
      { id: "counts", label: "Instrument, sponge and needle counts correct", checked: false },
      { id: "specimen", label: "Specimen labeling confirmed", checked: false },
    ],
  },
];

export function SurgicalCriticalCareWorkspace() {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Surgical & critical care"
        title="Operating theatres & ICU"
        description="Theatre scheduling, the WHO surgical safety checklist and ICU severity scoring share the same platform components used across the rest of Hospital OS."
      />

      <MetricsRow
        metrics={[
          { label: "Cases scheduled today", value: "4", icon: Activity, tone: "information", detail: "2 theatres active" },
          { label: "ICU beds occupied", value: `${prototypeIcuPatients.length} / 8`, icon: HeartPulse, tone: "information", detail: "3 beds available" },
          { label: "Patients ventilated", value: String(prototypeIcuPatients.filter((p) => p.ventilated).length), icon: Wind, tone: "warning", detail: "Respiratory therapy notified" },
          { label: "Safety checklists complete", value: "1 / 2", icon: ShieldCheck, tone: "warning", detail: "Time-Out in progress" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Theatre schedule
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Today&apos;s operating list
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-6">
            {prototypeTheatreSchedule.map((theatre) => (
              <div key={theatre.id}>
                <p className="mb-3 text-xs font-semibold text-ink-primary">{theatre.name}</p>
                <SlotGrid
                  resources={[
                    {
                      id: theatre.id,
                      name: theatre.name,
                      slots: theatre.slots.map((slot) => ({
                        id: slot.id,
                        time: slot.time,
                        status: slot.status,
                        label: slot.patient !== "—" ? slot.patient : undefined,
                      })),
                    },
                  ]}
                />
              </div>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Surgical safety checklist
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Theatre 2 · Devika Iyer
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <SurgicalSafetyChecklist phases={checklistPhases} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              ICU census
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Critical care patients
            </h2>
          </div>
          <StatusBadge>{prototypeIcuPatients.length} patients</StatusBadge>
        </PanelHeader>
        <ul aria-label="ICU census">
          {prototypeIcuPatients.map((patient) => (
            <li key={patient.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink-primary">{patient.name}</p>
                    <StatusBadge>{patient.bed}</StatusBadge>
                    {patient.ventilated ? <StatusBadge tone="warning">Ventilated</StatusBadge> : null}
                    {patient.hemodynamicSupport ? (
                      <StatusBadge tone="warning">Vasopressor support</StatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-ink-secondary">{patient.diagnosis}</p>
                  <p className="spine-mono mt-2 text-[10px] text-ink-tertiary">
                    Day {patient.daysInIcu} in ICU
                  </p>
                </div>
                <RiskScoreBadge
                  label="SOFA score"
                  level={sofaRiskLevel(patient.sofaScore)}
                  score={patient.sofaScore}
                />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
