"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Wind,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  Alert,
  Button,
  CheckboxField,
  Panel,
  PanelBody,
  PanelHeader,
  RiskScoreBadge,
  SelectField,
  SlotGrid,
  StatusBadge,
  SurgicalSafetyChecklist,
  TextField,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  buildInitialChecklistPhases,
  icuBeds,
  procedureTypes,
  prototypeIcuPatients,
  prototypeTheatreSchedule,
  sofaRiskLevel,
  surgeonRoster,
  type IcuPatient,
  type SafetyChecklistPhaseDraft,
  type SurgicalPriority,
  type TheatreCase,
} from "@/data/surgical-critical-care";

type BookingStep = "referral" | "checklist" | "disposition";

type ReferralDraft = {
  patientName: string;
  procedure: string;
  surgeon: string;
  theatreId: string;
  priority: SurgicalPriority;
  plannedTime: string;
};

type DispositionDraft = {
  destination: "recovery" | "icu";
  bed: string;
  sofaScore: number;
  ventilated: boolean;
  hemodynamicSupport: boolean;
  handoffNotes: string;
};

const initialReferral: ReferralDraft = {
  patientName: "",
  procedure: procedureTypes[0],
  surgeon: surgeonRoster[0],
  theatreId: prototypeTheatreSchedule[0].id,
  priority: "Elective",
  plannedTime: "",
};

const initialDisposition: DispositionDraft = {
  destination: "recovery",
  bed: icuBeds[0],
  sofaScore: 4,
  ventilated: false,
  hemodynamicSupport: false,
  handoffNotes: "",
};

function BookingStepper({ step }: { step: BookingStep }) {
  const steps: { id: BookingStep; label: string }[] = [
    { id: "referral", label: "Referral & planning" },
    { id: "checklist", label: "Safety checklist" },
    { id: "disposition", label: "Disposition" },
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

function ReferralStep({
  draft,
  onChange,
  onProceed,
}: {
  draft: ReferralDraft;
  onChange: (draft: ReferralDraft) => void;
  onProceed: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.patientName.trim()) {
      setError("Enter the patient's name before booking the case.");
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
              Referral &amp; planning
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Book the surgical case
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 md:grid-cols-2">
          <TextField
            id="sc-referral-name"
            label="Patient name"
            value={draft.patientName}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, patientName: event.target.value });
              setError(undefined);
            }}
            fieldClassName="md:col-span-2"
            placeholder="e.g. Devika Iyer"
          />
          <SelectField
            id="sc-referral-procedure"
            label="Procedure"
            value={draft.procedure}
            onChange={(event) => onChange({ ...draft, procedure: event.target.value })}
          >
            {procedureTypes.map((procedure) => (
              <option key={procedure}>{procedure}</option>
            ))}
          </SelectField>
          <SelectField
            id="sc-referral-surgeon"
            label="Lead surgeon"
            value={draft.surgeon}
            onChange={(event) => onChange({ ...draft, surgeon: event.target.value })}
          >
            {surgeonRoster.map((surgeon) => (
              <option key={surgeon}>{surgeon}</option>
            ))}
          </SelectField>
          <SelectField
            id="sc-referral-theatre"
            label="Theatre"
            value={draft.theatreId}
            onChange={(event) => onChange({ ...draft, theatreId: event.target.value })}
          >
            {prototypeTheatreSchedule.map((theatre) => (
              <option key={theatre.id} value={theatre.id}>
                {theatre.name}
              </option>
            ))}
          </SelectField>
          <TextField
            id="sc-referral-time"
            label="Planned time"
            value={draft.plannedTime}
            onChange={(event) => onChange({ ...draft, plannedTime: event.target.value })}
            placeholder="e.g. 14:30"
          />
          <SelectField
            id="sc-referral-priority"
            label="Priority"
            value={draft.priority}
            onChange={(event) =>
              onChange({ ...draft, priority: event.target.value as SurgicalPriority })
            }
          >
            <option>Elective</option>
            <option>Urgent</option>
            <option>Emergency</option>
          </SelectField>
        </PanelBody>
      </Panel>

      <Button className="mt-6" type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
        Continue to safety checklist
      </Button>
    </form>
  );
}

function ChecklistStep({
  patientName,
  phases,
  onItemToggle,
  onCompletePhase,
  onBack,
}: {
  patientName: string;
  phases: SafetyChecklistPhaseDraft[];
  onItemToggle: (phaseId: string, itemId: string) => void;
  onCompletePhase: (phaseId: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              WHO surgical safety checklist
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">{patientName}</h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <SurgicalSafetyChecklist
            phases={phases}
            onItemToggle={onItemToggle}
            onCompletePhase={onCompletePhase}
          />
        </PanelBody>
      </Panel>

      <Button
        className="mt-6"
        variant="tertiary"
        startIcon={<ArrowLeft aria-hidden="true" size={14} />}
        onClick={onBack}
      >
        Back to referral
      </Button>
    </div>
  );
}

function DispositionStep({
  draft,
  onChange,
  onConfirm,
}: {
  draft: DispositionDraft;
  onChange: (draft: DispositionDraft) => void;
  onConfirm: () => void;
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
              Post-op disposition
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Where does the patient go next?
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange({ ...draft, destination: "recovery" })}
              className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                draft.destination === "recovery"
                  ? "border-action bg-selected text-action"
                  : "border-border-default text-ink-secondary hover:border-action"
              }`}
            >
              <p className="font-semibold">Post-anesthesia recovery</p>
              <p className="mt-1 text-xs leading-5">
                Stable case, standard recovery monitoring before ward transfer.
              </p>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...draft, destination: "icu" })}
              className={`rounded-lg border p-4 text-left text-sm transition-colors ${
                draft.destination === "icu"
                  ? "border-action bg-selected text-action"
                  : "border-border-default text-ink-secondary hover:border-action"
              }`}
            >
              <p className="font-semibold">ICU admission</p>
              <p className="mt-1 text-xs leading-5">
                Requires ongoing critical care, ventilation or hemodynamic support.
              </p>
            </button>
          </div>

          {draft.destination === "icu" ? (
            <div className="space-y-5 rounded-lg border border-border-subtle p-4">
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  id="sc-disposition-bed"
                  label="ICU bed"
                  value={draft.bed}
                  onChange={(event) => onChange({ ...draft, bed: event.target.value })}
                >
                  {icuBeds.map((bed) => (
                    <option key={bed}>{bed}</option>
                  ))}
                </SelectField>
                <TextField
                  id="sc-disposition-sofa"
                  label="SOFA score"
                  type="number"
                  value={String(draft.sofaScore)}
                  onChange={(event) =>
                    onChange({ ...draft, sofaScore: Number(event.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckboxField
                  id="sc-disposition-ventilated"
                  label="Mechanically ventilated"
                  checked={draft.ventilated}
                  onChange={(event) => onChange({ ...draft, ventilated: event.target.checked })}
                />
                <CheckboxField
                  id="sc-disposition-vasopressor"
                  label="Vasopressor / hemodynamic support"
                  checked={draft.hemodynamicSupport}
                  onChange={(event) =>
                    onChange({ ...draft, hemodynamicSupport: event.target.checked })
                  }
                />
              </div>
              {draft.sofaScore >= 8 ? (
                <Alert tone="warning" title="High severity score">
                  A SOFA score of {draft.sofaScore} indicates significant organ dysfunction —
                  confirm intensivist handoff before leaving theatre.
                </Alert>
              ) : null}
            </div>
          ) : null}

          <TextField
            id="sc-disposition-notes"
            label="Handoff notes"
            value={draft.handoffNotes}
            onChange={(event) => onChange({ ...draft, handoffNotes: event.target.value })}
            placeholder="Fluid balance, drains, analgesia plan..."
          />
        </PanelBody>
      </Panel>

      <Button className="mt-6" type="submit" endIcon={<CheckCircle2 aria-hidden="true" size={14} />}>
        Confirm disposition
      </Button>
    </form>
  );
}

function IcuPatientRow({ patient }: { patient: IcuPatient }) {
  return (
    <li className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
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
        <RiskScoreBadge label="SOFA score" level={sofaRiskLevel(patient.sofaScore)} score={patient.sofaScore} />
      </div>
    </li>
  );
}

function Board({
  theatreSchedule,
  icuPatients,
  onStartBooking,
}: {
  theatreSchedule: typeof prototypeTheatreSchedule;
  icuPatients: IcuPatient[];
  onStartBooking: () => void;
}) {
  const metrics = useMemo(() => {
    const scheduled = theatreSchedule.reduce(
      (count, theatre) => count + theatre.slots.filter((slot) => slot.status === "booked").length,
      0,
    );
    const ventilated = icuPatients.filter((patient) => patient.ventilated).length;
    const critical = icuPatients.filter((patient) => sofaRiskLevel(patient.sofaScore) === "critical").length;
    return { scheduled, ventilated, critical };
  }, [theatreSchedule, icuPatients]);

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Surgical & critical care"
        title="Operating theatres & ICU"
        description="Theatre scheduling, the WHO surgical safety checklist and ICU severity scoring share the same platform components used across the rest of Hospital OS."
        action={
          <Button startIcon={<CalendarPlus aria-hidden="true" size={15} />} onClick={onStartBooking}>
            Book procedure
          </Button>
        }
      />

      <MetricsRow
        metrics={[
          { label: "Cases scheduled today", value: String(metrics.scheduled), icon: Activity, tone: "information", detail: "Across 2 theatres" },
          { label: "ICU beds occupied", value: `${icuPatients.length} / ${icuBeds.length}`, icon: HeartPulse, tone: "information", detail: `${icuBeds.length - icuPatients.length} beds available` },
          { label: "Patients ventilated", value: String(metrics.ventilated), icon: Wind, tone: metrics.ventilated > 0 ? "warning" : "success", detail: "Respiratory therapy notified" },
          { label: "Critical SOFA scores", value: String(metrics.critical), icon: ShieldCheck, tone: metrics.critical > 0 ? "critical" : "success", detail: metrics.critical > 0 ? "Intensivist review needed" : "All within range" },
        ]}
      />

      <Panel className="mt-6">
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
          {theatreSchedule.map((theatre) => (
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
          <StatusBadge>{icuPatients.length} patients</StatusBadge>
        </PanelHeader>
        <ul aria-label="ICU census">
          {icuPatients.map((patient) => (
            <IcuPatientRow key={patient.id} patient={patient} />
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function BookingCompleteView({
  referral,
  disposition,
  onReturnToBoard,
}: {
  referral: ReferralDraft;
  disposition: DispositionDraft;
  onReturnToBoard: () => void;
}) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Case complete
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            {disposition.destination === "icu" ? "Admitted to ICU" : "In recovery"}
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {referral.patientName}&apos;s {referral.procedure.toLowerCase()} is documented
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          The safety checklist, theatre slot and post-op disposition now appear on the
          Surgical &amp; critical care board.
        </p>

        <Panel className="mt-6">
          <PanelBody className="grid gap-3 text-xs text-ink-secondary sm:grid-cols-2">
            <p>
              <span className="font-semibold text-ink-primary">Surgeon:</span> {referral.surgeon}
            </p>
            <p>
              <span className="font-semibold text-ink-primary">Priority:</span> {referral.priority}
            </p>
            {disposition.destination === "icu" ? (
              <>
                <p>
                  <span className="font-semibold text-ink-primary">ICU bed:</span> {disposition.bed}
                </p>
                <p>
                  <span className="font-semibold text-ink-primary">SOFA score:</span>{" "}
                  {disposition.sofaScore}
                </p>
              </>
            ) : null}
          </PanelBody>
        </Panel>

        <Button className="mt-6" startIcon={<ArrowLeft aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to board
        </Button>
      </div>
    </div>
  );
}

export function SurgicalCriticalCareWorkspace() {
  const [theatreSchedule, setTheatreSchedule] = useState(prototypeTheatreSchedule);
  const [icuPatients, setIcuPatients] = useState<IcuPatient[]>(prototypeIcuPatients);
  const [mode, setMode] = useState<"board" | "booking" | "complete">("board");
  const [step, setStep] = useState<BookingStep>("referral");
  const [referral, setReferral] = useState<ReferralDraft>(initialReferral);
  const [checklistPhases, setChecklistPhases] = useState<SafetyChecklistPhaseDraft[]>(
    buildInitialChecklistPhases(),
  );
  const [disposition, setDisposition] = useState<DispositionDraft>(initialDisposition);
  const [lastCase, setLastCase] = useState<{ referral: ReferralDraft; disposition: DispositionDraft } | null>(
    null,
  );

  function startBooking() {
    setReferral(initialReferral);
    setChecklistPhases(buildInitialChecklistPhases());
    setDisposition(initialDisposition);
    setStep("referral");
    setMode("booking");
  }

  function handleItemToggle(phaseId: string, itemId: string) {
    setChecklistPhases((phases) =>
      phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : phase,
      ),
    );
  }

  function handleCompletePhase(phaseId: string) {
    setChecklistPhases((phases) => {
      const index = phases.findIndex((phase) => phase.id === phaseId);
      return phases.map((phase, phaseIndex) => {
        if (phaseIndex === index) return { ...phase, status: "complete" };
        if (phaseIndex === index + 1) return { ...phase, status: "current" };
        return phase;
      });
    });

    if (phaseId === "sign-out") {
      setStep("disposition");
    }
  }

  function handleDispositionConfirmed() {
    setTheatreSchedule((current) =>
      current.map((theatre) =>
        theatre.id === referral.theatreId
          ? {
              ...theatre,
              slots: theatre.slots.some((slot) => slot.status === "available")
                ? theatre.slots.map((slot): TheatreCase =>
                    slot.status === "available"
                      ? {
                          ...slot,
                          patient: referral.patientName,
                          procedure: referral.procedure,
                          surgeon: referral.surgeon,
                          time: referral.plannedTime || slot.time,
                          status: "booked",
                        }
                      : slot,
                  )
                : theatre.slots,
            }
          : theatre,
      ),
    );

    if (disposition.destination === "icu") {
      setIcuPatients((current) => [
        {
          id: `icu-${Date.now()}`,
          name: referral.patientName,
          bed: disposition.bed,
          diagnosis: `Post-op, ${referral.procedure.toLowerCase()}`,
          sofaScore: disposition.sofaScore,
          ventilated: disposition.ventilated,
          hemodynamicSupport: disposition.hemodynamicSupport,
          daysInIcu: 0,
        },
        ...current,
      ]);
    }

    setLastCase({ referral, disposition });
    setMode("complete");
  }

  if (mode === "complete" && lastCase) {
    return (
      <BookingCompleteView
        referral={lastCase.referral}
        disposition={lastCase.disposition}
        onReturnToBoard={() => {
          setMode("board");
          setLastCase(null);
        }}
      />
    );
  }

  if (mode === "booking") {
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
          <BookingStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "referral"
            ? "Book a surgical case"
            : step === "checklist"
              ? "Surgical safety checklist"
              : "Post-op disposition"}
        </h1>

        <div className="mt-6">
          {step === "referral" ? (
            <ReferralStep draft={referral} onChange={setReferral} onProceed={() => setStep("checklist")} />
          ) : null}

          {step === "checklist" ? (
            <ChecklistStep
              patientName={referral.patientName}
              phases={checklistPhases}
              onItemToggle={handleItemToggle}
              onCompletePhase={handleCompletePhase}
              onBack={() => setStep("referral")}
            />
          ) : null}

          {step === "disposition" ? (
            <DispositionStep
              draft={disposition}
              onChange={setDisposition}
              onConfirm={handleDispositionConfirmed}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return <Board theatreSchedule={theatreSchedule} icuPatients={icuPatients} onStartBooking={startBooking} />;
}
