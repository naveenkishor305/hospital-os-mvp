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
