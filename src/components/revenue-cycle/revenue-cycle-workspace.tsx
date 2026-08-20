"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  ReceiptIndianRupee,
  ScrollText,
  Wallet,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Alert,
  AgingReceivablesLadder,
  Button,
  CheckboxField,
  Panel,
  PanelBody,
  PanelHeader,
  ProcessStageTracker,
  SelectField,
  StatusBadge,
  TextField,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  buildAppealStages,
  buildSubmittedClaimStages,
  payerRoster,
  prototypeAgingBuckets,
  prototypeClaims,
  prototypeDenials,
  type ClaimSummary,
  type DenialRecord,
} from "@/data/revenue-cycle";

type ClaimStep = "intake" | "authorization" | "coding";

type IntakeDraft = {
  patient: string;
  payer: string;
  amount: string;
};

type AuthorizationDraft = {
  authorizationOnFile: boolean;
};

type CodingDraft = {
  primaryDiagnosis: string;
  cptCode: string;
};

const initialIntake: IntakeDraft = { patient: "", payer: payerRoster[0], amount: "" };
const initialAuthorization: AuthorizationDraft = { authorizationOnFile: true };
const initialCoding: CodingDraft = { primaryDiagnosis: "", cptCode: "" };

function ClaimStepper({ step }: { step: ClaimStep }) {
  const steps: { id: ClaimStep; label: string }[] = [
    { id: "intake", label: "Patient & payer" },
    { id: "authorization", label: "Authorization" },
    { id: "coding", label: "Coding & submission" },
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
      setError("Enter the patient's name before filing the claim.");
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
              Patient financial access
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              File a new claim
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 md:grid-cols-2">
          <TextField
            id="rcm-intake-patient"
            label="Patient name"
            value={draft.patient}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, patient: event.target.value });
              setError(undefined);
            }}
            fieldClassName="md:col-span-2"
            placeholder="e.g. Meera Nair"
          />
          <SelectField
            id="rcm-intake-payer"
            label="Payer"
            value={draft.payer}
            onChange={(event) => onChange({ ...draft, payer: event.target.value })}
          >
            {payerRoster.map((payer) => (
              <option key={payer}>{payer}</option>
            ))}
          </SelectField>
          <TextField
            id="rcm-intake-amount"
            label="Claim amount"
            value={draft.amount}
            onChange={(event) => onChange({ ...draft, amount: event.target.value })}
            placeholder="e.g. ₹24,500"
          />
        </PanelBody>
      </Panel>

      <Button className="mt-6" type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
        Continue to authorization check
      </Button>
    </form>
  );
}

function AuthorizationStep({
  draft,
  onChange,
  onProceed,
  onBack,
}: {
  draft: AuthorizationDraft;
  onChange: (draft: AuthorizationDraft) => void;
  onProceed: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Authorization &amp; utilization review
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Confirm prior authorization
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <CheckboxField
            id="rcm-auth-onfile"
            label="Prior authorization on file"
            checked={draft.authorizationOnFile}
            onChange={(event) => onChange({ authorizationOnFile: event.target.checked })}
          />
          {!draft.authorizationOnFile ? (
            <Alert tone="warning" title="Claim will submit blocked at adjudication">
              Without authorization on file, this claim is likely to pend or deny. It will still
              be filed, flagged for follow-up before payer submission.
            </Alert>
          ) : null}
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back
        </Button>
        <Button type="button" endIcon={<ArrowRight aria-hidden="true" size={14} />} onClick={onProceed}>
          Continue to coding
        </Button>
      </div>
    </div>
  );
}

function CodingStep({
  draft,
  onChange,
  onConfirm,
  onBack,
}: {
  draft: CodingDraft;
  onChange: (draft: CodingDraft) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.cptCode.trim()) {
      setError("Enter a CPT/procedure code before submitting the claim.");
      return;
    }
    onConfirm();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Revenue capture &amp; coding
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Code and submit
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="grid gap-5 md:grid-cols-2">
          <TextField
            id="rcm-coding-diagnosis"
            label="Primary diagnosis (ICD)"
            value={draft.primaryDiagnosis}
            onChange={(event) => onChange({ ...draft, primaryDiagnosis: event.target.value })}
            placeholder="e.g. I21.4"
          />
          <TextField
            id="rcm-coding-cpt"
            label="CPT / procedure code"
            value={draft.cptCode}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, cptCode: event.target.value });
              setError(undefined);
            }}
            placeholder="e.g. 99223"
          />
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back
        </Button>
        <Button type="submit" endIcon={<CheckCircle2 aria-hidden="true" size={14} />}>
          Submit claim
        </Button>
      </div>
    </form>
  );
}

function ClaimCompleteView({
  intake,
  onReturnToBoard,
}: {
  intake: IntakeDraft;
  onReturnToBoard: () => void;
}) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Claim submitted
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            In the claim lifecycle queue
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {intake.patient}&apos;s claim to {intake.payer} is filed
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          It now appears on the Revenue Cycle board with a live stage tracker.
        </p>

        <Button className="mt-6" startIcon={<ArrowLeft aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to board
        </Button>
      </div>
    </div>
  );
}

function Board({
  claims,
  denials,
  onStartClaim,
  onAppeal,
}: {
  claims: ClaimSummary[];
  denials: DenialRecord[];
  onStartClaim: () => void;
  onAppeal: (id: string) => void;
}) {
  const blockedClaims = claims.filter((claim) =>
    claim.stages.some((stage) => stage.status === "blocked"),
  ).length;
  const openDenials = denials.filter((denial) => !denial.appealed);

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Financial operations & revenue cycle"
        title="Revenue cycle management"
        description="Claim lifecycle status, accounts receivable aging and denial recovery all reuse the same platform primitives as clinical workflows."
        action={
          <Button startIcon={<ScrollText aria-hidden="true" size={15} />} onClick={onStartClaim}>
            File new claim
          </Button>
        }
      />

      <MetricsRow
        metrics={[
          { label: "Claims in flight", value: String(claims.length), icon: ReceiptIndianRupee, tone: blockedClaims > 0 ? "warning" : "information", detail: `${blockedClaims} blocked on adjudication` },
          { label: "Total receivables", value: "₹7,11,000", icon: Wallet, tone: "information", detail: "58% current" },
          { label: "Open denials", value: String(openDenials.length), icon: FileWarning, tone: openDenials.length > 0 ? "warning" : "success", detail: "₹62,450 at risk" },
          { label: "90+ day receivables", value: "₹39,000", icon: AlertTriangle, tone: "critical", detail: "Needs collection action" },
        ]}
      />

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Claim submission &amp; adjudication
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">Claim lifecycle</h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-6">
          {claims.map((claim) => (
            <div key={claim.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">
                  {claim.patient} · {claim.payer}
                </p>
                <StatusBadge>{claim.amount}</StatusBadge>
              </div>
              <ProcessStageTracker stages={claim.stages} />
            </div>
          ))}
        </PanelBody>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Accounts receivable
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Aging summary</h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <AgingReceivablesLadder buckets={prototypeAgingBuckets} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Denial management
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">Open denials</h2>
            </div>
          </PanelHeader>
          <PanelBody className="space-y-3">
            {denials.map((denial) => (
              <div
                key={denial.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-subtle p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-ink-primary">{denial.patient}</p>
                  <p className="mt-1 text-[11px] text-ink-secondary">{denial.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <StatusBadge tone="warning">{denial.category}</StatusBadge>
                  <p className="spine-mono text-[10px] text-ink-tertiary">{denial.amount}</p>
                  {denial.appealed ? (
                    <StatusBadge tone="information">Appeal in progress</StatusBadge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => onAppeal(denial.id)}>
                      Start appeal
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}

export function RevenueCycleWorkspace() {
  const [claims, setClaims] = useState<ClaimSummary[]>(prototypeClaims);
  const [denials, setDenials] = useState<DenialRecord[]>(prototypeDenials);
  const [mode, setMode] = useState<"board" | "claim" | "complete">("board");
  const [step, setStep] = useState<ClaimStep>("intake");
  const [intake, setIntake] = useState<IntakeDraft>(initialIntake);
  const [authorization, setAuthorization] = useState<AuthorizationDraft>(initialAuthorization);
  const [coding, setCoding] = useState<CodingDraft>(initialCoding);
  const [lastIntake, setLastIntake] = useState<IntakeDraft | null>(null);

  function startClaim() {
    setIntake(initialIntake);
    setAuthorization(initialAuthorization);
    setCoding(initialCoding);
    setStep("intake");
    setMode("claim");
  }

  function handleSubmitClaim() {
    setClaims((current) => [
      {
        id: `clm-${Date.now()}`,
        patient: intake.patient,
        payer: intake.payer,
        amount: intake.amount || "₹0",
        stages: buildSubmittedClaimStages(authorization.authorizationOnFile),
      },
      ...current,
    ]);
    setLastIntake(intake);
    setMode("complete");
  }

  function appealDenial(id: string) {
    const denial = denials.find((item) => item.id === id);
    if (!denial) return;

    setDenials((current) =>
      current.map((item) => (item.id === id ? { ...item, appealed: true } : item)),
    );

    setClaims((current) => [
      {
        id: `clm-appeal-${id}`,
        patient: denial.patient,
        payer: "Payer under appeal",
        amount: denial.amount,
        stages: buildAppealStages(),
      },
      ...current,
    ]);
  }

  if (mode === "complete" && lastIntake) {
    return (
      <ClaimCompleteView
        intake={lastIntake}
        onReturnToBoard={() => {
          setMode("board");
          setLastIntake(null);
        }}
      />
    );
  }

  if (mode === "claim") {
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
          <ClaimStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "intake"
            ? "File a new claim"
            : step === "authorization"
              ? "Authorization check"
              : "Coding & submission"}
        </h1>

        <div className="mt-6">
          {step === "intake" ? (
            <IntakeStep draft={intake} onChange={setIntake} onProceed={() => setStep("authorization")} />
          ) : null}

          {step === "authorization" ? (
            <AuthorizationStep
              draft={authorization}
              onChange={setAuthorization}
              onProceed={() => setStep("coding")}
              onBack={() => setStep("intake")}
            />
          ) : null}

          {step === "coding" ? (
            <CodingStep
              draft={coding}
              onChange={setCoding}
              onConfirm={handleSubmitClaim}
              onBack={() => setStep("authorization")}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return <Board claims={claims} denials={denials} onStartClaim={startClaim} onAppeal={appealDenial} />;
}
