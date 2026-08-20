"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Beaker,
  CheckCircle2,
  FilePlus2,
  Pill,
  ShieldAlert,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Alert,
  Button,
  CheckboxField,
  ComplianceCountdown,
  InteractionSeverityBadge,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  TextField,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  dispensingSettings,
  medicationRoster,
  prescriberRoster,
  prototypeCriticalResults,
  prototypeDispensingQueue,
  prototypeInteractionAlerts,
  type ClinicalDecision,
  type CriticalResult,
  type DispensingRequest,
  type InteractionAlert,
} from "@/data/diagnostics-pharmacy-ops";

const classificationLabel = {
  "immediate-emergency": "Immediate emergency",
  urgent: "Urgent",
  important: "Important",
} as const;

const dispensingStatusTone = {
  verification: "warning",
  compounding: "information",
  ready: "success",
  dispensed: "neutral",
} as const;

type RxStep = "intake" | "review" | "dispense";

type IntakeDraft = {
  patient: string;
  medication: string;
  prescriber: string;
  setting: DispensingRequest["setting"];
  controlled: boolean;
};

type ReviewDraft = {
  decision: ClinicalDecision | null;
  pharmacistNote: string;
};

type DispenseDraft = {
  dualSignOffConfirmed: boolean;
};

const initialIntake: IntakeDraft = {
  patient: "",
  medication: medicationRoster[0],
  prescriber: prescriberRoster[0],
  setting: "Inpatient",
  controlled: false,
};

const initialReview: ReviewDraft = { decision: null, pharmacistNote: "" };
const initialDispense: DispenseDraft = { dualSignOffConfirmed: false };

function RxStepper({ step }: { step: RxStep }) {
  const steps: { id: RxStep; label: string }[] = [
    { id: "intake", label: "Intake" },
    { id: "review", label: "Clinical review" },
    { id: "dispense", label: "Dispense" },
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

function IntakeStep({
  draft,
  onChange,
  onProceed,
}: {
  draft: IntakeDraft;
  onChange: (draft: IntakeDraft) => void;
  onProceed: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.patient.trim()) {
      setError("Enter the patient's name before verifying the prescription.");
      return;
    }
    onProceed();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Prescription intake
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Capture the new order
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 md:grid-cols-2">
          <TextField
            id="rx-intake-patient"
            label="Patient name"
            value={draft.patient}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, patient: event.target.value });
              setError(undefined);
            }}
            fieldClassName="md:col-span-2"
            placeholder="e.g. Lakshmi Pillai"
          />
          <SelectField
            id="rx-intake-medication"
            label="Medication"
            value={draft.medication}
            onChange={(event) => onChange({ ...draft, medication: event.target.value })}
          >
            {medicationRoster.map((medication) => (
              <option key={medication}>{medication}</option>
            ))}
          </SelectField>
          <SelectField
            id="rx-intake-prescriber"
            label="Prescriber"
            value={draft.prescriber}
            onChange={(event) => onChange({ ...draft, prescriber: event.target.value })}
          >
            {prescriberRoster.map((prescriber) => (
              <option key={prescriber}>{prescriber}</option>
            ))}
          </SelectField>
          <SelectField
            id="rx-intake-setting"
            label="Dispensing setting"
            value={draft.setting}
            onChange={(event) =>
              onChange({ ...draft, setting: event.target.value as DispensingRequest["setting"] })
            }
          >
            {dispensingSettings.map((setting) => (
              <option key={setting}>{setting}</option>
            ))}
          </SelectField>
          <CheckboxField
            id="rx-intake-controlled"
            label="Controlled substance"
            description="Requires dual sign-off before dispensing."
            checked={draft.controlled}
            onChange={(event) => onChange({ ...draft, controlled: event.target.checked })}
            className="md:col-span-2"
          />
        </PanelBody>
      </Panel>

      <Button className="mt-6" type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
        Continue to clinical review
      </Button>
    </form>
  );
}

function ReviewStep({
  intake,
  matchedAlerts,
  draft,
  onChange,
  onProceed,
  onBack,
}: {
  intake: IntakeDraft;
  matchedAlerts: InteractionAlert[];
  draft: ReviewDraft;
  onChange: (draft: ReviewDraft) => void;
  onProceed: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string>();
  const hasSevereAlert = matchedAlerts.some(
    (alert) => alert.severity === "contraindicated" || alert.severity === "major",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.decision) {
      setError("Record a clinical decision before continuing.");
      return;
    }
    onProceed();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Clinical review
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              {intake.patient} · {intake.medication}
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {matchedAlerts.length > 0 ? (
            <div className="space-y-2">
              {matchedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
                >
                  <p className="text-xs text-ink-secondary">{alert.pair}</p>
                  <InteractionSeverityBadge severity={alert.severity} />
                </div>
              ))}
              {hasSevereAlert ? (
                <Alert tone="critical" title="Severe interaction on file">
                  Contact the prescriber before dispensing, or document why the interaction is
                  clinically acceptable.
                </Alert>
              ) : null}
            </div>
          ) : (
            <StatusBadge tone="success">No interactions on file for this patient</StatusBadge>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                onChange({ ...draft, decision: "proceed" });
                setError(undefined);
              }}
              className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                draft.decision === "proceed"
                  ? "border-action bg-selected text-action"
                  : "border-border-default text-ink-secondary hover:border-action"
              }`}
            >
              <p className="font-semibold">Proceed to dispensing</p>
              <p className="mt-1 text-xs leading-5">
                No clinically significant concerns, or concerns already mitigated.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ ...draft, decision: "hold" });
                setError(undefined);
              }}
              className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                draft.decision === "hold"
                  ? "border-action bg-selected text-action"
                  : "border-border-default text-ink-secondary hover:border-action"
              }`}
            >
              <p className="font-semibold">Hold — contact prescriber</p>
              <p className="mt-1 text-xs leading-5">
                Order stays in verification until the prescriber responds.
              </p>
            </button>
          </div>
          {error ? <p className="text-xs font-medium text-error">{error}</p> : null}

          <TextField
            id="rx-review-note"
            label="Pharmacist note"
            value={draft.pharmacistNote}
            onChange={(event) => onChange({ ...draft, pharmacistNote: event.target.value })}
            placeholder="Rationale, prescriber contact outcome..."
          />
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back to intake
        </Button>
        <Button type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
          {draft.decision === "hold" ? "Confirm hold" : "Continue to dispensing"}
        </Button>
      </div>
    </form>
  );
}

function DispenseStep({
  intake,
  draft,
  onChange,
  onConfirm,
  onBack,
}: {
  intake: IntakeDraft;
  draft: DispenseDraft;
  onChange: (draft: DispenseDraft) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Setting-based dispensing
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              {intake.setting} · {intake.medication}
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {intake.controlled ? (
            <>
              <Alert tone="warning" title="Controlled substance">
                A second clinician must witness and countersign before this leaves the pharmacy.
              </Alert>
              <CheckboxField
                id="rx-dispense-dual-signoff"
                label="Dual sign-off witness confirmed"
                checked={draft.dualSignOffConfirmed}
                onChange={(event) => onChange({ dualSignOffConfirmed: event.target.checked })}
              />
            </>
          ) : (
            <StatusBadge tone="success">Standard dispensing — no additional sign-off required</StatusBadge>
          )}
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back to review
        </Button>
        <Button
          type="submit"
          disabled={intake.controlled && !draft.dualSignOffConfirmed}
          endIcon={<CheckCircle2 aria-hidden="true" size={14} />}
        >
          Confirm dispensing
        </Button>
      </div>
    </form>
  );
}

function Board({
  criticalResults,
  onAcknowledge,
  interactionAlerts,
  dispensingQueue,
  onStartRx,
}: {
  criticalResults: CriticalResult[];
  onAcknowledge: (id: string) => void;
  interactionAlerts: InteractionAlert[];
  dispensingQueue: DispensingRequest[];
  onStartRx: () => void;
}) {
  const unacknowledged = criticalResults.filter((result) => !result.acknowledgedBy).length;
  const contraindicated = interactionAlerts.filter((alert) => alert.severity === "contraindicated").length;
  const readyForPickup = dispensingQueue.filter((request) => request.status === "ready").length;
  const controlledOrders = dispensingQueue.filter((request) => request.controlled).length;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Clinical diagnostics, therapeutics & pharmacy"
        title="Diagnostics & pharmacy operations"
        description="Critical result escalation, drug interaction grading and controlled-substance dispensing share the same alert and badge language used everywhere else in Hospital OS."
        action={
          <Button startIcon={<FilePlus2 aria-hidden="true" size={15} />} onClick={onStartRx}>
            Verify new prescription
          </Button>
        }
      />

      <MetricsRow
        metrics={[
          { label: "Critical results open", value: String(criticalResults.length), icon: Beaker, tone: unacknowledged > 0 ? "critical" : "success", detail: `${unacknowledged} unacknowledged` },
          { label: "Interaction alerts", value: String(interactionAlerts.length), icon: AlertTriangle, tone: contraindicated > 0 ? "critical" : "warning", detail: `${contraindicated} contraindicated` },
          { label: "Dispensing queue", value: String(dispensingQueue.length), icon: Pill, tone: "information", detail: `${readyForPickup} ready for pickup` },
          { label: "Controlled substance orders", value: String(controlledOrders), icon: ShieldAlert, tone: "warning", detail: "Dual sign-off required" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-critical">
                Critical result management
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Escalation queue
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-4">
            {criticalResults.map((result) => (
              <Alert
                key={result.id}
                tone={result.classification === "immediate-emergency" ? "critical" : "warning"}
                title={`${result.patient} · ${result.test}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    {result.value} · {classificationLabel[result.classification]}
                  </span>
                  {result.acknowledgedBy ? (
                    <StatusBadge tone="success">Acknowledged · {result.acknowledgedBy}</StatusBadge>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ComplianceCountdown
                        label="Acknowledgement"
                        dueText={`${result.minutesSinceAlert} min since alert`}
                        overdue={result.minutesSinceAlert > 15}
                      />
                      <Button size="sm" variant="secondary" onClick={() => onAcknowledge(result.id)}>
                        Acknowledge
                      </Button>
                    </div>
                  )}
                </div>
              </Alert>
            ))}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Medication safety
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Drug interaction alerts
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {interactionAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{alert.patient}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{alert.pair}</p>
                </div>
                <InteractionSeverityBadge severity={alert.severity} />
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Pharmacy dispensing
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Setting-based dispensing queue
            </h2>
          </div>
          <StatusBadge>{dispensingQueue.length} orders</StatusBadge>
        </PanelHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                <th scope="col" className="px-5 py-3 font-semibold">Medication</th>
                <th scope="col" className="px-5 py-3 font-semibold">Setting</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {dispensingQueue.map((request) => (
                <tr key={request.id} className="hover:bg-surface-subtle/60">
                  <td className="px-5 py-4 text-xs font-semibold text-ink-primary">
                    {request.patient}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-primary">
                    {request.medication}
                    {request.controlled ? (
                      <StatusBadge tone="warning" className="ml-2">
                        Controlled
                      </StatusBadge>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-secondary">{request.setting}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={dispensingStatusTone[request.status]}>
                      {request.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function RxCompleteView({
  intake,
  review,
  onReturnToBoard,
}: {
  intake: IntakeDraft;
  review: ReviewDraft;
  onReturnToBoard: () => void;
}) {
  const held = review.decision === "hold";

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-xs font-bold uppercase tracking-[0.12em] ${held ? "text-warning" : "text-success"}`}>
            {held ? "Held for prescriber" : "Dispensing confirmed"}
          </p>
          <StatusBadge tone={held ? "warning" : "success"} icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            {held ? "Verification" : "Ready / dispensed"}
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {intake.patient}&apos;s {intake.medication} order
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          {held
            ? "The order stays in the verification queue until the prescriber responds."
            : "The order now appears on the pharmacy dispensing queue."}
        </p>

        <Panel className="mt-6">
          <PanelBody className="grid gap-3 text-xs text-ink-secondary sm:grid-cols-2">
            <p>
              <span className="font-semibold text-ink-primary">Prescriber:</span> {intake.prescriber}
            </p>
            <p>
              <span className="font-semibold text-ink-primary">Setting:</span> {intake.setting}
            </p>
          </PanelBody>
        </Panel>

        <Button className="mt-6" startIcon={<ArrowLeft aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to board
        </Button>
      </div>
    </div>
  );
}

export function DiagnosticsPharmacyOpsWorkspace() {
  const [criticalResults, setCriticalResults] = useState<CriticalResult[]>(prototypeCriticalResults);
  const [dispensingQueue, setDispensingQueue] = useState<DispensingRequest[]>(prototypeDispensingQueue);
  const [mode, setMode] = useState<"board" | "rx" | "complete">("board");
  const [step, setStep] = useState<RxStep>("intake");
  const [intake, setIntake] = useState<IntakeDraft>(initialIntake);
  const [review, setReview] = useState<ReviewDraft>(initialReview);
  const [dispense, setDispense] = useState<DispenseDraft>(initialDispense);
  const [lastRx, setLastRx] = useState<{ intake: IntakeDraft; review: ReviewDraft } | null>(null);

  function acknowledgeResult(id: string) {
    setCriticalResults((current) =>
      current.map((result) =>
        result.id === id ? { ...result, acknowledgedBy: "On-call clinician" } : result,
      ),
    );
  }

  function startRx() {
    setIntake(initialIntake);
    setReview(initialReview);
    setDispense(initialDispense);
    setStep("intake");
    setMode("rx");
  }

  function handleReviewSubmitted() {
    if (review.decision === "hold") {
      setDispensingQueue((current) => [
        {
          id: `dq-${Date.now()}`,
          patient: intake.patient,
          medication: intake.medication,
          setting: intake.setting,
          controlled: intake.controlled,
          status: "verification",
        },
        ...current,
      ]);
      setLastRx({ intake, review });
      setMode("complete");
      return;
    }
    setStep("dispense");
  }

  function handleDispenseConfirmed() {
    setDispensingQueue((current) => [
      {
        id: `dq-${Date.now()}`,
        patient: intake.patient,
        medication: intake.medication,
        setting: intake.setting,
        controlled: intake.controlled,
        status: "ready",
      },
      ...current,
    ]);
    setLastRx({ intake, review });
    setMode("complete");
  }

  if (mode === "complete" && lastRx) {
    return (
      <RxCompleteView
        intake={lastRx.intake}
        review={lastRx.review}
        onReturnToBoard={() => {
          setMode("board");
          setLastRx(null);
        }}
      />
    );
  }

  if (mode === "rx") {
    const matchedAlerts = prototypeInteractionAlerts.filter(
      (alert) => alert.patient.toLowerCase() === intake.patient.trim().toLowerCase(),
    );

    return (
      <div className="spine-page-container py-7 md:py-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMode("board")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-action hover:underline"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to board
          </button>
          <RxStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "intake"
            ? "Verify a new prescription"
            : step === "review"
              ? "Clinical review"
              : "Dispense"}
        </h1>

        <div className="mt-6">
          {step === "intake" ? (
            <IntakeStep draft={intake} onChange={setIntake} onProceed={() => setStep("review")} />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              intake={intake}
              matchedAlerts={matchedAlerts}
              draft={review}
              onChange={setReview}
              onProceed={handleReviewSubmitted}
              onBack={() => setStep("intake")}
            />
          ) : null}

          {step === "dispense" ? (
            <DispenseStep
              intake={intake}
              draft={dispense}
              onChange={setDispense}
              onConfirm={handleDispenseConfirmed}
              onBack={() => setStep("review")}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Board
      criticalResults={criticalResults}
      onAcknowledge={acknowledgeResult}
      interactionAlerts={prototypeInteractionAlerts}
      dispensingQueue={dispensingQueue}
      onStartRx={startRx}
    />
  );
}
