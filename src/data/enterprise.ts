import type { HierarchyNode } from "@naveenkishor305/spine-ui";

export const prototypeOrgHierarchy: HierarchyNode[] = [
  {
    id: "hospital",
    label: "Hospital OS",
    meta: "Enterprise",
    children: [
      {
        id: "clinical-ops",
        label: "Clinical Operations",
        meta: "5 departments",
        children: [
          { id: "ed", label: "Emergency Department" },
          { id: "icu", label: "Intensive Care Unit" },
          { id: "wards", label: "Inpatient Wards" },
        ],
      },
      {
        id: "support-services",
        label: "Support Services",
        meta: "6 departments",
        children: [
          { id: "biomedical", label: "Biomedical Engineering" },
          { id: "facilities", label: "Facilities Management" },
          { id: "supply-chain", label: "Supply Chain" },
        ],
      },
      { id: "finance", label: "Finance & Revenue Cycle", meta: "3 departments" },
    ],
  },
];

export const prototypeDepartmentVolume = [
  { id: "opd", label: "Outpatient Care", value: 412, displayValue: "412 visits" },
  { id: "ed", label: "Emergency", value: 298, displayValue: "298 visits" },
  { id: "inpatient", label: "Inpatient Wards", value: 176, displayValue: "176 bed-days" },
  { id: "pharmacy", label: "Pharmacy", value: 94, displayValue: "94 dispenses" },
];

export type ScorecardMetric = {
  label: string;
  value: string;
  variance: string;
  sentiment: "positive" | "negative" | "neutral";
};

export const prototypeScorecard: ScorecardMetric[] = [
  { label: "Average length of stay", value: "4.2 days", variance: "-0.3 days", sentiment: "positive" },
  { label: "SLA breaches (facility ops)", value: "3", variance: "+1", sentiment: "negative" },
  { label: "Bed occupancy", value: "87%", variance: "No change", sentiment: "neutral" },
  { label: "Denial rate", value: "6.1%", variance: "-0.8pp", sentiment: "positive" },
];

export type FlatHierarchyOption = { id: string; label: string; depth: number };

/** Flattens the tree into parent-selectable options for the "Add department" form. */
export function flattenHierarchy(nodes: HierarchyNode[], depth = 0): FlatHierarchyOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, label: node.label, depth },
    ...flattenHierarchy(node.children ?? [], depth + 1),
  ]);
}

/** Immutably inserts a new child under the node matching parentId, anywhere in the tree. */
export function addChildToHierarchy(
  nodes: HierarchyNode[],
  parentId: string,
  child: HierarchyNode,
): HierarchyNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), child] };
    }
    if (node.children) {
      return { ...node, children: addChildToHierarchy(node.children, parentId, child) };
    }
    return node;
  });
}

export const businessUnits = ["Clinical Operations", "Support Services", "Finance & Revenue Cycle"];

export type GuestRequest = {
  id: string;
  guest: string;
  request: string;
  category: "Amenity" | "Interpreter" | "Accommodation" | "Grievance";
  status: "open" | "resolved";
};

export const prototypeGuestRequests: GuestRequest[] = [
  { id: "gr-1", guest: "Farah Khan (attendant)", request: "Extra blanket and pillow for overnight stay", category: "Amenity", status: "open" },
  { id: "gr-2", guest: "Mohammed Farooq", request: "Malayalam interpreter for consent discussion", category: "Interpreter", status: "open" },
  { id: "gr-3", guest: "Priya Nambiar (family)", request: "Family accommodation near ICU during critical stay", category: "Accommodation", status: "resolved" },
];
