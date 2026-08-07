export type ClosureStatus =
  | "Not ready"
  | "Ready for closure"
  | "Closed"
  | "Exception review";

export type DocumentKind =
  | "Visit summary"
  | "Prescription"
  | "Investigation request"
  | "Referral summary"
  | "Patient education";

export type DeliveryStatus = "Not prepared" | "Ready" | "Delivered" | "Failed";

export type ClosureDocument = {
  id: string;
  kind: DocumentKind;
  required: boolean;
  status: DeliveryStatus;
  version: number;
  channel?: "Printed" | "SMS link" | "Patient portal" | "Receiving provider";
  deliveredAt?: string;
  recipient?: string;
  failureReason?: string;
};

export type FollowUpPlan = {
  id: string;
  status: "Required" | "Scheduled" | "Not required" | "Unable to schedule";
  specialty: string;
  clinician?: string;
  date?: string;
  time?: string;
  reason: string;
  reminderStatus: "Not queued" | "Queued" | "Sent";
  exceptionReason?: string;
};

export type ReferralRecord = {
  id: string;
  service: string;
  urgency: "Routine" | "Priority" | "Urgent";
  receivingProvider: string;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
  clinicalSummarySent: boolean;
  sentAt?: string;
  acknowledgementAt?: string;
  reason: string;
};

export type ContinuityTask = {
  id: string;
  category:
    | "Pending result"
    | "Follow-up"
    | "Referral"
    | "Medication access"
    | "Care gap";
  description: string;
  owner: string;
  dueAt: string;
  status: "Open" | "Completed" | "Escalated";
  createdAt: string;
  resolution?: string;
};

export type VisitClosureRecord = {
  id: string;
  patientId: string;
  encounterId: string;
  department: string;
  clinician: string;
  status: ClosureStatus;
  riskLevel: "Standard" | "High risk";
  clinicalEncounterComplete: boolean;
  clinicalSignedAt?: string;
  financialClearance: "Pending" | "Cleared" | "Exception approved";
  pharmacyHandoff: "Not required" | "Pending" | "Complete";
  medicationReconciled: boolean;
  patientEducationConfirmed: boolean;
  identityConfirmedAt?: string;
  transitionPlanRecorded: boolean;
  followUp: FollowUpPlan;
  referrals: ReferralRecord[];
  documents: ClosureDocument[];
  tasks: ContinuityTask[];
  closedAt?: string;
  closedBy?: string;
  auditNote: string;
};

export const visitClosureRecords: VisitClosureRecord[] = [
  {
    id: "CLS-26-08154",
    patientId: "pt-meera-nair",
    encounterId: "OPD-26-08154",
    department: "Cardiology",
    clinician: "Dr Ananya Rao",
    status: "Ready for closure",
    riskLevel: "High risk",
    clinicalEncounterComplete: true,
    clinicalSignedAt: "02 Aug 2026, 11:42 IST",
    financialClearance: "Cleared",
    pharmacyHandoff: "Complete",
    medicationReconciled: true,
    patientEducationConfirmed: true,
    identityConfirmedAt: "02 Aug 2026, 12:08 IST",
    transitionPlanRecorded: true,
    followUp: {
      id: "FUP-26-04118",
      status: "Scheduled",
      specialty: "Cardiology",
      clinician: "Dr Ananya Rao",
      date: "2026-08-16",
      time: "10:20",
      reason: "Review symptoms, CBC result and treatment response",
      reminderStatus: "Queued",
    },
    referrals: [],
    documents: [
      {
        id: "DOC-08154-01",
        kind: "Visit summary",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "Patient portal",
        deliveredAt: "02 Aug 2026, 12:06 IST",
        recipient: "Patient",
      },
      {
        id: "DOC-08154-02",
        kind: "Prescription",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "Printed",
        deliveredAt: "02 Aug 2026, 12:01 IST",
        recipient: "Patient",
      },
      {
        id: "DOC-08154-03",
        kind: "Investigation request",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "Patient portal",
        deliveredAt: "02 Aug 2026, 11:55 IST",
        recipient: "Patient",
      },
      {
        id: "DOC-08154-04",
        kind: "Patient education",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "SMS link",
        deliveredAt: "02 Aug 2026, 12:07 IST",
        recipient: "Patient",
      },
    ],
    tasks: [
      {
        id: "TASK-08154-01",
        category: "Pending result",
        description: "Review final CBC result and contact patient if plan changes",
        owner: "Cardiology results pool",
        dueAt: "03 Aug 2026, 17:00 IST",
        status: "Open",
        createdAt: "02 Aug 2026, 11:56 IST",
      },
    ],
    auditNote:
      "Signed clinical content remains immutable; closure coordinates delivery and continuity evidence only.",
  },
  {
    id: "CLS-26-08149",
    patientId: "pt-arjun-menon",
    encounterId: "OPD-26-08149",
    department: "General medicine",
    clinician: "Dr Joseph Thomas",
    status: "Closed",
    riskLevel: "Standard",
    clinicalEncounterComplete: true,
    clinicalSignedAt: "02 Aug 2026, 11:21 IST",
    financialClearance: "Cleared",
    pharmacyHandoff: "Not required",
    medicationReconciled: true,
    patientEducationConfirmed: true,
    identityConfirmedAt: "02 Aug 2026, 11:52 IST",
    transitionPlanRecorded: false,
    followUp: {
      id: "FUP-26-04111",
      status: "Not required",
      specialty: "General medicine",
      reason: "Return only if symptoms persist or worsen",
      reminderStatus: "Not queued",
    },
    referrals: [],
    documents: [
      {
        id: "DOC-08149-01",
        kind: "Visit summary",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "SMS link",
        deliveredAt: "02 Aug 2026, 11:54 IST",
        recipient: "Patient",
      },
      {
        id: "DOC-08149-02",
        kind: "Patient education",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "SMS link",
        deliveredAt: "02 Aug 2026, 11:54 IST",
        recipient: "Patient",
      },
    ],
    tasks: [],
    closedAt: "02 Aug 2026, 11:56 IST",
    closedBy: "Anita · OPD coordinator",
    auditNote: "Administrative closure completed after delivery confirmation.",
  },
  {
    id: "CLS-26-08161",
    patientId: "pt-farah-khan",
    encounterId: "OPD-26-08161",
    department: "Orthopaedics",
    clinician: "Dr Kavya Iyer",
    status: "Exception review",
    riskLevel: "Standard",
    clinicalEncounterComplete: true,
    clinicalSignedAt: "02 Aug 2026, 11:28 IST",
    financialClearance: "Pending",
    pharmacyHandoff: "Complete",
    medicationReconciled: true,
    patientEducationConfirmed: false,
    transitionPlanRecorded: false,
    followUp: {
      id: "FUP-26-04123",
      status: "Unable to schedule",
      specialty: "Orthopaedics",
      reason: "Review MRI and reassess knee pain",
      reminderStatus: "Not queued",
      exceptionReason: "Preferred clinician slots unavailable within 14 days",
    },
    referrals: [
      {
        id: "REF-26-00981",
        service: "Physiotherapy",
        urgency: "Priority",
        receivingProvider: "Nadi Rehabilitation Centre",
        status: "Draft",
        clinicalSummarySent: false,
        reason: "Supervised rehabilitation after MRI review",
      },
    ],
    documents: [
      {
        id: "DOC-08161-01",
        kind: "Visit summary",
        required: true,
        status: "Ready",
        version: 1,
      },
      {
        id: "DOC-08161-02",
        kind: "Prescription",
        required: true,
        status: "Delivered",
        version: 1,
        channel: "Printed",
        deliveredAt: "02 Aug 2026, 11:48 IST",
        recipient: "Patient",
      },
      {
        id: "DOC-08161-03",
        kind: "Investigation request",
        required: true,
        status: "Ready",
        version: 1,
      },
      {
        id: "DOC-08161-04",
        kind: "Referral summary",
        required: true,
        status: "Not prepared",
        version: 0,
      },
      {
        id: "DOC-08161-05",
        kind: "Patient education",
        required: true,
        status: "Ready",
        version: 1,
      },
    ],
    tasks: [
      {
        id: "TASK-08161-01",
        category: "Follow-up",
        description: "Secure orthopaedic review within 14 days",
        owner: "OPD scheduling pool",
        dueAt: "03 Aug 2026, 12:00 IST",
        status: "Escalated",
        createdAt: "02 Aug 2026, 11:41 IST",
      },
      {
        id: "TASK-08161-02",
        category: "Pending result",
        description: "Track MRI authorization, completion and final report review",
        owner: "Orthopaedics results pool",
        dueAt: "05 Aug 2026, 17:00 IST",
        status: "Open",
        createdAt: "02 Aug 2026, 11:33 IST",
      },
    ],
    auditNote:
      "Financial authorization, patient education and receiving-provider handoff remain unresolved.",
  },
];

export function cloneVisitClosureRecords() {
  return structuredClone(visitClosureRecords);
}
