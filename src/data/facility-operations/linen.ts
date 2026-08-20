export const prototypeLinenLevels = [
  { id: "bedsheets", label: "Bedsheets", current: 320, min: 400, max: 900, unit: "sets" },
  { id: "gowns", label: "Patient gowns", current: 210, min: 150, max: 500, unit: "units" },
  { id: "drapes", label: "Surgical drapes", current: 95, min: 100, max: 300, unit: "packs" },
];

export type LinenRequest = {
  id: string;
  item: string;
  quantity: string;
  ward: string;
  status: "requested" | "fulfilled";
};

export const prototypeLinenRequests: LinenRequest[] = [
  { id: "lr-1", item: "Bedsheets", quantity: "40 sets", ward: "ICU", status: "requested" },
  { id: "lr-2", item: "Patient gowns", quantity: "25 units", ward: "Ward 4B", status: "fulfilled" },
];
