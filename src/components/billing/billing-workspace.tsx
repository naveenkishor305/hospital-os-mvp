"use client";

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  History,
  Landmark,
  ReceiptIndianRupee,
  RefreshCw,
  Search,
  ShieldCheck,
  Undo2,
  WalletCards,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { TextField } from "@/components/ui/text-field";
import {
  cloneBillingAccounts,
  type BillingAccount,
  type CoverageStatus,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/data/billing";
import { prototypePatients } from "@/data/patients";
import { cn } from "@/lib/cn";

type WorkspaceView = "accounts" | "coverage" | "cashier";
type WorklistFilter = "All" | "Action required" | "Collect" | "Closed";

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function sessionTime() {
  return `${new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} · this session`;
}

function patientFor(account: BillingAccount) {
  return prototypePatients.find(
    (patient) => patient.id === account.patientId && !patient.restricted,
  );
}

function invoiceTone(status: InvoiceStatus): StatusTone {
  if (status === "Paid") return "success";
  if (status === "Ready to collect") return "information";
  if (status === "Partially paid" || status === "Coverage review") return "warning";
  if (status === "Refund review") return "critical";
  if (status === "Cancelled") return "restricted";
  return "neutral";
}

function coverageTone(status?: CoverageStatus): StatusTone {
  if (status === "Eligible") return "success";
  if (status === "Inactive") return "critical";
  if (status === "Verification required") return "warning";
  return "neutral";
}

function grossFor(account: BillingAccount) {
  return account.charges
    .filter((charge) => charge.status !== "Voided")
    .reduce((sum, charge) => sum + charge.quantity * charge.unitAmount, 0);
}

function approvedDiscountFor(account: BillingAccount) {
  return account.discounts
    .filter((discount) => discount.status === "Approved")
    .reduce((sum, discount) => sum + discount.amount, 0);
}

function coverageFor(account: BillingAccount) {
  return account.coverage?.status === "Eligible"
    ? account.coverage.approvedAmount
    : 0;
}

function patientResponsibilityFor(account: BillingAccount) {
  return Math.max(
    0,
    grossFor(account) - approvedDiscountFor(account) - coverageFor(account),
  );
}

function paidFor(account: BillingAccount) {
  return account.payments.reduce(
    (sum, payment) => sum + payment.amount - payment.refundedAmount,
    0,
  );
}

function balanceFor(account: BillingAccount) {
  return Math.max(0, patientResponsibilityFor(account) - paidFor(account));
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="spine-field" htmlFor={id}>
      <span className="spine-field__label">{label}</span>
      <textarea
        id={id}
        className="spine-input min-h-24 py-2.5 leading-6"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function BillingWorkspace({
  initialPatientId,
  initialEncounterId,
}: {
  initialPatientId?: string;
  initialEncounterId?: string;
}) {
  const initialAccounts = cloneBillingAccounts();
  const initialAccount =
    initialAccounts.find(
      (account) =>
        (initialPatientId ? account.patientId === initialPatientId : true) &&
        (initialEncounterId ? account.encounterId === initialEncounterId : true),
    ) ?? initialAccounts[0];

  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeAccountId, setActiveAccountId] = useState(initialAccount.id);
  const [view, setView] = useState<WorkspaceView>("accounts");
  const [filter, setFilter] = useState<WorklistFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<Notice>({
    tone: "information",
    title: "Financial handoff ready for review",
    message:
      "Charges, coverage, invoices and payments are illustrative and remain in this browser session.",
  });

  const [eligibilityOutcome, setEligibilityOutcome] = useState("");
  const [eligibilityReference, setEligibilityReference] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [patientCopay, setPatientCopay] = useState("");
  const [authorizationOutcome, setAuthorizationOutcome] = useState("");
  const [authorizationReference, setAuthorizationReference] = useState("");

  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [discountApproval, setDiscountApproval] = useState("");
  const [voidChargeId, setVoidChargeId] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationApproval, setCancellationApproval] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [payerIdentityConfirmed, setPayerIdentityConfirmed] = useState(false);

  const [refundPaymentId, setRefundPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundApproval, setRefundApproval] = useState("");

  const [reconcilePaymentId, setReconcilePaymentId] = useState("");
  const [settlementReference, setSettlementReference] = useState("");

  const activeAccount =
    accounts.find((account) => account.id === activeAccountId) ?? accounts[0];
  const activePatient = patientFor(activeAccount)!;
  const activeGross = grossFor(activeAccount);
  const activeDiscount = approvedDiscountFor(activeAccount);
  const activeCoverage = coverageFor(activeAccount);
  const activeResponsibility = patientResponsibilityFor(activeAccount);
  const activeBalance = balanceFor(activeAccount);
  const requiresAuthorization = activeAccount.charges.some(
    (charge) => charge.status !== "Voided" && charge.requiresAuthorization,
  );
  const pendingDiscount = activeAccount.discounts.find(
    (discount) => discount.status === "Pending",
  );

  const invoiceReadiness = [
    {
      label: "At least one captured charge",
      done: activeAccount.charges.some((charge) => charge.status === "Captured"),
    },
    {
      label: "No charge holds remain",
      done: !activeAccount.charges.some((charge) => charge.status === "On hold"),
    },
    {
      label: "Discount decisions completed",
      done: !pendingDiscount,
    },
    {
      label: "Coverage eligibility verified",
      done:
        activeAccount.financialClass === "Self-pay" ||
        activeAccount.coverage?.status === "Eligible",
    },
    {
      label: "Required authorization approved",
      done:
        !requiresAuthorization ||
        activeAccount.coverage?.authorizationStatus === "Approved",
    },
  ];
  const readyToFinalize = invoiceReadiness.every((item) => item.done);

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return accounts.filter((account) => {
      const patient = patientFor(account);
      const matchesQuery =
        !query ||
        account.id.toLowerCase().includes(query) ||
        account.encounterId.toLowerCase().includes(query) ||
        account.invoiceNumber?.toLowerCase().includes(query) ||
        patient?.name.toLowerCase().includes(query) ||
        patient?.mrn.toLowerCase().includes(query);
      const matchesFilter =
        filter === "All" ||
        (filter === "Action required" &&
          ["Draft", "Coverage review", "Refund review"].includes(
            account.invoiceStatus,
          )) ||
        (filter === "Collect" &&
          ["Ready to collect", "Partially paid"].includes(
            account.invoiceStatus,
          )) ||
        (filter === "Closed" &&
          ["Paid", "Cancelled"].includes(account.invoiceStatus));
      return matchesQuery && matchesFilter;
    });
  }, [accounts, filter, searchQuery]);

  const metrics = [
    {
      label: "Unbilled charges",
      value: accounts.reduce(
        (sum, account) =>
          sum +
          account.charges.filter((charge) => charge.status === "Captured" && !account.finalizedAt)
            .length,
        0,
      ),
      detail: "Awaiting invoice review",
      tone: "warning" as StatusTone,
    },
    {
      label: "Coverage exceptions",
      value: accounts.filter(
        (account) =>
          account.financialClass === "Insurance" &&
          (account.coverage?.status !== "Eligible" ||
            account.coverage.authorizationStatus === "Pending" ||
            account.coverage.authorizationStatus === "Not assessed"),
      ).length,
      detail: "Eligibility or authorization",
      tone: "critical" as StatusTone,
    },
    {
      label: "Patient balance",
      value: money.format(
        accounts.reduce((sum, account) => sum + balanceFor(account), 0),
      ),
      detail: "Across open invoices",
      tone: "information" as StatusTone,
    },
    {
      label: "Unreconciled",
      value: accounts.reduce(
        (sum, account) =>
          sum +
          account.payments.filter(
            (payment) => payment.reconciliationStatus === "Unreconciled",
          ).length,
        0,
      ),
      detail: "Cashier transactions",
      tone: "warning" as StatusTone,
    },
  ];

  function updateActive(
    updater: (account: BillingAccount) => BillingAccount,
  ) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === activeAccount.id ? updater(account) : account,
      ),
    );
  }

  function selectAccount(accountId: string) {
    setActiveAccountId(accountId);
    setNotice({
      tone: "information",
      title: "Financial account selected",
      message:
        "Review source charges, coverage and prior transactions before taking a consequential action.",
    });
    setPayerIdentityConfirmed(false);
  }

  function refreshChargeCapture() {
    const pendingSources = activeAccount.charges.filter(
      (charge) => charge.status === "On hold",
    );
    setNotice({
      tone: pendingSources.length ? "warning" : "success",
      title: pendingSources.length
        ? "Charge source exceptions remain"
        : "Charge capture is current",
      message: pendingSources.length
        ? `${pendingSources.length} held item(s) require correction before invoice finalization.`
        : "Consultation, diagnostics and pharmacy sources have no newer billable events in this prototype session.",
    });
  }

  function recordEligibility(event: FormEvent) {
    event.preventDefault();
    if (!activeAccount.coverage || !eligibilityOutcome || !eligibilityReference.trim()) {
      setNotice({
        tone: "error",
        title: "Eligibility record incomplete",
        message: "Select an outcome and record the payer response reference.",
      });
      return;
    }
    const nextStatus = eligibilityOutcome as CoverageStatus;
    const nextApproved = Number(approvedAmount || 0);
    const nextCopay = Number(patientCopay || 0);
    updateActive((account) => ({
      ...account,
      invoiceStatus: nextStatus === "Eligible" ? "Draft" : "Coverage review",
      coverage: account.coverage
        ? {
            ...account.coverage,
            status: nextStatus,
            verifiedAt: sessionTime(),
            responseReference: eligibilityReference.trim(),
            approvedAmount: nextStatus === "Eligible" ? nextApproved : 0,
            patientCopay: nextStatus === "Eligible" ? nextCopay : 0,
            authorizationStatus:
              nextStatus === "Eligible"
                ? requiresAuthorization
                  ? "Pending"
                  : "Not required"
                : "Not assessed",
          }
        : undefined,
    }));
    setNotice({
      tone: nextStatus === "Eligible" ? "success" : "critical",
      title: `Coverage recorded as ${nextStatus.toLowerCase()}`,
      message:
        "The payer response, estimate and verification time are linked to this encounter.",
    });
  }

  function recordAuthorization(event: FormEvent) {
    event.preventDefault();
    if (!activeAccount.coverage || !authorizationOutcome || !authorizationReference.trim()) {
      setNotice({
        tone: "error",
        title: "Authorization decision incomplete",
        message: "Record both the payer decision and its reference number.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      invoiceStatus:
        authorizationOutcome === "Approved" ? "Draft" : "Coverage review",
      coverage: account.coverage
        ? {
            ...account.coverage,
            authorizationStatus:
              authorizationOutcome as "Approved" | "Denied" | "Pending",
            authorizationReference: authorizationReference.trim(),
          }
        : undefined,
    }));
    setNotice({
      tone: authorizationOutcome === "Approved" ? "success" : "critical",
      title: `Authorization ${authorizationOutcome.toLowerCase()}`,
      message:
        authorizationOutcome === "Approved"
          ? "The authorized service can proceed to invoice review."
          : "Financial clearance remains blocked until the exception is resolved.",
    });
  }

  function requestDiscount(event: FormEvent) {
    event.preventDefault();
    const amount = Number(discountAmount);
    if (!amount || amount <= 0 || amount >= activeGross || !discountReason.trim()) {
      setNotice({
        tone: "error",
        title: "Discount request invalid",
        message:
          "Enter a positive amount below the gross charge and a documented reason.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      discounts: [
        ...account.discounts,
        {
          id: `DISC-${Date.now()}`,
          amount,
          reason: discountReason.trim(),
          status: "Pending",
          requestedAt: sessionTime(),
          requestedBy: "Kiran M, Billing executive",
        },
      ],
    }));
    setDiscountAmount("");
    setDiscountReason("");
    setNotice({
      tone: "warning",
      title: "Discount awaiting approval",
      message:
        "The invoice remains blocked until an authorized approver records a decision.",
    });
  }

  function approveDiscount() {
    if (!pendingDiscount || !discountApproval.trim()) {
      setNotice({
        tone: "error",
        title: "Approval reference required",
        message: "Record the authorized approver or approval reference.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      discounts: account.discounts.map((discount) =>
        discount.id === pendingDiscount.id
          ? {
              ...discount,
              status: "Approved",
              approvalReference: discountApproval.trim(),
              decidedAt: sessionTime(),
            }
          : discount,
      ),
    }));
    setDiscountApproval("");
    setNotice({
      tone: "success",
      title: "Discount approval recorded",
      message: "The approved adjustment is visible in the invoice calculation and audit trail.",
    });
  }

  function voidCharge(event: FormEvent) {
    event.preventDefault();
    if (!voidChargeId || voidReason.trim().length < 8) {
      setNotice({
        tone: "error",
        title: "Charge void requires evidence",
        message: "Select a charge and provide a specific correction reason.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      charges: account.charges.map((charge) =>
        charge.id === voidChargeId
          ? { ...charge, status: "Voided", voidReason: voidReason.trim() }
          : charge,
      ),
    }));
    setVoidChargeId("");
    setVoidReason("");
    setNotice({
      tone: "warning",
      title: "Charge voided with audit evidence",
      message: "The source item remains visible and is excluded from the invoice total.",
    });
  }

  function finalizeInvoice() {
    if (!readyToFinalize || activeAccount.finalizedAt) return;
    const invoiceNumber = `INV-26-${String(Date.now()).slice(-6)}`;
    updateActive((account) => ({
      ...account,
      invoiceNumber,
      invoiceStatus: balanceFor(account) > 0 ? "Ready to collect" : "Paid",
      finalizedAt: sessionTime(),
    }));
    setNotice({
      tone: "success",
      title: "Invoice finalized",
      message: `${invoiceNumber} is locked for collection. Later corrections require a linked adjustment, refund or cancellation record.`,
    });
  }

  function cancelInvoice(event: FormEvent) {
    event.preventDefault();
    if (
      !activeAccount.finalizedAt ||
      activeAccount.payments.length > 0 ||
      cancellationReason.trim().length < 8 ||
      !cancellationApproval.trim()
    ) {
      setNotice({
        tone: "error",
        title: "Invoice cancellation blocked",
        message:
          "Cancellation requires an unpaid finalized invoice, a specific reason and approval evidence. Paid invoices must use linked refunds or adjustments.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      invoiceStatus: "Cancelled",
      cancellationReason: cancellationReason.trim(),
      cancellationApproval: cancellationApproval.trim(),
      cancelledAt: sessionTime(),
    }));
    setCancellationReason("");
    setCancellationApproval("");
    setNotice({
      tone: "warning",
      title: "Invoice cancelled with approval evidence",
      message:
        "The finalized invoice remains visible and no collection can be recorded against it.",
    });
  }

  function capturePayment(event: FormEvent) {
    event.preventDefault();
    const amount = Number(paymentAmount);
    const referenceRequired = paymentMethod !== "Cash";
    if (
      !activeAccount.finalizedAt ||
      activeAccount.invoiceStatus === "Cancelled" ||
      !payerIdentityConfirmed ||
      !amount ||
      amount <= 0 ||
      amount > activeBalance ||
      (referenceRequired && !paymentReference.trim())
    ) {
      setNotice({
        tone: "error",
        title: "Payment cannot be captured",
        message:
          "Confirm identity, use a valid amount within the balance and record the non-cash transaction reference.",
      });
      return;
    }
    const paymentId = `PAY-26-${String(Date.now()).slice(-6)}`;
    const receiptNumber = `RCT-26-${String(Date.now()).slice(-6)}`;
    updateActive((account) => {
      const nextBalance = Math.max(0, balanceFor(account) - amount);
      return {
        ...account,
        invoiceStatus: nextBalance === 0 ? "Paid" : "Partially paid",
        payments: [
          ...account.payments,
          {
            id: paymentId,
            receiptNumber,
            amount,
            method: paymentMethod,
            reference:
              paymentMethod === "Cash" ? "Cash drawer OPD-01" : paymentReference.trim(),
            capturedAt: sessionTime(),
            capturedBy: "Kiran M, Cashier",
            reconciliationStatus: "Unreconciled",
            refundedAmount: 0,
          },
        ],
      };
    });
    setPaymentAmount("");
    setPaymentReference("");
    setPayerIdentityConfirmed(false);
    setNotice({
      tone: "success",
      title: "Payment captured and receipt generated",
      message: `${receiptNumber} preserves the invoice, method, reference, cashier and time of collection.`,
    });
  }

  function recordRefund(event: FormEvent) {
    event.preventDefault();
    const amount = Number(refundAmount);
    const payment = activeAccount.payments.find(
      (item) => item.id === refundPaymentId,
    );
    const refundable = payment ? payment.amount - payment.refundedAmount : 0;
    if (
      !payment ||
      !amount ||
      amount <= 0 ||
      amount > refundable ||
      refundReason.trim().length < 8 ||
      !refundApproval.trim()
    ) {
      setNotice({
        tone: "error",
        title: "Refund record incomplete",
        message:
          "Select a refundable payment, enter an allowable amount, reason and approval reference.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      invoiceStatus: "Partially paid",
      payments: account.payments.map((item) =>
        item.id === payment.id
          ? { ...item, refundedAmount: item.refundedAmount + amount }
          : item,
      ),
      refunds: [
        ...account.refunds,
        {
          id: `RFND-26-${String(Date.now()).slice(-6)}`,
          paymentId: payment.id,
          amount,
          reason: refundReason.trim(),
          approvalReference: refundApproval.trim(),
          recordedAt: sessionTime(),
          recordedBy: "Kiran M, Cashier",
        },
      ],
    }));
    setRefundPaymentId("");
    setRefundAmount("");
    setRefundReason("");
    setRefundApproval("");
    setNotice({
      tone: "warning",
      title: "Approved refund recorded",
      message:
        "The original receipt remains intact and the linked refund has reopened the patient balance.",
    });
  }

  function reconcilePayment(event: FormEvent) {
    event.preventDefault();
    if (!reconcilePaymentId || !settlementReference.trim()) {
      setNotice({
        tone: "error",
        title: "Settlement evidence required",
        message: "Select a payment and record its bank, terminal or cash-batch reference.",
      });
      return;
    }
    updateActive((account) => ({
      ...account,
      payments: account.payments.map((payment) =>
        payment.id === reconcilePaymentId
          ? {
              ...payment,
              reconciliationStatus: "Reconciled",
              settlementReference: settlementReference.trim(),
              reconciledAt: sessionTime(),
            }
          : payment,
      ),
    }));
    setReconcilePaymentId("");
    setSettlementReference("");
    setNotice({
      tone: "success",
      title: "Payment reconciled",
      message: "The cashier transaction is now linked to its settlement evidence.",
    });
  }

  function renderWorklist() {
    return (
      <Panel className="h-fit">
        <PanelHeader>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
              Financial worklist
            </p>
            <h2 className="mt-1 text-base font-semibold text-ink-primary">
              Patient accounts
            </h2>
          </div>
          <StatusBadge>{filteredAccounts.length}</StatusBadge>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <TextField
            id="billing-search"
            label="Search patient or invoice"
            placeholder="Name, MRN, encounter or invoice"
            value={searchQuery}
            endAdornment={<Search aria-hidden="true" size={15} />}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <SelectField
            id="billing-filter"
            label="Worklist status"
            value={filter}
            onChange={(event) => setFilter(event.target.value as WorklistFilter)}
          >
            <option>All</option>
            <option>Action required</option>
            <option>Collect</option>
            <option>Closed</option>
          </SelectField>
          <div className="space-y-2">
            {filteredAccounts.map((account) => {
              const patient = patientFor(account)!;
              const isActive = account.id === activeAccount.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    isActive
                      ? "border-action bg-selected"
                      : "border-border-default bg-surface hover:border-action hover:bg-surface-subtle",
                  )}
                  onClick={() => selectAccount(account.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink-primary">
                        {patient.name}
                      </p>
                      <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                        {account.encounterId} · {patient.mrn}
                      </p>
                    </div>
                    <StatusBadge tone={invoiceTone(account.invoiceStatus)}>
                      {account.invoiceStatus}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="text-[10px] text-ink-secondary">
                      {account.financialClass}
                    </span>
                    <span className="spine-mono text-sm font-semibold text-ink-primary">
                      {money.format(balanceFor(account))}
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

  function renderInvoice() {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Invoice review
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Source-linked charge capture
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={invoiceTone(activeAccount.invoiceStatus)}>
                {activeAccount.invoiceStatus}
              </StatusBadge>
              <Button
                variant="secondary"
                size="sm"
                startIcon={<RefreshCw aria-hidden="true" size={14} />}
                onClick={refreshChargeCapture}
              >
                Refresh sources
              </Button>
            </div>
          </PanelHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-surface-subtle text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Source evidence</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {activeAccount.charges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="px-5 py-4">
                      <p className={cn("text-xs font-semibold", charge.status === "Voided" ? "text-ink-tertiary line-through" : "text-ink-primary")}>
                        {charge.description}
                      </p>
                      <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                        {charge.code} · Qty {charge.quantity}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-ink-secondary">
                      <p>{charge.source}</p>
                      <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                        {charge.sourceReference} · {charge.capturedAt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        tone={
                          charge.status === "Captured"
                            ? charge.requiresAuthorization
                              ? "warning"
                              : "success"
                            : charge.status === "On hold"
                              ? "critical"
                              : "restricted"
                        }
                      >
                        {charge.status}
                        {charge.requiresAuthorization && charge.status !== "Voided"
                          ? " · Auth"
                          : ""}
                      </StatusBadge>
                      {charge.voidReason ? (
                        <p className="mt-1 text-[10px] text-ink-tertiary">
                          {charge.voidReason}
                        </p>
                      ) : null}
                    </td>
                    <td className="spine-mono px-5 py-4 text-right text-xs font-semibold text-ink-primary">
                      {money.format(charge.quantity * charge.unitAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PanelBody className="border-t border-border-subtle">
            <div className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Gross", activeGross],
                ["Discount", -activeDiscount],
                ["Coverage", -activeCoverage],
                ["Patient share", activeResponsibility],
                ["Balance", activeBalance],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-md bg-surface-subtle p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                    {label}
                  </p>
                  <p className="spine-mono mt-2 font-semibold text-ink-primary">
                    {money.format(Number(value))}
                  </p>
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>

        {!activeAccount.finalizedAt ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <Panel elevation="flat">
              <PanelHeader>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                    Controlled adjustments
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink-primary">
                    Discount approval
                  </h2>
                </div>
                <StatusBadge tone={pendingDiscount ? "warning" : "neutral"}>
                  {pendingDiscount ? "Decision pending" : "No pending request"}
                </StatusBadge>
              </PanelHeader>
              <PanelBody>
                {pendingDiscount ? (
                  <div className="space-y-4">
                    <Alert tone="warning" title={`${money.format(pendingDiscount.amount)} approval required`}>
                      {pendingDiscount.reason} · requested {pendingDiscount.requestedAt}
                    </Alert>
                    <TextField
                      id="discount-approval"
                      label="Approver or approval reference"
                      value={discountApproval}
                      onChange={(event) => setDiscountApproval(event.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={approveDiscount}>Approve adjustment</Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={requestDiscount}>
                    <TextField
                      id="discount-amount"
                      label="Requested amount"
                      type="number"
                      min="1"
                      max={Math.max(1, activeGross - 1)}
                      value={discountAmount}
                      onChange={(event) => setDiscountAmount(event.target.value)}
                    />
                    <TextareaField
                      id="discount-reason"
                      label="Reason and supporting context"
                      value={discountReason}
                      onChange={setDiscountReason}
                    />
                    <div className="flex justify-end">
                      <Button type="submit">Request approval</Button>
                    </div>
                  </form>
                )}
              </PanelBody>
            </Panel>

            <Panel elevation="flat">
              <PanelHeader>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                    Correction control
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-ink-primary">
                    Void incorrect charge
                  </h2>
                </div>
                <StatusBadge tone="warning">Audit required</StatusBadge>
              </PanelHeader>
              <PanelBody>
                <form className="space-y-4" onSubmit={voidCharge}>
                  <SelectField
                    id="void-charge"
                    label="Captured charge"
                    value={voidChargeId}
                    onChange={(event) => setVoidChargeId(event.target.value)}
                  >
                    <option value="">Select charge</option>
                    {activeAccount.charges
                      .filter((charge) => charge.status !== "Voided")
                      .map((charge) => (
                        <option key={charge.id} value={charge.id}>
                          {charge.description} · {money.format(charge.unitAmount)}
                        </option>
                      ))}
                  </SelectField>
                  <TextareaField
                    id="void-reason"
                    label="Correction reason"
                    value={voidReason}
                    onChange={setVoidReason}
                    placeholder="Explain why this source charge must be excluded"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="critical">
                      Void selected charge
                    </Button>
                  </div>
                </form>
              </PanelBody>
            </Panel>
          </div>
        ) : null}

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Financial clearance
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                Invoice finalization
              </h2>
            </div>
            <StatusBadge tone={activeAccount.finalizedAt ? "success" : readyToFinalize ? "information" : "warning"}>
              {activeAccount.finalizedAt ? activeAccount.invoiceNumber : readyToFinalize ? "Ready" : "Blocked"}
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {activeAccount.finalizedAt ? (
              <div className="space-y-5">
                <Alert
                  tone={activeAccount.invoiceStatus === "Cancelled" ? "restricted" : "success"}
                  title={activeAccount.invoiceStatus === "Cancelled" ? "Invoice cancelled and locked" : "Invoice locked for financial transactions"}
                >
                  {activeAccount.invoiceStatus === "Cancelled"
                    ? `${activeAccount.cancellationReason} · ${activeAccount.cancellationApproval} · ${activeAccount.cancelledAt}`
                    : `Finalized ${activeAccount.finalizedAt}. Payments, approved refunds and linked adjustments preserve the original invoice.`}
                </Alert>
                {activeAccount.payments.length === 0 && activeAccount.invoiceStatus !== "Cancelled" ? (
                  <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end" onSubmit={cancelInvoice}>
                    <TextField
                      id="cancellation-reason"
                      label="Cancellation reason"
                      value={cancellationReason}
                      onChange={(event) => setCancellationReason(event.target.value)}
                    />
                    <TextField
                      id="cancellation-approval"
                      label="Approval reference"
                      value={cancellationApproval}
                      onChange={(event) => setCancellationApproval(event.target.value)}
                    />
                    <Button type="submit" variant="critical">
                      Cancel unpaid invoice
                    </Button>
                  </form>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="grid gap-2 sm:grid-cols-2">
                  {invoiceReadiness.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-ink-secondary">
                      <CheckCircle2
                        aria-hidden="true"
                        size={15}
                        className={item.done ? "text-success" : "text-ink-tertiary"}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
                <Button
                  disabled={!readyToFinalize}
                  startIcon={<FileCheck2 aria-hidden="true" size={15} />}
                  onClick={finalizeInvoice}
                >
                  Finalize invoice
                </Button>
              </div>
            )}
          </PanelBody>
        </Panel>
      </div>
    );
  }

  function renderCoverage() {
    if (activeAccount.financialClass === "Self-pay" || !activeAccount.coverage) {
      return (
        <Panel>
          <PanelBody>
            <Alert tone="information" title="Self-pay account selected">
              No payer eligibility or authorization is required. Review charges and finalize the invoice from Patient accounts.
            </Alert>
          </PanelBody>
        </Panel>
      );
    }
    const coverage = activeAccount.coverage;
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">
                Coverage record
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">
                {coverage.payer} · {coverage.plan}
              </h2>
            </div>
            <StatusBadge tone={coverageTone(coverage.status)}>{coverage.status}</StatusBadge>
          </PanelHeader>
          <PanelBody>
            <dl className="grid gap-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Member</dt>
                <dd className="spine-mono mt-1 text-ink-primary">{coverage.memberId}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Policy holder</dt>
                <dd className="mt-1 text-ink-primary">{coverage.policyHolder}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Valid to</dt>
                <dd className="mt-1 text-ink-primary">{coverage.validTo ?? "Not returned"}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Payer response</dt>
                <dd className="spine-mono mt-1 text-ink-primary">{coverage.responseReference ?? "Not recorded"}</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Payer verification</p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">Eligibility and estimate</h2>
              </div>
              <Landmark aria-hidden="true" size={18} className="text-action" />
            </PanelHeader>
            <PanelBody>
              <form className="space-y-4" onSubmit={recordEligibility}>
                <SelectField
                  id="eligibility-outcome"
                  label="Eligibility outcome"
                  value={eligibilityOutcome}
                  onChange={(event) => setEligibilityOutcome(event.target.value)}
                >
                  <option value="">Select payer response</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Verification required">Needs more information</option>
                </SelectField>
                <TextField
                  id="eligibility-reference"
                  label="Payer response reference"
                  value={eligibilityReference}
                  onChange={(event) => setEligibilityReference(event.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id="approved-amount"
                    label="Estimated payer responsibility"
                    type="number"
                    min="0"
                    value={approvedAmount}
                    onChange={(event) => setApprovedAmount(event.target.value)}
                  />
                  <TextField
                    id="patient-copay"
                    label="Returned copay"
                    type="number"
                    min="0"
                    value={patientCopay}
                    onChange={(event) => setPatientCopay(event.target.value)}
                  />
                </div>
                <Alert tone="information" title="Estimate, not guarantee">
                  Eligibility and coverage amounts remain payer responses until adjudication; they are not recorded as patient payments.
                </Alert>
                <div className="flex justify-end">
                  <Button type="submit" startIcon={<ShieldCheck aria-hidden="true" size={15} />}>
                    Record eligibility response
                  </Button>
                </div>
              </form>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Prior authorization</p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">Govern service clearance</h2>
              </div>
              <StatusBadge tone={coverage.authorizationStatus === "Approved" ? "success" : coverage.authorizationStatus === "Denied" ? "critical" : "warning"}>
                {coverage.authorizationStatus}
              </StatusBadge>
            </PanelHeader>
            <PanelBody>
              {requiresAuthorization ? (
                <form className="space-y-4" onSubmit={recordAuthorization}>
                  <Alert tone="warning" title="Authorization-sensitive charge present">
                    {activeAccount.charges.filter((charge) => charge.requiresAuthorization && charge.status !== "Voided").map((charge) => charge.description).join(", ")}
                  </Alert>
                  <SelectField
                    id="authorization-outcome"
                    label="Payer decision"
                    value={authorizationOutcome}
                    onChange={(event) => setAuthorizationOutcome(event.target.value)}
                  >
                    <option value="">Select decision</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Denied">Denied</option>
                  </SelectField>
                  <TextField
                    id="authorization-reference"
                    label="Authorization or denial reference"
                    value={authorizationReference}
                    onChange={(event) => setAuthorizationReference(event.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">Record payer decision</Button>
                  </div>
                </form>
              ) : (
                <Alert tone="success" title="No prior authorization required">
                  No active source charge on this account is marked authorization-sensitive.
                </Alert>
              )}
            </PanelBody>
          </Panel>
        </div>
      </div>
    );
  }

  function renderCashier() {
    const unreconciled = activeAccount.payments.filter(
      (payment) => payment.reconciliationStatus === "Unreconciled",
    );
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Cashier</p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">Collect patient responsibility</h2>
            </div>
            <StatusBadge tone={activeBalance === 0 ? "success" : "information"}>
              {money.format(activeBalance)} due
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            {!activeAccount.finalizedAt ? (
              <Alert tone="warning" title="Invoice must be finalized before collection">
                Return to Patient accounts and complete the financial-clearance checklist.
              </Alert>
            ) : activeAccount.invoiceStatus === "Cancelled" ? (
              <Alert tone="restricted" title="Cancelled invoice cannot accept payment">
                Review the linked cancellation reason and approval from Patient accounts.
              </Alert>
            ) : activeBalance === 0 ? (
              <Alert tone="success" title="No patient balance remains">
                Collections equal the patient responsibility after coverage and approved adjustments.
              </Alert>
            ) : (
              <form className="space-y-5" onSubmit={capturePayment}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <TextField
                    id="payment-amount"
                    label="Amount to collect"
                    type="number"
                    min="1"
                    max={activeBalance}
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                  />
                  <SelectField
                    id="payment-method"
                    label="Payment method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank transfer</option>
                  </SelectField>
                  <TextField
                    id="payment-reference"
                    label={paymentMethod === "Cash" ? "Drawer note (optional)" : "Transaction reference"}
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                  />
                </div>
                <CheckboxField
                  id="payer-identity"
                  label="Patient or authorized payer identity confirmed"
                  description={`${activePatient.name} · ${activePatient.mrn} · ${activeAccount.invoiceNumber}`}
                  checked={payerIdentityConfirmed}
                  onChange={(event) => setPayerIdentityConfirmed(event.target.checked)}
                />
                <div className="flex justify-end">
                  <Button type="submit" startIcon={<ReceiptIndianRupee aria-hidden="true" size={15} />}>
                    Capture payment & issue receipt
                  </Button>
                </div>
              </form>
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Receipts</p>
              <h2 className="mt-1 text-base font-semibold text-ink-primary">Payment and refund ledger</h2>
            </div>
            <StatusBadge>{activeAccount.payments.length} transaction(s)</StatusBadge>
          </PanelHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead className="bg-surface-subtle text-[9px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
                <tr>
                  <th className="px-5 py-3">Receipt</th>
                  <th className="px-5 py-3">Method and reference</th>
                  <th className="px-5 py-3">Settlement</th>
                  <th className="px-5 py-3 text-right">Captured</th>
                  <th className="px-5 py-3 text-right">Refunded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {activeAccount.payments.length ? (
                  activeAccount.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-5 py-4">
                        <p className="spine-mono text-xs font-semibold text-ink-primary">{payment.receiptNumber}</p>
                        <p className="mt-1 text-[10px] text-ink-tertiary">{payment.capturedAt} · {payment.capturedBy}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-ink-secondary">
                        {payment.method}
                        <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">{payment.reference}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={payment.reconciliationStatus === "Reconciled" ? "success" : "warning"}>
                          {payment.reconciliationStatus}
                        </StatusBadge>
                        {payment.settlementReference ? (
                          <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">{payment.settlementReference}</p>
                        ) : null}
                      </td>
                      <td className="spine-mono px-5 py-4 text-right text-xs font-semibold text-ink-primary">{money.format(payment.amount)}</td>
                      <td className="spine-mono px-5 py-4 text-right text-xs text-critical">{money.format(payment.refundedAmount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-ink-tertiary">No receipt has been issued for this account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Governed reversal</p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">Record approved refund</h2>
              </div>
              <Undo2 aria-hidden="true" size={18} className="text-critical" />
            </PanelHeader>
            <PanelBody>
              <form className="space-y-4" onSubmit={recordRefund}>
                <SelectField
                  id="refund-payment"
                  label="Original payment"
                  value={refundPaymentId}
                  onChange={(event) => setRefundPaymentId(event.target.value)}
                >
                  <option value="">Select receipt</option>
                  {activeAccount.payments
                    .filter((payment) => payment.amount > payment.refundedAmount)
                    .map((payment) => (
                      <option key={payment.id} value={payment.id}>
                        {payment.receiptNumber} · {money.format(payment.amount - payment.refundedAmount)} refundable
                      </option>
                    ))}
                </SelectField>
                <TextField
                  id="refund-amount"
                  label="Refund amount"
                  type="number"
                  min="1"
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                />
                <TextareaField id="refund-reason" label="Refund reason" value={refundReason} onChange={setRefundReason} />
                <TextField
                  id="refund-approval"
                  label="Authorized approval reference"
                  value={refundApproval}
                  onChange={(event) => setRefundApproval(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="critical">Record approved refund</Button>
                </div>
              </form>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-action">Cashier close</p>
                <h2 className="mt-1 text-base font-semibold text-ink-primary">Payment reconciliation</h2>
              </div>
              <StatusBadge tone={unreconciled.length ? "warning" : "success"}>{unreconciled.length} open</StatusBadge>
            </PanelHeader>
            <PanelBody>
              {unreconciled.length ? (
                <form className="space-y-4" onSubmit={reconcilePayment}>
                  <SelectField
                    id="reconcile-payment"
                    label="Unreconciled payment"
                    value={reconcilePaymentId}
                    onChange={(event) => setReconcilePaymentId(event.target.value)}
                  >
                    <option value="">Select transaction</option>
                    {unreconciled.map((payment) => (
                      <option key={payment.id} value={payment.id}>
                        {payment.receiptNumber} · {payment.method} · {money.format(payment.amount)}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    id="settlement-reference"
                    label="Settlement, terminal or cash-batch reference"
                    value={settlementReference}
                    onChange={(event) => setSettlementReference(event.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" startIcon={<Banknote aria-hidden="true" size={15} />}>Reconcile payment</Button>
                  </div>
                </form>
              ) : (
                <Alert tone="success" title="Cashier ledger reconciled">
                  Every captured payment on this account is linked to settlement evidence.
                </Alert>
              )}
            </PanelBody>
          </Panel>
        </div>

        {activeAccount.refunds.length ? (
          <Alert tone="warning" title="Linked refund history">
            {activeAccount.refunds.map((refund) => `${refund.id}: ${money.format(refund.amount)} · ${refund.reason} · ${refund.approvalReference}`).join(" | ")}
          </Alert>
        ) : null}
      </div>
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <ButtonLink
            href="/pharmacy"
            variant="tertiary"
            size="sm"
            className="-ml-3"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
          >
            Back to pharmacy
          </ButtonLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Integrated OPD · Financial operations
            </p>
            <StatusBadge>Illustrative session data</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Billing, insurance and payments
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Reconcile source charges, verify coverage, govern adjustments, collect patient responsibility and close cashier evidence.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={view === "accounts" ? "primary" : "secondary"}
            startIcon={<FileText aria-hidden="true" size={15} />}
            onClick={() => setView("accounts")}
          >
            Patient accounts
          </Button>
          <Button
            variant={view === "coverage" ? "primary" : "secondary"}
            startIcon={<Landmark aria-hidden="true" size={15} />}
            onClick={() => setView("coverage")}
          >
            Coverage & auth
          </Button>
          <Button
            variant={view === "cashier" ? "primary" : "secondary"}
            startIcon={<WalletCards aria-hidden="true" size={15} />}
            onClick={() => setView("cashier")}
          >
            Cashier & receipts
          </Button>
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
          encounter={activeAccount.encounterId}
          location="OPD billing"
          clinician={activePatient.clinician ?? "Responsible clinician"}
          allergies={activePatient.allergies}
          verifiedAt="financial handoff · this session"
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
        {view === "accounts" ? renderInvoice() : view === "coverage" ? renderCoverage() : renderCashier()}
      </div>

      <Panel elevation="flat" className="mt-6">
        <PanelBody className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
              <History aria-hidden="true" size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-primary">Financial audit continuity</p>
              <p className="mt-1 text-[10px] text-ink-secondary">{activeAccount.auditNote}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CreditCard aria-hidden="true" size={14} className="text-action" />
              <span className="spine-mono text-[10px] text-ink-tertiary">{activeAccount.id} · {activeAccount.invoiceNumber ?? "Invoice not finalized"}</span>
            </div>
            <ButtonLink
              href={`/visit-closure?patient=${activeAccount.patientId}&encounter=${activeAccount.encounterId}`}
              size="sm"
              variant="secondary"
              startIcon={<ClipboardCheck aria-hidden="true" size={14} />}
            >
              Open visit closure handoff
            </ButtonLink>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
