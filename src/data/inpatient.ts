export type WardPatientStatus =
  | "admission-in-progress"
  | "active-care"
  | "discharge-ready"
  | "discharge-pending-barrier";

export type IsolationType = "contact" | "droplet" | "airborne" | "protective";

export type WardRiskFlag = {
  label: string;
  level: "low" | "moderate" | "high" | "critical";
  score?: string;
};

export type WardPatient = {
  id: string;
  name: string;
  age: number;
  sex: string;
  mrn: string;
  ward: string;
  bed: string;
  admittingDiagnosis: string;
  admittedAt: string;
  attendingPhysician: string;
  status: WardPatientStatus;
  isolation?: IsolationType;
  riskFlags: WardRiskFlag[];
  lengthOfStayDays: number;
  rapidResponseActive?: boolean;
};

export const prototypeWardPatients: WardPatient[] = [
  {
    id: "ward-lakshmi-pillai",
    name: "Lakshmi Pillai",
    age: 68,
    sex: "Female",
    mrn: "HOS-024801",
    ward: "Medical Ward B",
    bed: "B-204",
    admittingDiagnosis: "Community-acquired pneumonia, hypoxia on admission",
    admittedAt: "18 Aug 2026 · 22:10",
    attendingPhysician: "Dr. Ananya Rao",
    status: "active-care",
    riskFlags: [
      { label: "Fall risk", level: "high", score: "14" },
      { label: "Pressure injury", level: "moderate", score: "12" },
    ],
    lengthOfStayDays: 2,
  },
  {
    id: "ward-mohammed-farooq",
    name: "Mohammed Farooq",
    age: 54,
    sex: "Male",
    mrn: "HOS-024719",
    ward: "Medical Ward A",
    bed: "A-112",
    admittingDiagnosis: "Suspected multidrug-resistant organism, febrile",
    admittedAt: "19 Aug 2026 · 08:45",
    attendingPhysician: "Dr. Karthik Iyer",
    status: "active-care",
    isolation: "contact",
    riskFlags: [{ label: "Infection risk", level: "high" }],
    lengthOfStayDays: 1,
  },
  {
    id: "ward-devika-iyer",
    name: "Devika Iyer",
    age: 58,
    sex: "Female",
    mrn: "HOS-024718",
    ward: "Cardiac Step-down",
    bed: "C-305",
    admittingDiagnosis: "Post-STEMI, day 1 following primary PCI",
    admittedAt: "20 Aug 2026 · 11:20",
    attendingPhysician: "Dr. Ananya Rao",
    status: "admission-in-progress",
    riskFlags: [{ label: "Deterioration risk", level: "high", score: "EWS 5" }],
    lengthOfStayDays: 0,
    rapidResponseActive: false,
  },
  {
    id: "ward-priya-nambiar",
    name: "Priya Nambiar",
    age: 39,
    sex: "Female",
    mrn: "HOS-024655",
    ward: "Medical Ward B",
    bed: "B-118",
    admittingDiagnosis: "Diabetic ketoacidosis, resolved, stepping down",
    admittedAt: "17 Aug 2026 · 06:30",
    attendingPhysician: "Dr. Meenal Joshi",
    status: "discharge-ready",
    riskFlags: [{ label: "Fall risk", level: "low", score: "3" }],
    lengthOfStayDays: 3,
  },
  {
    id: "ward-suresh-babu",
    name: "Suresh Babu",
    age: 76,
    sex: "Male",
    mrn: "HOS-024602",
    ward: "Medical Ward A",
    bed: "A-206",
    admittingDiagnosis: "Fall at home, hip contusion, deconditioned",
    admittedAt: "15 Aug 2026 · 14:05",
    attendingPhysician: "Dr. Karthik Iyer",
    status: "discharge-pending-barrier",
    riskFlags: [
      { label: "Fall risk", level: "high", score: "16" },
      { label: "Delirium risk", level: "moderate" },
    ],
    lengthOfStayDays: 5,
  },
];

export const wardOptions = [
  "Medical Ward A",
  "Medical Ward B",
  "Cardiac Step-down",
  "Surgical Ward",
  "Isolation Ward",
];

export const attendingPhysicians = [
  "Dr. Ananya Rao",
  "Dr. Karthik Iyer",
  "Dr. Meenal Joshi",
  "Dr. Rohan Varghese",
];

export const dischargeStageOrder = [
  "needs-assessment",
  "barriers-review",
  "multidisciplinary-coordination",
  "ready-for-discharge",
] as const;

export type DischargeStage = (typeof dischargeStageOrder)[number];

export const dischargeStageLabels: Record<DischargeStage, string> = {
  "needs-assessment": "Needs assessment",
  "barriers-review": "Barriers review",
  "multidisciplinary-coordination": "Team coordination",
  "ready-for-discharge": "Ready for discharge",
};
