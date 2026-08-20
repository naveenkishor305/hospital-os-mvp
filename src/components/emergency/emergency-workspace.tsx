"use client";

import {
  ActivitySquare,
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  Siren,
  Stethoscope,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  AcuityBadge,
  Alert,
  Button,
  CheckboxField,
  Panel,
  PanelBody,
  PanelHeader,
  PathwayActivationBanner,
  ReassessmentTimer,
  SelectField,
  StatusBadge,
  TextField,
  type AcuityProtocol as SpineAcuityProtocol,
  type PathwayName,
} from "@naveenkishor305/spine-ui";

import {
  acuityIntervalMinutesByLevel,
  edClinicalTeams,
  prototypeEdPatients,
  treatmentAreas,
  type AcuityProtocol,
  type EdPathway,
  type EdPatient,
} from "@/data/emergency";

const pathwayOptions: EdPathway[] = ["Trauma", "Stroke", "STEMI", "Sepsis", "Isolation"];

const protocolOptions: AcuityProtocol[] = ["ESI", "CTAS", "Manchester", "ATS"];

const statusLabels: Record<EdPatient["status"], string> = {
  "awaiting-triage": "Awaiting triage",
  triaged: "Triaged",
  "in-treatment": "In treatment",
  "boarding-for-bed": "Boarding for bed",
};

const statusTone: Record<EdPatient["status"], "warning" | "information" | "success" | "neutral"> = {
  "awaiting-triage": "warning",
  triaged: "information",
  "in-treatment": "success",
  "boarding-for-bed": "neutral",
};

type IntakeStep = "arrival" | "triage" | "checkin";

type ArrivalDraft = {
  patientName: string;
  identityMode: "temporary" | "existing";
  arrivalMode: string;
  lifeThreatDetected: boolean;
  pathwayTriggers: EdPathway[];
};

type TriageDraft = {
  chiefComplaint: string;
  mechanismOfInjury: string;
  protocol: AcuityProtocol;
  acuityLevel: 1 | 2 | 3 | 4 | 5;
  treatmentArea: string;
  activatePathway: boolean;
  activationLevel: string;
};

type CheckinDraft = {
  team: string;
  handoff: string;
};

const initialArrival: ArrivalDraft = {
  patientName: "",
  identityMode: "temporary",
  arrivalMode: "Walk-in",
  lifeThreatDetected: false,
  pathwayTriggers: [],
};

const initialTriage: TriageDraft = {
  chiefComplaint: "",
  mechanismOfInjury: "",
  protocol: "ESI",
  acuityLevel: 3,
  treatmentArea: treatmentAreas[0],
  activatePathway: false,
  activationLevel: "Level I",
};

const initialCheckin: CheckinDraft = {
  team: edClinicalTeams[0],
  handoff: "",
};

function IntakeStepper({ step }: { step: IntakeStep }) {
  const steps: { id: IntakeStep; label: string }[] = [
    { id: "arrival", label: "Arrival" },
    { id: "triage", label: "Triage" },
    { id: "checkin", label: "Check-in" },
  ];
  const activeIndex = steps.findIndex((item) => item.id === step);

  return (
    <ol className="flex items-center gap-3">
      {steps.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3">
          <span
            className={`flex size-7 items-center justify-center rounded-full text-[11px] font-bold ${
              index < activeIndex
                ? "bg-success text-white"
                : index === activeIndex
                  ? "bg-action text-white"
                  : "bg-surface-subtle text-ink-tertiary"
            }`}
          >
            {index + 1}
          </span>
          <span
            className={`text-xs font-semibold ${
              index <= activeIndex ? "text-ink-primary" : "text-ink-tertiary"
            }`}
          >
            {item.label}
          </span>
          {index < steps.length - 1 ? (
            <ArrowRight aria-hidden="true" size={13} className="text-border-default" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function ArrivalStep({
  draft,
  onChange,
  onProceed,
  onBypass,
}: {
  draft: ArrivalDraft;
  onChange: (draft: ArrivalDraft) => void;
  onProceed: () => void;
  onBypass: () => void;
}) {
  const [error, setError] = useState<string>();

  function togglePathway(pathway: EdPathway) {
    onChange({
      ...draft,
      pathwayTriggers: draft.pathwayTriggers.includes(pathway)
        ? draft.pathwayTriggers.filter((item) => item !== pathway)
        : [...draft.pathwayTriggers, pathway],
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.patientName.trim()) {
      setError("Enter a patient name or note that identity is unknown.");
      return;
    }
    onProceed();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Arrival capture
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Record the patient&apos;s arrival
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 md:grid-cols-2">
            <TextField
              id="ed-arrival-name"
              label="Patient name"
              description="Use a temporary identifier if identity is unknown or unstable."
              value={draft.patientName}
              error={error}
              onChange={(event) => {
                onChange({ ...draft, patientName: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Devika Iyer or Unknown Male, approx. 40s"
            />
            <SelectField
              id="ed-arrival-identity"
              label="Identity status"
              value={draft.identityMode}
              onChange={(event) =>
                onChange({
                  ...draft,
                  identityMode: event.target.value as ArrivalDraft["identityMode"],
                })
              }
            >
              <option value="temporary">Temporary emergency identifier</option>
              <option value="existing">Existing patient, verified</option>
            </SelectField>
            <SelectField
              id="ed-arrival-mode"
              label="Arrival mode"
              value={draft.arrivalMode}
              onChange={(event) => onChange({ ...draft, arrivalMode: event.target.value })}
            >
              <option>Walk-in</option>
              <option>Ambulance</option>
              <option>Inter-facility transfer</option>
              <option>Police / public services</option>
            </SelectField>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Rapid visual assessment
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Immediate life-threat screen
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <CheckboxField
              id="ed-arrival-life-threat"
              label="Immediate life-threatening condition observed"
              description="Cardiac arrest, airway compromise, or massive hemorrhage. This bypasses standard triage and moves the patient directly to resuscitation."
              checked={draft.lifeThreatDetected}
              onChange={(event) =>
                onChange({ ...draft, lifeThreatDetected: event.target.checked })
              }
            />

            {draft.lifeThreatDetected ? (
              <Alert tone="critical" title="Bypass to resuscitation available" className="mt-4">
                Standard triage can be skipped. The patient can be moved directly to a
                resuscitation bay and formally triaged once stabilized.
              </Alert>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Pathway triggers
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Time-critical pathway alerts
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <div className="flex flex-wrap gap-2">
              {pathwayOptions.map((pathway) => {
                const active = draft.pathwayTriggers.includes(pathway);
                return (
                  <button
                    key={pathway}
                    type="button"
                    onClick={() => togglePathway(pathway)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-critical bg-critical-surface text-critical"
                        : "border-border-default bg-surface text-ink-secondary hover:border-action"
                    }`}
                  >
                    {pathway}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-ink-secondary">
              Selecting a pathway here flags it for review at triage. Formal activation
              happens on the next step.
            </p>
          </PanelBody>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <Panel elevation="flat">
          <PanelBody>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Next step
            </p>
            <p className="mt-3 text-xs leading-5 text-ink-secondary">
              {draft.lifeThreatDetected
                ? "Bypass sends this patient straight to a resuscitation bay. Triage is completed once the patient is stabilized."
                : "Proceeding to triage assigns an acuity level and routes the patient to the right treatment area."}
            </p>

            {draft.lifeThreatDetected ? (
              <Button
                type="button"
                variant="critical"
                fullWidth
                className="mt-5"
                startIcon={<Siren aria-hidden="true" size={15} />}
                onClick={() => {
                  if (!draft.patientName.trim()) {
                    setError("Enter a patient name or note that identity is unknown.");
                    return;
                  }
                  onBypass();
                }}
              >
                Bypass to resuscitation
              </Button>
            ) : null}

            <Button type="submit" variant={draft.lifeThreatDetected ? "secondary" : "primary"} fullWidth className="mt-3">
              Proceed to triage
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </form>
  );
}

function TriageStep({
  draft,
  onChange,
  onAssign,
  onBack,
}: {
  draft: TriageDraft;
  onChange: (draft: TriageDraft) => void;
  onAssign: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string>();
  const reassessmentMinutes = acuityIntervalMinutesByLevel[draft.acuityLevel];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.chiefComplaint.trim()) {
      setError("Record the chief complaint before assigning a triage category.");
      return;
    }
    onAssign();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Focused assessment
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Chief complaint and mechanism
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 md:grid-cols-2">
            <TextField
              id="ed-triage-complaint"
              label="Chief complaint"
              value={draft.chiefComplaint}
              error={error}
              onChange={(event) => {
                onChange({ ...draft, chiefComplaint: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Chest pain, diaphoretic, radiating to left arm"
            />
            <TextField
              id="ed-triage-moi"
              label="Mechanism of injury"
              description="Leave blank for medical presentations."
              value={draft.mechanismOfInjury}
              onChange={(event) => onChange({ ...draft, mechanismOfInjury: event.target.value })}
              fieldClassName="md:col-span-2"
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Triage protocol
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Assign acuity category
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                id="ed-triage-protocol"
                label="Protocol"
                value={draft.protocol}
                onChange={(event) =>
                  onChange({ ...draft, protocol: event.target.value as AcuityProtocol })
                }
              >
                {protocolOptions.map((protocol) => (
                  <option key={protocol} value={protocol}>
                    {protocol}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="ed-triage-area"
                label="Treatment area"
                value={draft.treatmentArea}
                onChange={(event) => onChange({ ...draft, treatmentArea: event.target.value })}
              >
                {treatmentAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </SelectField>
            </div>

            <div>
              <p className="spine-field__label mb-3">Acuity level</p>
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={draft.acuityLevel === level}
                    onClick={() => onChange({ ...draft, acuityLevel: level })}
                    className={`rounded-md border px-3 py-2 transition-colors ${
                      draft.acuityLevel === level
                        ? "border-action bg-selected"
                        : "border-border-default bg-surface hover:border-action"
                    }`}
                  >
                    <AcuityBadge
                      level={level}
                      protocol={draft.protocol as SpineAcuityProtocol}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-surface-subtle p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-tertiary">
                Preview
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <AcuityBadge level={draft.acuityLevel} protocol={draft.protocol as SpineAcuityProtocol} />
                <ReassessmentTimer dueInMinutes={reassessmentMinutes} />
              </div>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-critical">
                Emergency pathway
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Activate a time-critical pathway
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-4">
            <CheckboxField
              id="ed-triage-activate-pathway"
              label="Activate emergency pathway for this patient"
              description="Mobilizes the relevant team and marks the patient for priority resource allocation."
              checked={draft.activatePathway}
              onChange={(event) =>
                onChange({ ...draft, activatePathway: event.target.checked })
              }
            />

            {draft.activatePathway ? (
              <>
                <SelectField
                  id="ed-triage-activation-level"
                  label="Activation level"
                  value={draft.activationLevel}
                  onChange={(event) =>
                    onChange({ ...draft, activationLevel: event.target.value })
                  }
                >
                  <option>Level I</option>
                  <option>Level II</option>
                  <option>Level III</option>
                </SelectField>

                <PathwayActivationBanner
                  pathway={"Trauma" as PathwayName}
                  status="active"
                  activationLevel={draft.activationLevel}
                  criteria={draft.mechanismOfInjury || draft.chiefComplaint || "Criteria pending clinician review"}
                />
              </>
            ) : null}
          </PanelBody>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <Panel elevation="flat">
          <PanelBody>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Reassessment interval
            </p>
            <p className="mt-3 text-xs leading-5 text-ink-secondary">
              Level {draft.acuityLevel} patients are re-triaged every{" "}
              {reassessmentMinutes === 0 ? "continuously" : `${reassessmentMinutes} min`} while
              waiting.
            </p>

            <Button type="submit" fullWidth className="mt-5">
              Assign triage category
            </Button>
            <Button type="button" variant="tertiary" fullWidth className="mt-2" onClick={onBack}>
              <ArrowLeft aria-hidden="true" size={13} />
              Back to arrival
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </form>
  );
}

function CheckinStep({
  draft,
  onChange,
  onConfirm,
  onBack,
}: {
  draft: CheckinDraft;
  onChange: (draft: CheckinDraft) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Clinical team assignment
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Assign the receiving team
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <SelectField
              id="ed-checkin-team"
              label="Receiving physician and nurse"
              value={draft.team}
              onChange={(event) => onChange({ ...draft, team: event.target.value })}
            >
              {edClinicalTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </SelectField>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Structured handoff
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                SBAR to the receiving team
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <TextField
              id="ed-checkin-handoff"
              label="Situation, background, assessment, recommendation"
              value={draft.handoff}
              onChange={(event) => onChange({ ...draft, handoff: event.target.value })}
              placeholder="e.g. 58F chest pain, STEMI pathway active, ECG done, cardiology paged"
            />
          </PanelBody>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <Panel elevation="flat">
          <PanelBody>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Ready for check-in
            </p>
            <p className="mt-3 text-xs leading-5 text-ink-secondary">
              Confirming moves the patient onto the ED board in active treatment.
            </p>
            <Button
              fullWidth
              className="mt-5"
              startIcon={<CheckCircle2 aria-hidden="true" size={15} />}
              onClick={onConfirm}
            >
              Confirm patient arrived
            </Button>
            <Button type="button" variant="tertiary" fullWidth className="mt-2" onClick={onBack}>
              <ArrowLeft aria-hidden="true" size={13} />
              Back to triage
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </div>
  );
}

function EdPatientRow({ patient }: { patient: EdPatient }) {
  return (
    <li className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink-primary">{patient.name}</p>
            <StatusBadge tone={statusTone[patient.status]}>
              {statusLabels[patient.status]}
            </StatusBadge>
            {patient.allergies?.length ? (
              <StatusBadge tone="warning">{patient.allergies.join(", ")} allergy</StatusBadge>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-ink-secondary">{patient.chiefComplaint}</p>
          <p className="spine-mono mt-2 text-[10px] text-ink-tertiary">
            {patient.mrn ?? patient.temporaryId} · {patient.age} yrs · {patient.sex} ·{" "}
            {patient.arrivalMode} · Arrived {patient.arrivedAt}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {patient.acuityLevel && patient.acuityProtocol ? (
            <AcuityBadge level={patient.acuityLevel} protocol={patient.acuityProtocol} />
          ) : (
            <StatusBadge tone="warning">Awaiting triage</StatusBadge>
          )}
          {typeof patient.reassessmentDueInMinutes === "number" ? (
            <ReassessmentTimer dueInMinutes={patient.reassessmentDueInMinutes} />
          ) : null}
        </div>
      </div>

      {patient.treatmentArea ? (
        <p className="mt-3 text-[11px] text-ink-secondary">
          <span className="font-semibold text-ink-primary">{patient.treatmentArea}</span>
          {patient.team ? ` · ${patient.team}` : ""}
        </p>
      ) : null}

      {patient.pathway ? (
        <div className="mt-3">
          <PathwayActivationBanner
            pathway={patient.pathway.pathway as PathwayName}
            status={patient.pathway.status}
            activationLevel={patient.pathway.activationLevel}
            criteria={patient.pathway.criteria}
            activatedAt={patient.pathway.activatedAt}
          />
        </div>
      ) : null}
    </li>
  );
}

function EdBoard({ patients, onStartIntake }: { patients: EdPatient[]; onStartIntake: () => void }) {
  const metrics = useMemo(() => {
    const inEd = patients.length;
    const awaitingTriage = patients.filter((p) => p.status === "awaiting-triage").length;
    const activePathways = patients.filter((p) => p.pathway?.status === "active").length;
    const overdueReassessment = patients.filter(
      (p) => typeof p.reassessmentDueInMinutes === "number" && p.reassessmentDueInMinutes <= 0,
    ).length;

    return { inEd, awaitingTriage, activePathways, overdueReassessment };
  }, [patients]);

  const activePathwayPatients = patients.filter((p) => p.pathway?.status === "active");

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Emergency &amp; trauma
            </p>
            <StatusBadge>Illustrative records</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Emergency Department board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
            One acuity scale across ESI, CTAS, Manchester and ATS. Pathway
            activations interrupt the workflow; everything else is prioritized
            by acuity, not arrival order.
          </p>
        </div>

        <Button startIcon={<UserPlus aria-hidden="true" size={15} />} onClick={onStartIntake}>
          Record arrival
        </Button>
      </div>

      <section
        aria-labelledby="ed-metrics-title"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="ed-metrics-title" className="sr-only">
          Emergency Department metrics
        </h2>
        {[
          { label: "Patients in ED", value: String(metrics.inEd), icon: UsersRound, tone: "information" as const },
          { label: "Awaiting triage", value: String(metrics.awaitingTriage), icon: Clock3, tone: metrics.awaitingTriage > 0 ? "warning" as const : "success" as const },
          { label: "Active pathway activations", value: String(metrics.activePathways), icon: Siren, tone: metrics.activePathways > 0 ? "critical" as const : "success" as const },
          { label: "Reassessments overdue", value: String(metrics.overdueReassessment), icon: Bell, tone: metrics.overdueReassessment > 0 ? "critical" as const : "success" as const },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Panel key={metric.label} elevation="flat">
              <PanelBody>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-ink-secondary">{metric.label}</p>
                    <p className="spine-mono mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink-primary">
                      {metric.value}
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                </div>
                <StatusBadge tone={metric.tone} className="mt-4">
                  {metric.tone === "critical" ? "Needs attention" : "On track"}
                </StatusBadge>
              </PanelBody>
            </Panel>
          );
        })}
      </section>

      {activePathwayPatients.length > 0 ? (
        <section className="mt-6 space-y-3" aria-label="Active pathway activations">
          {activePathwayPatients.map((patient) => (
            <PathwayActivationBanner
              key={patient.id}
              pathway={patient.pathway!.pathway as PathwayName}
              status={patient.pathway!.status}
              activationLevel={patient.pathway!.activationLevel}
              criteria={`${patient.name} · ${patient.pathway!.criteria}`}
              activatedAt={patient.pathway!.activatedAt}
              action={
                <Button variant="critical" size="sm" startIcon={<Siren aria-hidden="true" size={13} />}>
                  Mobilize team
                </Button>
              }
            />
          ))}
        </section>
      ) : null}

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <div className="flex items-center gap-2 text-action">
              <ActivitySquare aria-hidden="true" size={16} />
              <p className="text-xs font-bold uppercase tracking-[0.1em]">Census</p>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Patients in the Emergency Department
            </h2>
          </div>
          <StatusBadge>{patients.length} patients</StatusBadge>
        </PanelHeader>
        <ul aria-label="Emergency Department census">
          {patients.map((patient) => (
            <EdPatientRow key={patient.id} patient={patient} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function IntakeCompleteView({ patient, onReturnToBoard }: { patient: EdPatient; onReturnToBoard: () => void }) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Check-in complete
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            In treatment
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {patient.name} is ready for treatment
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          The patient now appears on the Emergency Department board with an
          assigned acuity level, treatment area and clinical team.
        </p>

        <Panel className="mt-6">
          <PanelBody className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              {patient.acuityLevel && patient.acuityProtocol ? (
                <AcuityBadge level={patient.acuityLevel} protocol={patient.acuityProtocol} />
              ) : null}
            </div>
            <p className="text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary">{patient.treatmentArea}</span>
              {patient.team ? ` · ${patient.team}` : ""}
            </p>
          </PanelBody>
        </Panel>

        <Button className="mt-6" startIcon={<Stethoscope aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to ED board
        </Button>
      </div>
    </div>
  );
}

export function EmergencyWorkspace() {
  const [patients, setPatients] = useState<EdPatient[]>(prototypeEdPatients);
  const [mode, setMode] = useState<"board" | "intake" | "complete">("board");
  const [step, setStep] = useState<IntakeStep>("arrival");
  const [arrival, setArrival] = useState<ArrivalDraft>(initialArrival);
  const [triage, setTriage] = useState<TriageDraft>(initialTriage);
  const [checkin, setCheckin] = useState<CheckinDraft>(initialCheckin);
  const [lastAdmitted, setLastAdmitted] = useState<EdPatient | null>(null);

  function startIntake() {
    setArrival(initialArrival);
    setTriage(initialTriage);
    setCheckin(initialCheckin);
    setStep("arrival");
    setMode("intake");
  }

  function buildPatient(overrides: Partial<EdPatient>): EdPatient {
    return {
      id: `ed-${Date.now()}`,
      name: arrival.patientName || "Unidentified patient",
      age: 0,
      sex: "Not recorded",
      temporaryId: arrival.identityMode === "temporary" ? `ED-TEMP-${String(Date.now()).slice(-4)}` : undefined,
      chiefComplaint: triage.chiefComplaint || "Assessment pending",
      arrivalMode: arrival.arrivalMode,
      arrivedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      waitingSince: "0 min",
      status: "awaiting-triage",
      ...overrides,
    };
  }

  function handleBypass() {
    const patient = buildPatient({
      status: "in-treatment",
      acuityLevel: 1,
      acuityProtocol: "ESI",
      treatmentArea: "Resuscitation Bay 1",
      team: edClinicalTeams[0],
      reassessmentDueInMinutes: 0,
    });
    setPatients((current) => [patient, ...current]);
    setLastAdmitted(patient);
    setMode("complete");
  }

  function handleTriageAssigned() {
    setStep("checkin");
  }

  function handleCheckinConfirmed() {
    const patient = buildPatient({
      status: "in-treatment",
      acuityLevel: triage.acuityLevel,
      acuityProtocol: triage.protocol,
      treatmentArea: triage.treatmentArea,
      team: checkin.team,
      reassessmentDueInMinutes: acuityIntervalMinutesByLevel[triage.acuityLevel],
      pathway: triage.activatePathway
        ? {
            pathway: (arrival.pathwayTriggers[0] ?? "Trauma") as EdPathway,
            status: "active",
            activationLevel: triage.activationLevel,
            criteria: triage.mechanismOfInjury || triage.chiefComplaint,
            activatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          }
        : undefined,
    });
    setPatients((current) => [patient, ...current]);
    setLastAdmitted(patient);
    setMode("complete");
  }

  if (mode === "complete" && lastAdmitted) {
    return (
      <IntakeCompleteView
        patient={lastAdmitted}
        onReturnToBoard={() => {
          setMode("board");
          setLastAdmitted(null);
        }}
      />
    );
  }

  if (mode === "intake") {
    return (
      <div className="spine-page-container py-7 md:py-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMode("board")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-action hover:underline"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to ED board
          </button>
          <IntakeStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "arrival"
            ? "Emergency arrival"
            : step === "triage"
              ? "Emergency triage"
              : "Emergency check-in"}
        </h1>

        <div className="mt-6">
          {step === "arrival" ? (
            <ArrivalStep
              draft={arrival}
              onChange={setArrival}
              onProceed={() => setStep("triage")}
              onBypass={handleBypass}
            />
          ) : null}

          {step === "triage" ? (
            <TriageStep
              draft={triage}
              onChange={setTriage}
              onAssign={handleTriageAssigned}
              onBack={() => setStep("arrival")}
            />
          ) : null}

          {step === "checkin" ? (
            <CheckinStep
              draft={checkin}
              onChange={setCheckin}
              onConfirm={handleCheckinConfirmed}
              onBack={() => setStep("triage")}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return <EdBoard patients={patients} onStartIntake={startIntake} />;
}
