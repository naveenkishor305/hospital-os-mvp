export type AcuityProtocol = "ESI" | "CTAS" | "Manchester" | "ATS";

export type EdPatientStatus =
  | "awaiting-triage"
  | "triaged"
  | "in-treatment"
  | "boarding-for-bed";

export type EdPathway = "Trauma" | "Stroke" | "STEMI" | "Sepsis" | "Isolation";

export type EdPathwayStatus = "active" | "downgraded" | "stood-down";

export type EdPathwayActivation = {
  pathway: EdPathway;
  status: EdPathwayStatus;
  activationLevel?: string;
  criteria: string;
  activatedAt: string;
};

export type EdPatient = {
  id: string;
  name: string;
  age: number;
  sex: string;
  mrn?: string;
  temporaryId?: string;
  chiefComplaint: string;
  arrivalMode: string;
  arrivedAt: string;
  waitingSince: string;
  status: EdPatientStatus;
  acuityLevel?: 1 | 2 | 3 | 4 | 5;
  acuityProtocol?: AcuityProtocol;
  treatmentArea?: string;
  team?: string;
  reassessmentDueInMinutes?: number;
  pathway?: EdPathwayActivation;
  allergies?: string[];
};

export const prototypeEdPatients: EdPatient[] = [
  {
    id: "ed-devika-iyer",
    name: "Devika Iyer",
    age: 58,
    sex: "Female",
    mrn: "HOS-024718",
    chiefComplaint: "Chest pain, diaphoretic, radiating to left arm",
    arrivalMode: "Ambulance",
    arrivedAt: "10:29",
    waitingSince: "3 min",
    status: "triaged",
    acuityLevel: 2,
    acuityProtocol: "ESI",
    treatmentArea: "Resuscitation Bay 1",
    team: "Dr. Ananya Rao · Emergency Nurse Priya",
    reassessmentDueInMinutes: 12,
    pathway: {
      pathway: "STEMI",
      status: "active",
      criteria: "ST elevation on prehospital 12-lead, EMS pre-alert received",
      activatedAt: "10:31",
    },
    allergies: ["Penicillin"],
  },
  {
    id: "ed-ravi-chandran",
    name: "Ravi Chandran",
    age: 34,
    sex: "Male",
    mrn: "HOS-019482",
    chiefComplaint: "Closed forearm fracture after motorcycle collision",
    arrivalMode: "Ambulance",
    arrivedAt: "10:12",
    waitingSince: "20 min",
    status: "triaged",
    acuityLevel: 3,
    acuityProtocol: "CTAS",
    treatmentArea: "Trauma Bay 2",
    team: "Dr. Karthik Iyer",
    reassessmentDueInMinutes: -6,
  },
  {
    id: "ed-sunita-verma",
    name: "Sunita Verma",
    age: 27,
    sex: "Female",
    temporaryId: "ED-TEMP-0418",
    chiefComplaint: "Sore throat, low-grade fever, difficulty swallowing",
    arrivalMode: "Walk-in",
    arrivedAt: "10:44",
    waitingSince: "6 min",
    status: "awaiting-triage",
  },
  {
    id: "ed-farah-khan",
    name: "Farah Khan",
    age: 71,
    sex: "Female",
    mrn: "HOS-031096",
    chiefComplaint: "Sudden right-sided weakness and slurred speech",
    arrivalMode: "Ambulance",
    arrivedAt: "10:38",
    waitingSince: "1 min",
    status: "triaged",
    acuityLevel: 1,
    acuityProtocol: "ESI",
    treatmentArea: "Resuscitation Bay 2",
    team: "Dr. Ananya Rao · Trauma Nurse Divya",
    reassessmentDueInMinutes: 4,
    pathway: {
      pathway: "Stroke",
      status: "active",
      criteria: "Onset 40 minutes ago, FAST-positive, within thrombolysis window",
      activatedAt: "10:39",
    },
  },
  {
    id: "ed-arjun-menon",
    name: "Arjun Menon",
    age: 45,
    sex: "Male",
    mrn: "HOS-024719",
    chiefComplaint: "Twisted ankle during a football match, able to bear weight",
    arrivalMode: "Walk-in",
    arrivedAt: "09:58",
    waitingSince: "46 min",
    status: "boarding-for-bed",
    acuityLevel: 5,
    acuityProtocol: "ESI",
    treatmentArea: "Fast Track 1",
    team: "Nurse Practitioner Rohan",
    reassessmentDueInMinutes: 54,
  },
];

export const acuityIntervalMinutesByLevel: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 10,
  3: 30,
  4: 60,
  5: 120,
};

export const treatmentAreas = [
  "Resuscitation Bay 1",
  "Resuscitation Bay 2",
  "Trauma Bay 1",
  "Trauma Bay 2",
  "Fast Track 1",
  "Fast Track 2",
  "Isolation Room 1",
  "Observation Bay",
];

export const edClinicalTeams = [
  "Dr. Ananya Rao · Emergency Nurse Priya",
  "Dr. Karthik Iyer",
  "Dr. Meenal Joshi · Trauma Nurse Divya",
  "Nurse Practitioner Rohan",
];
