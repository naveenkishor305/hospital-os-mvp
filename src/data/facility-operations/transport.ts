import type { RequestTicket } from "@naveenkishor305/spine-ui";

export const prototypeTransportRequests: RequestTicket[] = [
  { id: "trn-1", title: "Specimen courier run", location: "Lab → Radiology", priority: "standard", status: "verified", assignee: "Transport team B", requestedAt: "1 hr ago" },
  { id: "trn-2", title: "Patient transport — wheelchair", location: "Ward 3A → Radiology", priority: "high", status: "assigned", assignee: "Transport team A", requestedAt: "15 min ago" },
];

export const transportRoutes = [
  "Lab → Radiology",
  "Ward 3A → Radiology",
  "Pharmacy → Ward 4B",
  "Central Warehouse → OT Store",
  "Ward 2A → Discharge lounge",
];

export const transportTypes = ["Patient (wheelchair)", "Patient (stretcher)", "Specimen courier", "Equipment / supply delivery"];

export function nextTransportStatus(status: RequestTicket["status"]): RequestTicket["status"] | null {
  if (status === "new") return "assigned";
  if (status === "assigned") return "in-progress";
  if (status === "in-progress") return "verified";
  return null;
}
