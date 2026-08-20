export type AlliedHealthDiscipline =
  | "Physiotherapy"
  | "Occupational therapy"
  | "Speech & language"
  | "Nutrition"
  | "Social work";

export type AlliedHealthReferral = {
  id: string;
  patient: string;
  discipline: AlliedHealthDiscipline;
  reason: string;
  priority: "routine" | "urgent";
  status: "pending-assignment" | "in-progress" | "completed";
  assignedTo?: string;
};

export const prototypeReferrals: AlliedHealthReferral[] = [
  { id: "ah-1", patient: "Suresh Babu", discipline: "Physiotherapy", reason: "Post-fall mobility and gait training", priority: "urgent", status: "in-progress", assignedTo: "Physiotherapist Rohan" },
  { id: "ah-2", patient: "Lakshmi Pillai", discipline: "Nutrition", reason: "Malnutrition risk on admission", priority: "routine", status: "pending-assignment" },
  { id: "ah-3", patient: "Arvind Nair", discipline: "Speech & language", reason: "Swallowing assessment post-extubation", priority: "urgent", status: "pending-assignment" },
  { id: "ah-4", patient: "Priya Nambiar", discipline: "Social work", reason: "Discharge planning, caregiver support", priority: "routine", status: "completed", assignedTo: "Social Worker Divya" },
];

export const therapistRoster: Record<AlliedHealthDiscipline, string> = {
  Physiotherapy: "Physiotherapist Rohan",
  "Occupational therapy": "OT Specialist Meena",
  "Speech & language": "SLP Anjali",
  Nutrition: "Dietitian Kavya",
  "Social work": "Social Worker Divya",
};

export type GoalProgress = {
  id: string;
  patient: string;
  goal: string;
  discipline: AlliedHealthDiscipline;
  progress: number;
};

export const prototypeGoalProgress: GoalProgress[] = [
  { id: "goal-1", patient: "Suresh Babu", goal: "Independent ambulation with walker, 20 meters", discipline: "Physiotherapy", progress: 60 },
  { id: "goal-2", patient: "Suresh Babu", goal: "Safe stair negotiation before discharge", discipline: "Physiotherapy", progress: 25 },
  { id: "goal-3", patient: "Lakshmi Pillai", goal: "Meet 80% of estimated caloric requirement", discipline: "Nutrition", progress: 45 },
];

export type SessionOutcome = "success" | "warning" | "neutral";

export const prototypeSessionHistory: {
  id: string;
  timestamp: string;
  actor: string;
  description: string;
  tone?: SessionOutcome;
}[] = [
  { id: "s1", timestamp: "Mon 09:15", actor: "Physiotherapist Rohan", description: "Baseline mobility assessment: unable to stand without max assist." },
  { id: "s2", timestamp: "Tue 10:00", actor: "Physiotherapist Rohan", description: "Gait training with walker, 5 meters with moderate assist.", tone: "success" },
  { id: "s3", timestamp: "Wed 09:40", actor: "Physiotherapist Rohan", description: "Fatigue limited session to 3 minutes; plan adjusted.", tone: "warning" },
];
