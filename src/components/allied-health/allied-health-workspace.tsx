"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  NotebookPen,
  Target,
  Users,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  Button,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  TextField,
  Timeline,
  type TimelineEntry,
} from "@naveenkishor305/spine-ui";

import { MetricsRow, ModulePageHeader } from "@/components/prototype/module-page-header";
import {
  prototypeGoalProgress,
  prototypeReferrals,
  prototypeSessionHistory,
  therapistRoster,
  type AlliedHealthReferral,
  type GoalProgress,
  type SessionOutcome,
} from "@/data/allied-health";

const statusLabel = {
  "pending-assignment": "Pending assignment",
  "in-progress": "In progress",
  completed: "Completed",
} as const;

const statusTone = {
  "pending-assignment": "warning",
  "in-progress": "information",
  completed: "success",
} as const;

const outcomeLabel: Record<SessionOutcome, string> = {
  success: "Progress made",
  warning: "Setback / plan adjusted",
  neutral: "No change",
};

type SessionStep = "select" | "session" | "progress";

type SelectDraft = { goalId: string };
type SessionDraft = { note: string; outcome: SessionOutcome };
type ProgressDraft = { newProgress: number };

function SessionStepper({ step }: { step: SessionStep }) {
  const steps: { id: SessionStep; label: string }[] = [
    { id: "select", label: "Select goal" },
    { id: "session", label: "Session note" },
    { id: "progress", label: "Update progress" },
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

function SelectGoalStep({
  goals,
  draft,
  onChange,
  onProceed,
}: {
  goals: GoalProgress[];
  draft: SelectDraft;
  onChange: (draft: SelectDraft) => void;
  onProceed: () => void;
}) {
  return (
    <div className="max-w-2xl">
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Session documentation
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Which goal is this session for?
            </h2>
          </div>
        </PanelHeader>
        <PanelBody>
          <SelectField
            id="ah-session-goal"
            label="Patient & goal"
            value={draft.goalId}
            onChange={(event) => onChange({ goalId: event.target.value })}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.patient} · {goal.goal}
              </option>
            ))}
          </SelectField>
        </PanelBody>
      </Panel>

      <Button className="mt-6" endIcon={<ArrowRight aria-hidden="true" size={14} />} onClick={onProceed}>
        Continue to session note
      </Button>
    </div>
  );
}

function SessionNoteStep({
  goal,
  draft,
  onChange,
  onProceed,
  onBack,
}: {
  goal: GoalProgress;
  draft: SessionDraft;
  onChange: (draft: SessionDraft) => void;
  onProceed: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.note.trim()) {
      setError("Add a short note describing what happened in the session.");
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
              {goal.discipline}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              {goal.patient} · {goal.goal}
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-5">
          <TextField
            id="ah-session-note"
            label="Session note"
            value={draft.note}
            error={error}
            onChange={(event) => {
              onChange({ ...draft, note: event.target.value });
              setError(undefined);
            }}
            placeholder="What happened in this session?"
          />
          <SelectField
            id="ah-session-outcome"
            label="Outcome"
            value={draft.outcome}
            onChange={(event) => onChange({ ...draft, outcome: event.target.value as SessionOutcome })}
          >
            <option value="success">{outcomeLabel.success}</option>
            <option value="warning">{outcomeLabel.warning}</option>
            <option value="neutral">{outcomeLabel.neutral}</option>
          </SelectField>
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back
        </Button>
        <Button type="submit" endIcon={<ArrowRight aria-hidden="true" size={14} />}>
          Continue to progress update
        </Button>
      </div>
    </form>
  );
}

function ProgressStep({
  goal,
  draft,
  onChange,
  onConfirm,
  onBack,
}: {
  goal: GoalProgress;
  draft: ProgressDraft;
  onChange: (draft: ProgressDraft) => void;
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
              Goal progress
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Update toward: {goal.goal}
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <p className="text-xs text-ink-secondary">Current progress: {goal.progress}%</p>
          <TextField
            id="ah-progress-value"
            label="New progress (%)"
            type="number"
            min={0}
            max={100}
            value={String(draft.newProgress)}
            onChange={(event) => onChange({ newProgress: Number(event.target.value) || 0 })}
          />
          <div className="h-2 rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full bg-action transition-all"
              style={{ width: `${Math.min(100, Math.max(0, draft.newProgress))}%` }}
            />
          </div>
        </PanelBody>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="tertiary" type="button" startIcon={<ArrowLeft aria-hidden="true" size={14} />} onClick={onBack}>
          Back
        </Button>
        <Button type="submit" endIcon={<CheckCircle2 aria-hidden="true" size={14} />}>
          Save session
        </Button>
      </div>
    </form>
  );
}

function SessionCompleteView({
  goal,
  onReturnToBoard,
}: {
  goal: GoalProgress;
  onReturnToBoard: () => void;
}) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Session logged
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            {goal.discipline}
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {goal.patient}&apos;s session is documented
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          The session note appears in the timeline and the goal&apos;s progress bar is updated.
        </p>

        <Button className="mt-6" startIcon={<ArrowLeft aria-hidden="true" size={15} />} onClick={onReturnToBoard}>
          Return to board
        </Button>
      </div>
    </div>
  );
}

function Board({
  referrals,
  goals,
  sessionHistory,
  onAcceptReferral,
  onStartSession,
}: {
  referrals: AlliedHealthReferral[];
  goals: GoalProgress[];
  sessionHistory: TimelineEntry[];
  onAcceptReferral: (id: string) => void;
  onStartSession: () => void;
}) {
  const urgentOpen = referrals.filter(
    (referral) => referral.priority === "urgent" && referral.status !== "completed",
  ).length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;
  const disciplinesEngaged = new Set(referrals.map((referral) => referral.discipline)).size;

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Rehabilitation, nutrition & social work"
        title="Allied health & care coordination"
        description="Referral triage, multidisciplinary goal tracking and session documentation compose from the same table, badge and timeline primitives used across the platform."
        action={
          <Button startIcon={<NotebookPen aria-hidden="true" size={15} />} onClick={onStartSession}>
            Log therapy session
          </Button>
        }
      />

      <MetricsRow
        metrics={[
          { label: "Open referrals", value: String(referrals.length), icon: ClipboardList, tone: urgentOpen > 0 ? "warning" : "information", detail: `${urgentOpen} urgent` },
          { label: "Active goals tracked", value: String(goals.length), icon: Target, tone: "information", detail: `Avg. ${avgProgress}% complete` },
          { label: "Disciplines engaged", value: String(disciplinesEngaged), icon: Users, tone: "success", detail: "Full multidisciplinary coverage" },
          { label: "Discharge coordination", value: String(referrals.filter((r) => r.status === "completed").length), icon: HeartHandshake, tone: "success", detail: "Ready for handoff" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Referral triage
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Discipline referrals
              </h2>
            </div>
            <StatusBadge>{referrals.length} referrals</StatusBadge>
          </PanelHeader>
          <ul aria-label="Allied health referrals">
            {referrals.map((referral) => (
              <li key={referral.id} className="border-b border-border-subtle p-4 last:border-b-0 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">{referral.patient}</p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {referral.discipline} · {referral.reason}
                    </p>
                    {referral.assignedTo ? (
                      <p className="mt-1 text-[11px] text-ink-tertiary">Assigned: {referral.assignedTo}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {referral.priority === "urgent" ? (
                      <StatusBadge tone="critical">Urgent</StatusBadge>
                    ) : null}
                    <StatusBadge tone={statusTone[referral.status]}>
                      {statusLabel[referral.status]}
                    </StatusBadge>
                    {referral.status === "pending-assignment" ? (
                      <Button size="sm" variant="secondary" onClick={() => onAcceptReferral(referral.id)}>
                        Accept &amp; assign
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Session history
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Recent sessions
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <Timeline entries={sessionHistory} />
          </PanelBody>
        </Panel>
      </div>

      <Panel className="mt-6">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Multidisciplinary goals
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-primary">
              Rehabilitation &amp; care plan progress
            </h2>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-ink-primary">
                  {goal.patient} · {goal.goal}
                </p>
                <StatusBadge>{goal.discipline}</StatusBadge>
              </div>
              <div className="h-2 rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-action transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-ink-tertiary">{goal.progress}% toward goal</p>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}

export function AlliedHealthWorkspace() {
  const [referrals, setReferrals] = useState<AlliedHealthReferral[]>(prototypeReferrals);
  const [goals, setGoals] = useState<GoalProgress[]>(prototypeGoalProgress);
  const [sessionHistory, setSessionHistory] = useState<TimelineEntry[]>(prototypeSessionHistory);
  const [mode, setMode] = useState<"board" | "session" | "complete">("board");
  const [step, setStep] = useState<SessionStep>("select");
  const [selectDraft, setSelectDraft] = useState<SelectDraft>({ goalId: prototypeGoalProgress[0]?.id ?? "" });
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>({ note: "", outcome: "success" });
  const [progressDraft, setProgressDraft] = useState<ProgressDraft>({ newProgress: 0 });
  const [lastGoal, setLastGoal] = useState<GoalProgress | null>(null);

  function acceptReferral(id: string) {
    setReferrals((current) =>
      current.map((referral) =>
        referral.id === id
          ? { ...referral, status: "in-progress", assignedTo: therapistRoster[referral.discipline] }
          : referral,
      ),
    );
  }

  function startSession() {
    const firstGoal = goals[0];
    setSelectDraft({ goalId: firstGoal?.id ?? "" });
    setSessionDraft({ note: "", outcome: "success" });
    setProgressDraft({ newProgress: firstGoal?.progress ?? 0 });
    setStep("select");
    setMode("session");
  }

  const selectedGoal = goals.find((goal) => goal.id === selectDraft.goalId) ?? goals[0];

  function handleGoalSelected() {
    setProgressDraft({ newProgress: Math.min(100, (selectedGoal?.progress ?? 0) + 10) });
    setStep("session");
  }

  function handleSaveSession() {
    if (!selectedGoal) return;

    setGoals((current) =>
      current.map((goal) =>
        goal.id === selectedGoal.id
          ? { ...goal, progress: Math.min(100, Math.max(0, progressDraft.newProgress)) }
          : goal,
      ),
    );

    setSessionHistory((current) => [
      {
        id: `s-${Date.now()}`,
        timestamp: "Just now",
        actor: therapistRoster[selectedGoal.discipline],
        description: `${selectedGoal.patient}: ${sessionDraft.note}`,
        tone: sessionDraft.outcome === "neutral" ? undefined : sessionDraft.outcome,
      },
      ...current,
    ]);

    setLastGoal(selectedGoal);
    setMode("complete");
  }

  if (mode === "complete" && lastGoal) {
    return (
      <SessionCompleteView
        goal={lastGoal}
        onReturnToBoard={() => {
          setMode("board");
          setLastGoal(null);
        }}
      />
    );
  }

  if (mode === "session" && selectedGoal) {
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
          <SessionStepper step={step} />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          {step === "select"
            ? "Log a therapy session"
            : step === "session"
              ? "Session note"
              : "Update goal progress"}
        </h1>

        <div className="mt-6">
          {step === "select" ? (
            <SelectGoalStep
              goals={goals}
              draft={selectDraft}
              onChange={setSelectDraft}
              onProceed={handleGoalSelected}
            />
          ) : null}

          {step === "session" ? (
            <SessionNoteStep
              goal={selectedGoal}
              draft={sessionDraft}
              onChange={setSessionDraft}
              onProceed={() => setStep("progress")}
              onBack={() => setStep("select")}
            />
          ) : null}

          {step === "progress" ? (
            <ProgressStep
              goal={selectedGoal}
              draft={progressDraft}
              onChange={setProgressDraft}
              onConfirm={handleSaveSession}
              onBack={() => setStep("session")}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Board
      referrals={referrals}
      goals={goals}
      sessionHistory={sessionHistory}
      onAcceptReferral={acceptReferral}
      onStartSession={startSession}
    />
  );
}
