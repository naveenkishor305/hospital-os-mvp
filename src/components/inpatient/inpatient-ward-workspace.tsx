"use client";

import {
  ActivitySquare,
  ArrowLeft,
  ArrowRight,
  Bed,
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  Alert,
  Button,
  CheckboxField,
  IsolationTypeBadge,
  Panel,
  PanelBody,
  PanelHeader,
  ProcessStageTracker,
  RiskScoreBadge,
  SelectField,
  StatusBadge,
  TextField,
  type IsolationType as SpineIsolationType,
  type ProcessStage,
  type RiskLevel,
} from "@naveenkishor305/spine-ui";

import {
  attendingPhysicians,
  dischargeStageLabels,
  dischargeStageOrder,
  prototypeWardPatients,
  wardOptions,
  type DischargeStage,
  type IsolationType,
  type WardPatient,
  type WardRiskFlag,
} from "@/data/inpatient";

const statusLabels: Record<WardPatient["status"], string> = {
  "admission-in-progress": "Admission in progress",
  "active-care": "Active care",
  "discharge-ready": "Discharge ready",
  "discharge-pending-barrier": "Discharge blocked",
};

const statusTone: Record<WardPatient["status"], "warning" | "information" | "success" | "critical"> = {
  "admission-in-progress": "information",
  "active-care": "information",
  "discharge-ready": "success",
  "discharge-pending-barrier": "warning",
};

type IntakeStep = "reception" | "nursing" | "physician";

type ReceptionDraft = {
  patientName: string;
  ward: string;
  bed: string;
  isolation: IsolationType | "none";
};

type NursingDraft = {
  fallRisk: RiskLevel;
  pressureInjuryRisk: RiskLevel;
  deliriumRisk: RiskLevel;
  interventionsInitiated: boolean;
};

type PhysicianDraft = {
  diagnosis: string;
  attendingPhysician: string;
  initialOrders: string;
};

const initialReception: ReceptionDraft = {
  patientName: "",
  ward: wardOptions[0],
  bed: "",
  isolation: "none",
};

const initialNursing: NursingDraft = {
  fallRisk: "low",
  pressureInjuryRisk: "low",
  deliriumRisk: "low",
  interventionsInitiated: false,
};

const initialPhysician: PhysicianDraft = {
  diagnosis: "",
  attendingPhysician: attendingPhysicians[0],
  initialOrders: "",
};

const riskLevels: RiskLevel[] = ["low", "moderate", "high", "critical"];

function IntakeStepper({ step }: { step: IntakeStep }) {
  const steps: { id: IntakeStep; label: string }[] = [
    { id: "reception", label: "Ward reception" },
    { id: "nursing", label: "Nursing assessment" },
    { id: "physician", label: "Physician assessment" },
  ];
  const activeIndex = steps.findIndex((item) => item.id === step);

  return (
    <ol className="flex flex-wrap items-center gap-3">
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

function ReceptionStep({
  draft,
  onChange,
  onProceed,
}: {
  draft: ReceptionDraft;
  onChange: (draft: ReceptionDraft) => void;
  onProceed: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.patientName.trim()) {
      setError("Enter the patient's name to accept this admission.");
      return;
    }
    if (!draft.bed.trim()) {
      setError("Confirm a bed assignment before continuing.");
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
                Identity &amp; admission validation
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Verify the incoming patient
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 md:grid-cols-2">
            <TextField
              id="ward-reception-name"
              label="Patient name"
              value={draft.patientName}
              error={error}
              onChange={(event) => {
                onChange({ ...draft, patientName: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Lakshmi Pillai"
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Bed readiness
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Assign ward and bed
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 md:grid-cols-2">
            <SelectField
              id="ward-reception-ward"
              label="Ward"
              value={draft.ward}
              onChange={(event) => onChange({ ...draft, ward: event.target.value })}
            >
              {wardOptions.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </SelectField>
            <TextField
              id="ward-reception-bed"
              label="Bed number"
              value={draft.bed}
              onChange={(event) => onChange({ ...draft, bed: event.target.value })}
              placeholder="e.g. B-204"
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Infection precautions
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Isolation requirement
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <div className="flex flex-wrap gap-2">
              {(["none", "contact", "droplet", "airborne", "protective"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={draft.isolation === type}
                  onClick={() => onChange({ ...draft, isolation: type })}
                  className={`rounded-md border px-3 py-2 transition-colors ${
                    draft.isolation === type
                      ? "border-action bg-selected"
                      : "border-border-default bg-surface hover:border-action"
                  }`}
                >
                  {type === "none" ? (
                    <span className="text-xs font-semibold text-ink-secondary">
                      No precautions
                    </span>
                  ) : (
                    <IsolationTypeBadge type={type as SpineIsolationType} />
                  )}
                </button>
              ))}
            </div>
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
              Accepting the patient starts the baseline nursing assessment,
              including safety risk screening.
            </p>
            <Button type="submit" fullWidth className="mt-5" startIcon={<Bed aria-hidden="true" size={15} />}>
              Accept patient
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </form>
  );
}

function RiskSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
}) {
  return (
    <div>
      <p className="spine-field__label mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {riskLevels.map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={value === level}
            onClick={() => onChange(level)}
            className={`rounded-md border px-3 py-2 transition-colors ${
              value === level
                ? "border-action bg-selected"
                : "border-border-default bg-surface hover:border-action"
            }`}
          >
            <RiskScoreBadge label={label} level={level} />
          </button>
        ))}
      </div>
    </div>
  );
}

function NursingStep({
  draft,
  onChange,
  onSave,
  onBack,
}: {
  draft: NursingDraft;
  onChange: (draft: NursingDraft) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  const highestRisk = [draft.fallRisk, draft.pressureInjuryRisk, draft.deliriumRisk].includes(
    "high",
  )
    ? "high"
    : [draft.fallRisk, draft.pressureInjuryRisk, draft.deliriumRisk].includes("critical")
      ? "critical"
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Safety risk assessments
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Baseline nursing screening
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-6">
            <RiskSelector
              label="Fall risk"
              value={draft.fallRisk}
              onChange={(level) => onChange({ ...draft, fallRisk: level })}
            />
            <RiskSelector
              label="Pressure injury risk"
              value={draft.pressureInjuryRisk}
              onChange={(level) => onChange({ ...draft, pressureInjuryRisk: level })}
            />
            <RiskSelector
              label="Delirium risk"
              value={draft.deliriumRisk}
              onChange={(level) => onChange({ ...draft, deliriumRisk: level })}
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Initial interventions
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Nursing care priorities
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <CheckboxField
              id="ward-nursing-interventions"
              label="Fall precautions, positioning and orientation initiated"
              description="Bed alarm, non-slip footwear and call bell within reach where fall risk is elevated."
              checked={draft.interventionsInitiated}
              onChange={(event) =>
                onChange({ ...draft, interventionsInitiated: event.target.checked })
              }
            />
          </PanelBody>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        {highestRisk ? (
          <Alert tone={highestRisk === "critical" ? "critical" : "warning"} title="Elevated risk identified">
            Interventions should be documented before the physician assessment
            is finalized.
          </Alert>
        ) : null}

        <Panel elevation="flat">
          <PanelBody>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Next step
            </p>
            <p className="mt-3 text-xs leading-5 text-ink-secondary">
              Risk levels are visible to the whole care team once saved.
            </p>
            <Button fullWidth className="mt-5" onClick={onSave}>
              Save assessment
            </Button>
            <Button type="button" variant="tertiary" fullWidth className="mt-2" onClick={onBack}>
              <ArrowLeft aria-hidden="true" size={13} />
              Back to reception
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </div>
  );
}

function PhysicianStep({
  draft,
  onChange,
  onConfirm,
  onBack,
}: {
  draft: PhysicianDraft;
  onChange: (draft: PhysicianDraft) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.diagnosis.trim()) {
      setError("Record a principal diagnosis before completing admission.");
      return;
    }
    onConfirm();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Diagnosis &amp; severity
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Admission physician assessment
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="grid gap-5 md:grid-cols-2">
            <TextField
              id="ward-physician-diagnosis"
              label="Principal diagnosis"
              value={draft.diagnosis}
              error={error}
              onChange={(event) => {
                onChange({ ...draft, diagnosis: event.target.value });
                setError(undefined);
              }}
              fieldClassName="md:col-span-2"
              placeholder="e.g. Community-acquired pneumonia, hypoxia on admission"
            />
            <SelectField
              id="ward-physician-attending"
              label="Attending physician"
              value={draft.attendingPhysician}
              onChange={(event) => onChange({ ...draft, attendingPhysician: event.target.value })}
            >
              {attendingPhysicians.map((physician) => (
                <option key={physician} value={physician}>
                  {physician}
                </option>
              ))}
            </SelectField>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Initial orders
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Management plan
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <TextField
              id="ward-physician-orders"
              label="Laboratory, imaging, medication, diet and monitoring orders"
              value={draft.initialOrders}
              onChange={(event) => onChange({ ...draft, initialOrders: event.target.value })}
              placeholder="e.g. CBC, CRP, chest X-ray, IV ceftriaxone, continuous SpO2 monitoring"
            />
          </PanelBody>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <Panel elevation="flat">
          <PanelBody>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Ready to admit
            </p>
            <p className="mt-3 text-xs leading-5 text-ink-secondary">
              Confirming adds this patient to the ward board in active care.
            </p>
            <Button
              type="submit"
              fullWidth
              className="mt-5"
              startIcon={<CheckCircle2 aria-hidden="true" size={15} />}
            >
              Finalize admission
            </Button>
            <Button type="button" variant="tertiary" fullWidth className="mt-2" onClick={onBack}>
              <ArrowLeft aria-hidden="true" size={13} />
              Back to nursing assessment
            </Button>
          </PanelBody>
        </Panel>
      </aside>
    </form>
  );
}

function dischargeStageFor(patient: WardPatient): DischargeStage {
  if (patient.status === "discharge-ready") return "ready-for-discharge";
  if (patient.status === "discharge-pending-barrier") return "multidisciplinary-coordination";
  return "needs-assessment";
}

function DischargePlanningPanel({ patient, onClose }: { patient: WardPatient; onClose: () => void }) {
  const currentStage = dischargeStageFor(patient);
  const currentIndex = dischargeStageOrder.indexOf(currentStage);

  const stages: ProcessStage[] = dischargeStageOrder.map((stage, index) => ({
    id: stage,
    label: dischargeStageLabels[stage],
    status:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? patient.status === "discharge-pending-barrier"
            ? "blocked"
            : "current"
          : "upcoming",
  }));

  return (
    <Panel className="mb-4 border-warning">
      <PanelHeader>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-warning">
            Discharge planning
          </p>
          <h2 className="mt-2 text-base font-semibold text-ink-primary">{patient.name}</h2>
        </div>
        <Button variant="tertiary" size="sm" onClick={onClose}>
          Close
        </Button>
      </PanelHeader>
      <PanelBody>
        <ProcessStageTracker stages={stages} />

        {patient.status === "discharge-pending-barrier" ? (
          <Alert tone="warning" title="Discharge barrier unresolved" className="mt-5">
            This patient cannot be discharged until multidisciplinary
            coordination (transport, equipment or caregiver support) is
            confirmed.
          </Alert>
        ) : patient.status === "discharge-ready" ? (
          <Alert tone="success" title="Cleared for discharge" className="mt-5">
            All discharge barriers are resolved. Discharge paperwork can be
            finalized.
          </Alert>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

function RiskFlagBadges({ flags }: { flags: WardRiskFlag[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag) => (
        <RiskScoreBadge key={flag.label} label={flag.label} level={flag.level} score={flag.score} />
      ))}
    </div>
  );
}

function WardPatientRow({
  patient,
  onOpenDischarge,
}: {
  patient: WardPatient;
  onOpenDischarge: () => void;
}) {
  return (
    <li className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink-primary">{patient.name}</p>
            <StatusBadge tone={statusTone[patient.status]}>
              {statusLabels[patient.status]}
            </StatusBadge>
            {patient.isolation ? <IsolationTypeBadge type={patient.isolation} /> : null}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-ink-secondary">
            {patient.admittingDiagnosis}
          </p>
          <p className="spine-mono mt-2 text-[10px] text-ink-tertiary">
            {patient.mrn} · {patient.age} yrs · {patient.sex} · {patient.attendingPhysician}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-ink-primary">
            {patient.ward} · {patient.bed}
          </p>
          <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
            Day {patient.lengthOfStayDays} · Admitted {patient.admittedAt}
          </p>
        </div>
      </div>

      {patient.riskFlags.length > 0 ? (
        <div className="mt-3">
          <RiskFlagBadges flags={patient.riskFlags} />
        </div>
      ) : null}

      {patient.status === "discharge-ready" || patient.status === "discharge-pending-barrier" ? (
        <div className="mt-3">
          <Button
            variant="tertiary"
            size="sm"
            startIcon={<ClipboardCheck aria-hidden="true" size={13} />}
            onClick={onOpenDischarge}
          >
            View discharge plan
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function WardBoard({
  patients,
  onStartAdmission,
}: {
  patients: WardPatient[];
  onStartAdmission: () => void;
}) {
  const [dischargePatientId, setDischargePatientId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const onWard = patients.length;
    const admitting = patients.filter((p) => p.status === "admission-in-progress").length;
    const dischargeReady = patients.filter((p) => p.status === "discharge-ready").length;
    const elevatedRisk = patients.filter((p) =>
      p.riskFlags.some((flag) => flag.level === "high" || flag.level === "critical"),
    ).length;

    return { onWard, admitting, dischargeReady, elevatedRisk };
  }, [patients]);

  const dischargePatient = patients.find((patient) => patient.id === dischargePatientId) ?? null;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Inpatient care &amp; ward management
            </p>
            <StatusBadge>Illustrative records</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Ward board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
            Isolation precautions and safety risk stay visible next to every
            bed. Discharge readiness is a tracked process, not a single click.
          </p>
        </div>

        <Button startIcon={<UserPlus aria-hidden="true" size={15} />} onClick={onStartAdmission}>
          Admit patient
        </Button>
      </div>

      <section
        aria-labelledby="ward-metrics-title"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="ward-metrics-title" className="sr-only">
          Ward metrics
        </h2>
        {[
          { label: "Patients on ward", value: String(metrics.onWard), icon: UsersRound, tone: "information" as const },
          { label: "Admissions in progress", value: String(metrics.admitting), icon: Bed, tone: "information" as const },
          { label: "Discharge ready", value: String(metrics.dischargeReady), icon: CheckCircle2, tone: "success" as const },
          { label: "Elevated safety risk", value: String(metrics.elevatedRisk), icon: ShieldAlert, tone: metrics.elevatedRisk > 0 ? "warning" as const : "success" as const },
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
                  {metric.tone === "warning" ? "Needs review" : "On track"}
                </StatusBadge>
              </PanelBody>
            </Panel>
          );
        })}
      </section>

      {dischargePatient ? (
        <div className="mt-6">
          <DischargePlanningPanel
            patient={dischargePatient}
            onClose={() => setDischargePatientId(null)}
          />
        </div>
      ) : null}

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <div className="flex items-center gap-2 text-action">
              <ActivitySquare aria-hidden="true" size={16} />
              <p className="text-xs font-bold uppercase tracking-[0.1em]">Census</p>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Patients on the ward
            </h2>
          </div>
          <StatusBadge>{patients.length} patients</StatusBadge>
        </PanelHeader>
        <ul aria-label="Ward census">
          {patients.map((patient) => (
            <WardPatientRow
              key={patient.id}
              patient={patient}
              onOpenDischarge={() => setDischargePatientId(patient.id)}
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function AdmissionCompleteView({
  patient,
  onReturnToBoard,
}: {
  patient: WardPatient;
  onReturnToBoard: () => void;
}) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Admission complete
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            Active care
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {patient.name} is admitted
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          The patient now appears on the ward board with bed assignment,
          isolation status and safety risk flags visible to the care team.
        </p>

        <Panel className="mt-6">
          <PanelBody className="grid gap-4 sm:grid-cols-2">
            <p className="text-xs text-ink-secondary">
              <span className="font-semibold text-ink-primary">
                {patient.ward} · {patient.bed}
              </span>
              {patient.isolation ? (
                <span className="ml-2 inline-flex align-middle">
                  <IsolationTypeBadge type={patient.isolation} />
                </span>
              ) : null}
            </p>
            {patient.riskFlags.length > 0 ? <RiskFlagBadges flags={patient.riskFlags} /> : null}
          </PanelBody>
        </Panel>

        <Button className="mt-6" startIcon={<Bed aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to ward board
        </Button>
      </div>
    </div>
  );
}

export function InpatientWardWorkspace() {
  const [patients, setPatients] = useState<WardPatient[]>(prototypeWardPatients);
  const [mode, setMode] = useState<"board" | "intake" | "complete">("board");
  const [step, setStep] = useState<IntakeStep>("reception");
  const [reception, setReception] = useState<ReceptionDraft>(initialReception);
  const [nursing, setNursing] = useState<NursingDraft>(initialNursing);
  const [physician, setPhysician] = useState<PhysicianDraft>(initialPhysician);
  const [lastAdmitted, setLastAdmitted] = useState<WardPatient | null>(null);

  function startAdmission() {
    setReception(initialReception);
    setNursing(initialNursing);
    setPhysician(initialPhysician);
    setStep("reception");
    setMode("intake");
  }

  function handleAdmissionComplete() {
    const riskFlags: WardRiskFlag[] = [
      { label: "Fall risk", level: nursing.fallRisk },
      { label: "Pressure injury", level: nursing.pressureInjuryRisk },
      { label: "Delirium risk", level: nursing.deliriumRisk },
    ].filter((flag) => flag.level !== "low");

    const patient: WardPatient = {
      id: `ward-${Date.now()}`,
      name: reception.patientName || "Unidentified patient",
      age: 0,
      sex: "Not recorded",
      mrn: `HOS-${String(Date.now()).slice(-6)}`,
      ward: reception.ward,
      bed: reception.bed,
      admittingDiagnosis: physician.diagnosis || "Assessment pending",
      admittedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      attendingPhysician: physician.attendingPhysician,
      status: "active-care",
      isolation: reception.isolation === "none" ? undefined : reception.isolation,
      riskFlags,
      lengthOfStayDays: 0,
    };

    setPatients((current) => [patient, ...current]);
    setLastAdmitted(patient);
    setMode("complete");
  }

  if (mode === "complete" && lastAdmitted) {
    return (
      <AdmissionCompleteView
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
            Back to ward board
          </button>
          <IntakeStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "reception"
            ? "Ward reception"
            : step === "nursing"
              ? "Admission nursing assessment"
              : "Admission physician assessment"}
        </h1>

        <div className="mt-6">
          {step === "reception" ? (
            <ReceptionStep
              draft={reception}
              onChange={setReception}
              onProceed={() => setStep("nursing")}
            />
          ) : null}

          {step === "nursing" ? (
            <NursingStep
              draft={nursing}
              onChange={setNursing}
              onSave={() => setStep("physician")}
              onBack={() => setStep("reception")}
            />
          ) : null}

          {step === "physician" ? (
            <PhysicianStep
              draft={physician}
              onChange={setPhysician}
              onConfirm={handleAdmissionComplete}
              onBack={() => setStep("nursing")}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return <WardBoard patients={patients} onStartAdmission={startAdmission} />;
}
