export type BiomedicalAsset = {
  assetName: string;
  assetId: string;
  stage: "registered" | "commissioned" | "in-service" | "maintenance-due" | "under-repair" | "retired";
  location: string;
  nextActionLabel: string;
  nextActionDue: string;
  overdue?: boolean;
};

export const prototypeBiomedicalAssets: BiomedicalAsset[] = [
  { assetName: "Infusion pump — IP-0231", assetId: "BME-AST-0231", stage: "maintenance-due", location: "Ward 4B", nextActionLabel: "PM service", nextActionDue: "due in 3 days" },
  { assetName: "Defibrillator — DF-0087", assetId: "BME-AST-0087", stage: "in-service", location: "Emergency Department", nextActionLabel: "Calibration", nextActionDue: "overdue by 2 days", overdue: true },
  { assetName: "Ventilator — VT-0045", assetId: "BME-AST-0045", stage: "under-repair", location: "ICU", nextActionLabel: "Repair completion", nextActionDue: "due tomorrow" },
];
