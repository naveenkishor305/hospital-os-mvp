import type { ProcessStage } from "@naveenkishor305/spine-ui";

export type ClaimSummary = {
  id: string;
  patient: string;
  payer: string;
  amount: string;
  stages: ProcessStage[];
};

export const prototypeClaims: ClaimSummary[] = [
  {
    id: "clm-1",
    patient: "Meera Nair",
    payer: "Star Health Insurance",
    amount: "₹48,200",
    stages: [
      { id: "submitted", label: "Submitted", status: "complete" },
      { id: "scrubbed", label: "Scrubbed", status: "complete" },
      { id: "adjudicated", label: "Adjudicated", status: "current" },
      { id: "paid", label: "Paid", status: "upcoming" },
    ],
  },
  {
    id: "clm-2",
    patient: "Arjun Menon",
    payer: "ICICI Lombard",
    amount: "₹12,650",
    stages: [
      { id: "submitted", label: "Submitted", status: "complete" },
      { id: "scrubbed", label: "Scrubbed", status: "complete" },
      { id: "adjudicated", label: "Adjudicated", status: "blocked" },
      { id: "paid", label: "Paid", status: "upcoming" },
    ],
  },
];

export const prototypeAgingBuckets = [
  { id: "current", label: "Current", amount: 412000, displayAmount: "₹4,12,000", severity: "success" as const },
  { id: "31-60", label: "31–60 days", amount: 186000, displayAmount: "₹1,86,000", severity: "neutral" as const },
  { id: "61-90", label: "61–90 days", amount: 74000, displayAmount: "₹74,000", severity: "warning" as const },
  { id: "90plus", label: "90+ days", amount: 39000, displayAmount: "₹39,000", severity: "critical" as const },
];

export type DenialRecord = {
  id: string;
  patient: string;
  reason: string;
  category: "Medical necessity" | "Coding" | "Authorization" | "Eligibility";
  amount: string;
  appealed?: boolean;
};

export const prototypeDenials: DenialRecord[] = [
  { id: "den-1", patient: "Farah Khan", reason: "Prior authorization not on file", category: "Authorization", amount: "₹22,400" },
  { id: "den-2", patient: "Ravi Chandran", reason: "CPT/diagnosis mismatch", category: "Coding", amount: "₹8,150" },
  { id: "den-3", patient: "Suresh Babu", reason: "Coverage lapsed prior to admission", category: "Eligibility", amount: "₹31,900" },
];

export const payerRoster = [
  "Star Health Insurance",
  "ICICI Lombard",
  "HDFC Ergo",
  "National Insurance Co.",
  "Self-pay",
];

export function buildSubmittedClaimStages(authorizationOnFile: boolean): ProcessStage[] {
  return [
    { id: "submitted", label: "Submitted", status: "complete" },
    { id: "scrubbed", label: "Scrubbed", status: "complete" },
    {
      id: "adjudicated",
      label: "Adjudicated",
      status: authorizationOnFile ? "current" : "blocked",
    },
    { id: "paid", label: "Paid", status: "upcoming" },
  ];
}

export function buildAppealStages(): ProcessStage[] {
  return [
    { id: "original", label: "Original claim", status: "complete" },
    { id: "denied", label: "Denied", status: "complete" },
    { id: "appealed", label: "Appeal submitted", status: "current" },
    { id: "resolved", label: "Resolved", status: "upcoming" },
  ];
}
