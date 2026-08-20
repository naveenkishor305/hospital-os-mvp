import type { ComparisonCandidate, ComparisonCriterion } from "@naveenkishor305/spine-ui";

export const sourcingCriteria: ComparisonCriterion[] = [
  { id: "price", label: "Price", weight: 0.4 },
  { id: "delivery", label: "Delivery reliability", weight: 0.35 },
  { id: "compliance", label: "Compliance", weight: 0.25 },
];

export const sourcingCandidates: ComparisonCandidate[] = [
  { id: "meditech", name: "MediTech Supplies", scores: { price: 8, delivery: 9, compliance: 10 }, recommended: true },
  { id: "carewell", name: "Carewell Distribution", scores: { price: 9, delivery: 6, compliance: 8 } },
  { id: "healthlink", name: "HealthLink Partners", scores: { price: 7, delivery: 7, compliance: 9 } },
];

export const prototypeInventoryLevels = [
  { id: "iv-fluid", label: "IV Fluid — 0.9% NaCl 500ml", current: 340, min: 200, max: 600, unit: "units" },
  { id: "gloves-m", label: "Surgical gloves — size M", current: 80, min: 150, max: 500, unit: "boxes" },
  { id: "sutures", label: "Absorbable sutures 3-0", current: 210, min: 100, max: 400, unit: "packs" },
];

export type ProcurementTicket = {
  id: string;
  title: string;
  location: string;
  priority: "low" | "standard" | "high" | "urgent";
  status: "new" | "assigned" | "in-progress" | "verified" | "closed";
  assignee?: string;
  requestedAt: string;
};

export const prototypeProcurementColumns: {
  status: ProcurementTicket["status"];
  label: string;
  tickets: ProcurementTicket[];
}[] = [
  {
    status: "new",
    label: "New",
    tickets: [
      { id: "po-1", title: "Emergency reorder — surgical gloves", location: "Central Warehouse", priority: "urgent", status: "new", requestedAt: "10 min ago" },
    ],
  },
  {
    status: "assigned",
    label: "Assigned",
    tickets: [
      { id: "po-2", title: "Goods receipt — IV fluid shipment", location: "Receiving Bay 2", priority: "standard", status: "assigned", assignee: "Warehouse team B", requestedAt: "1 hr ago" },
    ],
  },
  {
    status: "verified",
    label: "Verified",
    tickets: [
      { id: "po-3", title: "Cycle count — Pharmacy store", location: "Pharmacy Store 1", priority: "low", status: "verified", assignee: "Inventory audit team", requestedAt: "3 hr ago" },
    ],
  },
];
