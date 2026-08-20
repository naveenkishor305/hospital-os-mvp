export type TheatreCase = {
  id: string;
  theatre: string;
  patient: string;
  procedure: string;
  surgeon: string;
  time: string;
  status: "available" | "booked" | "blocked" | "selected";
};

export const prototypeTheatreSchedule: { id: string; name: string; slots: TheatreCase[] }[] = [
  {
    id: "ot-1",
    name: "Theatre 1 — General Surgery",
    slots: [
      { id: "ot1-0800", theatre: "Theatre 1", patient: "Ravi Chandran", procedure: "ORIF forearm", surgeon: "Dr. Karthik Iyer", time: "08:00", status: "booked" },
      { id: "ot1-1030", theatre: "Theatre 1", patient: "—", procedure: "—", surgeon: "—", time: "10:30", status: "available" },
      { id: "ot1-1300", theatre: "Theatre 1", patient: "Farah Khan", procedure: "Cholecystectomy", surgeon: "Dr. Meenal Joshi", time: "13:00", status: "booked" },
    ],
  },
  {
    id: "ot-2",
    name: "Theatre 2 — Cardiac",
    slots: [
      { id: "ot2-0700", theatre: "Theatre 2", patient: "Devika Iyer", procedure: "Primary PCI, post-STEMI", surgeon: "Dr. Ananya Rao", time: "07:00", status: "booked" },
      { id: "ot2-1000", theatre: "Theatre 2", patient: "—", procedure: "Turnover & cleaning", surgeon: "—", time: "10:00", status: "blocked" },
    ],
  },
];

export type IcuPatient = {
  id: string;
  name: string;
  bed: string;
  diagnosis: string;
  sofaScore: number;
  ventilated: boolean;
  hemodynamicSupport: boolean;
  daysInIcu: number;
};

export const prototypeIcuPatients: IcuPatient[] = [
  {
    id: "icu-devika-iyer",
    name: "Devika Iyer",
    bed: "ICU-04",
    diagnosis: "Post-PCI, STEMI, cardiogenic shock risk",
    sofaScore: 9,
    ventilated: false,
    hemodynamicSupport: true,
    daysInIcu: 0,
  },
  {
    id: "icu-arvind-nair",
    name: "Arvind Nair",
    bed: "ICU-02",
    diagnosis: "Severe community-acquired pneumonia, ARDS",
    sofaScore: 13,
    ventilated: true,
    hemodynamicSupport: true,
    daysInIcu: 4,
  },
  {
    id: "icu-geetha-menon",
    name: "Geetha Menon",
    bed: "ICU-06",
    diagnosis: "Post-laparotomy, septic shock resolving",
    sofaScore: 5,
    ventilated: false,
    hemodynamicSupport: false,
    daysInIcu: 6,
  },
];

export function sofaRiskLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score >= 12) return "critical";
  if (score >= 8) return "high";
  if (score >= 4) return "moderate";
  return "low";
}
