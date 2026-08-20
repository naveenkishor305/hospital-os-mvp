import type { RequestTicket } from "@naveenkishor305/spine-ui";

export const prototypeHousekeepingTickets: RequestTicket[] = [
  { id: "evs-1", title: "Isolation room terminal clean", location: "Ward 4B · Room 412", priority: "high", status: "new", requestedAt: "5 min ago" },
  { id: "evs-2", title: "Routine clean — waiting area", location: "OPD lobby", priority: "standard", status: "assigned", assignee: "Housekeeping team C", requestedAt: "35 min ago" },
];

export const housekeepingLocations = ["Ward 4B · Room 412", "OPD lobby", "ICU · Bed 2", "Emergency Department", "OT complex"];

export function nextHousekeepingStatus(status: RequestTicket["status"]): RequestTicket["status"] | null {
  if (status === "new") return "assigned";
  if (status === "assigned") return "verified";
  return null;
}
