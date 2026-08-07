"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Beaker,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FlaskConical,
  History,
  Save,
  Search,
  ShieldAlert,
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
  diagnosticOrders,
  rejectionReasons,
  specimenTypes,
  type DiagnosticOperationalStatus,
  type DiagnosticOrder,
  type DiagnosticResultStatus,
  type DiagnosticService,
  type ResultFlag,
} from "@/data/diagnostics";
import { prototypePatients } from "@/data/patients";
import { cn } from "@/lib/cn";

type WorkspaceView = "worklist" | "results";
type ServiceFilter = "All" | DiagnosticService;
type StatusFilter = "All" | "Action required" | "In progress" | "Resulted";

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  description?: string;
  error?: string;
};

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
        className={cn("spine-input min-h-24 py-2.5 leading-6", className)}
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

function operationalTone(status: DiagnosticOperationalStatus): StatusTone {
  if (status === "Completed") return "success";
  if (status === "Recollection required") return "warning";
  if (status === "Placed") return "neutral";
  return "information";
}

function resultTone(status: DiagnosticResultStatus): StatusTone {
  if (status === "Final") return "success";
  if (status === "Preliminary") return "warning";
  if (status === "Amended") return "information";
  return "neutral";
}

function flagTone(flag: ResultFlag): StatusTone {
  if (flag === "Critical") return "critical";
  if (flag === "Normal") return "success";
  return "warning";
}

function sessionTime() {
  return `${new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} · this session`;
}

function patientForOrder(order: DiagnosticOrder) {
  return prototypePatients.find(
    (patient) => patient.id === order.patientId && !patient.restricted,
  );
}

export function DiagnosticsWorkspace({
  initialPatientId,
  initialEncounterId,
}: {
  initialPatientId?: string;
  initialEncounterId?: string;
}) {
  const initialOrder =
    diagnosticOrders.find(
      (order) =>
        (initialPatientId ? order.patientId === initialPatientId : true) &&
        (initialEncounterId ? order.encounterId === initialEncounterId : true),
    ) ??
    diagnosticOrders.find((order) =>
      order.analytes.some((analyte) => analyte.flag === "Critical"),
    ) ??
    diagnosticOrders[0];

  const [orders, setOrders] = useState<DiagnosticOrder[]>(() =>
    diagnosticOrders.map((order) => ({
      ...order,
      analytes: order.analytes.map((analyte) => ({ ...analyte })),
      specimen: order.specimen ? { ...order.specimen } : undefined,
    })),
  );
  const [activeOrderId, setActiveOrderId] = useState(initialOrder.id);
  const [view, setView] = useState<WorkspaceView>("worklist");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<Notice>({
    tone: "information",
    title: "Department handoff is ready for review",
    message:
      "Orders are illustrative and session-based. Identity, provenance and lifecycle controls remain explicit.",
  });

  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [specimenType, setSpecimenType] = useState("EDTA whole blood");
  const [specimenId, setSpecimenId] = useState("");
  const [collectorName, setCollectorName] = useState("Nisha P, Phlebotomy");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionDetail, setRejectionDetail] = useState("");

  const [resultName, setResultName] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [resultUnit, setResultUnit] = useState("");
  const [resultRange, setResultRange] = useState("");
  const [resultFlag, setResultFlag] = useState<ResultFlag>("Normal");
  const [verificationAttested, setVerificationAttested] = useState(false);

  const [reviewNote, setReviewNote] = useState("");
  const [reviewAttested, setReviewAttested] = useState(false);
  const [criticalAction, setCriticalAction] = useState("");
  const [criticalOutcome, setCriticalOutcome] = useState("");
  const [criticalFollowUp, setCriticalFollowUp] = useState("");
  const [criticalAttested, setCriticalAttested] = useState(false);

  const [notificationMethod, setNotificationMethod] = useState("");
  const [notificationOutcome, setNotificationOutcome] = useState("");
  const [amendedValue, setAmendedValue] = useState("");
  const [amendmentReason, setAmendmentReason] = useState("");
  const [amendmentAttested, setAmendmentAttested] = useState(false);

  const activeOrder =
    orders.find((order) => order.id === activeOrderId) ?? orders[0];
  const activePatient = patientForOrder(activeOrder)!;
  const activeCritical = activeOrder.analytes.some(
    (analyte) => analyte.flag === "Critical",
  );
  const activeRequiresAcknowledgement =
    ["Final", "Amended"].includes(activeOrder.resultStatus) &&
    !activeOrder.acknowledgedAt;

  const criticalOrders = orders.filter(
    (order) =>
      order.analytes.some((analyte) => analyte.flag === "Critical") &&
      !order.acknowledgedAt,
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const patient = patientForOrder(order);
      const matchesService =
        serviceFilter === "All" || order.service === serviceFilter;
      const matchesSearch =
        !normalizedSearch ||
        order.testName.toLowerCase().includes(normalizedSearch) ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.accessionId?.toLowerCase().includes(normalizedSearch) ||
        patient?.name.toLowerCase().includes(normalizedSearch) ||
        patient?.mrn.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Action required" &&
          (order.operationalStatus === "Placed" ||
            order.operationalStatus === "Recollection required" ||
            (order.resultStatus === "Final" && !order.acknowledgedAt))) ||
        (statusFilter === "In progress" &&
          ["Accepted", "Collected", "In progress"].includes(
            order.operationalStatus,
          )) ||
        (statusFilter === "Resulted" &&
          ["Preliminary", "Final", "Amended"].includes(order.resultStatus));

      return matchesService && matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, serviceFilter, statusFilter]);

  const metrics = [
    {
      label: "Open orders",
      value: orders.filter((order) => order.operationalStatus !== "Completed")
        .length,
      detail: "Across lab and imaging",
      tone: "information" as StatusTone,
    },
    {
      label: "Awaiting collection",
      value: orders.filter((order) =>
        ["Placed", "Accepted", "Recollection required"].includes(
          order.operationalStatus,
        ),
      ).length,
      detail: "Identity check required",
      tone: "warning" as StatusTone,
    },
    {
      label: "Unreviewed results",
      value: orders.filter(
        (order) =>
          ["Final", "Amended"].includes(order.resultStatus) &&
          !order.acknowledgedAt,
      ).length,
      detail: "Clinical ownership pending",
      tone: "warning" as StatusTone,
    },
    {
      label: "Critical unresolved",
      value: criticalOrders.length,
      detail: "Persistent until handled",
      tone: criticalOrders.length ? "critical" : "success" as StatusTone,
    },
  ];

  function updateActiveOrder(
    updater: (order: DiagnosticOrder) => DiagnosticOrder,
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === activeOrderId ? updater(order) : order,
      ),
    );
  }

  function selectOrder(orderId: string, nextView?: WorkspaceView) {
    setActiveOrderId(orderId);
    if (nextView) setView(nextView);
    setIdentityConfirmed(false);
    setRejectionReason("");
    setRejectionDetail("");
    setReviewNote("");
    setReviewAttested(false);
    setCriticalAction("");
    setCriticalOutcome("");
    setCriticalFollowUp("");
    setCriticalAttested(false);
    setNotificationMethod("");
    setNotificationOutcome("");
    setAmendedValue("");
    setAmendmentReason("");
    setAmendmentAttested(false);
  }

  function acceptOrder() {
    if (activeOrder.operationalStatus !== "Placed") return;
    updateActiveOrder((order) => ({
      ...order,
      operationalStatus: "Accepted",
    }));
    setNotice({
      tone: "success",
      title: "Order accepted by the performing department",
      message:
        "Primary ownership is now Central laboratory. Collection still requires an identity check.",
    });
  }

  function collectSpecimen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !identityConfirmed ||
      !specimenType ||
      !specimenId.trim() ||
      !collectorName.trim()
    ) {
      setNotice({
        tone: "warning",
        title: "Collection requirements are incomplete",
        message:
          "Confirm two patient identifiers and record specimen, label and collector details.",
      });
      return;
    }

    const collectedAt = sessionTime();
    updateActiveOrder((order) => ({
      ...order,
      operationalStatus: "Collected",
      resultStatus: "Not available",
      accessionId: order.accessionId ?? `ACC-26-${String(Date.now()).slice(-5)}`,
      specimen: {
        type: specimenType,
        specimenId: specimenId.trim(),
        collectedAt,
        collectedBy: collectorName.trim(),
        receivedAt: collectedAt,
        receivedBy: "Arun K, Central laboratory",
        condition: "Acceptable",
      },
      analytes: [],
      acknowledgedAt: undefined,
      acknowledgedBy: undefined,
      reviewNote: undefined,
    }));
    setIdentityConfirmed(false);
    setSpecimenId("");
    setNotice({
      tone: "success",
      title: "Specimen collected and accessioned",
      message:
        "The label, collector and receipt event were added to the session chain of custody.",
    });
  }

  function beginProcessing() {
    if (activeOrder.operationalStatus !== "Collected") return;
    updateActiveOrder((order) => ({
      ...order,
      operationalStatus: "In progress",
    }));
    setNotice({
      tone: "information",
      title: "Analytical processing started",
      message:
        "Operational fulfilment is in progress. No clinical result is final yet.",
    });
  }

  function rejectSpecimen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeOrder.specimen || !rejectionReason || !rejectionDetail.trim()) {
      setNotice({
        tone: "warning",
        title: "Rejection evidence is required",
        message:
          "Choose a governed reason and explain the recollection handoff before rejecting the specimen.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      operationalStatus: "Recollection required",
      resultStatus: "Not available",
      analytes: [],
      specimen: order.specimen
        ? {
            ...order.specimen,
            condition: "Rejected",
            rejectionReason: `${rejectionReason}: ${rejectionDetail.trim()}`,
          }
        : undefined,
    }));
    setRejectionReason("");
    setRejectionDetail("");
    setNotice({
      tone: "warning",
      title: "Specimen rejected; recollection required",
      message:
        "The rejected specimen remains traceable and the order has returned to an explicit collection exception state.",
    });
  }

  function saveResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      activeOrder.operationalStatus !== "In progress" ||
      !resultName.trim() ||
      !resultValue.trim() ||
      !resultRange.trim()
    ) {
      setNotice({
        tone: "warning",
        title: "Result entry is incomplete",
        message:
          "Processing must be active and the analyte, value and reference range must be recorded.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      resultStatus: "Preliminary",
      analytes: [
        {
          id: `analyte-${Date.now()}`,
          name: resultName.trim(),
          value: resultValue.trim(),
          unit: resultUnit.trim(),
          referenceRange: resultRange.trim(),
          flag: resultFlag,
        },
      ],
      resultedAt: sessionTime(),
    }));
    setNotice({
      tone: resultFlag === "Critical" ? "critical" : "success",
      title:
        resultFlag === "Critical"
          ? "Preliminary critical value requires verification"
          : "Preliminary result saved",
      message:
        "The result is not final and cannot be treated as clinically acknowledged until verification is complete.",
    });
  }

  function verifyFinalResult() {
    if (
      activeOrder.resultStatus !== "Preliminary" ||
      !activeOrder.analytes.length ||
      !verificationAttested
    ) {
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Final verification is blocked while offline",
        message:
          "The preliminary value is preserved. Reconnect and confirm server persistence before publishing a final result.",
      });
      return;
    }

    const isCritical = activeOrder.analytes.some(
      (analyte) => analyte.flag === "Critical",
    );
    updateActiveOrder((order) => ({
      ...order,
      operationalStatus: "Completed",
      resultStatus: "Final",
      verifiedBy: "Dr Leena Mathew, Pathology",
      resultedAt: sessionTime(),
    }));
    setVerificationAttested(false);
    setView("results");
    setNotice({
      tone: isCritical ? "critical" : "success",
      title: isCritical
        ? "Critical result published and routed"
        : "Final result published",
      message: isCritical
        ? "A persistent action event is assigned to the ordering clinician until response evidence is recorded."
        : "The result is available for attributed clinical review and patient communication.",
    });
  }

  function acknowledgeRoutineResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      activeCritical ||
      !activeRequiresAcknowledgement ||
      !reviewNote.trim() ||
      !reviewAttested
    ) {
      setNotice({
        tone: "warning",
        title: "Clinical review record is incomplete",
        message:
          "Record the interpretation and attest that the result was reviewed in patient context.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Result acknowledgement is blocked while offline",
        message:
          "Your review text remains in this session. Reconnect before recording the consequential acknowledgement.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      acknowledgedAt: sessionTime(),
      acknowledgedBy: order.orderedBy,
      reviewNote: reviewNote.trim(),
    }));
    setReviewNote("");
    setReviewAttested(false);
    setNotice({
      tone: "success",
      title: "Result clinically acknowledged",
      message:
        "Reviewer, time and interpretation are now visible in this session audit trail.",
    });
  }

  function acknowledgeCriticalResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !activeCritical ||
      !activeRequiresAcknowledgement ||
      !criticalAction.trim() ||
      !criticalOutcome.trim() ||
      !criticalFollowUp.trim() ||
      !criticalAttested
    ) {
      setNotice({
        tone: "critical",
        title: "Critical response evidence is incomplete",
        message:
          "Document the action, immediate outcome, follow-up ownership and clinician attestation.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Critical acknowledgement requires confirmed connectivity",
        message:
          "Use the governed downtime escalation protocol. This prototype will not display the critical event as handled offline.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      acknowledgedAt: sessionTime(),
      acknowledgedBy: order.orderedBy,
      reviewNote: `Action: ${criticalAction.trim()} Outcome: ${criticalOutcome.trim()} Follow-up: ${criticalFollowUp.trim()}`,
    }));
    setCriticalAction("");
    setCriticalOutcome("");
    setCriticalFollowUp("");
    setCriticalAttested(false);
    setNotice({
      tone: "success",
      title: "Critical result acknowledged with response evidence",
      message:
        "The persistent event is resolved for this prototype and retains the attributed response record.",
    });
  }

  function recordPatientNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !activeOrder.acknowledgedAt ||
      !notificationMethod ||
      !notificationOutcome.trim()
    ) {
      setNotice({
        tone: "warning",
        title: "Communication record is incomplete",
        message:
          "Choose the method and record the outcome after clinical acknowledgement.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      patientNotified: `${notificationMethod} · ${notificationOutcome.trim()} · ${sessionTime()}`,
    }));
    setNotificationMethod("");
    setNotificationOutcome("");
    setNotice({
      tone: "success",
      title: "Patient communication recorded",
      message:
        "Method, outcome and time are associated with the reviewed result.",
    });
  }

  function amendFinalResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !["Final", "Amended"].includes(activeOrder.resultStatus) ||
      !activeOrder.analytes.length ||
      !amendedValue.trim() ||
      !amendmentReason.trim() ||
      !amendmentAttested
    ) {
      setNotice({
        tone: "warning",
        title: "Amendment requirements are incomplete",
        message:
          "Record the corrected value, reason and verification attestation. The original result will remain visible.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Result amendment is blocked while offline",
        message:
          "Reconnect before publishing a corrected result version.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      resultStatus: "Amended",
      analytes: order.analytes.map((analyte, index) =>
        index === 0
          ? {
              ...analyte,
              previousValue: `${analyte.value}${analyte.unit ? ` ${analyte.unit}` : ""}`,
              previousAt: order.resultedAt,
              value: amendedValue.trim(),
            }
          : analyte,
      ),
      resultedAt: sessionTime(),
      verifiedBy: "Dr Leena Mathew, Pathology",
      amendmentReason: amendmentReason.trim(),
      acknowledgedAt: undefined,
      acknowledgedBy: undefined,
      reviewNote: undefined,
      patientNotified: undefined,
    }));
    setAmendedValue("");
    setAmendmentReason("");
    setAmendmentAttested(false);
    setNotice({
      tone: "warning",
      title: "Amended result published for renewed review",
      message:
        "The original value remains visible and the ordering clinician must acknowledge the corrected version.",
    });
  }

  function renderWorklist() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Department queue
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Diagnostic worklist
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink-secondary">
                Filter by service and next safe action. Opening a row never changes its state.
              </p>
            </div>
            <StatusBadge>{filteredOrders.length} visible</StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                id="diagnostic-search"
                label="Search worklist"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Patient, MRN, order or accession"
                endAdornment={<Search aria-hidden="true" size={15} />}
              />
              <SelectField
                id="diagnostic-service-filter"
                label="Service"
                value={serviceFilter}
                onChange={(event) =>
                  setServiceFilter(event.target.value as ServiceFilter)
                }
              >
                <option value="All">All services</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
              </SelectField>
              <SelectField
                id="diagnostic-status-filter"
                label="Work state"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <option value="All">All states</option>
                <option value="Action required">Action required</option>
                <option value="In progress">In progress</option>
                <option value="Resulted">Resulted</option>
              </SelectField>
            </div>

            <div className="mt-6 overflow-x-auto rounded-md border border-border-subtle">
              <table className="w-full min-w-[940px] border-collapse text-left">
                <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Patient and order</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Operational state</th>
                    <th className="px-4 py-3 font-semibold">Result state</th>
                    <th className="px-4 py-3 font-semibold">Next action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredOrders.map((order) => {
                    const patient = patientForOrder(order)!;
                    const critical = order.analytes.some(
                      (analyte) => analyte.flag === "Critical",
                    );
                    return (
                      <tr
                        key={order.id}
                        className={cn(
                          order.id === activeOrderId && "bg-selected/40",
                        )}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-ink-primary">
                            {patient.name}
                          </p>
                          <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                            {patient.mrn} · {order.id}
                          </p>
                          <p className="mt-1 text-xs text-ink-secondary">
                            {order.testName}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-secondary">
                          {order.service}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={order.priority === "Urgent" ? "warning" : "neutral"}
                          >
                            {order.priority}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={operationalTone(order.operationalStatus)}>
                            {order.operationalStatus}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={resultTone(order.resultStatus)}>
                              {order.resultStatus}
                            </StatusBadge>
                            {critical && !order.acknowledgedAt ? (
                              <StatusBadge tone="critical">Critical</StatusBadge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              selectOrder(
                                order.id,
                                ["Final", "Amended"].includes(order.resultStatus)
                                  ? "results"
                                  : "worklist",
                              )
                            }
                          >
                            Open order
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredOrders.length ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-xs text-ink-secondary"
                      >
                        No diagnostic orders match the current filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                <Beaker aria-hidden="true" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Active order
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  {activeOrder.testName}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={operationalTone(activeOrder.operationalStatus)}>
                {activeOrder.operationalStatus}
              </StatusBadge>
              <StatusBadge tone={resultTone(activeOrder.resultStatus)}>
                {activeOrder.resultStatus}
              </StatusBadge>
            </div>
          </PanelHeader>
          <PanelBody>
            <dl className="grid gap-4 rounded-md border border-border-subtle bg-surface-subtle p-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Order", activeOrder.id],
                ["Encounter", activeOrder.encounterId],
                ["Ordered by", activeOrder.orderedBy],
                ["Ordered at", activeOrder.orderedAt],
                ["Department", activeOrder.performingDepartment],
                ["Indication", activeOrder.indication],
                ["Accession", activeOrder.accessionId ?? "Not assigned"],
                ["Priority", activeOrder.priority],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-1 text-xs text-ink-primary",
                      ["Order", "Encounter", "Accession"].includes(label) &&
                        "spine-mono",
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {activeOrder.operationalStatus === "Placed" ? (
              <div className="mt-6">
                <Alert tone="information" title="Order awaits department acceptance">
                  Acceptance records operational ownership; it does not collect a specimen or publish a result.
                </Alert>
                <div className="mt-4 flex justify-end">
                  <Button
                    startIcon={<ClipboardCheck aria-hidden="true" size={15} />}
                    onClick={acceptOrder}
                  >
                    Accept laboratory order
                  </Button>
                </div>
              </div>
            ) : null}

            {["Accepted", "Recollection required"].includes(
              activeOrder.operationalStatus,
            ) ? (
              <form onSubmit={collectSpecimen} className="mt-6 space-y-4">
                {activeOrder.operationalStatus === "Recollection required" ? (
                  <Alert tone="warning" title="Previous specimen cannot be used">
                    {activeOrder.specimen?.rejectionReason ??
                      "A new specimen and label are required."}
                  </Alert>
                ) : null}
                <div className="grid gap-4 md:grid-cols-3">
                  <SelectField
                    id="specimen-type"
                    label="Specimen type"
                    value={specimenType}
                    onChange={(event) => setSpecimenType(event.target.value)}
                  >
                    {specimenTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    id="specimen-id"
                    label="Printed specimen label"
                    value={specimenId}
                    onChange={(event) => setSpecimenId(event.target.value)}
                    placeholder="SP-26-……"
                  />
                  <TextField
                    id="collector-name"
                    label="Collector"
                    value={collectorName}
                    onChange={(event) => setCollectorName(event.target.value)}
                  />
                </div>
                <CheckboxField
                  id="specimen-identity-confirmed"
                  label="Patient identity and specimen label matched at collection"
                  description={`I confirmed ${activePatient.name} using name and MRN ${activePatient.mrn} before labelling.`}
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    startIcon={<UserRoundCheck aria-hidden="true" size={15} />}
                  >
                    Record collection and accession
                  </Button>
                </div>
              </form>
            ) : null}

            {activeOrder.operationalStatus === "Collected" ? (
              <div className="mt-6">
                <Alert tone="success" title="Specimen received in acceptable condition">
                  Chain of custody is visible at right. Analytical work has not started.
                </Alert>
                <div className="mt-4 flex justify-end">
                  <Button
                    startIcon={<Activity aria-hidden="true" size={15} />}
                    onClick={beginProcessing}
                  >
                    Begin analytical processing
                  </Button>
                </div>
              </div>
            ) : null}

            {activeOrder.operationalStatus === "In progress" ? (
              <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
                <form onSubmit={saveResult} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="result-name"
                      label="Analyte or observation"
                      value={resultName}
                      onChange={(event) => setResultName(event.target.value)}
                      placeholder={activeOrder.testName}
                    />
                    <TextField
                      id="result-value"
                      label="Result value"
                      value={resultValue}
                      onChange={(event) => setResultValue(event.target.value)}
                    />
                    <TextField
                      id="result-unit"
                      label="Unit"
                      value={resultUnit}
                      onChange={(event) => setResultUnit(event.target.value)}
                      placeholder="%, g/dL, mmol/L"
                    />
                    <TextField
                      id="result-range"
                      label="Reference range or decision limit"
                      value={resultRange}
                      onChange={(event) => setResultRange(event.target.value)}
                    />
                    <SelectField
                      id="result-flag"
                      label="Interpretive flag"
                      value={resultFlag}
                      onChange={(event) =>
                        setResultFlag(event.target.value as ResultFlag)
                      }
                      fieldClassName="sm:col-span-2"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                      <option value="Critical">Critical</option>
                    </SelectField>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="secondary"
                      startIcon={<Save aria-hidden="true" size={14} />}
                    >
                      Save preliminary result
                    </Button>
                  </div>
                </form>

                <div className="rounded-md border border-border-subtle bg-surface-subtle p-4">
                  <p className="text-xs font-semibold text-ink-primary">
                    Final verification
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-secondary">
                    Publishing is blocked until a preliminary value exists, verification is attributed, and connectivity is confirmed.
                  </p>
                  <CheckboxField
                    id="result-verification-attestation"
                    label="I verified value, unit, range, specimen and patient association"
                    checked={verificationAttested}
                    className="mt-4"
                    disabled={activeOrder.resultStatus !== "Preliminary"}
                    onChange={(event) =>
                      setVerificationAttested(event.target.checked)
                    }
                  />
                  <Button
                    fullWidth
                    className="mt-4"
                    disabled={
                      activeOrder.resultStatus !== "Preliminary" ||
                      !verificationAttested
                    }
                    startIcon={<FileCheck2 aria-hidden="true" size={15} />}
                    onClick={verifyFinalResult}
                  >
                    Verify and publish final result
                  </Button>
                </div>
              </div>
            ) : null}

            {activeOrder.specimen &&
            ["Collected", "In progress"].includes(
              activeOrder.operationalStatus,
            ) ? (
              <form
                onSubmit={rejectSpecimen}
                className="mt-6 border-t border-border-subtle pt-6"
              >
                <p className="text-xs font-semibold text-ink-primary">
                  Specimen exception
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-secondary">
                  Reject only with a governed reason and explicit recollection handoff.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <SelectField
                    id="specimen-rejection-reason"
                    label="Rejection reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                  >
                    <option value="">Select reason</option>
                    {rejectionReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    id="specimen-rejection-detail"
                    label="Recollection handoff"
                    value={rejectionDetail}
                    onChange={(event) => setRejectionDetail(event.target.value)}
                    placeholder="Who was notified and what happens next?"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="tertiary"
                    className="spine-button--critical-text"
                    startIcon={<AlertTriangle aria-hidden="true" size={15} />}
                  >
                    Reject specimen and request recollection
                  </Button>
                </div>
              </form>
            ) : null}
          </PanelBody>
        </Panel>
      </div>
    );
  }

  function renderResults() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Clinical review
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Result details and acknowledgement
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink-secondary">
                Values, units, ranges, source, time and finality remain visible together.
              </p>
            </div>
            <StatusBadge tone={resultTone(activeOrder.resultStatus)}>
              {activeOrder.resultStatus}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {activeOrder.resultStatus === "Not available" ? (
              <Alert tone="warning" title="No clinical result is available">
                Return to the worklist to complete collection and analytical processing.
              </Alert>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border border-border-subtle">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Analyte</th>
                        <th className="px-4 py-3 font-semibold">Value · unit</th>
                        <th className="px-4 py-3 font-semibold">Reference</th>
                        <th className="px-4 py-3 font-semibold">Flag</th>
                        <th className="px-4 py-3 font-semibold">Previous</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {activeOrder.analytes.map((analyte) => (
                        <tr
                          key={analyte.id}
                          className={cn(
                            analyte.flag === "Critical" && "bg-critical-surface/55",
                          )}
                        >
                          <td className="px-4 py-4 text-xs font-semibold text-ink-primary">
                            {analyte.name}
                          </td>
                          <td className="spine-mono px-4 py-4 text-sm font-bold text-ink-primary">
                            {analyte.value} {analyte.unit}
                          </td>
                          <td className="spine-mono px-4 py-4 text-xs text-ink-secondary">
                            {analyte.referenceRange}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge tone={flagTone(analyte.flag)}>
                              {analyte.flag === "Critical" ? "Critical value" : analyte.flag}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-4 text-xs text-ink-secondary">
                            {analyte.previousValue ? (
                              <>
                                <span className="spine-mono block text-ink-primary">
                                  {analyte.previousValue}
                                </span>
                                <span className="mt-1 block text-[10px] text-ink-tertiary">
                                  {analyte.previousAt}
                                </span>
                              </>
                            ) : (
                              "No linked prior value"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <dl className="mt-5 grid gap-4 rounded-md border border-border-subtle bg-surface-subtle p-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Specimen", activeOrder.specimen?.specimenId ?? "No specimen"],
                    ["Collection time", activeOrder.specimen?.collectedAt ?? "Not applicable"],
                    ["Result time", activeOrder.resultedAt ?? "Pending"],
                    ["Verified by", activeOrder.verifiedBy ?? "Not final"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xs text-ink-primary">{value}</dd>
                    </div>
                  ))}
                </dl>

                {activeOrder.resultStatus === "Preliminary" ? (
                  <Alert tone="warning" title="Preliminary—do not treat as a final report" className="mt-5">
                    Verification and publication must be completed by an authorized diagnostic reviewer.
                  </Alert>
                ) : null}

                {activeOrder.resultStatus === "Amended" ? (
                  <Alert tone="warning" title="Corrected result version" className="mt-5">
                    Reason: {activeOrder.amendmentReason}. The previous value remains visible in the table and this version requires renewed clinical acknowledgement.
                  </Alert>
                ) : null}
              </>
            )}
          </PanelBody>
        </Panel>

        {activeRequiresAcknowledgement && activeCritical ? (
          <Panel className="border-critical/45">
            <PanelHeader className="bg-critical-surface/60">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-md bg-critical text-white">
                  <ShieldAlert aria-hidden="true" size={17} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-critical">
                    Critical response record
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink-primary">
                    Acknowledge result and document action
                  </h2>
                </div>
              </div>
              <StatusBadge tone="critical">Online confirmation required</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <form onSubmit={acknowledgeCriticalResult} className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <TextareaField
                    id="critical-action"
                    label="Immediate action taken"
                    value={criticalAction}
                    onChange={(event) => setCriticalAction(event.target.value)}
                    placeholder="Clinical assessment, repeat test, medication or escalation action"
                  />
                  <TextareaField
                    id="critical-outcome"
                    label="Observed outcome or current condition"
                    value={criticalOutcome}
                    onChange={(event) => setCriticalOutcome(event.target.value)}
                    placeholder="What changed and what risk remains?"
                  />
                  <TextareaField
                    id="critical-follow-up"
                    label="Follow-up owner and timing"
                    description="One primary accountable owner is required."
                    value={criticalFollowUp}
                    onChange={(event) => setCriticalFollowUp(event.target.value)}
                    className="lg:col-span-2"
                    placeholder="Owner, next action, target time and escalation route"
                  />
                </div>
                <CheckboxField
                  id="critical-attestation"
                  label="I reviewed the patient, result source and critical response"
                  description={`This acknowledgement will be attributed to ${activeOrder.orderedBy}.`}
                  checked={criticalAttested}
                  onChange={(event) => setCriticalAttested(event.target.checked)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="critical"
                    startIcon={<ShieldAlert aria-hidden="true" size={15} />}
                  >
                    Acknowledge critical result and record response
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        ) : null}

        {activeRequiresAcknowledgement && !activeCritical ? (
          <Panel>
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Result ownership
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Record clinical review
                </h2>
              </div>
              <StatusBadge tone="warning">Acknowledgement pending</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <form onSubmit={acknowledgeRoutineResult} className="space-y-4">
                <TextareaField
                  id="routine-review-note"
                  label="Interpretation and next action"
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Clinical relevance, plan and follow-up"
                />
                <CheckboxField
                  id="routine-review-attestation"
                  label="I reviewed this result in the active patient context"
                  checked={reviewAttested}
                  onChange={(event) => setReviewAttested(event.target.checked)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    startIcon={<ClipboardCheck aria-hidden="true" size={15} />}
                  >
                    Acknowledge result
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        ) : null}

        {activeOrder.acknowledgedAt ? (
          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 aria-hidden="true" size={18} className="text-success" />
                <div>
                  <p className="text-xs font-semibold text-ink-primary">
                    Acknowledged by {activeOrder.acknowledgedBy}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-tertiary">
                    {activeOrder.acknowledgedAt}
                  </p>
                </div>
              </div>
              <StatusBadge tone="success">Clinical review complete</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <p className="text-xs leading-5 text-ink-secondary">
                {activeOrder.reviewNote}
              </p>
              {activeOrder.patientNotified ? (
                <Alert tone="success" title="Patient communication recorded" className="mt-5">
                  {activeOrder.patientNotified}
                </Alert>
              ) : (
                <form onSubmit={recordPatientNotification} className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      id="notification-method"
                      label="Communication method"
                      value={notificationMethod}
                      onChange={(event) => setNotificationMethod(event.target.value)}
                    >
                      <option value="">Select method</option>
                      <option value="In person">In person</option>
                      <option value="Verified phone call">Verified phone call</option>
                      <option value="Secure patient message">Secure patient message</option>
                      <option value="Authorized caregiver">Authorized caregiver</option>
                    </SelectField>
                    <TextField
                      id="notification-outcome"
                      label="Outcome"
                      value={notificationOutcome}
                      onChange={(event) => setNotificationOutcome(event.target.value)}
                      placeholder="Reached, advice understood, follow-up confirmed"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">
                      Record patient communication
                    </Button>
                  </div>
                </form>
              )}
            </PanelBody>
          </Panel>
        ) : null}

        {["Final", "Amended"].includes(activeOrder.resultStatus) ? (
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Version control
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Correct a published result
                </h2>
              </div>
              <StatusBadge>Original retained</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <Alert tone="warning" title="Do not edit a final result in place">
                A correction creates an amended version, preserves the original value and reopens clinical acknowledgement.
              </Alert>
              <form onSubmit={amendFinalResult} className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    id="amended-value"
                    label="Corrected value for first result line"
                    value={amendedValue}
                    onChange={(event) => setAmendedValue(event.target.value)}
                  />
                  <TextField
                    id="amendment-reason"
                    label="Reason for correction"
                    value={amendmentReason}
                    onChange={(event) => setAmendmentReason(event.target.value)}
                  />
                </div>
                <CheckboxField
                  id="amendment-attestation"
                  label="I verified the corrected value and understand review will reopen"
                  checked={amendmentAttested}
                  onChange={(event) => setAmendmentAttested(event.target.checked)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="secondary"
                    startIcon={<FileCheck2 aria-hidden="true" size={15} />}
                  >
                    Publish amended result
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        ) : null}
      </div>
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <ButtonLink
            href="/consultation?appointment=apt-meera-legacy&handoff=confirmed"
            variant="tertiary"
            size="sm"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
          >
            Back to consultation
          </ButtonLink>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Diagnostics and results
            </p>
            <StatusBadge>Prototype data</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Diagnostic operations workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Fulfil diagnostic orders, preserve specimen provenance, publish governed results and close the clinical review loop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === "worklist" ? "primary" : "secondary"}
            startIcon={<FlaskConical aria-hidden="true" size={15} />}
            onClick={() => setView("worklist")}
          >
            Department worklist
          </Button>
          <Button
            variant={view === "results" ? "primary" : "secondary"}
            startIcon={<ClipboardCheck aria-hidden="true" size={15} />}
            onClick={() => setView("results")}
          >
            Results review
          </Button>
        </div>
      </div>

      {criticalOrders.length ? (
        <div className="mt-6">
          <Alert
            tone="critical"
            title={`${criticalOrders.length} critical result${criticalOrders.length === 1 ? "" : "s"} require${criticalOrders.length === 1 ? "s" : ""} acknowledged response`}
          >
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <span>
                {patientForOrder(criticalOrders[0])?.name} · {criticalOrders[0].testName} · {criticalOrders[0].analytes.find((analyte) => analyte.flag === "Critical")?.value} {criticalOrders[0].analytes.find((analyte) => analyte.flag === "Critical")?.unit} · resulted {criticalOrders[0].resultedAt}
              </span>
              <Button
                variant="critical"
                size="sm"
                onClick={() => selectOrder(criticalOrders[0].id, "results")}
              >
                Review critical result
              </Button>
            </div>
          </Alert>
        </div>
      ) : null}

      <div className="mt-6">
        <Alert tone={notice.tone} title={notice.title}>
          {notice.message}
        </Alert>
      </div>

      <div className="mt-6">
        <PatientContextBar
          name={activePatient.name}
          age={activePatient.age}
          sex={activePatient.sex}
          mrn={activePatient.mrn}
          encounter={activeOrder.encounterId}
          location={activePatient.location ?? activeOrder.performingDepartment}
          clinician={activeOrder.orderedBy}
          allergies={activePatient.allergies}
          verifiedAt="order handoff · this session"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Panel key={metric.label} elevation="flat">
            <PanelBody className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-ink-primary">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-secondary">{metric.detail}</p>
                </div>
                <StatusBadge tone={metric.tone} showDot>
                  Live
                </StatusBadge>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <main aria-label={view === "worklist" ? "Diagnostic worklist" : "Results review"}>
          {view === "worklist" ? renderWorklist() : renderResults()}
        </main>

        <aside className="space-y-6">
          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <Beaker aria-hidden="true" size={16} className="text-action" />
                <h2 className="text-sm font-semibold text-ink-primary">
                  Specimen chain of custody
                </h2>
              </div>
            </PanelHeader>
            <PanelBody>
              {activeOrder.specimen ? (
                <dl className="space-y-4">
                  {[
                    ["Specimen", `${activeOrder.specimen.type} · ${activeOrder.specimen.specimenId}`],
                    ["Collected", `${activeOrder.specimen.collectedAt} · ${activeOrder.specimen.collectedBy}`],
                    ["Received", activeOrder.specimen.receivedAt ? `${activeOrder.specimen.receivedAt} · ${activeOrder.specimen.receivedBy}` : "Awaiting receipt"],
                    ["Condition", activeOrder.specimen.condition],
                  ].map(([label, value]) => (
                    <div key={label} className="border-l-2 border-border-default pl-3">
                      <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xs leading-5 text-ink-primary">
                        {value}
                      </dd>
                    </div>
                  ))}
                  {activeOrder.specimen.rejectionReason ? (
                    <Alert tone="warning" title="Specimen exception">
                      {activeOrder.specimen.rejectionReason}
                    </Alert>
                  ) : null}
                </dl>
              ) : (
                <p className="text-xs leading-5 text-ink-secondary">
                  No specimen is associated with this order yet.
                </p>
              )}
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <History aria-hidden="true" size={16} className="text-action" />
                <h2 className="text-sm font-semibold text-ink-primary">
                  Order evidence
                </h2>
              </div>
            </PanelHeader>
            <PanelBody>
              <ol className="space-y-4">
                <li className="border-l-2 border-action pl-3">
                  <p className="text-xs font-semibold text-ink-primary">
                    Order placed
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                    {activeOrder.orderedAt} · {activeOrder.orderedBy}
                  </p>
                </li>
                {activeOrder.specimen ? (
                  <li className="border-l-2 border-action pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      Specimen {activeOrder.specimen.condition.toLowerCase()}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {activeOrder.specimen.collectedAt} · {activeOrder.specimen.collectedBy}
                    </p>
                  </li>
                ) : null}
                {activeOrder.resultedAt ? (
                  <li className="border-l-2 border-action pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      Result {activeOrder.resultStatus.toLowerCase()}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {activeOrder.resultedAt} · {activeOrder.verifiedBy ?? "Verification pending"}
                    </p>
                  </li>
                ) : null}
                {activeOrder.acknowledgedAt ? (
                  <li className="border-l-2 border-success pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      Clinical acknowledgement
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {activeOrder.acknowledgedAt} · {activeOrder.acknowledgedBy}
                    </p>
                  </li>
                ) : null}
              </ol>
            </PanelBody>
          </Panel>

          <Alert tone="information" title="Prototype boundary">
            Session interactions do not print labels, transmit HL7/FHIR messages, control an analyser, open a diagnostic image viewer or write clinical data to Supabase.
          </Alert>
        </aside>
      </div>
    </div>
  );
}

