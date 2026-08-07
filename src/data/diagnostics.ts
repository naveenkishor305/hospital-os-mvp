export type DiagnosticService = "Laboratory" | "Radiology";

export type DiagnosticPriority = "Routine" | "Urgent";

export type DiagnosticOperationalStatus =
  | "Placed"
  | "Accepted"
  | "Collected"
  | "In progress"
  | "Completed"
  | "Recollection required";

export type DiagnosticResultStatus =
  | "Not available"
  | "Preliminary"
  | "Final"
  | "Amended";

export type ResultFlag = "Normal" | "High" | "Low" | "Critical";

export type DiagnosticAnalyte = {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: ResultFlag;
  previousValue?: string;
  previousAt?: string;
};

export type SpecimenRecord = {
  type: string;
  specimenId: string;
  collectedAt: string;
  collectedBy: string;
  receivedAt?: string;
  receivedBy?: string;
  condition: "Acceptable" | "Rejected";
  rejectionReason?: string;
};

export type DiagnosticOrder = {
  id: string;
  patientId: string;
  encounterId: string;
  service: DiagnosticService;
  testName: string;
  indication: string;
  priority: DiagnosticPriority;
  orderedAt: string;
  orderedBy: string;
  performingDepartment: string;
  operationalStatus: DiagnosticOperationalStatus;
  resultStatus: DiagnosticResultStatus;
  accessionId?: string;
  specimen?: SpecimenRecord;
  analytes: DiagnosticAnalyte[];
  resultedAt?: string;
  verifiedBy?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  reviewNote?: string;
  patientNotified?: string;
  amendmentReason?: string;
};

export const diagnosticOrders: DiagnosticOrder[] = [
  {
    id: "lab-260802-1042",
    patientId: "pt-meera-k-nair",
    encounterId: "OPD-26-08154",
    service: "Laboratory",
    testName: "Complete blood count",
    indication: "Fatigue and intermittent dizziness",
    priority: "Routine",
    orderedAt: "02 Aug 2026, 10:42 IST",
    orderedBy: "Dr Joseph Thomas",
    performingDepartment: "Central laboratory",
    operationalStatus: "Placed",
    resultStatus: "Not available",
    analytes: [],
  },
  {
    id: "lab-260802-1038",
    patientId: "pt-meera-k-nair",
    encounterId: "OPD-26-08154",
    service: "Laboratory",
    testName: "HbA1c",
    indication: "Review glycaemic control",
    priority: "Routine",
    orderedAt: "02 Aug 2026, 10:38 IST",
    orderedBy: "Dr Joseph Thomas",
    performingDepartment: "Central laboratory",
    operationalStatus: "In progress",
    resultStatus: "Preliminary",
    accessionId: "ACC-26-38421",
    specimen: {
      type: "EDTA whole blood",
      specimenId: "SP-26-701842",
      collectedAt: "02 Aug 2026, 10:51 IST",
      collectedBy: "Nisha P, Phlebotomy",
      receivedAt: "02 Aug 2026, 10:59 IST",
      receivedBy: "Arun K, Central laboratory",
      condition: "Acceptable",
    },
    analytes: [
      {
        id: "hba1c",
        name: "HbA1c",
        value: "7.6",
        unit: "%",
        referenceRange: "4.0-5.6",
        flag: "High",
        previousValue: "7.4 %",
        previousAt: "18 Jul 2026",
      },
    ],
    resultedAt: "02 Aug 2026, 11:34 IST",
  },
  {
    id: "lab-260802-0917",
    patientId: "pt-meera-nair",
    encounterId: "OPD-26-08154",
    service: "Laboratory",
    testName: "Renal function panel",
    indication: "Palpitations and medication monitoring",
    priority: "Urgent",
    orderedAt: "02 Aug 2026, 09:17 IST",
    orderedBy: "Dr Ananya Rao",
    performingDepartment: "Central laboratory",
    operationalStatus: "Completed",
    resultStatus: "Final",
    accessionId: "ACC-26-38377",
    specimen: {
      type: "Serum",
      specimenId: "SP-26-701204",
      collectedAt: "02 Aug 2026, 09:26 IST",
      collectedBy: "Nisha P, Phlebotomy",
      receivedAt: "02 Aug 2026, 09:34 IST",
      receivedBy: "Arun K, Central laboratory",
      condition: "Acceptable",
    },
    analytes: [
      {
        id: "potassium",
        name: "Potassium",
        value: "6.4",
        unit: "mmol/L",
        referenceRange: "3.5-5.1",
        flag: "Critical",
        previousValue: "4.2 mmol/L",
        previousAt: "21 Jul 2026",
      },
      {
        id: "creatinine",
        name: "Creatinine",
        value: "1.2",
        unit: "mg/dL",
        referenceRange: "0.6-1.1",
        flag: "High",
        previousValue: "0.9 mg/dL",
        previousAt: "21 Jul 2026",
      },
    ],
    resultedAt: "02 Aug 2026, 10:06 IST",
    verifiedBy: "Dr Leena Mathew, Pathology",
  },
  {
    id: "lab-260802-0844",
    patientId: "pt-arjun-menon",
    encounterId: "OPD-26-08149",
    service: "Laboratory",
    testName: "Complete blood count",
    indication: "Fever and sore throat",
    priority: "Routine",
    orderedAt: "02 Aug 2026, 08:44 IST",
    orderedBy: "Dr Joseph Thomas",
    performingDepartment: "Central laboratory",
    operationalStatus: "Recollection required",
    resultStatus: "Not available",
    accessionId: "ACC-26-38311",
    specimen: {
      type: "EDTA whole blood",
      specimenId: "SP-26-700918",
      collectedAt: "02 Aug 2026, 08:56 IST",
      collectedBy: "Asha R, Phlebotomy",
      receivedAt: "02 Aug 2026, 09:05 IST",
      receivedBy: "Arun K, Central laboratory",
      condition: "Rejected",
      rejectionReason: "Clotted specimen; recollection requested from OPD room 4.",
    },
    analytes: [],
  },
  {
    id: "rad-260802-1011",
    patientId: "pt-farah-khan",
    encounterId: "OPD-26-08161",
    service: "Radiology",
    testName: "Right knee radiograph",
    indication: "Persistent pain aggravated by stairs",
    priority: "Routine",
    orderedAt: "02 Aug 2026, 10:11 IST",
    orderedBy: "Dr Kavya Iyer",
    performingDepartment: "Diagnostic imaging",
    operationalStatus: "Completed",
    resultStatus: "Final",
    accessionId: "IMG-26-11842",
    analytes: [
      {
        id: "impression",
        name: "Impression",
        value: "Moderate medial compartment joint-space narrowing",
        unit: "",
        referenceRange: "Clinical correlation advised",
        flag: "High",
      },
    ],
    resultedAt: "02 Aug 2026, 11:12 IST",
    verifiedBy: "Dr Rohan Malik, Radiology",
    acknowledgedAt: "02 Aug 2026, 11:26 IST",
    acknowledgedBy: "Dr Kavya Iyer",
    reviewNote: "Reviewed with the patient; continue planned conservative care.",
    patientNotified: "In person · 02 Aug 2026, 11:29 IST",
  },
];

export const specimenTypes = [
  "EDTA whole blood",
  "Serum",
  "Plasma",
  "Urine",
  "Swab",
];

export const rejectionReasons = [
  "Patient or label mismatch",
  "Insufficient quantity",
  "Clotted specimen",
  "Haemolysed specimen",
  "Incorrect container",
  "Transport delay or temperature exception",
];

