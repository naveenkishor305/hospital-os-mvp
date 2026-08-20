export type AlliedHealthReferral = {
  id: string;
  patient: string;
  discipline: "Physiotherapy" | "Occupational therapy" | "Speech & language" | "Nutrition" | "Social work";
  reason: string;
  priority: "routine" | "urgent";
  status: "pending-assignment" | "in-progress" | "completed";
};

export const prototypeReferrals: AlliedHealthReferral[] = [
  { id: "ah-1", patient: "Suresh Babu", discipline: "Physiotherapy", reason: "Post-fall mobility and gait training", priority: "urgent", status: "in-progress" },
  { id: "ah-2", patient: "Lakshmi Pillai", discipline: "Nutrition", reason: "Malnutrition risk on admission", priority: "routine", status: "pending-assignment" },
  { id: "ah-3", patient: "Arvind Nair", discipline: "Speech & language", reason: "Swallowing assessment post-extubation", priority: "urgent", status: "pending-assignment" },
  { id: "ah-4", patient: "Priya Nambiar", discipline: "Social work", reason: "Discharge planning, caregiver support", priority: "routine", status: "completed" },
];

export const prototypeGoalProgress = [
  { id: "goal-1", patient: "Suresh Babu", goal: "Independent ambulation with walker, 20 meters", discipline: "Physiotherapy", progress: 60 },
  { id: "goal-2", patient: "Suresh Babu", goal: "Safe stair negotiation before discharge", discipline: "Physiotherapy", progress: 25 },
  { id: "goal-3", patient: "Lakshmi Pillai", goal: "Meet 80% of estimated caloric requirement", discipline: "Nutrition", progress: 45 },
];

export const prototypeSessionHistory = [
  { id: "s1", timestamp: "Mon 09:15", actor: "Physiotherapist Rohan", description: "Baseline mobility assessment: unable to stand without max assist." },
  { id: "s2", timestamp: "Tue 10:00", actor: "Physiotherapist Rohan", description: "Gait training with walker, 5 meters with moderate assist.", tone: "success" as const },
  { id: "s3", timestamp: "Wed 09:40", actor: "Physiotherapist Rohan", description: "Fatigue limited session to 3 minutes; plan adjusted.", tone: "warning" as const },
];
