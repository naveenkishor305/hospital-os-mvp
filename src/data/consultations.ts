export type NursingHandoff = {
  recordedAt: string;
  recordedBy: string;
  chiefComplaint: string;
  vitals: {
    temperature: string;
    pulse: string;
    systolic: string;
    diastolic: string;
    spo2: string;
    respiration: string;
    pain: string;
  };
};

export type PriorVisit = {
  date: string;
  service: string;
  summary: string;
  clinician: string;
};

export type RecentResult = {
  name: string;
  value: string;
  reference: string;
  status: "Normal" | "High" | "Low";
  collectedAt: string;
};

export type ClinicalProfile = {
  nursingHandoff: NursingHandoff;
  currentMedications: string[];
  activeProblems: string[];
  priorVisits: PriorVisit[];
  recentResults: RecentResult[];
};

const defaultProfile: ClinicalProfile = {
  nursingHandoff: {
    recordedAt: "02 Aug 2026, 10:24 IST",
    recordedBy: "Nurse station 2",
    chiefComplaint: "Fatigue and intermittent dizziness for five days",
    vitals: {
      temperature: "37.1",
      pulse: "82",
      systolic: "128",
      diastolic: "78",
      spo2: "98",
      respiration: "16",
      pain: "3",
    },
  },
  currentMedications: ["Metformin 500 mg twice daily"],
  activeProblems: ["Type 2 diabetes mellitus", "Vitamin D insufficiency"],
  priorVisits: [
    {
      date: "19 Jul 2026",
      service: "General medicine",
      summary: "Reviewed glycaemic control and persistent fatigue.",
      clinician: "Dr Joseph Thomas",
    },
    {
      date: "08 Mar 2026",
      service: "General medicine",
      summary: "Routine diabetes follow-up; medication continued.",
      clinician: "Dr Joseph Thomas",
    },
  ],
  recentResults: [
    {
      name: "HbA1c",
      value: "7.4 %",
      reference: "4.0-5.6 %",
      status: "High",
      collectedAt: "18 Jul 2026, 09:18 IST",
    },
    {
      name: "Haemoglobin",
      value: "11.8 g/dL",
      reference: "12.0-15.5 g/dL",
      status: "Low",
      collectedAt: "18 Jul 2026, 09:18 IST",
    },
    {
      name: "Creatinine",
      value: "0.8 mg/dL",
      reference: "0.6-1.1 mg/dL",
      status: "Normal",
      collectedAt: "18 Jul 2026, 09:18 IST",
    },
  ],
};

export const prototypeClinicalProfiles: Record<string, ClinicalProfile> = {
  "pt-meera-k-nair": defaultProfile,
  "pt-meera-nair": {
    nursingHandoff: {
      recordedAt: "02 Aug 2026, 10:29 IST",
      recordedBy: "Nurse station 4",
      chiefComplaint: "Palpitations with mild exertional breathlessness",
      vitals: {
        temperature: "36.8",
        pulse: "96",
        systolic: "136",
        diastolic: "84",
        spo2: "97",
        respiration: "18",
        pain: "1",
      },
    },
    currentMedications: [
      "Apixaban 5 mg twice daily",
      "Metoprolol 25 mg once daily",
    ],
    activeProblems: ["Atrial fibrillation", "Hypertension"],
    priorVisits: [
      {
        date: "21 Jul 2026",
        service: "Cardiology",
        summary: "Rate-control review; anticoagulation continued.",
        clinician: "Dr Ananya Rao",
      },
    ],
    recentResults: [
      {
        name: "Potassium",
        value: "4.2 mmol/L",
        reference: "3.5-5.1 mmol/L",
        status: "Normal",
        collectedAt: "21 Jul 2026, 08:44 IST",
      },
      {
        name: "TSH",
        value: "5.8 mIU/L",
        reference: "0.4-4.0 mIU/L",
        status: "High",
        collectedAt: "21 Jul 2026, 08:44 IST",
      },
    ],
  },
  "pt-arjun-menon": {
    nursingHandoff: {
      recordedAt: "02 Aug 2026, 10:16 IST",
      recordedBy: "Nurse station 1",
      chiefComplaint: "Fever, sore throat and body ache for two days",
      vitals: {
        temperature: "38.2",
        pulse: "102",
        systolic: "124",
        diastolic: "80",
        spo2: "98",
        respiration: "18",
        pain: "4",
      },
    },
    currentMedications: ["Paracetamol 500 mg as needed"],
    activeProblems: ["No active chronic problem recorded"],
    priorVisits: [
      {
        date: "12 Nov 2025",
        service: "General medicine",
        summary: "Self-limited upper respiratory infection.",
        clinician: "Dr Joseph Thomas",
      },
    ],
    recentResults: [],
  },
  "pt-farah-khan": {
    nursingHandoff: {
      recordedAt: "02 Aug 2026, 10:22 IST",
      recordedBy: "Orthopaedic nurse station",
      chiefComplaint: "Right knee pain aggravated by stairs",
      vitals: {
        temperature: "36.9",
        pulse: "78",
        systolic: "130",
        diastolic: "82",
        spo2: "99",
        respiration: "16",
        pain: "6",
      },
    },
    currentMedications: ["Calcium carbonate 500 mg once daily"],
    activeProblems: ["Right knee osteoarthritis"],
    priorVisits: [
      {
        date: "02 Jun 2026",
        service: "Orthopaedics",
        summary: "Conservative management and physiotherapy advised.",
        clinician: "Dr Kavya Iyer",
      },
    ],
    recentResults: [],
  },
};

export function clinicalProfileFor(patientId: string): ClinicalProfile {
  return prototypeClinicalProfiles[patientId] ?? defaultProfile;
}

export const diagnosisOptions = [
  { code: "R53.83", label: "Other fatigue" },
  { code: "R42", label: "Dizziness and giddiness" },
  { code: "J06.9", label: "Acute upper respiratory infection, unspecified" },
  { code: "M17.11", label: "Unilateral primary osteoarthritis, right knee" },
  { code: "I48.91", label: "Atrial fibrillation, unspecified" },
];

export const orderCatalog = {
  Laboratory: [
    "Complete blood count",
    "HbA1c",
    "Thyroid profile",
    "Renal function panel",
  ],
  Radiology: ["Chest radiograph", "Right knee radiograph", "Echocardiogram"],
  Procedure: ["12-lead ECG", "Peak expiratory flow", "Dressing change"],
} as const;

export type MedicationOption = {
  id: string;
  name: string;
  allergyTriggers: string[];
  interactionTerms: string[];
};

export const medicationOptions: MedicationOption[] = [
  {
    id: "paracetamol-500",
    name: "Paracetamol 500 mg tablet",
    allergyTriggers: [],
    interactionTerms: [],
  },
  {
    id: "amoxicillin-500",
    name: "Amoxicillin 500 mg capsule",
    allergyTriggers: ["Penicillin"],
    interactionTerms: [],
  },
  {
    id: "ibuprofen-400",
    name: "Ibuprofen 400 mg tablet",
    allergyTriggers: ["NSAID"],
    interactionTerms: ["Apixaban", "Warfarin"],
  },
  {
    id: "pantoprazole-40",
    name: "Pantoprazole 40 mg tablet",
    allergyTriggers: [],
    interactionTerms: [],
  },
];
