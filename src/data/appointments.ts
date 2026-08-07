export type AppointmentStatus =
  | "Scheduled"
  | "Arrived"
  | "Cancelled"
  | "Completed";

export type QueueStatus =
  | "Not queued"
  | "Waiting"
  | "Called"
  | "In consultation"
  | "Completed";

export type AppointmentPriority = "Routine" | "Follow-up" | "Urgent";

export type AppointmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  department: string;
  clinicianId: string;
  clinician: string;
  date: string;
  time: string;
  durationMinutes: number;
  visitType: string;
  source: string;
  appointmentStatus: AppointmentStatus;
  queueStatus: QueueStatus;
  priority: AppointmentPriority;
  room: string;
  bookedAt: string;
  arrivedAt?: string;
  token?: string;
  waitMinutes?: number;
  actionNote?: string;
};

export type ClinicianAvailability = {
  id: string;
  name: string;
  department: string;
  room: string;
  slotMinutes: number;
  schedule: Record<string, string[]>;
  blockedSlots?: Array<{
    date: string;
    time: string;
    reason: string;
  }>;
};

export type WaitlistRecord = {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  department: string;
  clinicianId: string;
  clinician: string;
  date: string;
  visitType: string;
  addedAt: string;
  status: "Waiting" | "Slot offered";
};

export const scheduleDates = [
  { value: "2026-08-02", label: "Today · 02 Aug 2026" },
  { value: "2026-08-03", label: "Tomorrow · 03 Aug 2026" },
  { value: "2026-08-04", label: "Tuesday · 04 Aug 2026" },
];

const morningSlots = [
  "09:30",
  "09:50",
  "10:10",
  "10:30",
  "10:50",
  "11:10",
  "11:30",
  "11:50",
];

const extendedSlots = [
  ...morningSlots,
  "12:10",
  "12:30",
];

export const prototypeClinicians: ClinicianAvailability[] = [
  {
    id: "dr-ananya-rao",
    name: "Dr Ananya Rao",
    department: "Cardiology",
    room: "OPD 4",
    slotMinutes: 20,
    schedule: {
      "2026-08-02": extendedSlots,
      "2026-08-03": extendedSlots,
      "2026-08-04": morningSlots,
    },
    blockedSlots: [
      {
        date: "2026-08-02",
        time: "11:30",
        reason: "Clinical review meeting",
      },
    ],
  },
  {
    id: "dr-joseph-thomas",
    name: "Dr Joseph Thomas",
    department: "General medicine",
    room: "OPD room 4",
    slotMinutes: 20,
    schedule: {
      "2026-08-02": extendedSlots,
      "2026-08-03": extendedSlots,
      "2026-08-04": extendedSlots,
    },
  },
  {
    id: "dr-kavya-iyer",
    name: "Dr Kavya Iyer",
    department: "Orthopaedics",
    room: "OPD 7",
    slotMinutes: 20,
    schedule: {
      "2026-08-02": morningSlots,
      "2026-08-03": extendedSlots,
      "2026-08-04": morningSlots,
    },
    blockedSlots: [
      {
        date: "2026-08-03",
        time: "10:30",
        reason: "Procedure block",
      },
    ],
  },
  {
    id: "dr-isha-sen",
    name: "Dr Isha Sen",
    department: "Ophthalmology",
    room: "Eye OPD 2",
    slotMinutes: 20,
    schedule: {
      "2026-08-02": morningSlots,
      "2026-08-03": morningSlots,
      "2026-08-04": extendedSlots,
    },
  },
];

export const prototypeAppointments: AppointmentRecord[] = [
  {
    id: "apt-meera-08154",
    patientId: "pt-meera-nair",
    patientName: "Meera Nair",
    mrn: "HOS-024718",
    department: "Cardiology",
    clinicianId: "dr-ananya-rao",
    clinician: "Dr Ananya Rao",
    date: "2026-08-02",
    time: "10:30",
    durationMinutes: 20,
    visitType: "Follow-up",
    source: "Front desk",
    appointmentStatus: "Scheduled",
    queueStatus: "Not queued",
    priority: "Follow-up",
    room: "OPD 4",
    bookedAt: "01 Aug 2026 · 15:42",
  },
  {
    id: "apt-arjun-08149",
    patientId: "pt-arjun-menon",
    patientName: "Arjun Menon",
    mrn: "HOS-019482",
    department: "General medicine",
    clinicianId: "dr-joseph-thomas",
    clinician: "Dr Joseph Thomas",
    date: "2026-08-02",
    time: "10:10",
    durationMinutes: 20,
    visitType: "New consultation",
    source: "Online",
    appointmentStatus: "Arrived",
    queueStatus: "Waiting",
    priority: "Routine",
    room: "OPD room 4",
    bookedAt: "31 Jul 2026 · 18:09",
    arrivedAt: "10:12",
    token: "GM-014",
    waitMinutes: 16,
  },
  {
    id: "apt-farah-08161",
    patientId: "pt-farah-khan",
    patientName: "Farah Khan",
    mrn: "HOS-031096",
    department: "Orthopaedics",
    clinicianId: "dr-kavya-iyer",
    clinician: "Dr Kavya Iyer",
    date: "2026-08-02",
    time: "10:50",
    durationMinutes: 20,
    visitType: "Follow-up",
    source: "WhatsApp",
    appointmentStatus: "Arrived",
    queueStatus: "Called",
    priority: "Follow-up",
    room: "OPD 7",
    bookedAt: "01 Aug 2026 · 09:21",
    arrivedAt: "10:18",
    token: "OR-008",
    waitMinutes: 10,
  },
  {
    id: "apt-meera-legacy",
    patientId: "pt-meera-k-nair",
    patientName: "Meera K Nair",
    mrn: "HOS-040882",
    department: "General medicine",
    clinicianId: "dr-joseph-thomas",
    clinician: "Dr Joseph Thomas",
    date: "2026-08-02",
    time: "09:50",
    durationMinutes: 20,
    visitType: "New consultation",
    source: "Call centre",
    appointmentStatus: "Arrived",
    queueStatus: "In consultation",
    priority: "Routine",
    room: "OPD room 4",
    bookedAt: "01 Aug 2026 · 12:34",
    arrivedAt: "09:43",
    token: "GM-011",
    waitMinutes: 21,
  },
];

export const prototypeWaitlist: WaitlistRecord[] = [
  {
    id: "waitlist-001",
    patientId: "pt-meera-k-nair",
    patientName: "Meera K Nair",
    mrn: "HOS-040882",
    department: "Cardiology",
    clinicianId: "dr-ananya-rao",
    clinician: "Dr Ananya Rao",
    date: "2026-08-03",
    visitType: "Follow-up",
    addedAt: "02 Aug 2026 · 09:32",
    status: "Waiting",
  },
];
