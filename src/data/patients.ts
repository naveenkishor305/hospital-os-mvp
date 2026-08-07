export type ConsentState = "Recorded" | "Needs review" | "Not recorded";

export type PatientAccessRecord = {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  sex: string;
  mobile: string;
  phoneSuffix: string;
  source: string;
  lastUpdated: string;
  language: string;
  address: string;
  abhaMasked?: string;
  consent: ConsentState;
  restricted?: boolean;
  duplicateCluster?: string;
  encounter?: string;
  department?: string;
  location?: string;
  clinician?: string;
  appointment?: string;
  allergies?: string[];
};

export const prototypePatients: PatientAccessRecord[] = [
  {
    id: "pt-meera-nair",
    name: "Meera Nair",
    mrn: "HOS-024718",
    dob: "1983-11-18",
    age: 42,
    sex: "Female",
    mobile: "9876587654",
    phoneSuffix: "7654",
    source: "Main facility registration",
    lastUpdated: "02 Aug 2026 · 10:28",
    language: "English · Malayalam",
    address: "Adyar, Chennai",
    abhaMasked: "••-••••-••••-4312",
    consent: "Recorded",
    duplicateCluster: "meera-nair",
    encounter: "OPD-26-08154",
    department: "Cardiology",
    location: "OPD 4",
    clinician: "Dr Ananya Rao",
    appointment: "Today · 10:35",
    allergies: ["Penicillin"],
  },
  {
    id: "pt-meera-k-nair",
    name: "Meera K Nair",
    mrn: "HOS-040882",
    dob: "1984-01-09",
    age: 42,
    sex: "Female",
    mobile: "9123487654",
    phoneSuffix: "7654",
    source: "Legacy OPD import",
    lastUpdated: "19 Jul 2026 · 16:42",
    language: "Malayalam",
    address: "Besant Nagar, Chennai",
    consent: "Needs review",
    duplicateCluster: "meera-nair",
    department: "General medicine",
    appointment: "No active appointment",
  },
  {
    id: "pt-arjun-menon",
    name: "Arjun Menon",
    mrn: "HOS-019482",
    dob: "1991-05-12",
    age: 35,
    sex: "Male",
    mobile: "9003219482",
    phoneSuffix: "9482",
    source: "Main facility registration",
    lastUpdated: "02 Aug 2026 · 10:12",
    language: "English · Tamil",
    address: "Mylapore, Chennai",
    consent: "Recorded",
    encounter: "OPD-26-08149",
    department: "General medicine",
    location: "OPD room 4",
    clinician: "Dr Joseph Thomas",
    appointment: "Today · 10:40",
  },
  {
    id: "pt-farah-khan",
    name: "Farah Khan",
    mrn: "HOS-031096",
    dob: "1978-08-27",
    age: 47,
    sex: "Female",
    mobile: "9840031096",
    phoneSuffix: "1096",
    source: "Online appointment verification",
    lastUpdated: "02 Aug 2026 · 09:54",
    language: "English · Hindi",
    address: "Nungambakkam, Chennai",
    abhaMasked: "••-••••-••••-8091",
    consent: "Recorded",
    encounter: "OPD-26-08161",
    department: "Orthopaedics",
    location: "Reception desk 1",
    clinician: "Dr Kavya Iyer",
    appointment: "Today · 10:50",
  },
  {
    id: "pt-restricted-42",
    name: "Ravi Chandran",
    mrn: "HOS-088842",
    dob: "1968-03-14",
    age: 58,
    sex: "Male",
    mobile: "9884008842",
    phoneSuffix: "8842",
    source: "Restricted facility record",
    lastUpdated: "Access controlled",
    language: "Hidden",
    address: "Hidden",
    consent: "Not recorded",
    restricted: true,
    appointment: "Restricted",
  },
];
