"use client";

import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileOutput,
  History,
  ListChecks,
  MessageSquareText,
  RefreshCw,
  Route,
  Search,
  Send,
  ShieldCheck,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import {
  Alert,
  Button,
  ButtonLink,
  CheckboxField,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  TextField,
  type StatusTone,
} from "@naveenkishor305/spine-ui";
import { prototypePatients } from "@/data/patients";
import {
  cloneVisitClosureRecords,
  type ClosureStatus,
  type DeliveryStatus,
  type VisitClosureRecord,
} from "@/data/visit-closure";
import { cn } from "@/lib/cn";

type WorkspaceView = "readiness" | "documents" | "continuity";
type WorklistFilter = "All" | "Action required" | "Ready" | "Closed";

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

function sessionTime() {
  return `${new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} · this session`;
}

function patientFor(record: VisitClosureRecord) {
  return prototypePatients.find(
    (patient) => patient.id === record.patientId && !patient.restricted,
  );
}

function closureTone(status: ClosureStatus): StatusTone {
  if (status === "Closed") return "success";
  if (status === "Ready for closure") return "information";
  if (status === "Exception review") return "warning";
  return "neutral";
}

function documentTone(status: DeliveryStatus): StatusTone {
  if (status === "Delivered") return "success";
  if (status === "Ready") return "information";
  if (status === "Failed") return "error";
  return "neutral";
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="spine-field" htmlFor={id}>
      <span className="spine-field__label">{label}</span>
      <textarea
        id={id}
        className="spine-input min-h-24 py-2.5 leading-6"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function VisitClosureWorkspace({
  initialPatientId,
  initialEncounterId,
}: {
  initialPatientId?: string;
  initialEncounterId?: string;
}) {
  const initialRecords = cloneVisitClosureRecords();
  const initialRecord =
    initialRecords.find(
      (record) =>
        (initialPatientId ? record.patientId === initialPatientId : true) &&
        (initialEncounterId ? record.encounterId === initialEncounterId : true),
    ) ?? initialRecords[0];

  const [records, setRecords] = useState(initialRecords);
  const [activeRecordId, setActiveRecordId] = useState(initialRecord.id);
  const [view, setView] = useState<WorkspaceView>("readiness");
  const [filter, setFilter] = useState<WorklistFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [notice, setNotice] = useState<Notice>({
    tone: "information",
    title: "Administrative closure handoff ready",
    message:
      "Signed clinical content is read-only. Delivery, follow-up and referral changes remain illustrative in this browser session.",
  });

  const [identityConfirmed, setIdentityConfirmed] = useState(
    Boolean(initialRecord.identityConfirmedAt),
  );
  const [medicationReconciled, setMedicationReconciled] = useState(
    initialRecord.medicationReconciled,
  );
  const [educationConfirmed, setEducationConfirmed] = useState(
    initialRecord.patientEducationConfirmed,
  );
  const [transitionPlanRecorded, setTransitionPlanRecorded] = useState(
    initialRecord.transitionPlanRecorded,
  );

  const [documentId, setDocumentId] = useState("");
  const [deliveryChannel, setDeliveryChannel] = useState("Printed");
  const [deliveryRecipient, setDeliveryRecipient] = useState("Patient");

  const [followUpStatus, setFollowUpStatus] = useState("Scheduled");
  const [followUpSpecialty, setFollowUpSpecialty] = useState("");
  const [followUpClinician, setFollowUpClinician] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [followUpException, setFollowUpException] = useState("");

  const [referralService, setReferralService] = useState("");
  const [referralUrgency, setReferralUrgency] = useState("Routine");
  const [referralProvider, setReferralProvider] = useState("");
  const [referralReason, setReferralReason] = useState("");

  const [taskCategory, setTaskCategory] = useState("Pending result");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskOwner, setTaskOwner] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");

  useEffect(() => {
    const syncConnectivity = () => setIsOnline(navigator.onLine);
    syncConnectivity();
    window.addEventListener("online", syncConnectivity);
    window.addEventListener("offline", syncConnectivity);
    return () => {
      window.removeEventListener("online", syncConnectivity);
      window.removeEventListener("offline", syncConnectivity);
    };
  }, []);

  const activeRecord =
    records.find((record) => record.id === activeRecordId) ?? records[0];
  const activePatient = patientFor(activeRecord)!;
  const recordLocked = activeRecord.status === "Closed";

  const updateActiveRecord = (
    updater: (record: VisitClosureRecord) => VisitClosureRecord,
  ) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === activeRecordId ? updater(record) : record,
      ),
    );
  };

  const followUpResolved =
    activeRecord.followUp.status === "Scheduled" ||
    activeRecord.followUp.status === "Not required" ||
    (activeRecord.followUp.status === "Unable to schedule" &&
      activeRecord.tasks.some(
        (task) =>
          task.category === "Follow-up" && task.status !== "Completed" && task.owner,
      ));
  const referralsResolved = activeRecord.referrals.every(
    (referral) =>
      ["Sent", "Accepted"].includes(referral.status) &&
      referral.clinicalSummarySent,
  );
  const requiredDocumentsDelivered = activeRecord.documents
    .filter((document) => document.required)
    .every((document) => document.status === "Delivered");
  const tasksRouted = activeRecord.tasks
    .filter((task) => task.status !== "Completed")
    .every((task) => Boolean(task.owner.trim() && task.dueAt.trim()));

  const readiness = [
    {
      label: "Clinical encounter completed and signed",
      done: activeRecord.clinicalEncounterComplete,
      detail: activeRecord.clinicalSignedAt ?? "Clinical completion missing",
    },
    {
      label: "Financial clearance recorded",
      done: activeRecord.financialClearance !== "Pending",
      detail: activeRecord.financialClearance,
    },
    {
      label: "Medication handoff complete or not required",
      done: activeRecord.pharmacyHandoff !== "Pending",
      detail: activeRecord.pharmacyHandoff,
    },
    {
      label: "Patient identity confirmed for closure",
      done: identityConfirmed,
      detail: identityConfirmed ? "Confirmed this session" : "Confirmation required",
    },
    {
      label: "Medication reconciliation verified",
      done: medicationReconciled,
      detail: medicationReconciled ? "Verified" : "Review required",
    },
    {
      label: "Patient or caregiver education completed",
      done: educationConfirmed,
      detail: educationConfirmed ? "Understanding confirmed" : "Education incomplete",
    },
    {
      label: "Required documents delivered",
      done: requiredDocumentsDelivered,
      detail: `${activeRecord.documents.filter((item) => item.status === "Delivered").length}/${activeRecord.documents.filter((item) => item.required).length} delivered`,
    },
    {
      label: "Follow-up scheduled or exception routed",
      done: followUpResolved,
      detail: activeRecord.followUp.status,
    },
    {
      label: "Referral handoffs completed",
      done: referralsResolved,
      detail: activeRecord.referrals.length
        ? `${activeRecord.referrals.filter((item) => item.clinicalSummarySent).length}/${activeRecord.referrals.length} sent`
        : "No referral ordered",
    },
    {
      label: "Unresolved work has owner and due time",
      done: tasksRouted,
      detail: `${activeRecord.tasks.filter((task) => task.status !== "Completed").length} open task(s)`,
    },
    {
      label: "High-risk transition plan recorded",
      done: activeRecord.riskLevel === "Standard" || transitionPlanRecorded,
      detail:
        activeRecord.riskLevel === "High risk"
          ? transitionPlanRecorded
            ? "Plan recorded"
            : "Required for high-risk transition"
          : "Not required",
    },
  ];
  const readyToClose = readiness.every((item) => item.done);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records.filter((record) => {
      const patient = patientFor(record);
      const matchesQuery =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.encounterId.toLowerCase().includes(query) ||
        patient?.name.toLowerCase().includes(query) ||
        patient?.mrn.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All" ||
        (filter === "Action required" &&
          ["Not ready", "Exception review"].includes(record.status)) ||
        (filter === "Ready" && record.status === "Ready for closure") ||
        (filter === "Closed" && record.status === "Closed");
      return matchesQuery && matchesFilter;
    });
  }, [filter, records, searchQuery]);

  const metrics = [
    {
      label: "Awaiting closure",
      value: records.filter((record) => record.status !== "Closed").length,
      detail: "Active administrative episodes",
      tone: "information" as StatusTone,
    },
    {
      label: "Exception review",
      value: records.filter((record) => record.status === "Exception review").length,
      detail: "Needs governed resolution",
      tone: "warning" as StatusTone,
    },
    {
      label: "Open continuity tasks",
      value: records.reduce(
        (sum, record) =>
          sum + record.tasks.filter((task) => task.status !== "Completed").length,
        0,
      ),
      detail: "Owned after-visit work",
      tone: "neutral" as StatusTone,
    },
    {
      label: "Closed this list",
      value: records.filter((record) => record.status === "Closed").length,
      detail: "Auditable closure complete",
      tone: "success" as StatusTone,
    },
  ];

  function selectRecord(record: VisitClosureRecord) {
    setActiveRecordId(record.id);
    setIdentityConfirmed(Boolean(record.identityConfirmedAt));
    setMedicationReconciled(record.medicationReconciled);
    setEducationConfirmed(record.patientEducationConfirmed);
    setTransitionPlanRecorded(record.transitionPlanRecorded);
    setDocumentId("");
    setNotice({
      tone: record.status === "Closed" ? "success" : "information",
      title: record.status === "Closed" ? "Closed visit opened read-only" : "Closure episode selected",
      message:
        record.status === "Closed"
          ? "Delivery evidence and continuity tasks remain visible; signed clinical content is unchanged."
          : "Review every readiness gate before administrative closure.",
    });
  }

  function saveVerification() {
    if (recordLocked) return;
    updateActiveRecord((record) => ({
      ...record,
      identityConfirmedAt: identityConfirmed ? sessionTime() : undefined,
      medicationReconciled,
      patientEducationConfirmed: educationConfirmed,
      transitionPlanRecorded,
    }));
    setNotice({
      tone: "success",
      title: "Closure verification saved",
      message:
        "Identity, medicines, education and transition-plan evidence were updated for this session.",
    });
  }

  function prepareDocument() {
    if (!documentId || recordLocked) {
      setNotice({
        tone: "warning",
        title: "Select an editable document",
        message: "Closed records are read-only and a document must be selected before preparation.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      documents: record.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status: "Ready",
              version: Math.max(1, document.version + 1),
              failureReason: undefined,
            }
          : document,
      ),
    }));
    setNotice({
      tone: "success",
      title: "Document prepared from finalized sources",
      message:
        "A new administrative document version is ready; finalized clinical documentation was not edited.",
    });
  }

  function recordDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const document = activeRecord.documents.find((item) => item.id === documentId);
    if (!isOnline) {
      setNotice({
        tone: "critical",
        title: "Delivery confirmation blocked while offline",
        message: "Reconnect before recording a patient or provider handoff.",
      });
      return;
    }
    if (!document || document.status === "Not prepared" || !deliveryRecipient.trim()) {
      setNotice({
        tone: "warning",
        title: "Delivery evidence is incomplete",
        message: "Select a prepared document and record its recipient and channel.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      documents: record.documents.map((item) =>
        item.id === documentId
          ? {
              ...item,
              status: "Delivered",
              channel: deliveryChannel as NonNullable<typeof item.channel>,
              recipient: deliveryRecipient.trim(),
              deliveredAt: sessionTime(),
              failureReason: undefined,
            }
          : item,
      ),
    }));
    setNotice({
      tone: "success",
      title: "Delivery evidence recorded",
      message: `${document.kind} was handed to ${deliveryRecipient.trim()} through ${deliveryChannel}.`,
    });
  }

  function saveFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recordLocked) return;
    if (!followUpReason.trim() || !followUpSpecialty.trim()) {
      setNotice({
        tone: "warning",
        title: "Follow-up plan is incomplete",
        message: "Record the specialty and clinical reason before saving the plan.",
      });
      return;
    }
    if (followUpStatus === "Scheduled" && (!followUpDate || !followUpTime)) {
      setNotice({
        tone: "warning",
        title: "Appointment date and time required",
        message: "A scheduled follow-up must include a confirmed date and time.",
      });
      return;
    }
    if (followUpStatus === "Unable to schedule" && !followUpException.trim()) {
      setNotice({
        tone: "warning",
        title: "Exception reason required",
        message: "Explain why follow-up could not be scheduled and route an owned task.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      followUp: {
        ...record.followUp,
        status: followUpStatus as typeof record.followUp.status,
        specialty: followUpSpecialty.trim(),
        clinician: followUpClinician.trim() || undefined,
        date: followUpStatus === "Scheduled" ? followUpDate : undefined,
        time: followUpStatus === "Scheduled" ? followUpTime : undefined,
        reason: followUpReason.trim(),
        reminderStatus:
          followUpStatus === "Scheduled" ? "Queued" : "Not queued",
        exceptionReason:
          followUpStatus === "Unable to schedule"
            ? followUpException.trim()
            : undefined,
      },
    }));
    setNotice({
      tone: followUpStatus === "Unable to schedule" ? "warning" : "success",
      title:
        followUpStatus === "Unable to schedule"
          ? "Follow-up exception recorded"
          : "Follow-up plan saved",
      message:
        followUpStatus === "Scheduled"
          ? "The appointment is confirmed and a reminder is queued for this session."
          : "The plan is saved; unresolved scheduling still requires an owned continuity task.",
    });
  }

  function createReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recordLocked) return;
    if (!referralService.trim() || !referralProvider.trim() || !referralReason.trim()) {
      setNotice({
        tone: "warning",
        title: "Referral details are incomplete",
        message: "Service, receiving provider and clinical reason are required.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      referrals: [
        ...record.referrals,
        {
          id: `REF-${Date.now().toString().slice(-8)}`,
          service: referralService.trim(),
          urgency: referralUrgency as "Routine" | "Priority" | "Urgent",
          receivingProvider: referralProvider.trim(),
          status: "Draft",
          clinicalSummarySent: false,
          reason: referralReason.trim(),
        },
      ],
      documents: record.documents.some(
        (document) => document.kind === "Referral summary",
      )
        ? record.documents
        : [
            ...record.documents,
            {
              id: `DOC-${record.encounterId.slice(-5)}-REF`,
              kind: "Referral summary",
              required: true,
              status: "Not prepared",
              version: 0,
            },
          ],
    }));
    setReferralService("");
    setReferralProvider("");
    setReferralReason("");
    setNotice({
      tone: "information",
      title: "Referral drafted",
      message: "Prepare and send the referral summary before visit closure.",
    });
  }

  function sendReferral(referralId: string) {
    if (!isOnline || recordLocked) {
      setNotice({
        tone: "critical",
        title: "Referral handoff blocked",
        message: "An online connection and an open closure episode are required.",
      });
      return;
    }
    const referralDocument = activeRecord.documents.find(
      (document) => document.kind === "Referral summary",
    );
    if (!referralDocument || referralDocument.status === "Not prepared") {
      setNotice({
        tone: "warning",
        title: "Referral summary is not prepared",
        message: "Prepare the referral document before sending it to the receiving provider.",
      });
      return;
    }
    const referral = activeRecord.referrals.find((item) => item.id === referralId);
    updateActiveRecord((record) => ({
      ...record,
      referrals: record.referrals.map((item) =>
        item.id === referralId
          ? {
              ...item,
              status: "Sent",
              clinicalSummarySent: true,
              sentAt: sessionTime(),
            }
          : item,
      ),
      documents: record.documents.map((document) =>
        document.kind === "Referral summary"
          ? {
              ...document,
              status: "Delivered",
              channel: "Receiving provider",
              recipient: referral?.receivingProvider ?? "Receiving provider",
              deliveredAt: sessionTime(),
            }
          : document,
      ),
    }));
    setNotice({
      tone: "success",
      title: "Receiving-provider handoff sent",
      message: "The referral and clinical summary now carry delivery evidence.",
    });
  }

  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recordLocked) return;
    if (!taskDescription.trim() || !taskOwner.trim() || !taskDueAt) {
      setNotice({
        tone: "warning",
        title: "Continuity task is incomplete",
        message: "Every unresolved item requires a description, accountable owner and due time.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      tasks: [
        ...record.tasks,
        {
          id: `TASK-${Date.now().toString().slice(-8)}`,
          category: taskCategory as typeof record.tasks[number]["category"],
          description: taskDescription.trim(),
          owner: taskOwner.trim(),
          dueAt: `${taskDueAt.replace("T", " ")} local`,
          status: "Open",
          createdAt: sessionTime(),
        },
      ],
    }));
    setTaskDescription("");
    setTaskOwner("");
    setTaskDueAt("");
    setNotice({
      tone: "success",
      title: "Unresolved work routed",
      message: "The task remains visible after closure with an owner and due time.",
    });
  }

  function completeTask(taskId: string) {
    if (recordLocked) {
      updateActiveRecord((record) => ({
        ...record,
        tasks: record.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "Completed",
                resolution: `Post-closure completion appended ${sessionTime()}`,
              }
            : task,
        ),
      }));
      setNotice({
        tone: "success",
        title: "Post-closure task completion appended",
        message:
          "The continuity task was resolved without reopening the visit or changing its closure evidence.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      tasks: record.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "Completed", resolution: `Completed ${sessionTime()}` }
          : task,
      ),
    }));
  }

  function closeVisit() {
    if (!isOnline) {
      setNotice({
        tone: "critical",
        title: "Visit closure blocked while offline",
        message: "Reconnect so delivery, task and closure evidence can be committed together.",
      });
      return;
    }
    if (!readyToClose) {
      setNotice({
        tone: "critical",
        title: "Visit is not ready to close",
        message: "Resolve every failed readiness gate or route the permitted exception first.",
      });
      return;
    }
    updateActiveRecord((record) => ({
      ...record,
      status: "Closed",
      identityConfirmedAt: record.identityConfirmedAt ?? sessionTime(),
      medicationReconciled,
      patientEducationConfirmed: educationConfirmed,
      transitionPlanRecorded,
      closedAt: sessionTime(),
      closedBy: "Authorized OPD coordinator · this session",
    }));
    setNotice({
      tone: "success",
      title: "Visit administratively closed",
      message:
        "The delivery audit is locked and unresolved continuity tasks remain active with their owners.",
    });
  }

  function renderWorklist() {
    return (
      <Panel elevation="flat" className="h-fit overflow-hidden">
        <PanelHeader>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
              Closure worklist
            </p>
            <h2 className="mt-1 text-base font-semibold text-ink-primary">
              Today&apos;s visit episodes
            </h2>
          </div>
          <StatusBadge>{filteredRecords.length} shown</StatusBadge>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <TextField
            id="closure-search"
            label="Search patient, MRN or encounter"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            endAdornment={<Search aria-hidden="true" size={15} />}
          />
          <SelectField
            id="closure-filter"
            label="Worklist filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value as WorklistFilter)}
          >
            <option>All</option>
            <option>Action required</option>
            <option>Ready</option>
            <option>Closed</option>
          </SelectField>
          <div className="space-y-2">
            {filteredRecords.map((record) => {
              const patient = patientFor(record);
              const selected = record.id === activeRecordId;
              return (
                <button
                  key={record.id}
                  type="button"
                  data-selected={selected}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors",
                    selected
                      ? "border-action bg-selected"
                      : "border-border-default bg-surface hover:border-action",
                  )}
                  onClick={() => selectRecord(record)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink-primary">
                        {patient?.name ?? "Protected patient"}
                      </p>
                      <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                        {record.encounterId} · {patient?.mrn}
                      </p>
                    </div>
                    <StatusBadge tone={closureTone(record.status)}>
                      {record.status}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-ink-secondary">
                    <span>{record.department}</span>
                    <span>
                      {record.tasks.filter((task) => task.status !== "Completed").length} open task(s)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </PanelBody>
      </Panel>
    );
  }

  function renderReadiness() {
    return (
      <div className="space-y-6">
        {recordLocked ? (
          <Alert tone="success" title="Administrative closure is locked">
            Closed {activeRecord.closedAt} by {activeRecord.closedBy}. Clinical content and delivery evidence are read-only.
          </Alert>
        ) : null}

        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Safety gate
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Closure readiness
              </h2>
            </div>
            <StatusBadge tone={readyToClose ? "success" : "warning"} showDot>
              {readiness.filter((item) => item.done).length}/{readiness.length} complete
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="grid gap-3 lg:grid-cols-2">
              {readiness.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-md border border-border-subtle bg-surface-subtle p-3"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                      item.done
                        ? "bg-success-surface text-success"
                        : "bg-warning-surface text-warning",
                    )}
                  >
                    {item.done ? (
                      <CheckCircle2 aria-hidden="true" size={14} />
                    ) : (
                      <Clock3 aria-hidden="true" size={14} />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink-primary">{item.label}</p>
                    <p className="mt-1 text-[10px] text-ink-secondary">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>

        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Patient departure verification
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Confirm understanding and safe handoff
              </h2>
            </div>
            <UserCheck aria-hidden="true" size={18} className="text-action" />
          </PanelHeader>
          <PanelBody className="space-y-3">
            <CheckboxField
              id="closure-identity"
              label="Patient identity confirmed"
              description="Match name, date of birth and MRN before handing over documents."
              checked={identityConfirmed}
              disabled={recordLocked}
              onChange={(event) => setIdentityConfirmed(event.target.checked)}
            />
            <CheckboxField
              id="closure-medication"
              label="Medication reconciliation completed"
              description="Patient understands what to start, continue, stop and when to seek help."
              checked={medicationReconciled}
              disabled={recordLocked}
              onChange={(event) => setMedicationReconciled(event.target.checked)}
            />
            <CheckboxField
              id="closure-education"
              label="Education and return precautions understood"
              description="Teach-back or caregiver confirmation has been recorded."
              checked={educationConfirmed}
              disabled={recordLocked}
              onChange={(event) => setEducationConfirmed(event.target.checked)}
            />
            {activeRecord.riskLevel === "High risk" ? (
              <CheckboxField
                id="closure-transition-plan"
                label="High-risk transition care plan recorded"
                description="Plan includes risks, contacts, medicines, warning signs and accountable follow-up."
                checked={transitionPlanRecorded}
                disabled={recordLocked}
                onChange={(event) => setTransitionPlanRecorded(event.target.checked)}
              />
            ) : null}
            <div className="flex justify-end">
              <Button
                onClick={saveVerification}
                disabled={recordLocked}
                startIcon={<ShieldCheck aria-hidden="true" size={15} />}
              >
                Save verification
              </Button>
            </div>
          </PanelBody>
        </Panel>

        <Panel elevation="flat" className={readyToClose ? "border-success" : "border-warning"}>
          <PanelBody className="flex flex-wrap items-center justify-between gap-5 p-5">
            <div>
              <p className="text-xs font-semibold text-ink-primary">
                {recordLocked
                  ? "Visit closure completed"
                  : readyToClose
                    ? "All administrative closure gates have passed"
                    : "Closure remains blocked"}
              </p>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-ink-secondary">
                Open continuity tasks remain active after closure. This action does not change signed notes, diagnoses, orders, prescriptions or finalized billing.
              </p>
            </div>
            <Button
              onClick={closeVisit}
              disabled={recordLocked || !readyToClose || !isOnline}
              startIcon={<ClipboardCheck aria-hidden="true" size={16} />}
            >
              {recordLocked ? "Visit closed" : "Close visit"}
            </Button>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  function renderDocuments() {
    return (
      <div className="space-y-6">
        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Departure package
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Documents and delivery evidence
              </h2>
            </div>
            <StatusBadge tone={requiredDocumentsDelivered ? "success" : "warning"}>
              {activeRecord.documents.filter((item) => item.status === "Delivered").length}/{activeRecord.documents.length} delivered
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="grid gap-3 lg:grid-cols-2">
              {activeRecord.documents.map((document) => (
                <button
                  type="button"
                  key={document.id}
                  data-selected={document.id === documentId}
                  onClick={() => setDocumentId(document.id)}
                  className={cn(
                    "rounded-md border p-4 text-left transition-colors",
                    document.id === documentId
                      ? "border-action bg-selected"
                      : "border-border-default bg-surface hover:border-action",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-md bg-surface-subtle text-action">
                      <FileOutput aria-hidden="true" size={16} />
                    </span>
                    <StatusBadge tone={documentTone(document.status)}>
                      {document.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink-primary">
                    {document.kind}
                  </p>
                  <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                    {document.id} · version {document.version}
                  </p>
                  <p className="mt-2 text-[10px] leading-5 text-ink-secondary">
                    {document.deliveredAt
                      ? `${document.channel} to ${document.recipient} · ${document.deliveredAt}`
                      : document.required
                        ? "Required before closure"
                        : "Optional document"}
                  </p>
                </button>
              ))}
            </div>
          </PanelBody>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Versioned output
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Prepare selected document
                </h2>
              </div>
              <FileCheck2 aria-hidden="true" size={18} className="text-action" />
            </PanelHeader>
            <PanelBody>
              <Alert tone="information" title="Finalized sources remain read-only">
                Preparation assembles signed notes, prescriptions, orders and instructions into a delivery document without editing them.
              </Alert>
              <Button
                className="mt-4"
                onClick={prepareDocument}
                disabled={!documentId || recordLocked}
                startIcon={<RefreshCw aria-hidden="true" size={15} />}
              >
                Prepare new version
              </Button>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Auditable handoff
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Record delivery
                </h2>
              </div>
              <Send aria-hidden="true" size={18} className="text-action" />
            </PanelHeader>
            <PanelBody>
              <form className="space-y-4" onSubmit={recordDelivery}>
                <SelectField
                  id="delivery-channel"
                  label="Delivery channel"
                  value={deliveryChannel}
                  disabled={recordLocked}
                  onChange={(event) => setDeliveryChannel(event.target.value)}
                >
                  <option>Printed</option>
                  <option>SMS link</option>
                  <option>Patient portal</option>
                  <option>Receiving provider</option>
                </SelectField>
                <TextField
                  id="delivery-recipient"
                  label="Recipient"
                  value={deliveryRecipient}
                  disabled={recordLocked}
                  onChange={(event) => setDeliveryRecipient(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!documentId || recordLocked || !isOnline}>
                    Confirm delivery
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        </div>
      </div>
    );
  }

  function renderContinuity() {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Continuity plan
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Follow-up scheduling
                </h2>
              </div>
              <StatusBadge
                tone={activeRecord.followUp.status === "Scheduled" ? "success" : "warning"}
              >
                {activeRecord.followUp.status}
              </StatusBadge>
            </PanelHeader>
            <PanelBody>
              <div className="rounded-md border border-border-subtle bg-surface-subtle p-4 text-xs text-ink-secondary">
                <p className="font-semibold text-ink-primary">
                  {activeRecord.followUp.specialty}
                  {activeRecord.followUp.clinician ? ` · ${activeRecord.followUp.clinician}` : ""}
                </p>
                <p className="mt-1 leading-5">{activeRecord.followUp.reason}</p>
                {activeRecord.followUp.date ? (
                  <p className="spine-mono mt-2 text-[10px] text-action">
                    {activeRecord.followUp.date} · {activeRecord.followUp.time} · reminder {activeRecord.followUp.reminderStatus.toLowerCase()}
                  </p>
                ) : null}
                {activeRecord.followUp.exceptionReason ? (
                  <p className="mt-2 text-[10px] font-semibold text-warning">
                    Exception: {activeRecord.followUp.exceptionReason}
                  </p>
                ) : null}
              </div>
              <form className="mt-5 space-y-4" onSubmit={saveFollowUp}>
                <SelectField
                  id="follow-up-status"
                  label="Plan outcome"
                  value={followUpStatus}
                  disabled={recordLocked}
                  onChange={(event) => setFollowUpStatus(event.target.value)}
                >
                  <option>Scheduled</option>
                  <option>Not required</option>
                  <option>Unable to schedule</option>
                </SelectField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="follow-up-specialty"
                    label="Specialty or service"
                    value={followUpSpecialty}
                    disabled={recordLocked}
                    onChange={(event) => setFollowUpSpecialty(event.target.value)}
                  />
                  <TextField
                    id="follow-up-clinician"
                    label="Clinician (optional)"
                    value={followUpClinician}
                    disabled={recordLocked}
                    onChange={(event) => setFollowUpClinician(event.target.value)}
                  />
                </div>
                {followUpStatus === "Scheduled" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="follow-up-date"
                      label="Date"
                      type="date"
                      value={followUpDate}
                      disabled={recordLocked}
                      onChange={(event) => setFollowUpDate(event.target.value)}
                    />
                    <TextField
                      id="follow-up-time"
                      label="Time"
                      type="time"
                      value={followUpTime}
                      disabled={recordLocked}
                      onChange={(event) => setFollowUpTime(event.target.value)}
                    />
                  </div>
                ) : null}
                <TextareaField
                  id="follow-up-reason"
                  label="Clinical reason and expected outcome"
                  value={followUpReason}
                  onChange={setFollowUpReason}
                  disabled={recordLocked}
                />
                {followUpStatus === "Unable to schedule" ? (
                  <TextareaField
                    id="follow-up-exception"
                    label="Exception reason"
                    value={followUpException}
                    onChange={setFollowUpException}
                    disabled={recordLocked}
                  />
                ) : null}
                <div className="flex justify-end">
                  <Button type="submit" disabled={recordLocked} startIcon={<CalendarCheck2 aria-hidden="true" size={15} />}>
                    Save follow-up plan
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  External care handoff
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Referrals
                </h2>
              </div>
              <StatusBadge>{activeRecord.referrals.length} referral(s)</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-3">
                {activeRecord.referrals.length ? (
                  activeRecord.referrals.map((referral) => (
                    <div key={referral.id} className="rounded-md border border-border-default p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-ink-primary">{referral.service}</p>
                          <p className="mt-1 text-[10px] text-ink-secondary">{referral.receivingProvider}</p>
                        </div>
                        <StatusBadge tone={referral.status === "Accepted" || referral.status === "Sent" ? "success" : "warning"}>
                          {referral.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 text-[10px] leading-5 text-ink-secondary">{referral.reason}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="spine-mono text-[9px] text-ink-tertiary">{referral.id} · {referral.urgency}</span>
                        {!referral.clinicalSummarySent ? (
                          <Button size="sm" variant="secondary" disabled={recordLocked || !isOnline} onClick={() => sendReferral(referral.id)}>
                            Send handoff
                          </Button>
                        ) : (
                          <span className="text-[10px] font-semibold text-success">Summary delivered</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert tone="neutral" title="No referral ordered">
                    Add a referral only when continuity requires another service or provider.
                  </Alert>
                )}
              </div>
              <form className="mt-5 space-y-4 border-t border-border-subtle pt-5" onSubmit={createReferral}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField id="referral-service" label="Service" value={referralService} disabled={recordLocked} onChange={(event) => setReferralService(event.target.value)} />
                  <SelectField id="referral-urgency" label="Urgency" value={referralUrgency} disabled={recordLocked} onChange={(event) => setReferralUrgency(event.target.value)}>
                    <option>Routine</option>
                    <option>Priority</option>
                    <option>Urgent</option>
                  </SelectField>
                </div>
                <TextField id="referral-provider" label="Receiving provider or facility" value={referralProvider} disabled={recordLocked} onChange={(event) => setReferralProvider(event.target.value)} />
                <TextareaField id="referral-reason" label="Clinical reason and requested action" value={referralReason} onChange={setReferralReason} disabled={recordLocked} />
                <div className="flex justify-end">
                  <Button type="submit" disabled={recordLocked} startIcon={<Route aria-hidden="true" size={15} />}>Draft referral</Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        </div>

        <Panel elevation="flat">
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Unresolved-task routing
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Pending results, access barriers and care gaps
              </h2>
            </div>
            <StatusBadge tone={tasksRouted ? "success" : "critical"}>
              {activeRecord.tasks.filter((task) => task.status !== "Completed").length} open
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="overflow-x-auto rounded-md border border-border-subtle">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRecord.tasks.length ? activeRecord.tasks.map((task) => (
                    <tr key={task.id} className="border-t border-border-subtle">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink-primary">{task.description}</p>
                        <p className="spine-mono mt-1 text-[9px] text-ink-tertiary">{task.id} · {task.category}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">{task.owner}</td>
                      <td className="spine-mono px-4 py-3 text-[10px] text-ink-secondary">{task.dueAt}</td>
                      <td className="px-4 py-3"><StatusBadge tone={task.status === "Completed" ? "success" : task.status === "Escalated" ? "warning" : "information"}>{task.status}</StatusBadge></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="tertiary" disabled={task.status === "Completed"} onClick={() => completeTask(task.id)}>Complete</Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-ink-tertiary">No unresolved continuity tasks.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <form className="mt-5 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_220px_210px_auto] lg:items-end" onSubmit={createTask}>
              <SelectField id="task-category" label="Category" value={taskCategory} disabled={recordLocked} onChange={(event) => setTaskCategory(event.target.value)}>
                <option>Pending result</option>
                <option>Follow-up</option>
                <option>Referral</option>
                <option>Medication access</option>
                <option>Care gap</option>
              </SelectField>
              <TextField id="task-description" label="Unresolved work" value={taskDescription} disabled={recordLocked} onChange={(event) => setTaskDescription(event.target.value)} />
              <TextField id="task-owner" label="Accountable owner" value={taskOwner} disabled={recordLocked} onChange={(event) => setTaskOwner(event.target.value)} />
              <TextField id="task-due" label="Due date and time" type="datetime-local" value={taskDueAt} disabled={recordLocked} onChange={(event) => setTaskDueAt(event.target.value)} />
              <Button type="submit" disabled={recordLocked}>Route task</Button>
            </form>
          </PanelBody>
        </Panel>
      </div>
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <ButtonLink
            href="/billing"
            variant="tertiary"
            size="sm"
            className="-ml-3"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
          >
            Back to billing
          </ButtonLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Integrated OPD · Encounter management
            </p>
            <StatusBadge>Illustrative session data</StatusBadge>
            <StatusBadge tone={isOnline ? "success" : "critical"} showDot>
              {isOnline ? "Online" : "Offline · final actions blocked"}
            </StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Visit closure and continuity
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Deliver the departure package, secure follow-up and referrals, route unresolved work, and close the OPD visit without changing finalized clinical documentation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={view === "readiness" ? "primary" : "secondary"} startIcon={<ListChecks aria-hidden="true" size={15} />} onClick={() => setView("readiness")}>Closure readiness</Button>
          <Button variant={view === "documents" ? "primary" : "secondary"} startIcon={<FileOutput aria-hidden="true" size={15} />} onClick={() => setView("documents")}>Documents & delivery</Button>
          <Button variant={view === "continuity" ? "primary" : "secondary"} startIcon={<Route aria-hidden="true" size={15} />} onClick={() => setView("continuity")}>Follow-up & referrals</Button>
        </div>
      </div>

      <Alert tone={notice.tone} title={notice.title} className="mt-6">
        {notice.message}
      </Alert>

      <div className="mt-6">
        <PatientContextBar
          name={activePatient.name}
          age={activePatient.age}
          sex={activePatient.sex}
          mrn={activePatient.mrn}
          encounter={activeRecord.encounterId}
          location="OPD departure desk"
          clinician={activeRecord.clinician}
          allergies={activePatient.allergies}
          verifiedAt={activeRecord.identityConfirmedAt ?? "closure verification pending"}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Panel key={metric.label} elevation="flat">
            <PanelBody className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink-primary">{metric.value}</p>
                  <p className="mt-1 text-xs text-ink-secondary">{metric.detail}</p>
                </div>
                <StatusBadge tone={metric.tone} showDot>Live</StatusBadge>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[360px_minmax(0,1fr)]">
        {renderWorklist()}
        {view === "readiness"
          ? renderReadiness()
          : view === "documents"
            ? renderDocuments()
            : renderContinuity()}
      </div>

      <Panel elevation="flat" className="mt-6">
        <PanelBody className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
              <History aria-hidden="true" size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-primary">Closure audit continuity</p>
              <p className="mt-1 text-[10px] text-ink-secondary">{activeRecord.auditNote}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-ink-tertiary">
            <span className="flex items-center gap-1.5"><Stethoscope aria-hidden="true" size={13} />Clinical record unchanged</span>
            <span className="flex items-center gap-1.5"><MessageSquareText aria-hidden="true" size={13} />Delivery evidence retained</span>
            <span className="spine-mono">{activeRecord.id}</span>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
