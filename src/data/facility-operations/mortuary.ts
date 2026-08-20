import type { CustodyHandoff } from "@naveenkishor305/spine-ui";

export const prototypeCustodyTrail: CustodyHandoff[] = [
  { id: "coc-1", timestamp: "Mon 03:40", from: "ICU", to: "Mortuary intake", item: "Deceased — body bag #14", witness: "Nurse Kavitha", verified: true },
  { id: "coc-2", timestamp: "Mon 04:10", from: "Mortuary intake", to: "Cold storage bay 2", item: "Body bag #14", witness: "Mortuary technician", verified: true },
];

export const custodyLocations = [
  "Cold storage bay 1",
  "Cold storage bay 2",
  "Autopsy suite",
  "Family viewing room",
  "Funeral home transport",
];
