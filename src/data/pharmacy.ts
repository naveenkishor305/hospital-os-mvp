export type PharmacyPriority = "Routine" | "Urgent";

export type PharmacyStatus =
  | "Awaiting verification"
  | "Clinical hold"
  | "Ready to dispense"
  | "Partially dispensed"
  | "Awaiting handoff"
  | "Dispensed"
  | "Cancelled";

export type PrescriptionLine = {
  id: string;
  medicine: string;
  genericName: string;
  dose: string;
  frequency: string;
  duration: string;
  directions: string;
  prescribedQuantity: number;
  dispensedQuantity: number;
  unit: string;
  allergyTriggers: string[];
  interactionTerms: string[];
  substitutionAllowed: boolean;
  highRisk?: boolean;
  additionalControl?: boolean;
};

export type DispensingEvent = {
  id: string;
  lineId: string;
  medicine: string;
  quantity: number;
  batchNumber: string;
  expiry: string;
  dispensedAt: string;
  dispensedBy: string;
};

export type PrescriptionOrder = {
  id: string;
  patientId: string;
  encounterId: string;
  priority: PharmacyPriority;
  prescribedAt: string;
  prescribedBy: string;
  authorizedAt?: string;
  status: PharmacyStatus;
  lines: PrescriptionLine[];
  clinicalNote: string;
  clarificationNote?: string;
  clarificationAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  partialReason?: string;
  nextSupplyPlan?: string;
  dispensingEvents: DispensingEvent[];
  handedOffAt?: string;
  handedOffBy?: string;
  counsellingRecord?: string;
};

export type InventoryBatch = {
  id: string;
  genericName: string;
  medicine: string;
  strength: string;
  dosageForm: string;
  batchNumber: string;
  expiry: string;
  expiryLabel: string;
  stock: number;
  location: string;
  barcode: string;
  quarantined?: boolean;
  expired?: boolean;
  additionalControl?: boolean;
};

export const pharmacyOrders: PrescriptionOrder[] = [
  {
    id: "RX-26-08154-03",
    patientId: "pt-meera-k-nair",
    encounterId: "OPD-26-08154",
    priority: "Routine",
    prescribedAt: "02 Aug 2026, 11:48 IST",
    prescribedBy: "Dr Joseph Thomas",
    authorizedAt: "02 Aug 2026, 11:49 IST",
    status: "Awaiting verification",
    clinicalNote: "Supportive treatment after OPD review; counsel on dosing and return precautions.",
    lines: [
      {
        id: "rx-line-paracetamol-01",
        medicine: "Paracetamol 500 mg tablet",
        genericName: "Paracetamol",
        dose: "500 mg",
        frequency: "Twice daily when required",
        duration: "3 days",
        directions: "Take after food. Do not exceed the prescribed daily dose.",
        prescribedQuantity: 6,
        dispensedQuantity: 0,
        unit: "tablets",
        allergyTriggers: [],
        interactionTerms: [],
        substitutionAllowed: true,
      },
      {
        id: "rx-line-pantoprazole-01",
        medicine: "Pantoprazole 40 mg tablet",
        genericName: "Pantoprazole",
        dose: "40 mg",
        frequency: "Once daily",
        duration: "5 days",
        directions: "Take before breakfast.",
        prescribedQuantity: 5,
        dispensedQuantity: 0,
        unit: "tablets",
        allergyTriggers: [],
        interactionTerms: [],
        substitutionAllowed: true,
      },
    ],
    dispensingEvents: [],
  },
  {
    id: "RX-26-08154-02",
    patientId: "pt-meera-nair",
    encounterId: "OPD-26-08154",
    priority: "Urgent",
    prescribedAt: "02 Aug 2026, 11:31 IST",
    prescribedBy: "Dr Ananya Rao",
    authorizedAt: "02 Aug 2026, 11:32 IST",
    status: "Clinical hold",
    clinicalNote: "Prescription requires pharmacist reconciliation before any supply.",
    lines: [
      {
        id: "rx-line-amoxicillin-01",
        medicine: "Amoxicillin 500 mg capsule",
        genericName: "Amoxicillin",
        dose: "500 mg",
        frequency: "Three times daily",
        duration: "5 days",
        directions: "Take at evenly spaced times and complete the prescribed course.",
        prescribedQuantity: 15,
        dispensedQuantity: 0,
        unit: "capsules",
        allergyTriggers: ["Penicillin"],
        interactionTerms: [],
        substitutionAllowed: false,
      },
      {
        id: "rx-line-ibuprofen-01",
        medicine: "Ibuprofen 400 mg tablet",
        genericName: "Ibuprofen",
        dose: "400 mg",
        frequency: "Twice daily",
        duration: "3 days",
        directions: "Take after food.",
        prescribedQuantity: 6,
        dispensedQuantity: 0,
        unit: "tablets",
        allergyTriggers: ["NSAID"],
        interactionTerms: ["Apixaban", "Warfarin"],
        substitutionAllowed: false,
        highRisk: true,
      },
      {
        id: "rx-line-paracetamol-02",
        medicine: "Paracetamol 500 mg tablet",
        genericName: "Paracetamol",
        dose: "500 mg",
        frequency: "Twice daily when required",
        duration: "3 days",
        directions: "Take only as prescribed.",
        prescribedQuantity: 6,
        dispensedQuantity: 0,
        unit: "tablets",
        allergyTriggers: [],
        interactionTerms: [],
        substitutionAllowed: true,
      },
    ],
    dispensingEvents: [],
  },
  {
    id: "RX-26-08149-01",
    patientId: "pt-arjun-menon",
    encounterId: "OPD-26-08149",
    priority: "Routine",
    prescribedAt: "02 Aug 2026, 11:18 IST",
    prescribedBy: "Dr Joseph Thomas",
    authorizedAt: "02 Aug 2026, 11:19 IST",
    status: "Ready to dispense",
    clinicalNote: "Pharmacist verified identity, allergy history and prescribed course.",
    verifiedAt: "02 Aug 2026, 11:24 IST",
    verifiedBy: "Aditi S, Pharmacist",
    lines: [
      {
        id: "rx-line-amoxicillin-02",
        medicine: "Amoxicillin 500 mg capsule",
        genericName: "Amoxicillin",
        dose: "500 mg",
        frequency: "Three times daily",
        duration: "5 days",
        directions: "Take at evenly spaced times and complete the prescribed course.",
        prescribedQuantity: 15,
        dispensedQuantity: 0,
        unit: "capsules",
        allergyTriggers: ["Penicillin"],
        interactionTerms: [],
        substitutionAllowed: false,
      },
    ],
    dispensingEvents: [],
  },
  {
    id: "RX-26-08161-01",
    patientId: "pt-farah-khan",
    encounterId: "OPD-26-08161",
    priority: "Routine",
    prescribedAt: "02 Aug 2026, 11:07 IST",
    prescribedBy: "Dr Kavya Iyer",
    authorizedAt: "02 Aug 2026, 11:08 IST",
    status: "Partially dispensed",
    clinicalNote: "Analgesia plan reviewed during orthopaedic consultation.",
    verifiedAt: "02 Aug 2026, 11:14 IST",
    verifiedBy: "Aditi S, Pharmacist",
    partialReason: "Only four tablets available in the selected FEFO batch.",
    nextSupplyPlan: "Balance quantity reserved for collection after 16:00 today.",
    lines: [
      {
        id: "rx-line-paracetamol-03",
        medicine: "Paracetamol 500 mg tablet",
        genericName: "Paracetamol",
        dose: "500 mg",
        frequency: "Twice daily when required",
        duration: "5 days",
        directions: "Take after food when required for pain.",
        prescribedQuantity: 10,
        dispensedQuantity: 4,
        unit: "tablets",
        allergyTriggers: [],
        interactionTerms: [],
        substitutionAllowed: true,
      },
    ],
    dispensingEvents: [
      {
        id: "dispense-260802-1109",
        lineId: "rx-line-paracetamol-03",
        medicine: "Paracetamol 500 mg tablet",
        quantity: 4,
        batchNumber: "PAR-26-031",
        expiry: "Sep 2026",
        dispensedAt: "02 Aug 2026, 11:16 IST",
        dispensedBy: "Aditi S, Pharmacist",
      },
    ],
  },
  {
    id: "RX-26-08138-01",
    patientId: "pt-meera-k-nair",
    encounterId: "OPD-26-08138",
    priority: "Routine",
    prescribedAt: "02 Aug 2026, 09:42 IST",
    prescribedBy: "Dr Joseph Thomas",
    authorizedAt: "02 Aug 2026, 09:43 IST",
    status: "Dispensed",
    clinicalNote: "Completed outpatient dispensing record.",
    verifiedAt: "02 Aug 2026, 09:47 IST",
    verifiedBy: "Aditi S, Pharmacist",
    handedOffAt: "02 Aug 2026, 09:54 IST",
    handedOffBy: "Aditi S, Pharmacist",
    counsellingRecord: "Identity, label, directions, storage and warning signs reviewed in Malayalam.",
    lines: [
      {
        id: "rx-line-pantoprazole-02",
        medicine: "Pantoprazole 40 mg tablet",
        genericName: "Pantoprazole",
        dose: "40 mg",
        frequency: "Once daily",
        duration: "5 days",
        directions: "Take before breakfast.",
        prescribedQuantity: 5,
        dispensedQuantity: 5,
        unit: "tablets",
        allergyTriggers: [],
        interactionTerms: [],
        substitutionAllowed: true,
      },
    ],
    dispensingEvents: [
      {
        id: "dispense-260802-0949",
        lineId: "rx-line-pantoprazole-02",
        medicine: "Pantoprazole 40 mg tablet",
        quantity: 5,
        batchNumber: "PAN-26-118",
        expiry: "Feb 2027",
        dispensedAt: "02 Aug 2026, 09:50 IST",
        dispensedBy: "Aditi S, Pharmacist",
      },
    ],
  },
];

export const inventoryBatches: InventoryBatch[] = [
  {
    id: "batch-par-expired",
    genericName: "Paracetamol",
    medicine: "Paracetamol 500 mg tablet",
    strength: "500 mg",
    dosageForm: "Tablet",
    batchNumber: "PAR-26-018",
    expiry: "2026-07-31",
    expiryLabel: "Jul 2026",
    stock: 6,
    location: "OPD pharmacy · A-01",
    barcode: "890100260018",
    expired: true,
  },
  {
    id: "batch-par-031",
    genericName: "Paracetamol",
    medicine: "Paracetamol 500 mg tablet",
    strength: "500 mg",
    dosageForm: "Tablet",
    batchNumber: "PAR-26-031",
    expiry: "2026-09-30",
    expiryLabel: "Sep 2026",
    stock: 8,
    location: "OPD pharmacy · A-01",
    barcode: "890100260031",
  },
  {
    id: "batch-par-044",
    genericName: "Paracetamol",
    medicine: "Acetaminophen 500 mg tablet",
    strength: "500 mg",
    dosageForm: "Tablet",
    batchNumber: "PAR-26-044",
    expiry: "2027-03-31",
    expiryLabel: "Mar 2027",
    stock: 80,
    location: "OPD pharmacy · A-02",
    barcode: "890100260044",
  },
  {
    id: "batch-pan-118",
    genericName: "Pantoprazole",
    medicine: "Pantoprazole 40 mg tablet",
    strength: "40 mg",
    dosageForm: "Tablet",
    batchNumber: "PAN-26-118",
    expiry: "2027-02-28",
    expiryLabel: "Feb 2027",
    stock: 42,
    location: "OPD pharmacy · B-04",
    barcode: "890200260118",
  },
  {
    id: "batch-amx-204",
    genericName: "Amoxicillin",
    medicine: "Amoxicillin 500 mg capsule",
    strength: "500 mg",
    dosageForm: "Capsule",
    batchNumber: "AMX-26-204",
    expiry: "2026-12-31",
    expiryLabel: "Dec 2026",
    stock: 36,
    location: "OPD pharmacy · C-02",
    barcode: "890300260204",
  },
  {
    id: "batch-ibu-quarantine",
    genericName: "Ibuprofen",
    medicine: "Ibuprofen 400 mg tablet",
    strength: "400 mg",
    dosageForm: "Tablet",
    batchNumber: "IBU-26-077",
    expiry: "2027-01-31",
    expiryLabel: "Jan 2027",
    stock: 24,
    location: "Quarantine shelf · Q-02",
    barcode: "890400260077",
    quarantined: true,
  },
  {
    id: "batch-pgb-016",
    genericName: "Pregabalin",
    medicine: "Pregabalin 75 mg capsule",
    strength: "75 mg",
    dosageForm: "Capsule",
    batchNumber: "PGB-26-016",
    expiry: "2027-05-31",
    expiryLabel: "May 2027",
    stock: 20,
    location: "Controlled cabinet · CC-01",
    barcode: "890500260016",
    additionalControl: true,
  },
];

export function clonePharmacyOrders() {
  return pharmacyOrders.map((order) => ({
    ...order,
    lines: order.lines.map((line) => ({
      ...line,
      allergyTriggers: [...line.allergyTriggers],
      interactionTerms: [...line.interactionTerms],
    })),
    dispensingEvents: order.dispensingEvents.map((event) => ({ ...event })),
  }));
}

export function cloneInventoryBatches() {
  return inventoryBatches.map((batch) => ({ ...batch }));
}
