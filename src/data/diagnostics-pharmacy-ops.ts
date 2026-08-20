export type CriticalResult = {
  id: string;
  patient: string;
  test: string;
  value: string;
  classification: "immediate-emergency" | "urgent" | "important";
  acknowledgedBy?: string;
  minutesSinceAlert: number;
};

export const prototypeCriticalResults: CriticalResult[] = [
  { id: "cr-1", patient: "Devika Iyer", test: "Troponin I", value: "8.4 ng/mL (critical high)", classification: "immediate-emergency", minutesSinceAlert: 4 },
  { id: "cr-2", patient: "Ravi Chandran", test: "Serum potassium", value: "6.7 mmol/L (critical high)", classification: "urgent", acknowledgedBy: "Dr. Karthik Iyer", minutesSinceAlert: 18 },
  { id: "cr-3", patient: "Farah Khan", test: "Hemoglobin", value: "6.1 g/dL (critical low)", classification: "important", minutesSinceAlert: 32 },
];

export type InteractionAlert = {
  id: string;
  patient: string;
  pair: string;
  severity: "contraindicated" | "major" | "moderate" | "minor";
};

export const prototypeInteractionAlerts: InteractionAlert[] = [
  { id: "ix-1", patient: "Lakshmi Pillai", pair: "Clarithromycin + Simvastatin", severity: "contraindicated" },
  { id: "ix-2", patient: "Suresh Babu", pair: "Warfarin + Aspirin", severity: "major" },
  { id: "ix-3", patient: "Priya Nambiar", pair: "Metformin + Iodinated contrast", severity: "moderate" },
];

export type DispensingRequest = {
  id: string;
  patient: string;
  medication: string;
  setting: "Inpatient" | "Emergency" | "OPD pharmacy";
  controlled: boolean;
  status: "verification" | "compounding" | "ready" | "dispensed";
};

export const prototypeDispensingQueue: DispensingRequest[] = [
  { id: "dq-1", patient: "Arvind Nair", medication: "Piperacillin-tazobactam 4.5g IV", setting: "Inpatient", controlled: false, status: "ready" },
  { id: "dq-2", patient: "Devika Iyer", medication: "Fentanyl PCA", setting: "Inpatient", controlled: true, status: "verification" },
  { id: "dq-3", patient: "Mohammed Farooq", medication: "Vancomycin 1g IV (renal-adjusted)", setting: "Inpatient", controlled: false, status: "compounding" },
  { id: "dq-4", patient: "Sunita Verma", medication: "Amoxicillin-clavulanate 625mg", setting: "OPD pharmacy", controlled: false, status: "dispensed" },
];
