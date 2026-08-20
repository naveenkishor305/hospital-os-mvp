"use client";

import {
  ArrowLeft,
  Boxes,
  ClipboardCheck,
  CreditCard,
  FileText,
  History,
  PackageCheck,
  PackageSearch,
  Pill,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import type { FormEvent, TextareaHTMLAttributes } from "react";
import { useMemo, useState } from "react";

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
import { clinicalProfileFor } from "@/data/consultations";
import { prototypePatients } from "@/data/patients";
import {
  cloneInventoryBatches,
  clonePharmacyOrders,
  type InventoryBatch,
  type PharmacyStatus,
  type PrescriptionLine,
  type PrescriptionOrder,
} from "@/data/pharmacy";
import { cn } from "@/lib/cn";

type WorkspaceView = "worklist" | "inventory";
type WorklistFilter = "All" | "Action required" | "Ready" | "Completed";

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

type SafetyRisk = {
  lineId: string;
  medicine: string;
  kind: "Allergy" | "Interaction";
  detail: string;
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

function statusTone(status: PharmacyStatus): StatusTone {
  if (status === "Dispensed") return "success";
  if (status === "Clinical hold") return "critical";
  if (status === "Ready to dispense" || status === "Awaiting handoff") {
    return "information";
  }
  if (status === "Partially dispensed") return "warning";
  if (status === "Cancelled") return "restricted";
  return "neutral";
}

function sessionTime() {
  return `${new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} · this session`;
}

function patientForOrder(order: PrescriptionOrder) {
  return prototypePatients.find(
    (patient) => patient.id === order.patientId && !patient.restricted,
  );
}

function risksForOrder(order: PrescriptionOrder): SafetyRisk[] {
  const patient = patientForOrder(order);
  if (!patient) return [];

  const recordedAllergies = patient.allergies ?? [];
  const currentMedications = clinicalProfileFor(patient.id).currentMedications;
  const risks: SafetyRisk[] = [];

  order.lines.forEach((line) => {
    line.allergyTriggers.forEach((trigger) => {
      if (
        recordedAllergies.some((allergy) =>
          allergy.toLowerCase().includes(trigger.toLowerCase()),
        )
      ) {
        risks.push({
          lineId: line.id,
          medicine: line.medicine,
          kind: "Allergy",
          detail: `${trigger} matches the recorded allergy list`,
        });
      }
    });

    line.interactionTerms.forEach((term) => {
      if (
        currentMedications.some((medication) =>
          medication.toLowerCase().includes(term.toLowerCase()),
        )
      ) {
        risks.push({
          lineId: line.id,
          medicine: line.medicine,
          kind: "Interaction",
          detail: `${term} appears in the reconciled medication list`,
        });
      }
    });
  });

  return risks;
}

function remainingQuantity(line: PrescriptionLine) {
  return Math.max(0, line.prescribedQuantity - line.dispensedQuantity);
}

function batchAvailable(batch: InventoryBatch) {
  return !batch.expired && !batch.quarantined && batch.stock > 0;
}

export function PharmacyWorkspace({
  initialPatientId,
  initialEncounterId,
}: {
  initialPatientId?: string;
  initialEncounterId?: string;
}) {
  const initialOrders = clonePharmacyOrders();
  const initialOrder =
    initialOrders.find(
      (order) =>
        (initialPatientId ? order.patientId === initialPatientId : true) &&
        (initialEncounterId ? order.encounterId === initialEncounterId : true),
    ) ??
    initialOrders.find((order) => order.status === "Clinical hold") ??
    initialOrders[0];

  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(cloneInventoryBatches);
  const [activeOrderId, setActiveOrderId] = useState(initialOrder.id);
  const [view, setView] = useState<WorkspaceView>("worklist");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorklistFilter>("All");
  const [notice, setNotice] = useState<Notice>({
    tone: "information",
    title: "Pharmacy handoff ready for review",
    message:
      "Prescription, stock and dispensing records are illustrative and remain in this browser session.",
  });

  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [allergyReviewed, setAllergyReviewed] = useState(false);
  const [medicationReviewed, setMedicationReviewed] = useState(false);
  const [pharmacistAttested, setPharmacistAttested] = useState(false);
  const [clarificationOutcome, setClarificationOutcome] = useState("");
  const [clarificationNote, setClarificationNote] = useState("");

  const [selectedLineId, setSelectedLineId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [dispenseQuantity, setDispenseQuantity] = useState("");
  const [partialReason, setPartialReason] = useState("");
  const [nextSupplyPlan, setNextSupplyPlan] = useState("");
  const [substitutionConfirmed, setSubstitutionConfirmed] = useState(false);
  const [substitutionReason, setSubstitutionReason] = useState("");
  const [controlReference, setControlReference] = useState("");
  const [secondChecker, setSecondChecker] = useState("");

  const [recipient, setRecipient] = useState("");
  const [labelConfirmed, setLabelConfirmed] = useState(false);
  const [counsellingConfirmed, setCounsellingConfirmed] = useState(false);
  const [counsellingNote, setCounsellingNote] = useState("");

  const activeOrder =
    orders.find((order) => order.id === activeOrderId) ?? orders[0];
  const activePatient = patientForOrder(activeOrder)!;
  const activeProfile = clinicalProfileFor(activePatient.id);
  const activeRisks = risksForOrder(activeOrder);
  const selectedLine = activeOrder.lines.find(
    (line) => line.id === selectedLineId,
  );
  const selectedBatch = inventory.find(
    (batch) => batch.id === selectedBatchId,
  );
  const compatibleBatches = selectedLine
    ? inventory.filter(
        (batch) => batch.genericName === selectedLine.genericName,
      )
    : [];
  const recommendedBatch = compatibleBatches
    .filter(batchAvailable)
    .sort((left, right) => left.expiry.localeCompare(right.expiry))[0];
  const isSubstitution = Boolean(
    selectedLine &&
      selectedBatch &&
      selectedLine.medicine !== selectedBatch.medicine,
  );
  const totalPrescribed = activeOrder.lines.reduce(
    (sum, line) => sum + line.prescribedQuantity,
    0,
  );
  const totalDispensed = activeOrder.lines.reduce(
    (sum, line) => sum + line.dispensedQuantity,
    0,
  );

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const patient = patientForOrder(order);
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.encounterId.toLowerCase().includes(query) ||
        patient?.name.toLowerCase().includes(query) ||
        patient?.mrn.toLowerCase().includes(query) ||
        order.lines.some((line) => line.medicine.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Action required" &&
          ["Awaiting verification", "Clinical hold", "Partially dispensed"].includes(
            order.status,
          )) ||
        (statusFilter === "Ready" &&
          ["Ready to dispense", "Awaiting handoff"].includes(order.status)) ||
        (statusFilter === "Completed" &&
          ["Dispensed", "Cancelled"].includes(order.status));

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const metrics = [
    {
      label: "Open prescriptions",
      value: orders.filter(
        (order) => !["Dispensed", "Cancelled"].includes(order.status),
      ).length,
      detail: "Verification through handoff",
      tone: "information" as StatusTone,
    },
    {
      label: "Clinical holds",
      value: orders.filter((order) => order.status === "Clinical hold").length,
      detail: "Supply remains blocked",
      tone: "critical" as StatusTone,
    },
    {
      label: "Partial fills",
      value: orders.filter((order) => order.status === "Partially dispensed")
        .length,
      detail: "Balance plan required",
      tone: "warning" as StatusTone,
    },
    {
      label: "Stock exceptions",
      value: inventory.filter(
        (batch) => batch.expired || batch.quarantined || batch.stock <= 10,
      ).length,
      detail: "Expired, held or low stock",
      tone: "warning" as StatusTone,
    },
  ];

  function resetTaskInputs() {
    setIdentityConfirmed(false);
    setAllergyReviewed(false);
    setMedicationReviewed(false);
    setPharmacistAttested(false);
    setClarificationOutcome("");
    setClarificationNote("");
    setSelectedLineId("");
    setSelectedBatchId("");
    setScanValue("");
    setDispenseQuantity("");
    setPartialReason("");
    setNextSupplyPlan("");
    setSubstitutionConfirmed(false);
    setSubstitutionReason("");
    setControlReference("");
    setSecondChecker("");
    setRecipient("");
    setLabelConfirmed(false);
    setCounsellingConfirmed(false);
    setCounsellingNote("");
  }

  function selectOrder(orderId: string) {
    setActiveOrderId(orderId);
    resetTaskInputs();
    setView("worklist");
    setNotice({
      tone: "information",
      title: "Prescription context changed",
      message:
        "Confirm patient identity again before any verification, dispensing or handoff action.",
    });
  }

  function updateActiveOrder(
    updater: (order: PrescriptionOrder) => PrescriptionOrder,
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === activeOrder.id ? updater(order) : order,
      ),
    );
  }

  function resolveClinicalHold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clarificationOutcome || !clarificationNote.trim()) {
      setNotice({
        tone: "warning",
        title: "Clarification record is incomplete",
        message:
          "Choose an outcome and document who was contacted, the decision and the clinical rationale.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Clinical hold cannot be resolved offline",
        message:
          "The note remains in this session. Reconnect before changing a consequential prescription state.",
      });
      return;
    }

    if (clarificationOutcome === "Return to prescriber") {
      updateActiveOrder((order) => ({
        ...order,
        status: "Clinical hold",
        clarificationNote: clarificationNote.trim(),
        clarificationAt: sessionTime(),
      }));
      setNotice({
        tone: "information",
        title: "Prescription returned to prescriber",
        message:
          "The clinical hold remains active and no medicine may be supplied until a revised order is received.",
      });
      return;
    }

    const riskLineIds = new Set(activeRisks.map((risk) => risk.lineId));
    const safeLines = activeOrder.lines.filter(
      (line) => !riskLineIds.has(line.id),
    );

    updateActiveOrder((order) => ({
      ...order,
      lines: safeLines,
      status: safeLines.length ? "Awaiting verification" : "Cancelled",
      clarificationNote: `${clarificationOutcome}: ${clarificationNote.trim()}`,
      clarificationAt: sessionTime(),
    }));
    setClarificationOutcome("");
    setClarificationNote("");
    setNotice({
      tone: safeLines.length ? "warning" : "restricted",
      title: safeLines.length
        ? "Unsafe prescription lines discontinued"
        : "Prescription cancelled after safety review",
      message: safeLines.length
        ? "The original risk evidence remains attributed. The remaining lines require a fresh pharmacist verification."
        : "No dispensable lines remain. A new authorized prescription is required.",
    });
  }

  function verifyPrescription() {
    if (!activeOrder.authorizedAt) {
      setNotice({
        tone: "critical",
        title: "Prescription authorization missing",
        message:
          "Return the order to the prescriber. Pharmacy verification cannot replace clinical authorization.",
      });
      return;
    }
    if (activeRisks.length) {
      updateActiveOrder((order) => ({ ...order, status: "Clinical hold" }));
      setNotice({
        tone: "critical",
        title: "Unresolved safety risks block verification",
        message:
          "Record prescriber clarification and resolve the unsafe lines before proceeding.",
      });
      return;
    }
    if (
      !identityConfirmed ||
      !allergyReviewed ||
      !medicationReviewed ||
      !pharmacistAttested
    ) {
      setNotice({
        tone: "warning",
        title: "Final pharmacist verification is incomplete",
        message:
          "Confirm identity, allergy status, reconciled medicines and the final verification attestation.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Final verification is blocked while offline",
        message:
          "The review state is preserved. Reconnect and synchronize before releasing the prescription for supply.",
      });
      return;
    }

    updateActiveOrder((order) => ({
      ...order,
      status: "Ready to dispense",
      verifiedAt: sessionTime(),
      verifiedBy: "Aditi S, Pharmacist",
    }));
    setPharmacistAttested(false);
    setNotice({
      tone: "success",
      title: "Prescription verified and released",
      message:
        "The pharmacist, time and safety review are now visible. Batch selection and barcode confirmation remain required.",
    });
  }

  function dispenseMedicine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(dispenseQuantity);
    if (!identityConfirmed || !selectedLine || !selectedBatch) {
      setNotice({
        tone: "warning",
        title: "Dispensing checks are incomplete",
        message:
          "Confirm patient identity, choose an outstanding prescription line and select a compatible batch.",
      });
      return;
    }
    if (!activeOrder.verifiedAt) {
      setNotice({
        tone: "critical",
        title: "Pharmacist verification required",
        message: "No item can be dispensed from an unverified prescription.",
      });
      return;
    }
    if (selectedBatch.genericName !== selectedLine.genericName) {
      setNotice({
        tone: "critical",
        title: "Selected batch does not match the prescription line",
        message: "Choose stock with the same verified generic medicine.",
      });
      return;
    }
    if (selectedBatch.expired || selectedBatch.quarantined) {
      setNotice({
        tone: "critical",
        title: selectedBatch.expired
          ? "Expired stock is blocked"
          : "Quarantined stock is blocked",
        message:
          "Select an available batch. The exception remains visible in inventory and cannot be overridden here.",
      });
      return;
    }
    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > remainingQuantity(selectedLine) ||
      quantity > selectedBatch.stock
    ) {
      setNotice({
        tone: "warning",
        title: "Dispense quantity is invalid",
        message: `Enter a whole quantity up to ${Math.min(
          remainingQuantity(selectedLine),
          selectedBatch.stock,
        )}.`,
      });
      return;
    }
    if (scanValue.trim() !== selectedBatch.barcode) {
      setNotice({
        tone: "critical",
        title: "Barcode verification failed",
        message:
          "The scanned value must match the selected batch before stock can be issued.",
      });
      return;
    }
    if (
      isSubstitution &&
      (!selectedLine.substitutionAllowed ||
        !substitutionConfirmed ||
        !substitutionReason.trim())
    ) {
      setNotice({
        tone: "warning",
        title: "Substitution evidence is incomplete",
        message:
          "Confirm substitution eligibility and document the product change and patient communication.",
      });
      return;
    }
    if (
      (selectedLine.additionalControl || selectedBatch.additionalControl) &&
      (!controlReference.trim() || !secondChecker.trim())
    ) {
      setNotice({
        tone: "critical",
        title: "Additional control record is incomplete",
        message:
          "Record the authorization reference and independent checker before supply.",
      });
      return;
    }
    const lineWillRemain = quantity < remainingQuantity(selectedLine);
    if (lineWillRemain && (!partialReason.trim() || !nextSupplyPlan.trim())) {
      setNotice({
        tone: "warning",
        title: "Partial fulfilment plan required",
        message:
          "Record why the full quantity is unavailable and how the balance will be supplied or escalated.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Stock issue is blocked while offline",
        message:
          "Reconnect before committing batch traceability and the inventory decrement.",
      });
      return;
    }

    const nextLines = activeOrder.lines.map((line) =>
      line.id === selectedLine.id
        ? {
            ...line,
            dispensedQuantity: line.dispensedQuantity + quantity,
          }
        : line,
    );
    const allComplete = nextLines.every(
      (line) => remainingQuantity(line) === 0,
    );

    updateActiveOrder((order) => ({
      ...order,
      lines: nextLines,
      status: allComplete ? "Awaiting handoff" : "Partially dispensed",
      partialReason: lineWillRemain ? partialReason.trim() : order.partialReason,
      nextSupplyPlan: lineWillRemain
        ? nextSupplyPlan.trim()
        : order.nextSupplyPlan,
      dispensingEvents: [
        ...order.dispensingEvents,
        {
          id: `dispense-${Date.now()}`,
          lineId: selectedLine.id,
          medicine: selectedBatch.medicine,
          quantity,
          batchNumber: selectedBatch.batchNumber,
          expiry: selectedBatch.expiryLabel,
          dispensedAt: sessionTime(),
          dispensedBy: "Aditi S, Pharmacist",
        },
      ],
    }));
    setInventory((current) =>
      current.map((batch) =>
        batch.id === selectedBatch.id
          ? { ...batch, stock: batch.stock - quantity }
          : batch,
      ),
    );
    setSelectedLineId("");
    setSelectedBatchId("");
    setScanValue("");
    setDispenseQuantity("");
    setPartialReason("");
    setNextSupplyPlan("");
    setSubstitutionConfirmed(false);
    setSubstitutionReason("");
    setNotice({
      tone: allComplete ? "success" : "warning",
      title: allComplete
        ? "All prescribed quantities prepared"
        : "Dispensing event recorded",
      message: allComplete
        ? "Confirm the label, counselling and recipient before the medicine leaves pharmacy."
        : "Batch, expiry, quantity and stock movement are retained. Outstanding lines remain visible.",
    });
  }

  function completeHandoff() {
    if (
      !identityConfirmed ||
      !recipient ||
      !labelConfirmed ||
      !counsellingConfirmed ||
      !counsellingNote.trim()
    ) {
      setNotice({
        tone: "warning",
        title: "Medication handoff is incomplete",
        message:
          "Confirm identity, recipient, label accuracy, counselling and the communication record.",
      });
      return;
    }
    if (
      activeOrder.status === "Partially dispensed" &&
      (!activeOrder.partialReason || !activeOrder.nextSupplyPlan)
    ) {
      setNotice({
        tone: "critical",
        title: "Outstanding supply plan is missing",
        message:
          "Record the partial-fill reason and balance plan before handing over an incomplete supply.",
      });
      return;
    }
    if (!navigator.onLine) {
      setNotice({
        tone: "critical",
        title: "Final handoff is blocked while offline",
        message:
          "Counselling text remains in this session. Reconnect before closing the medication record.",
      });
      return;
    }

    const fullyDispensed = activeOrder.lines.every(
      (line) => remainingQuantity(line) === 0,
    );
    updateActiveOrder((order) => ({
      ...order,
      status: fullyDispensed ? "Dispensed" : "Partially dispensed",
      handedOffAt: sessionTime(),
      handedOffBy: "Aditi S, Pharmacist",
      counsellingRecord: `${recipient}: ${counsellingNote.trim()}`,
    }));
    setLabelConfirmed(false);
    setCounsellingConfirmed(false);
    setCounsellingNote("");
    setRecipient("");
    setNotice({
      tone: fullyDispensed ? "success" : "warning",
      title: fullyDispensed
        ? "Medication dispensed and handed off"
        : "Partial supply handed off with balance plan",
      message:
        "Recipient, counselling, pharmacist, batch and stock evidence are linked in the session record.",
    });
  }

  function renderWorklist() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Outpatient pharmacy
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Prescription worklist
              </h2>
            </div>
            <StatusBadge>{filteredOrders.length} visible</StatusBadge>
          </PanelHeader>
          <PanelBody>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <TextField
                id="pharmacy-search"
                label="Search prescription, patient, MRN or medicine"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                endAdornment={<Search aria-hidden="true" size={15} />}
              />
              <SelectField
                id="pharmacy-status-filter"
                label="Workflow state"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as WorklistFilter)
                }
              >
                <option value="All">All states</option>
                <option value="Action required">Action required</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
              </SelectField>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-border-default">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-surface-subtle text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                  <tr>
                    <th className="px-4 py-3">Patient / prescription</th>
                    <th className="px-4 py-3">Prescriber</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-surface">
                  {filteredOrders.map((order) => {
                    const patient = patientForOrder(order)!;
                    const isActive = order.id === activeOrder.id;
                    return (
                      <tr
                        key={order.id}
                        className={cn(isActive && "bg-selected/50")}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-ink-primary">
                            {patient.name} · {patient.mrn}
                          </p>
                          <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                            {order.id} · {order.encounterId}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-ink-primary">
                            {order.prescribedBy}
                          </p>
                          <p className="mt-1 text-[10px] text-ink-tertiary">
                            {order.prescribedAt}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-secondary">
                          {order.lines.length} · {order.lines
                            .map((line) => line.genericName)
                            .join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={statusTone(order.status)} showDot>
                            {order.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant={isActive ? "primary" : "secondary"}
                            onClick={() => selectOrder(order.id)}
                          >
                            {isActive ? "Selected" : "Review"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Authorized prescription
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                {activeOrder.id}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={activeOrder.priority === "Urgent" ? "warning" : "neutral"}>
                {activeOrder.priority}
              </StatusBadge>
              <StatusBadge tone={statusTone(activeOrder.status)}>
                {activeOrder.status}
              </StatusBadge>
            </div>
          </PanelHeader>
          <PanelBody>
            {!activeOrder.authorizedAt ? (
              <Alert tone="critical" title="No prescriber authorization">
                This order cannot enter pharmacist verification or dispensing.
              </Alert>
            ) : (
              <Alert tone="information" title="Prescription provenance confirmed">
                Authorized {activeOrder.authorizedAt} by {activeOrder.prescribedBy}. Pharmacy verification remains a separate attributed action.
              </Alert>
            )}

            <div className="mt-5 space-y-3">
              {activeOrder.lines.map((line) => (
                <div
                  key={line.id}
                  className="rounded-lg border border-border-default bg-surface-subtle p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-primary">
                        {line.medicine}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-secondary">
                        {line.dose} · {line.frequency} · {line.duration}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {line.highRisk ? (
                        <StatusBadge tone="warning">High-risk review</StatusBadge>
                      ) : null}
                      {line.additionalControl ? (
                        <StatusBadge tone="restricted">Additional control</StatusBadge>
                      ) : null}
                      <StatusBadge tone={remainingQuantity(line) ? "information" : "success"}>
                        {line.dispensedQuantity}/{line.prescribedQuantity} {line.unit}
                      </StatusBadge>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-ink-secondary">
                    {line.directions}
                  </p>
                </div>
              ))}
              {!activeOrder.lines.length ? (
                <Alert tone="restricted" title="No dispensable prescription lines">
                  The unsafe lines were discontinued. A new authorized prescription is required for further supply.
                </Alert>
              ) : null}
            </div>
          </PanelBody>
        </Panel>

        {activeRisks.length ? (
          <Panel>
            <PanelHeader>
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-critical-subtle text-critical">
                  <ShieldAlert aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-critical">
                    Hard safety stop
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink-primary">
                    Resolve clinical risks before supply
                  </h2>
                </div>
              </div>
              <StatusBadge tone="critical">{activeRisks.length} risks</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <div className="space-y-3">
                {activeRisks.map((risk) => (
                  <Alert
                    key={`${risk.lineId}-${risk.kind}`}
                    tone={risk.kind === "Allergy" ? "critical" : "warning"}
                    title={`${risk.kind}: ${risk.medicine}`}
                  >
                    {risk.detail}. The system does not recommend or authorize an alternative medicine.
                  </Alert>
                ))}
              </div>
              <form onSubmit={resolveClinicalHold} className="mt-5 space-y-4">
                <SelectField
                  id="clarification-outcome"
                  label="Prescriber clarification outcome"
                  value={clarificationOutcome}
                  onChange={(event) => setClarificationOutcome(event.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="Return to prescriber">Return to prescriber</option>
                  <option value="Unsafe line discontinued">Unsafe line discontinued by prescriber</option>
                </SelectField>
                <TextareaField
                  id="clarification-note"
                  label="Attributed clarification record"
                  description="Record who was contacted, the read-back decision, rationale and time. Do not enter a replacement unless a new authorized order exists."
                  value={clarificationNote}
                  onChange={(event) => setClarificationNote(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant={
                      clarificationOutcome === "Unsafe line discontinued"
                        ? "critical"
                        : "secondary"
                    }
                    startIcon={<ClipboardCheck aria-hidden="true" size={15} />}
                  >
                    Record clarification
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        ) : null}

        {activeOrder.status === "Awaiting verification" ? (
          <Panel>
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Pharmacist verification
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Independent clinical and identity review
                </h2>
              </div>
              <StatusBadge tone="warning">Release blocked</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <div className="grid gap-3 lg:grid-cols-2">
                <CheckboxField
                  id="pharmacy-identity"
                  label="Patient identity confirmed"
                  description="Use name plus MRN or date of birth at the point of supply."
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                />
                <CheckboxField
                  id="pharmacy-allergy-review"
                  label="Allergy status reviewed"
                  description={
                    activePatient.allergies?.length
                      ? activePatient.allergies.join(", ")
                      : "No allergy recorded; absence reviewed in context"
                  }
                  checked={allergyReviewed}
                  onChange={(event) => setAllergyReviewed(event.target.checked)}
                />
                <CheckboxField
                  id="pharmacy-medication-review"
                  label="Current medicines reconciled"
                  description={activeProfile.currentMedications.join(", ")}
                  checked={medicationReviewed}
                  onChange={(event) => setMedicationReviewed(event.target.checked)}
                />
                <CheckboxField
                  id="pharmacist-attestation"
                  label="Final pharmacist verification"
                  description="I reviewed authorization, dose, directions, duration, safety context and supply eligibility."
                  checked={pharmacistAttested}
                  onChange={(event) => setPharmacistAttested(event.target.checked)}
                />
              </div>
              <div className="mt-5 flex justify-end">
                <Button
                  startIcon={<ShieldCheck aria-hidden="true" size={15} />}
                  onClick={verifyPrescription}
                >
                  Verify & release for dispensing
                </Button>
              </div>
            </PanelBody>
          </Panel>
        ) : null}

        {["Ready to dispense", "Partially dispensed"].includes(
          activeOrder.status,
        ) && activeOrder.lines.some((line) => remainingQuantity(line) > 0) ? (
          <Panel>
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Batch-controlled supply
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Select, scan and issue medicine
                </h2>
              </div>
              <StatusBadge tone="information">FEFO guided</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <Alert tone="information" title="Stock commitment is consequential">
                Expired and quarantined stock cannot be issued. The earliest available expiry is identified, but the pharmacist must select and scan the physical batch.
              </Alert>
              <form onSubmit={dispenseMedicine} className="mt-5 space-y-5">
                <CheckboxField
                  id="dispense-identity"
                  label="Patient identity reconfirmed at dispensing"
                  description={`${activePatient.name} · ${activePatient.mrn}`}
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  <SelectField
                    id="dispense-line"
                    label="Outstanding prescription line"
                    value={selectedLineId}
                    onChange={(event) => {
                      setSelectedLineId(event.target.value);
                      setSelectedBatchId("");
                      setScanValue("");
                    }}
                  >
                    <option value="">Select medicine</option>
                    {activeOrder.lines
                      .filter((line) => remainingQuantity(line) > 0)
                      .map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.medicine} · {remainingQuantity(line)} remaining
                        </option>
                      ))}
                  </SelectField>
                  <SelectField
                    id="dispense-batch"
                    label="Compatible inventory batch"
                    description={
                      recommendedBatch
                        ? `FEFO: ${recommendedBatch.batchNumber} · expires ${recommendedBatch.expiryLabel}`
                        : "No available batch"
                    }
                    value={selectedBatchId}
                    disabled={!selectedLine}
                    onChange={(event) => setSelectedBatchId(event.target.value)}
                  >
                    <option value="">Select physical batch</option>
                    {compatibleBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber} · {batch.medicine} · {batch.stock} available · {batch.expiryLabel}
                        {batch.expired ? " · EXPIRED" : ""}
                        {batch.quarantined ? " · QUARANTINED" : ""}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    id="batch-scan"
                    label="Scan or enter batch barcode"
                    description={
                      selectedBatch
                        ? `Prototype scanner value: ${selectedBatch.barcode}`
                        : "Select a batch first"
                    }
                    value={scanValue}
                    disabled={!selectedBatch}
                    onChange={(event) => setScanValue(event.target.value)}
                    endAdornment={<ScanLine aria-hidden="true" size={15} />}
                  />
                  <TextField
                    id="dispense-quantity"
                    label="Quantity to issue"
                    type="number"
                    min="1"
                    max={
                      selectedLine && selectedBatch
                        ? Math.min(
                            remainingQuantity(selectedLine),
                            selectedBatch.stock,
                          )
                        : undefined
                    }
                    value={dispenseQuantity}
                    onChange={(event) => setDispenseQuantity(event.target.value)}
                  />
                </div>

                {selectedBatch?.expired ? (
                  <Alert tone="critical" title="Expired batch selected">
                    This stock remains visible for investigation but cannot be dispensed.
                  </Alert>
                ) : null}
                {selectedBatch?.quarantined ? (
                  <Alert tone="critical" title="Quarantined batch selected">
                    Release from quarantine requires a separate inventory-governance workflow.
                  </Alert>
                ) : null}

                {isSubstitution ? (
                  <div className="space-y-3">
                    <Alert tone="warning" title="Equivalent-product substitution">
                      Selected product: {selectedBatch?.medicine}. The generic medicine matches, but the product differs from the prescribed line.
                    </Alert>
                    <CheckboxField
                      id="substitution-confirmed"
                      label="Substitution eligibility and patient communication confirmed"
                      checked={substitutionConfirmed}
                      onChange={(event) =>
                        setSubstitutionConfirmed(event.target.checked)
                      }
                    />
                    <TextField
                      id="substitution-reason"
                      label="Substitution record"
                      value={substitutionReason}
                      onChange={(event) => setSubstitutionReason(event.target.value)}
                    />
                  </div>
                ) : null}

                {selectedLine?.additionalControl ||
                selectedBatch?.additionalControl ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextField
                      id="control-reference"
                      label="Additional authorization reference"
                      value={controlReference}
                      onChange={(event) => setControlReference(event.target.value)}
                    />
                    <TextField
                      id="second-checker"
                      label="Independent checker"
                      value={secondChecker}
                      onChange={(event) => setSecondChecker(event.target.value)}
                    />
                  </div>
                ) : null}

                {selectedLine &&
                Number(dispenseQuantity) > 0 &&
                Number(dispenseQuantity) < remainingQuantity(selectedLine) ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <TextField
                      id="partial-reason"
                      label="Partial fulfilment reason"
                      value={partialReason}
                      onChange={(event) => setPartialReason(event.target.value)}
                    />
                    <TextField
                      id="next-supply-plan"
                      label="Balance supply or escalation plan"
                      value={nextSupplyPlan}
                      onChange={(event) => setNextSupplyPlan(event.target.value)}
                    />
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    startIcon={<PackageCheck aria-hidden="true" size={15} />}
                  >
                    Commit dispense & decrement stock
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>
        ) : null}

        {activeOrder.dispensingEvents.length &&
        activeOrder.status !== "Dispensed" &&
        activeOrder.status !== "Cancelled" ? (
          <Panel>
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                  Patient handoff
                </p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">
                  Label, counsel and release
                </h2>
              </div>
              <StatusBadge tone={activeOrder.status === "Partially dispensed" ? "warning" : "information"}>
                {activeOrder.status === "Partially dispensed"
                  ? "Outstanding balance"
                  : "Awaiting handoff"}
              </StatusBadge>
            </PanelHeader>
            <PanelBody>
              {activeOrder.status === "Partially dispensed" ? (
                <Alert tone="warning" title="Partial supply requires explicit balance plan">
                  {activeOrder.partialReason ?? "Reason not recorded"} · {activeOrder.nextSupplyPlan ?? "Plan not recorded"}
                </Alert>
              ) : null}
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <SelectField
                  id="handoff-recipient"
                  label="Verified recipient"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                >
                  <option value="">Select recipient</option>
                  <option value="Patient">Patient</option>
                  <option value="Authorized caregiver">Authorized caregiver</option>
                </SelectField>
                <CheckboxField
                  id="handoff-identity"
                  label="Identity confirmed at handoff"
                  description={`${activePatient.name} · ${activePatient.mrn}`}
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                />
                <CheckboxField
                  id="label-confirmed"
                  label="Label checked against prescription and physical pack"
                  checked={labelConfirmed}
                  onChange={(event) => setLabelConfirmed(event.target.checked)}
                />
                <CheckboxField
                  id="counselling-confirmed"
                  label="Directions, duration, storage and warning signs explained"
                  checked={counsellingConfirmed}
                  onChange={(event) =>
                    setCounsellingConfirmed(event.target.checked)
                  }
                />
              </div>
              <TextareaField
                id="counselling-note"
                label="Counselling and understanding record"
                description={`Preferred language: ${activePatient.language}`}
                className="mt-4"
                value={counsellingNote}
                onChange={(event) => setCounsellingNote(event.target.value)}
              />
              <div className="mt-5 flex justify-end">
                <Button
                  startIcon={<UserRoundCheck aria-hidden="true" size={15} />}
                  onClick={completeHandoff}
                >
                  Complete medication handoff
                </Button>
              </div>
            </PanelBody>
          </Panel>
        ) : null}

        {activeOrder.status === "Dispensed" ? (
          <div className="space-y-4">
            <Alert tone="success" title="Dispensing record complete">
              Handed off {activeOrder.handedOffAt} by {activeOrder.handedOffBy}. The signed prescription, batch traceability, inventory movement and counselling record remain linked.
            </Alert>
            <div className="flex justify-end">
              <ButtonLink
                href={`/billing?patient=${activeOrder.patientId}&encounter=${activeOrder.encounterId}`}
                startIcon={<CreditCard aria-hidden="true" size={15} />}
              >
                Open billing handoff
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderInventory() {
    return (
      <Panel>
        <PanelHeader>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
              Batch inventory
            </p>
            <h2 className="mt-1 text-base font-semibold text-ink-primary">
              Availability, expiry and quarantine
            </h2>
          </div>
          <StatusBadge>{inventory.length} batches</StatusBadge>
        </PanelHeader>
        <PanelBody>
          <Alert tone="information" title="FEFO supports, but does not replace, physical verification">
            Available batches are ordered by expiry during dispensing. Expired and quarantined stock stays visible and blocked.
          </Alert>
          <div className="mt-5 overflow-x-auto rounded-lg border border-border-default">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead className="bg-surface-subtle text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                <tr>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface">
                {[...inventory]
                  .sort((left, right) => left.expiry.localeCompare(right.expiry))
                  .map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink-primary">
                          {batch.medicine}
                        </p>
                        <p className="mt-1 text-[10px] text-ink-tertiary">
                          {batch.strength} · {batch.dosageForm}
                        </p>
                      </td>
                      <td className="spine-mono px-4 py-3 text-[11px] text-ink-primary">
                        {batch.batchNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">
                        {batch.expiryLabel}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">
                        {batch.location}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={batch.stock <= 10 ? "warning" : "success"}>
                          {batch.stock}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        {batch.expired ? (
                          <StatusBadge tone="critical">Expired · blocked</StatusBadge>
                        ) : batch.quarantined ? (
                          <StatusBadge tone="restricted">Quarantined</StatusBadge>
                        ) : batch.additionalControl ? (
                          <StatusBadge tone="warning">Additional control</StatusBadge>
                        ) : (
                          <StatusBadge tone="success">Available</StatusBadge>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </PanelBody>
      </Panel>
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
            className="-ml-3"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
          >
            Back to consultation
          </ButtonLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Integrated OPD · Medication
            </p>
            <StatusBadge>Illustrative session data</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Medication and pharmacy workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Verify authorized prescriptions, resolve safety holds, issue traceable stock and close the patient counselling loop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === "worklist" ? "primary" : "secondary"}
            startIcon={<Pill aria-hidden="true" size={15} />}
            onClick={() => setView("worklist")}
          >
            Prescription worklist
          </Button>
          <Button
            variant={view === "inventory" ? "primary" : "secondary"}
            startIcon={<Boxes aria-hidden="true" size={15} />}
            onClick={() => setView("inventory")}
          >
            Batch inventory
          </Button>
        </div>
      </div>

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
          location="OPD pharmacy"
          clinician={activeOrder.prescribedBy}
          allergies={activePatient.allergies}
          verifiedAt="pharmacy handoff · this session"
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
                  <p className="mt-1 text-xs text-ink-secondary">
                    {metric.detail}
                  </p>
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
        <main aria-label={view === "worklist" ? "Prescription worklist" : "Batch inventory"}>
          {view === "worklist" ? renderWorklist() : renderInventory()}
        </main>

        <aside className="space-y-6">
          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <FileText aria-hidden="true" size={16} className="text-action" />
                <h2 className="text-sm font-semibold text-ink-primary">
                  Active prescription
                </h2>
              </div>
            </PanelHeader>
            <PanelBody>
              <dl className="space-y-4">
                {[
                  ["Prescription", activeOrder.id],
                  ["Authorized", activeOrder.authorizedAt ?? "Missing"],
                  ["Pharmacist", activeOrder.verifiedBy ?? "Verification pending"],
                  ["Progress", `${totalDispensed}/${totalPrescribed} units prepared`],
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
              </dl>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div className="flex items-center gap-2">
                <History aria-hidden="true" size={16} className="text-action" />
                <h2 className="text-sm font-semibold text-ink-primary">
                  Dispensing evidence
                </h2>
              </div>
              <StatusBadge>{activeOrder.dispensingEvents.length} events</StatusBadge>
            </PanelHeader>
            <PanelBody>
              <ol className="space-y-4">
                <li className="border-l-2 border-action pl-3">
                  <p className="text-xs font-semibold text-ink-primary">
                    Prescription authorized
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                    {activeOrder.authorizedAt ?? "Authorization unavailable"} · {activeOrder.prescribedBy}
                  </p>
                </li>
                {activeOrder.verifiedAt ? (
                  <li className="border-l-2 border-action pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      Pharmacist verified
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {activeOrder.verifiedAt} · {activeOrder.verifiedBy}
                    </p>
                  </li>
                ) : null}
                {activeOrder.dispensingEvents.map((event) => (
                  <li key={event.id} className="border-l-2 border-warning pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      {event.quantity} · {event.medicine}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {event.batchNumber} · exp {event.expiry} · {event.dispensedAt}
                    </p>
                  </li>
                ))}
                {activeOrder.handedOffAt ? (
                  <li className="border-l-2 border-success pl-3">
                    <p className="text-xs font-semibold text-ink-primary">
                      Patient handoff recorded
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink-tertiary">
                      {activeOrder.handedOffAt} · {activeOrder.handedOffBy}
                    </p>
                  </li>
                ) : null}
              </ol>
            </PanelBody>
          </Panel>

          {activeOrder.dispensingEvents.length ? (
            <Panel elevation="flat">
              <PanelHeader>
                <div className="flex items-center gap-2">
                  <PackageSearch aria-hidden="true" size={16} className="text-action" />
                  <h2 className="text-sm font-semibold text-ink-primary">
                    Label preview
                  </h2>
                </div>
              </PanelHeader>
              <PanelBody>
                <div className="rounded-md border border-dashed border-border-default bg-surface-subtle p-4">
                  <p className="text-xs font-bold text-ink-primary">nadi · OPD pharmacy</p>
                  <p className="spine-mono mt-2 text-[10px] text-ink-secondary">
                    {activePatient.name} · {activePatient.mrn}
                  </p>
                  <div className="my-3 border-t border-border-subtle" />
                  {activeOrder.lines
                    .filter((line) => line.dispensedQuantity > 0)
                    .map((line) => (
                      <div key={line.id} className="mt-3 first:mt-0">
                        <p className="text-xs font-semibold text-ink-primary">
                          {line.medicine}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-ink-secondary">
                          {line.frequency} · {line.directions}
                        </p>
                      </div>
                    ))}
                </div>
              </PanelBody>
            </Panel>
          ) : null}

          {activeRisks.length ? (
            <Alert tone="critical" title="Supply lock remains active">
              Clinical-risk banners cannot be dismissed. Only an attributed prescriber clarification changes the prescription state.
            </Alert>
          ) : null}

          <Alert tone="information" title="Prototype boundary">
            This session does not create legal labels or receipts, process payment, connect a barcode scanner, enforce jurisdiction-specific schedules, or write pharmacy and inventory records to Supabase.
          </Alert>
        </aside>
      </div>
    </div>
  );
}
