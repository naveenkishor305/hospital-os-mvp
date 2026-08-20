import type { RequestTicket } from "@naveenkishor305/spine-ui";

export const prototypeFacilityColumns: {
  status: RequestTicket["status"];
  label: string;
  tickets: RequestTicket[];
}[] = [
  {
    status: "new",
    label: "New",
    tickets: [
      { id: "fac-1", title: "Isolation room terminal clean", location: "Ward 4B · Room 412", priority: "high", status: "new", requestedAt: "5 min ago" },
      { id: "fac-2", title: "Visitor badge — external contractor", location: "Main lobby", priority: "standard", status: "new", requestedAt: "12 min ago" },
    ],
  },
  {
    status: "assigned",
    label: "Assigned",
    tickets: [
      { id: "fac-3", title: "Infusion pump repair", location: "Biomedical workshop", priority: "urgent", status: "assigned", assignee: "R. Fernandes", requestedAt: "22 min ago" },
      { id: "fac-4", title: "Linen shortage — ICU", location: "ICU linen store", priority: "high", status: "assigned", assignee: "Linen services team", requestedAt: "40 min ago" },
    ],
  },
  {
    status: "in-progress",
    label: "In progress",
    tickets: [
      { id: "fac-5", title: "AC unit — Ward 4B", location: "Ward 4B", priority: "standard", status: "in-progress", assignee: "Facilities maintenance", requestedAt: "1 hr ago" },
    ],
  },
  {
    status: "verified",
    label: "Verified",
    tickets: [
      { id: "fac-6", title: "Specimen courier run", location: "Lab → Radiology", priority: "standard", status: "verified", assignee: "Transport team B", requestedAt: "1 hr ago" },
    ],
  },
];

export type FacilityAsset = {
  assetName: string;
  assetId: string;
  stage: "registered" | "commissioned" | "in-service" | "maintenance-due" | "under-repair" | "retired";
  location: string;
  nextActionLabel: string;
  nextActionDue: string;
  overdue?: boolean;
};

export const prototypeFacilityAssets: FacilityAsset[] = [
  { assetName: "Infusion pump — IP-0231", assetId: "BME-AST-0231", stage: "maintenance-due", location: "Ward 4B", nextActionLabel: "PM service", nextActionDue: "due in 3 days" },
  { assetName: "Defibrillator — DF-0087", assetId: "BME-AST-0087", stage: "in-service", location: "Emergency Department", nextActionLabel: "Calibration", nextActionDue: "overdue by 2 days", overdue: true },
  { assetName: "Autoclave — CSSD-02", assetId: "FAC-AST-0102", stage: "under-repair", location: "Central Sterile Services", nextActionLabel: "Repair completion", nextActionDue: "due tomorrow" },
];

export const prototypeIsolationRooms = [
  { room: "Ward 4B · Room 412", type: "contact" as const, patient: "Mohammed Farooq" },
  { room: "ICU · Bed 2", type: "airborne" as const, patient: "Arvind Nair" },
  { room: "Ward 2A · Room 208", type: "protective" as const, patient: "Priya Nambiar" },
];
