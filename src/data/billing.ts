export type ChargeSource = "Consultation" | "Diagnostics" | "Pharmacy" | "Manual";

export type ChargeStatus = "Captured" | "On hold" | "Voided";

export type InvoiceStatus =
  | "Draft"
  | "Coverage review"
  | "Ready to collect"
  | "Partially paid"
  | "Paid"
  | "Refund review"
  | "Cancelled";

export type CoverageStatus =
  | "Not applicable"
  | "Verification required"
  | "Eligible"
  | "Inactive";

export type AuthorizationStatus =
  | "Not required"
  | "Not assessed"
  | "Pending"
  | "Approved"
  | "Denied";

export type BillingCharge = {
  id: string;
  source: ChargeSource;
  sourceReference: string;
  code: string;
  description: string;
  quantity: number;
  unitAmount: number;
  status: ChargeStatus;
  capturedAt: string;
  requiresAuthorization?: boolean;
  voidReason?: string;
};

export type CoverageRecord = {
  payer: string;
  plan: string;
  memberId: string;
  policyHolder: string;
  status: CoverageStatus;
  verifiedAt?: string;
  responseReference?: string;
  authorizationStatus: AuthorizationStatus;
  authorizationReference?: string;
  approvedAmount: number;
  patientCopay: number;
  validTo?: string;
};

export type DiscountRequest = {
  id: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: string;
  requestedBy: string;
  approvalReference?: string;
  decidedAt?: string;
};

export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank transfer";

export type PaymentRecord = {
  id: string;
  receiptNumber: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  capturedAt: string;
  capturedBy: string;
  reconciliationStatus: "Unreconciled" | "Reconciled";
  settlementReference?: string;
  reconciledAt?: string;
  refundedAmount: number;
};

export type RefundRecord = {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  approvalReference: string;
  recordedAt: string;
  recordedBy: string;
};

export type BillingAccount = {
  id: string;
  patientId: string;
  encounterId: string;
  invoiceNumber?: string;
  invoiceStatus: InvoiceStatus;
  financialClass: "Self-pay" | "Insurance";
  charges: BillingCharge[];
  coverage?: CoverageRecord;
  discounts: DiscountRequest[];
  payments: PaymentRecord[];
  refunds: RefundRecord[];
  openedAt: string;
  finalizedAt?: string;
  cancellationReason?: string;
  cancellationApproval?: string;
  cancelledAt?: string;
  auditNote: string;
};

export const billingAccounts: BillingAccount[] = [
  {
    id: "BA-26-08161",
    patientId: "pt-farah-khan",
    encounterId: "OPD-26-08161",
    invoiceStatus: "Coverage review",
    financialClass: "Insurance",
    openedAt: "02 Aug 2026, 10:51 IST",
    auditNote: "MRI requires payer authorization before financial clearance.",
    coverage: {
      payer: "Nadi Health Assurance",
      plan: "Family Plus",
      memberId: "NHA-••••-3096",
      policyHolder: "Farah Khan",
      status: "Verification required",
      authorizationStatus: "Not assessed",
      approvedAmount: 0,
      patientCopay: 0,
      validTo: "31 Mar 2027",
    },
    charges: [
      {
        id: "CHG-08161-C01",
        source: "Consultation",
        sourceReference: "OPD-26-08161",
        code: "CONS-ORTHO",
        description: "Orthopaedic consultation",
        quantity: 1,
        unitAmount: 900,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:22 IST",
      },
      {
        id: "CHG-08161-D01",
        source: "Diagnostics",
        sourceReference: "IMG-26-00471",
        code: "MRI-KNEE",
        description: "MRI knee without contrast",
        quantity: 1,
        unitAmount: 7500,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:31 IST",
        requiresAuthorization: true,
      },
      {
        id: "CHG-08161-P01",
        source: "Pharmacy",
        sourceReference: "RX-26-08161-01",
        code: "PHARM-RX",
        description: "Dispensed OPD medication",
        quantity: 1,
        unitAmount: 340,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:48 IST",
      },
    ],
    discounts: [],
    payments: [],
    refunds: [],
  },
  {
    id: "BA-26-08154",
    patientId: "pt-meera-nair",
    encounterId: "OPD-26-08154",
    invoiceNumber: "INV-26-004582",
    invoiceStatus: "Ready to collect",
    financialClass: "Insurance",
    openedAt: "02 Aug 2026, 10:36 IST",
    finalizedAt: "02 Aug 2026, 12:04 IST",
    auditNote: "Coverage verified; patient share is ready for collection.",
    coverage: {
      payer: "WellCare India",
      plan: "Corporate OPD",
      memberId: "WCI-••••-4718",
      policyHolder: "Meera Nair",
      status: "Eligible",
      verifiedAt: "02 Aug 2026, 11:02 IST",
      responseReference: "ELG-WCI-260802-1187",
      authorizationStatus: "Not required",
      approvedAmount: 1800,
      patientCopay: 250,
      validTo: "31 Dec 2026",
    },
    charges: [
      {
        id: "CHG-08154-C01",
        source: "Consultation",
        sourceReference: "OPD-26-08154",
        code: "CONS-CARD",
        description: "Cardiology consultation",
        quantity: 1,
        unitAmount: 1100,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:50 IST",
      },
      {
        id: "CHG-08154-D01",
        source: "Diagnostics",
        sourceReference: "LAB-26-10084",
        code: "LAB-CBC",
        description: "Complete blood count",
        quantity: 1,
        unitAmount: 450,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:53 IST",
      },
      {
        id: "CHG-08154-P01",
        source: "Pharmacy",
        sourceReference: "RX-26-08154-03",
        code: "PHARM-RX",
        description: "Dispensed OPD medication",
        quantity: 1,
        unitAmount: 500,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:57 IST",
      },
    ],
    discounts: [],
    payments: [],
    refunds: [],
  },
  {
    id: "BA-26-08149",
    patientId: "pt-arjun-menon",
    encounterId: "OPD-26-08149",
    invoiceStatus: "Draft",
    financialClass: "Self-pay",
    openedAt: "02 Aug 2026, 10:41 IST",
    auditNote: "All downstream charge sources have responded.",
    charges: [
      {
        id: "CHG-08149-C01",
        source: "Consultation",
        sourceReference: "OPD-26-08149",
        code: "CONS-GM",
        description: "General medicine consultation",
        quantity: 1,
        unitAmount: 650,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:21 IST",
      },
      {
        id: "CHG-08149-D01",
        source: "Diagnostics",
        sourceReference: "LAB-26-10079",
        code: "LAB-METAB",
        description: "Basic metabolic panel",
        quantity: 1,
        unitAmount: 920,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:27 IST",
      },
      {
        id: "CHG-08149-P01",
        source: "Pharmacy",
        sourceReference: "RX-26-08149-01",
        code: "PHARM-RX",
        description: "Dispensed OPD medication",
        quantity: 1,
        unitAmount: 180,
        status: "Captured",
        capturedAt: "02 Aug 2026, 11:34 IST",
      },
    ],
    discounts: [],
    payments: [],
    refunds: [],
  },
  {
    id: "BA-26-08138",
    patientId: "pt-meera-k-nair",
    encounterId: "OPD-26-08138",
    invoiceNumber: "INV-26-004571",
    invoiceStatus: "Paid",
    financialClass: "Self-pay",
    openedAt: "02 Aug 2026, 09:12 IST",
    finalizedAt: "02 Aug 2026, 09:46 IST",
    auditNote: "Invoice paid and cashier settlement reconciled.",
    charges: [
      {
        id: "CHG-08138-C01",
        source: "Consultation",
        sourceReference: "OPD-26-08138",
        code: "CONS-GM",
        description: "General medicine consultation",
        quantity: 1,
        unitAmount: 650,
        status: "Captured",
        capturedAt: "02 Aug 2026, 09:38 IST",
      },
      {
        id: "CHG-08138-P01",
        source: "Pharmacy",
        sourceReference: "RX-26-08138-01",
        code: "PHARM-RX",
        description: "Dispensed OPD medication",
        quantity: 1,
        unitAmount: 250,
        status: "Captured",
        capturedAt: "02 Aug 2026, 09:44 IST",
      },
    ],
    discounts: [],
    payments: [
      {
        id: "PAY-26-009882",
        receiptNumber: "RCT-26-009882",
        amount: 900,
        method: "UPI",
        reference: "UPI-682041",
        capturedAt: "02 Aug 2026, 09:50 IST",
        capturedBy: "Kiran M, Cashier",
        reconciliationStatus: "Reconciled",
        settlementReference: "SETTLE-260802-AM",
        reconciledAt: "02 Aug 2026, 10:05 IST",
        refundedAmount: 0,
      },
    ],
    refunds: [],
  },
];

export function cloneBillingAccounts() {
  return structuredClone(billingAccounts);
}
