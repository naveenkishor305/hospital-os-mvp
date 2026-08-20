import type { RequestTicket } from "@naveenkishor305/spine-ui";

export type BuildingAsset = {
  assetName: string;
  assetId: string;
  stage: "registered" | "commissioned" | "in-service" | "maintenance-due" | "under-repair" | "retired";
  location: string;
  nextActionLabel: string;
  nextActionDue: string;
  overdue?: boolean;
};

export const prototypeBuildingAssets: BuildingAsset[] = [
  { assetName: "Autoclave — CSSD-02", assetId: "FAC-AST-0102", stage: "under-repair", location: "Central Sterile Services", nextActionLabel: "Repair completion", nextActionDue: "due tomorrow" },
  { assetName: "Central AHU — Block B", assetId: "FAC-AST-0044", stage: "in-service", location: "Rooftop plant room", nextActionLabel: "Filter change", nextActionDue: "due in 10 days" },
];

export const prototypeWorkOrders: RequestTicket[] = [
  { id: "wo-1", title: "AC unit — Ward 4B", location: "Ward 4B", priority: "standard", status: "in-progress", assignee: "Facilities maintenance", requestedAt: "1 hr ago" },
  { id: "wo-2", title: "Leaking tap — Staff washroom", location: "Block A, Level 2", priority: "low", status: "new", requestedAt: "20 min ago" },
];

export const workOrderLocations = ["Ward 4B", "Block A, Level 2", "Central Sterile Services", "Rooftop plant room", "OT complex"];

export function nextWorkOrderStatus(status: RequestTicket["status"]): RequestTicket["status"] | null {
  if (status === "new") return "assigned";
  if (status === "assigned") return "in-progress";
  if (status === "in-progress") return "verified";
  return null;
}
