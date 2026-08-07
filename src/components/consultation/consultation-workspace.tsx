"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Beaker,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FlaskConical,
  HeartPulse,
  History,
  LockKeyhole,
  Pill,
  Plus,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import type { FormEvent, TextareaHTMLAttributes } from "react";
import { useMemo, useState } from "react";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/ui/status-badge";
import { TextField } from "@/components/ui/text-field";
import {
  clinicalProfileFor,
  diagnosisOptions,
  medicationOptions,
  orderCatalog,
} from "@/data/consultations";
import { prototypeAppointments } from "@/data/appointments";
import { prototypePatients } from "@/data/patients";
import { cn } from "@/lib/cn";

type ActiveSection = "intake" | "note" | "orders" | "close";
type OrderType = keyof typeof orderCatalog;
type DiagnosisType = "Primary" | "Differential";
type OrderUrgency = "Routine" | "Urgent";

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

type VitalsDraft = {
  temperature: string;
  pulse: string;
  systolic: string;
  diastolic: string;
  spo2: string;
  respiration: string;
  pain: string;
};

type SoapDraft = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

type DiagnosisEntry = {
  id: string;
  code: string;
  label: string;
  type: DiagnosisType;
};

type ClinicalOrder = {
  id: string;
  type: OrderType;
  name: string;
  urgency: OrderUrgency;
  reason: string;
  status: "Draft";
};

type PrescriptionLine = {
  id: string;
  medication: string;
  frequency: string;
  duration: string;
  instructions: string;
  safetyNote?: string;
};

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
};

const sectionItems: Array<{
  id: ActiveSection;
  label: string;
  icon: typeof HeartPulse;
}> = [
  { id: "intake", label: "Clinical intake", icon: HeartPulse },
  { id: "note", label: "Clinical note", icon: ClipboardList },
  { id: "orders", label: "Orders & prescription", icon: FlaskConical },
  { id: "close", label: "Review & close", icon: FileCheck2 },
];

function TextareaField({
  id,
  label,
  description,
  error,
  className,
  ...props
}: TextareaFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <label className="spine-field" htmlFor={id}>
      <span className="spine-field__label">{label}</span>
      {description ? (
        <span id={descriptionId} className="spine-field__description">
          {description}
        </span>
      ) : null}
      <textarea
        id={id}
        className={cn("spine-input min-h-28 py-2.5 leading-6", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error ? (
        <span id={errorId} className="spine-field__message" data-error="true">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof HeartPulse;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-selected text-action">
        <Icon aria-hidden="true" size={17} />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-ink-primary">{title}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-ink-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ConsultationWorkspace({
  initialAppointmentId,
  handoffConfirmed = false,
}: {
  initialAppointmentId?: string;
  handoffConfirmed?: boolean;
}) {
  const fallbackAppointment = prototypeAppointments.find(
    (appointment) => appointment.id === "apt-meera-legacy",
  )!;
  const activeAppointment =
    prototypeAppointments.find(
      (appointment) => appointment.id === initialAppointmentId,
    ) ?? fallbackAppointment;
  const patient = prototypePatients.find(
    (record) => record.id === activeAppointment.patientId && !record.restricted,
  )!;
  const profile = clinicalProfileFor(patient.id);
  const hasClinicalHandoff =
    handoffConfirmed || activeAppointment.queueStatus === "In consultation";
  const encounterId = patient.encounter ?? `OPD-${activeAppointment.id.slice(-8)}`;

  const [activeSection, setActiveSection] = useState<ActiveSection>("intake");
  const [notice, setNotice] = useState<Notice | null>(
    hasClinicalHandoff
      ? {
          tone: "information",
          title: "Nursing handoff available for verification",
          message:
            "Prefilled observations retain their source and remain unverified until the clinician confirms them.",
        }
      : {
          tone: "critical",
          title: "Clinical handoff not confirmed",
          message:
            "Return to the live queue and explicitly start consultation before documenting this encounter.",
        },
  );
  const [vitals, setVitals] = useState<VitalsDraft>({
    ...profile.nursingHandoff.vitals,
  });
  const [chiefComplaint, setChiefComplaint] = useState(
    profile.nursingHandoff.chiefComplaint,
  );
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [allergiesVerified, setAllergiesVerified] = useState(false);
  const [medicationsReconciled, setMedicationsReconciled] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [vitalErrors, setVitalErrors] = useState<Partial<Record<keyof VitalsDraft, string>>>({});
  const [complaintError, setComplaintError] = useState("");
  const [soap, setSoap] = useState<SoapDraft>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [diagnosisType, setDiagnosisType] = useState<DiagnosisType>("Primary");
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("Laboratory");
  const [orderName, setOrderName] = useState("");
  const [orderUrgency, setOrderUrgency] = useState<OrderUrgency>("Routine");
  const [orderReason, setOrderReason] = useState("");
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [medicationId, setMedicationId] = useState("");
  const [medicationFrequency, setMedicationFrequency] = useState("");
  const [medicationDuration, setMedicationDuration] = useState("");
  const [medicationInstructions, setMedicationInstructions] = useState("");
  const [safetyOverrideReason, setSafetyOverrideReason] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionLine[]>([]);
  const [draftDirty, setDraftDirty] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState("Not saved in this session");
  const [signatureAttested, setSignatureAttested] = useState(false);
  const [noteSigned, setNoteSigned] = useState(false);
  const [signedAt, setSignedAt] = useState("");
  const [addendumText, setAddendumText] = useState("");
  const [addenda, setAddenda] = useState<Array<{ id: string; text: string; at: string }>>([]);
  const [disposition, setDisposition] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [patientInstructions, setPatientInstructions] = useState("");
  const [ordersReviewed, setOrdersReviewed] = useState(false);
  const [closureConfirmed, setClosureConfirmed] = useState(false);
  const [encounterCompleted, setEncounterCompleted] = useState(false);

  const documentationLocked = noteSigned || encounterCompleted || !hasClinicalHandoff;
  const selectedMedication = medicationOptions.find(
    (medication) => medication.id === medicationId,
  );
  const allergyMatches = useMemo(() => {
    if (!selectedMedication) return [];
    const patientAllergies = patient.allergies ?? [];
    return selectedMedication.allergyTriggers.filter((trigger) =>
      patientAllergies.some((allergy) =>
        allergy.toLowerCase().includes(trigger.toLowerCase()),
      ),
    );
  }, [patient.allergies, selectedMedication]);
  const interactionMatches = useMemo(() => {
    if (!selectedMedication) return [];
    return selectedMedication.interactionTerms.filter((term) =>
      profile.currentMedications.some((medication) =>
        medication.toLowerCase().includes(term.toLowerCase()),
      ),
    );
  }, [profile.currentMedications, selectedMedication]);

  const soapComplete = Object.values(soap).every((value) => value.trim().length > 0);
  const signingReadiness = [
    { label: "Clinical handoff confirmed", done: hasClinicalHandoff },
    { label: "Identity and nursing intake verified", done: intakeComplete },
    { label: "Allergy status verified", done: allergiesVerified },
    { label: "Medication reconciliation complete", done: medicationsReconciled },
    { label: "SOAP note complete", done: soapComplete },
    { label: "At least one diagnosis recorded", done: diagnoses.length > 0 },
    { label: "Latest changes saved", done: !draftDirty },
  ];
  const readyToSign = signingReadiness.every((item) => item.done);
  const readyToComplete =
    noteSigned &&
    Boolean(disposition) &&
    Boolean(patientInstructions.trim()) &&
    ordersReviewed &&
    closureConfirmed &&
    (disposition !== "Follow-up" || Boolean(followUpDate));

  function markDraftChanged() {
    if (!noteSigned) setDraftDirty(true);
  }

  function updateVital(field: keyof VitalsDraft, value: string) {
    setVitals((current) => ({ ...current, [field]: value }));
    setVitalErrors((current) => ({ ...current, [field]: undefined }));
    setIntakeComplete(false);
    markDraftChanged();
  }

  function validateVital(
    field: keyof VitalsDraft,
    label: string,
    minimum: number,
    maximum: number,
    errors: Partial<Record<keyof VitalsDraft, string>>,
  ) {
    const value = Number(vitals[field]);
    if (!vitals[field] || !Number.isFinite(value)) {
      errors[field] = `${label} is required.`;
    } else if (value < minimum || value > maximum) {
      errors[field] = `Review ${label.toLowerCase()}; value is outside the supported entry range.`;
    }
  }

  function saveClinicalIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Partial<Record<keyof VitalsDraft, string>> = {};
    validateVital("temperature", "Temperature", 34, 43, errors);
    validateVital("pulse", "Pulse", 30, 220, errors);
    validateVital("systolic", "Systolic pressure", 60, 250, errors);
    validateVital("diastolic", "Diastolic pressure", 30, 150, errors);
    validateVital("spo2", "SpO2", 50, 100, errors);
    validateVital("respiration", "Respiratory rate", 6, 60, errors);
    validateVital("pain", "Pain score", 0, 10, errors);
    const nextComplaintError = chiefComplaint.trim()
      ? ""
      : "Chief complaint is required.";

    setVitalErrors(errors);
    setComplaintError(nextComplaintError);
    if (
      Object.keys(errors).length > 0 ||
      nextComplaintError ||
      !identityConfirmed ||
      !allergiesVerified ||
      !medicationsReconciled
    ) {
      setNotice({
        tone: "warning",
        title: "Clinical intake is incomplete",
        message:
          "Review the highlighted observations and confirm identity, allergies and medication reconciliation.",
      });
      return;
    }

    setIntakeComplete(true);
    setDraftDirty(true);
    setNotice({
      tone: "success",
      title: "Clinical intake verified",
      message:
        "The nursing handoff is now attributed as clinician-verified in this session draft.",
    });
  }

  function addDiagnosis() {
    const option = diagnosisOptions.find((item) => item.code === diagnosisCode);
    if (!option || documentationLocked) return;
    if (diagnoses.some((diagnosis) => diagnosis.code === option.code)) {
      setNotice({
        tone: "warning",
        title: "Diagnosis already recorded",
        message: `${option.code} is already present in this encounter.`,
      });
      return;
    }

    setDiagnoses((current) => [
      ...current,
      {
        id: `diagnosis-${Date.now()}`,
        code: option.code,
        label: option.label,
        type: diagnosisType,
      },
    ]);
    setDiagnosisCode("");
    markDraftChanged();
  }

  function addOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!orderName || !orderReason.trim() || documentationLocked) {
      setNotice({
        tone: "warning",
        title: "Order details required",
        message: "Choose a service and record its clinical reason before adding it.",
      });
      return;
    }

    setOrders((current) => [
      ...current,
      {
        id: `order-${Date.now()}`,
        type: orderType,
        name: orderName,
        urgency: orderUrgency,
        reason: orderReason.trim(),
        status: "Draft",
      },
    ]);
    setOrderName("");
    setOrderReason("");
    setOrderUrgency("Routine");
    markDraftChanged();
    setNotice({
      tone: "information",
      title: "Draft order added",
      message:
        "No external service has been requested yet. The order remains part of the unsigned encounter draft.",
    });
  }

  function addMedication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (documentationLocked) return;
    if (!allergiesVerified || !medicationsReconciled) {
      setNotice({
        tone: "critical",
        title: "Medication safety checks incomplete",
        message: "Verify allergies and reconcile current medications before prescribing.",
      });
      return;
    }
    if (allergyMatches.length > 0) {
      setNotice({
        tone: "critical",
        title: "Prescription blocked by recorded allergy",
        message: `${selectedMedication?.name} matches the recorded ${allergyMatches.join(", ")} allergy. Choose another medication.`,
      });
      return;
    }
    if (
      !selectedMedication ||
      !medicationFrequency ||
      !medicationDuration.trim() ||
      !medicationInstructions.trim()
    ) {
      setNotice({
        tone: "warning",
        title: "Prescription details required",
        message: "Complete medication, frequency, duration and instructions.",
      });
      return;
    }
    if (interactionMatches.length > 0 && !safetyOverrideReason.trim()) {
      setNotice({
        tone: "critical",
        title: "Interaction review requires a reason",
        message:
          "Record the clinical rationale or choose a different medication before continuing.",
      });
      return;
    }

    setPrescription((current) => [
      ...current,
      {
        id: `medication-${Date.now()}`,
        medication: selectedMedication.name,
        frequency: medicationFrequency,
        duration: medicationDuration.trim(),
        instructions: medicationInstructions.trim(),
        safetyNote:
          interactionMatches.length > 0
            ? `Interaction reviewed: ${safetyOverrideReason.trim()}`
            : undefined,
      },
    ]);
    setMedicationId("");
    setMedicationFrequency("");
    setMedicationDuration("");
    setMedicationInstructions("");
    setSafetyOverrideReason("");
    markDraftChanged();
    setNotice({
      tone: "success",
      title: "Medication added to draft",
      message:
        "The prescription remains unsigned and has not been sent to pharmacy.",
    });
  }

  function saveDraft() {
    if (!hasClinicalHandoff || noteSigned) return;
    setDraftDirty(false);
    setDraftSavedAt(`${nowLabel()} · this session`);
    setNotice({
      tone: "success",
      title: "Encounter draft saved",
      message:
        "Illustrative session data is marked saved. A production build would encrypt and synchronize this draft.",
    });
  }

  function signClinicalNote() {
    if (!readyToSign || !signatureAttested || noteSigned) return;
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Signing unavailable while offline",
        message:
          "The draft remains preserved. Reconnect, synchronize and resolve conflicts before signing.",
      });
      return;
    }

    setNoteSigned(true);
    setSignedAt(`${nowLabel()} · this session`);
    setNotice({
      tone: "success",
      title: "Clinical note signed as version 1",
      message:
        "The signed content is locked. Any correction must be recorded as a linked, attributed addendum.",
    });
  }

  function addAddendum() {
    if (!noteSigned || !addendumText.trim()) return;
    setAddenda((current) => [
      ...current,
      {
        id: `addendum-${Date.now()}`,
        text: addendumText.trim(),
        at: `${nowLabel()} · this session`,
      },
    ]);
    setAddendumText("");
    setNotice({
      tone: "information",
      title: "Versioned addendum added",
      message: "The original signed note remains unchanged and traceable.",
    });
  }

  function completeEncounter() {
    if (!readyToComplete || encounterCompleted) return;
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Encounter closure unavailable while offline",
        message:
          "The signed note and closure draft are preserved until synchronization is safe.",
      });
      return;
    }

    setEncounterCompleted(true);
    setNotice({
      tone: "success",
      title: "OPD encounter completed",
      message:
        "The visit summary is ready for downstream billing and follow-up handoffs. No external transaction was created in this prototype.",
    });
  }

  function renderIntake() {
    return (
      <form onSubmit={saveClinicalIntake} className="space-y-6">
        <Panel>
          <PanelHeader>
            <SectionIntro
              eyebrow="Step 1 of 4"
              title="Verify nursing intake"
              description="Confirm imported observations at the point of care before they influence documentation, orders or medication decisions."
              icon={HeartPulse}
            />
            <StatusBadge tone={intakeComplete ? "success" : "warning"}>
              {intakeComplete ? "Verified" : "Needs verification"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <Alert tone="information" title="Prefilled from nursing handoff">
              Recorded by {profile.nursingHandoff.recordedBy} at {profile.nursingHandoff.recordedAt}.
              Editing creates a clinician-attributed draft; it does not rewrite the source entry.
            </Alert>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <TextField
                id="temperature"
                label="Temperature"
                description="°C"
                type="number"
                step="0.1"
                value={vitals.temperature}
                error={vitalErrors.temperature}
                disabled={documentationLocked}
                onChange={(event) => updateVital("temperature", event.target.value)}
              />
              <TextField
                id="pulse"
                label="Pulse"
                description="beats/min"
                type="number"
                value={vitals.pulse}
                error={vitalErrors.pulse}
                disabled={documentationLocked}
                onChange={(event) => updateVital("pulse", event.target.value)}
              />
              <TextField
                id="systolic"
                label="Systolic BP"
                description="mmHg"
                type="number"
                value={vitals.systolic}
                error={vitalErrors.systolic}
                disabled={documentationLocked}
                onChange={(event) => updateVital("systolic", event.target.value)}
              />
              <TextField
                id="diastolic"
                label="Diastolic BP"
                description="mmHg"
                type="number"
                value={vitals.diastolic}
                error={vitalErrors.diastolic}
                disabled={documentationLocked}
                onChange={(event) => updateVital("diastolic", event.target.value)}
              />
              <TextField
                id="spo2"
                label="SpO2"
                description="%"
                type="number"
                value={vitals.spo2}
                error={vitalErrors.spo2}
                disabled={documentationLocked}
                onChange={(event) => updateVital("spo2", event.target.value)}
              />
              <TextField
                id="respiration"
                label="Respiratory rate"
                description="breaths/min"
                type="number"
                value={vitals.respiration}
                error={vitalErrors.respiration}
                disabled={documentationLocked}
                onChange={(event) => updateVital("respiration", event.target.value)}
              />
              <TextField
                id="pain"
                label="Pain score"
                description="0-10"
                type="number"
                value={vitals.pain}
                error={vitalErrors.pain}
                disabled={documentationLocked}
                onChange={(event) => updateVital("pain", event.target.value)}
              />
            </div>

            <TextareaField
              id="chief-complaint"
              label="Chief complaint"
              description="Use the patient's own words where practical."
              className="mt-6 min-h-24"
              value={chiefComplaint}
              error={complaintError}
              disabled={documentationLocked}
              onChange={(event) => {
                setChiefComplaint(event.target.value);
                setComplaintError("");
                setIntakeComplete(false);
                markDraftChanged();
              }}
            />

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              <CheckboxField
                id="identity-confirmed"
                label="Two identifiers confirmed"
                description={`${patient.name} · ${patient.dob} · ${patient.mrn}`}
                checked={identityConfirmed}
                disabled={documentationLocked}
                onChange={(event) => {
                  setIdentityConfirmed(event.target.checked);
                  setIntakeComplete(false);
                  markDraftChanged();
                }}
              />
              <CheckboxField
                id="allergies-verified"
                label="Allergy status verified"
                description={
                  patient.allergies?.length
                    ? patient.allergies.join(", ")
                    : "No allergy is recorded; verify directly with the patient."
                }
                checked={allergiesVerified}
                disabled={documentationLocked}
                onChange={(event) => {
                  setAllergiesVerified(event.target.checked);
                  setIntakeComplete(false);
                  markDraftChanged();
                }}
              />
              <CheckboxField
                id="medications-reconciled"
                label="Medication list reconciled"
                description={profile.currentMedications.join("; ")}
                checked={medicationsReconciled}
                disabled={documentationLocked}
                onChange={(event) => {
                  setMedicationsReconciled(event.target.checked);
                  setIntakeComplete(false);
                  markDraftChanged();
                }}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={documentationLocked}
                startIcon={<ClipboardCheck aria-hidden="true" size={15} />}
              >
                Verify and save intake
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </form>
    );
  }

  function renderNote() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <SectionIntro
              eyebrow="Step 2 of 4"
              title="Structured clinical documentation"
              description="Document a structured core with guided narrative. The system does not diagnose or replace clinical judgement."
              icon={ClipboardList}
            />
            <StatusBadge tone={noteSigned ? "success" : soapComplete ? "information" : "warning"}>
              {noteSigned ? "Signed v1" : soapComplete ? "Complete draft" : "Draft"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {noteSigned ? (
              <Alert tone="success" title={`Signed ${signedAt}`}>
                Version 1 is locked. Use the addendum control below for any correction.
              </Alert>
            ) : null}
            <div className={cn("grid gap-5 lg:grid-cols-2", noteSigned && "mt-5")}>
              {(
                [
                  ["subjective", "Subjective", "Symptoms, history and patient-reported context"],
                  ["objective", "Objective", "Examination findings and reviewed measurements"],
                  ["assessment", "Assessment", "Clinical assessment and differential reasoning"],
                  ["plan", "Plan", "Treatment, investigations, advice and follow-up intent"],
                ] as const
              ).map(([field, label, description]) => (
                <TextareaField
                  key={field}
                  id={`soap-${field}`}
                  label={label}
                  description={description}
                  value={soap[field]}
                  disabled={documentationLocked}
                  onChange={(event) => {
                    setSoap((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }));
                    markDraftChanged();
                  }}
                />
              ))}
            </div>
          </PanelBody>
        </Panel>

        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Diagnoses
              </p>
              <h2 className="mt-2 text-base font-semibold text-ink-primary">
                Encounter problem list
              </h2>
            </div>
            <StatusBadge tone={diagnoses.length ? "information" : "warning"}>
              {diagnoses.length} recorded
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {!documentationLocked ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_180px_auto] lg:items-end">
                <SelectField
                  id="diagnosis-code"
                  label="Diagnosis"
                  value={diagnosisCode}
                  onChange={(event) => setDiagnosisCode(event.target.value)}
                >
                  <option value="">Select coded diagnosis</option>
                  {diagnosisOptions.map((diagnosis) => (
                    <option key={diagnosis.code} value={diagnosis.code}>
                      {diagnosis.code} · {diagnosis.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  id="diagnosis-type"
                  label="Classification"
                  value={diagnosisType}
                  onChange={(event) =>
                    setDiagnosisType(event.target.value as DiagnosisType)
                  }
                >
                  <option value="Primary">Primary</option>
                  <option value="Differential">Differential</option>
                </SelectField>
                <Button
                  onClick={addDiagnosis}
                  disabled={!diagnosisCode}
                  startIcon={<Plus aria-hidden="true" size={14} />}
                >
                  Add diagnosis
                </Button>
              </div>
            ) : null}

            <div className={cn("divide-y divide-border-subtle", !documentationLocked && "mt-5")}>
              {diagnoses.length ? (
                diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="spine-mono text-xs font-bold text-action">
                          {diagnosis.code}
                        </span>
                        <StatusBadge tone={diagnosis.type === "Primary" ? "information" : "neutral"}>
                          {diagnosis.type}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-ink-primary">{diagnosis.label}</p>
                    </div>
                    {!documentationLocked ? (
                      <Button
                        variant="tertiary"
                        size="sm"
                        className="spine-button--critical-text"
                        startIcon={<Trash2 aria-hidden="true" size={13} />}
                        onClick={() => {
                          setDiagnoses((current) =>
                            current.filter((item) => item.id !== diagnosis.id),
                          );
                          markDraftChanged();
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="py-5 text-center text-xs text-ink-secondary">
                  No encounter diagnosis recorded yet.
                </p>
              )}
            </div>
          </PanelBody>
        </Panel>

        {noteSigned ? (
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Signed-record correction
                </p>
                <h2 className="mt-2 text-base font-semibold text-ink-primary">
                  Versioned addendum
                </h2>
              </div>
              <StatusBadge>{addenda.length} addenda</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <TextareaField
                id="addendum"
                label="Addendum text"
                description="State the correction or clarification. The original signed note will remain unchanged."
                value={addendumText}
                onChange={(event) => setAddendumText(event.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  disabled={!addendumText.trim()}
                  onClick={addAddendum}
                >
                  Add attributed addendum
                </Button>
              </div>
              {addenda.length ? (
                <div className="mt-5 divide-y divide-border-subtle border-t border-border-subtle">
                  {addenda.map((addendum, index) => (
                    <div key={addendum.id} className="py-4">
                      <p className="text-xs font-semibold text-ink-primary">
                        Addendum {index + 1}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-secondary">
                        {addendum.text}
                      </p>
                      <p className="spine-mono mt-2 text-[10px] text-ink-tertiary">
                        Dr Joseph Thomas · {addendum.at}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </PanelBody>
          </Panel>
        ) : null}
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <SectionIntro
              eyebrow="Step 3 of 4"
              title="Orders and medication"
              description="Every request remains attributable, reviewable and visibly separate from fulfilment. Nothing is placed or prescribed automatically."
              icon={FlaskConical}
            />
            <StatusBadge>{orders.length + prescription.length} draft items</StatusBadge>
          </PanelHeader>
          <PanelBody>
            <form onSubmit={addOrder}>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  id="order-type"
                  label="Order type"
                  value={orderType}
                  disabled={documentationLocked}
                  onChange={(event) => {
                    setOrderType(event.target.value as OrderType);
                    setOrderName("");
                  }}
                >
                  {(Object.keys(orderCatalog) as OrderType[]).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </SelectField>
                <SelectField
                  id="order-name"
                  label="Service"
                  value={orderName}
                  disabled={documentationLocked}
                  onChange={(event) => setOrderName(event.target.value)}
                >
                  <option value="">Select service</option>
                  {orderCatalog[orderType].map((order) => (
                    <option key={order} value={order}>{order}</option>
                  ))}
                </SelectField>
                <SelectField
                  id="order-urgency"
                  label="Urgency"
                  value={orderUrgency}
                  disabled={documentationLocked}
                  onChange={(event) => setOrderUrgency(event.target.value as OrderUrgency)}
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                </SelectField>
                <TextField
                  id="order-reason"
                  label="Clinical reason"
                  value={orderReason}
                  disabled={documentationLocked}
                  onChange={(event) => setOrderReason(event.target.value)}
                  placeholder="Reason for request"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={documentationLocked}
                  startIcon={<Plus aria-hidden="true" size={14} />}
                >
                  Add draft order
                </Button>
              </div>
            </form>

            <div className="mt-6 overflow-x-auto rounded-md border border-border-subtle">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">Urgency</th>
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {orders.length ? orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-xs font-semibold text-ink-primary">{order.name}</td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">{order.type}</td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">{order.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={order.urgency === "Urgent" ? "critical" : "neutral"}>{order.urgency}</StatusBadge>
                      </td>
                      <td className="px-4 py-3"><StatusBadge>{order.status}</StatusBadge></td>
                      <td className="px-4 py-3 text-right">
                        {!documentationLocked ? (
                          <Button
                            variant="tertiary"
                            size="sm"
                            className="spine-button--critical-text"
                            onClick={() => {
                              setOrders((current) => current.filter((item) => item.id !== order.id));
                              markDraftChanged();
                            }}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-secondary">No draft orders.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </PanelBody>
        </Panel>

        <Panel elevation="flat">
          <PanelHeader>
            <div className="flex gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                <Pill aria-hidden="true" size={17} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Medication</p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">Prescription draft</h2>
              </div>
            </div>
            <StatusBadge tone={allergiesVerified && medicationsReconciled ? "success" : "warning"}>
              {allergiesVerified && medicationsReconciled ? "Safety context verified" : "Checks required"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {!allergiesVerified || !medicationsReconciled ? (
              <Alert tone="critical" title="Prescription controls locked">
                Return to clinical intake and verify allergies and current medications before adding a medicine.
              </Alert>
            ) : null}
            <form onSubmit={addMedication} className="mt-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  id="medication"
                  label="Medication"
                  value={medicationId}
                  disabled={documentationLocked || !allergiesVerified || !medicationsReconciled}
                  onChange={(event) => {
                    setMedicationId(event.target.value);
                    setSafetyOverrideReason("");
                  }}
                >
                  <option value="">Select medicine</option>
                  {medicationOptions.map((medication) => (
                    <option key={medication.id} value={medication.id}>{medication.name}</option>
                  ))}
                </SelectField>
                <SelectField
                  id="frequency"
                  label="Frequency"
                  value={medicationFrequency}
                  disabled={documentationLocked}
                  onChange={(event) => setMedicationFrequency(event.target.value)}
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="As needed">As needed</option>
                </SelectField>
                <TextField
                  id="medication-duration"
                  label="Duration"
                  placeholder="e.g. 5 days"
                  value={medicationDuration}
                  disabled={documentationLocked}
                  onChange={(event) => setMedicationDuration(event.target.value)}
                />
                <TextField
                  id="medication-instructions"
                  label="Patient instructions"
                  placeholder="e.g. after food"
                  value={medicationInstructions}
                  disabled={documentationLocked}
                  onChange={(event) => setMedicationInstructions(event.target.value)}
                />
              </div>

              {allergyMatches.length > 0 ? (
                <Alert tone="critical" title="Recorded allergy match" className="mt-4">
                  {selectedMedication?.name} matches {allergyMatches.join(", ")}. This medication cannot be added to the draft.
                </Alert>
              ) : null}
              {interactionMatches.length > 0 ? (
                <div className="mt-4">
                  <Alert tone="warning" title="Potential medication interaction requires review">
                    This selection matches the current medication term {interactionMatches.join(", ")}.
                    Record your clinical rationale; the system is not making a prescribing decision.
                  </Alert>
                  <TextareaField
                    id="interaction-rationale"
                    label="Clinical review rationale"
                    className="mt-4 min-h-20"
                    value={safetyOverrideReason}
                    disabled={documentationLocked}
                    onChange={(event) => setSafetyOverrideReason(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={documentationLocked || !allergiesVerified || !medicationsReconciled}
                  startIcon={<Plus aria-hidden="true" size={14} />}
                >
                  Add to prescription draft
                </Button>
              </div>
            </form>

            <div className="mt-6 divide-y divide-border-subtle border-t border-border-subtle">
              {prescription.length ? prescription.map((line) => (
                <div key={line.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">{line.medication}</p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {line.frequency} · {line.duration} · {line.instructions}
                    </p>
                    {line.safetyNote ? (
                      <p className="mt-2 text-[10px] font-semibold text-warning">{line.safetyNote}</p>
                    ) : null}
                  </div>
                  {!documentationLocked ? (
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="spine-button--critical-text"
                      onClick={() => {
                        setPrescription((current) => current.filter((item) => item.id !== line.id));
                        markDraftChanged();
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              )) : (
                <p className="py-6 text-center text-xs text-ink-secondary">No medication in this prescription draft.</p>
              )}
            </div>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  function renderClose() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <SectionIntro
              eyebrow="Step 4 of 4"
              title="Safety review and signature"
              description="Signing makes the clinical record final. Review completeness, saved state and downstream actions before attesting."
              icon={FileCheck2}
            />
            <StatusBadge tone={noteSigned ? "success" : readyToSign ? "information" : "warning"}>
              {noteSigned ? "Signed v1" : readyToSign ? "Ready for attestation" : "Checks incomplete"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {signingReadiness.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-md border px-3 py-2.5",
                    item.done
                      ? "border-success/25 bg-success-surface"
                      : "border-warning/30 bg-warning-surface",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 aria-hidden="true" size={16} className="shrink-0 text-success" />
                  ) : (
                    <AlertTriangle aria-hidden="true" size={16} className="shrink-0 text-warning" />
                  )}
                  <span className="text-xs font-semibold text-ink-primary">{item.label}</span>
                </div>
              ))}
            </div>

            {!noteSigned ? (
              <div className="mt-6 border-t border-border-subtle pt-6">
                <Alert tone="warning" title="Signing is consequential and requires synchronization">
                  Once signed, the SOAP note, diagnoses, orders and prescription become version 1 and cannot be edited in place.
                </Alert>
                <CheckboxField
                  id="signature-attestation"
                  label="I reviewed this patient, safety context and final record"
                  description="I confirm this documentation reflects my clinical judgement and is ready to sign."
                  className="mt-4"
                  checked={signatureAttested}
                  disabled={!readyToSign}
                  onChange={(event) => setSignatureAttested(event.target.checked)}
                />
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <Button
                    variant="secondary"
                    startIcon={<Save aria-hidden="true" size={14} />}
                    disabled={!draftDirty}
                    onClick={saveDraft}
                  >
                    Save latest draft
                  </Button>
                  <Button
                    disabled={!readyToSign || !signatureAttested}
                    startIcon={<ShieldCheck aria-hidden="true" size={15} />}
                    onClick={signClinicalNote}
                  >
                    Sign clinical note
                  </Button>
                </div>
              </div>
            ) : (
              <Alert tone="success" title="Clinical note signed and locked" className="mt-6">
                Version 1 signed {signedAt}. Corrections use a linked addendum; the original remains intact.
              </Alert>
            )}
          </PanelBody>
        </Panel>

        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Visit completion</p>
              <h2 className="mt-2 text-base font-semibold text-ink-primary">Disposition and handoff</h2>
            </div>
            <StatusBadge tone={encounterCompleted ? "success" : noteSigned ? "information" : "warning"}>
              {encounterCompleted ? "Encounter completed" : noteSigned ? "Closure available" : "Signature required"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {encounterCompleted ? (
              <div className="space-y-4">
                <Alert tone="success" title="OPD visit completed">
                  The visit summary is ready for diagnostics, billing, patient instructions and follow-up workflows.
                </Alert>
                <div className="flex flex-wrap justify-end gap-3">
                  {orders.some((order) =>
                    ["Laboratory", "Radiology"].includes(order.type),
                  ) ? (
                    <ButtonLink
                      href={`/diagnostics?patient=${patient.id}&encounter=${encounterId}`}
                      startIcon={<FlaskConical aria-hidden="true" size={15} />}
                    >
                      Open diagnostics handoff
                    </ButtonLink>
                  ) : null}
                  {prescription.length ? (
                    <ButtonLink
                      href={`/pharmacy?patient=${patient.id}&encounter=${encounterId}`}
                      startIcon={<Pill aria-hidden="true" size={15} />}
                    >
                      Open pharmacy handoff
                    </ButtonLink>
                  ) : null}
                  <ButtonLink
                    href={`/billing?patient=${patient.id}&encounter=${encounterId}`}
                    startIcon={<CreditCard aria-hidden="true" size={15} />}
                  >
                    Open billing handoff
                  </ButtonLink>
                </div>
              </div>
            ) : null}
            <div className={cn("grid gap-5 lg:grid-cols-2", encounterCompleted && "mt-5")}>
              <SelectField
                id="disposition"
                label="Disposition"
                value={disposition}
                disabled={!noteSigned || encounterCompleted}
                onChange={(event) => setDisposition(event.target.value)}
              >
                <option value="">Select disposition</option>
                <option value="Discharge from OPD">Discharge from OPD</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Internal referral">Internal referral</option>
                <option value="Emergency escalation">Emergency escalation</option>
              </SelectField>
              <TextField
                id="follow-up-date"
                label="Follow-up date"
                description={disposition === "Follow-up" ? "Required for follow-up disposition" : "Optional"}
                type="date"
                value={followUpDate}
                disabled={!noteSigned || encounterCompleted}
                onChange={(event) => setFollowUpDate(event.target.value)}
              />
            </div>
            <TextareaField
              id="patient-instructions"
              label="Patient instructions and return precautions"
              description="Use plain language suitable for the patient's preferred language and context."
              className="mt-5"
              value={patientInstructions}
              disabled={!noteSigned || encounterCompleted}
              onChange={(event) => setPatientInstructions(event.target.value)}
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <CheckboxField
                id="orders-reviewed"
                label="Orders and prescription reviewed"
                description={`${orders.length} orders and ${prescription.length} medication lines will be included in the visit summary.`}
                checked={ordersReviewed}
                disabled={!noteSigned || encounterCompleted}
                onChange={(event) => setOrdersReviewed(event.target.checked)}
              />
              <CheckboxField
                id="closure-confirmed"
                label="Patient communication confirmed"
                description="Disposition, instructions and warning signs were reviewed with the patient or authorised caregiver."
                checked={closureConfirmed}
                disabled={!noteSigned || encounterCompleted}
                onChange={(event) => setClosureConfirmed(event.target.checked)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                disabled={!readyToComplete || encounterCompleted}
                startIcon={<UserRoundCheck aria-hidden="true" size={15} />}
                onClick={completeEncounter}
              >
                Complete encounter & hand off
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <ButtonLink
            href="/appointments"
            variant="tertiary"
            size="sm"
            className="-ml-3"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
          >
            Back to appointments & queue
          </ButtonLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Integrated OPD · Consultation
            </p>
            <StatusBadge>Illustrative session data</StatusBadge>
            <StatusBadge tone={encounterCompleted ? "success" : noteSigned ? "information" : "warning"}>
              {encounterCompleted ? "Completed" : noteSigned ? "Signed" : "Draft encounter"}
            </StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Clinical consultation workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Verify clinical intake, document the encounter, prepare orders and complete a governed OPD handoff.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            tone={
              draftDirty
                ? "warning"
                : draftSavedAt === "Not saved in this session"
                  ? "neutral"
                  : "success"
            }
            showDot
          >
            {draftDirty ? "Unsaved changes" : draftSavedAt}
          </StatusBadge>
          <Button
            variant="secondary"
            size="sm"
            disabled={!draftDirty || noteSigned || !hasClinicalHandoff}
            startIcon={<Save aria-hidden="true" size={14} />}
            onClick={saveDraft}
          >
            Save draft
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <PatientContextBar
          name={patient.name}
          age={patient.age}
          sex={patient.sex}
          mrn={patient.mrn}
          encounter={encounterId}
          location={activeAppointment.room}
          clinician={activeAppointment.clinician}
          allergies={patient.allergies}
          verifiedAt={identityConfirmed ? "this session" : "nursing handoff"}
        />
      </div>

      {notice ? (
        <Alert tone={notice.tone} title={notice.title} className="mt-5">
          {notice.message}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0">
          <div className="overflow-x-auto border-b border-border-subtle" role="tablist" aria-label="Consultation sections">
            <div className="spine-segmented-control min-w-max">
              {sectionItems.map((section) => {
                const Icon = section.icon;
                const sectionDone =
                  section.id === "intake"
                    ? intakeComplete
                    : section.id === "note"
                      ? soapComplete && diagnoses.length > 0
                      : section.id === "orders"
                        ? orders.length + prescription.length > 0
                        : encounterCompleted;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSection === section.id}
                    className="spine-segmented-control__item"
                    data-active={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon aria-hidden="true" size={15} />
                    {section.label}
                    {sectionDone ? <CheckCircle2 aria-hidden="true" size={13} className="text-success" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {activeSection === "intake" ? renderIntake() : null}
            {activeSection === "note" ? renderNote() : null}
            {activeSection === "orders" ? renderOrders() : null}
            {activeSection === "close" ? renderClose() : null}
          </div>
        </main>

        <aside className="space-y-6 2xl:sticky 2xl:top-[88px] 2xl:self-start" aria-label="Patient clinical context">
          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Activity aria-hidden="true" size={16} className="text-action" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Encounter state</p>
                  <h2 className="mt-1 text-sm font-semibold text-ink-primary">Workflow summary</h2>
                </div>
              </div>
            </PanelHeader>
            <PanelBody>
              <dl className="divide-y divide-border-subtle text-xs">
                {[
                  ["Token", activeAppointment.token ?? "Clinical handoff"],
                  ["Service", activeAppointment.department],
                  ["Location", activeAppointment.room],
                  ["Note", noteSigned ? "Signed v1" : draftDirty ? "Unsaved draft" : "Saved draft"],
                  ["Orders", `${orders.length} draft`],
                  ["Prescription", `${prescription.length} lines`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 py-3 first:pt-0">
                    <dt className="text-ink-tertiary">{label}</dt>
                    <dd className="text-right font-semibold text-ink-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Pill aria-hidden="true" size={16} className="text-action" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Medication safety</p>
                  <h2 className="mt-1 text-sm font-semibold text-ink-primary">Current context</h2>
                </div>
              </div>
            </PanelHeader>
            <PanelBody>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">Allergies</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patient.allergies?.length ? patient.allergies.map((allergy) => (
                    <StatusBadge key={allergy} tone="critical">{allergy}</StatusBadge>
                  )) : <StatusBadge tone="warning">None recorded · unverified</StatusBadge>}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">Current medications</p>
                <ul className="mt-2 space-y-2 text-xs text-ink-primary">
                  {profile.currentMedications.map((medication) => (
                    <li key={medication} className="rounded-md bg-surface-subtle px-3 py-2">{medication}</li>
                  ))}
                </ul>
              </div>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Beaker aria-hidden="true" size={16} className="text-action" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Recent results</p>
                  <h2 className="mt-1 text-sm font-semibold text-ink-primary">Source and freshness</h2>
                </div>
              </div>
            </PanelHeader>
            <PanelBody>
              {profile.recentResults.length ? (
                <div className="divide-y divide-border-subtle">
                  {profile.recentResults.map((result) => (
                    <div key={`${result.name}-${result.collectedAt}`} className="py-3 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-ink-primary">{result.name}</p>
                          <p className="spine-mono mt-1 text-xs text-ink-primary">{result.value}</p>
                        </div>
                        <StatusBadge tone={result.status === "Normal" ? "success" : "warning"}>{result.status}</StatusBadge>
                      </div>
                      <p className="mt-2 text-[10px] text-ink-tertiary">Reference {result.reference}</p>
                      <p className="mt-1 text-[10px] text-ink-tertiary">Collected {result.collectedAt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-ink-secondary">No recent result is linked to this encounter.</p>
              )}
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <History aria-hidden="true" size={16} className="text-action" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">Clinical timeline</p>
                  <h2 className="mt-1 text-sm font-semibold text-ink-primary">Previous visits</h2>
                </div>
              </div>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-4">
                {profile.priorVisits.map((visit) => (
                  <div key={`${visit.date}-${visit.service}`} className="border-l-2 border-border-default pl-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-action">{visit.date}</p>
                    <p className="mt-1 text-xs font-semibold text-ink-primary">{visit.service}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-secondary">{visit.summary}</p>
                    <p className="mt-1 text-[10px] text-ink-tertiary">{visit.clinician}</p>
                  </div>
                ))}
              </div>
            </PanelBody>
          </Panel>

          <Alert tone="information" title="Prototype boundary">
            This workspace demonstrates governed clinical operations. It does not diagnose, transmit orders, prescribe, bill or write records to Supabase.
          </Alert>
        </aside>
      </div>

      {!hasClinicalHandoff ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-graphite/30 p-5 backdrop-blur-[2px]">
          <Panel className="w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="handoff-required-title">
            <PanelBody className="p-6">
              <span className="grid size-11 place-items-center rounded-full bg-critical-surface text-critical">
                <LockKeyhole aria-hidden="true" size={20} />
              </span>
              <h2 id="handoff-required-title" className="mt-4 text-lg font-semibold text-ink-primary">Clinical handoff required</h2>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                Consultation documentation cannot begin from a scheduled or waiting appointment. Explicitly start the consultation from the live queue first.
              </p>
              <ButtonLink href="/appointments" fullWidth className="mt-5" startIcon={<Stethoscope aria-hidden="true" size={15} />}>
                Return to live queue
              </ButtonLink>
            </PanelBody>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
