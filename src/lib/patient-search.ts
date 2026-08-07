import type { PatientAccessRecord } from "@/data/patients";

export type PatientSearchMode = "all" | "name" | "mrn" | "mobile" | "dob";

export type RegistrationIdentity = {
  fullName: string;
  dob: string;
  mobile: string;
};

export type DuplicateCandidate = {
  patient: PatientAccessRecord;
  confidence: "High" | "Possible";
  reasons: string[];
};

function normalizeText(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeName(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function namesAreSimilar(left: string, right: string) {
  const leftTokens = new Set(normalizeName(left));
  const rightTokens = new Set(normalizeName(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return false;
  }

  const overlap = [...leftTokens].filter((token) => rightTokens.has(token));
  return overlap.length / Math.max(leftTokens.size, rightTokens.size) >= 0.66;
}

export function searchPatients(
  patients: PatientAccessRecord[],
  query: string,
  mode: PatientSearchMode,
) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  return patients.filter((patient) => {
    const fields: Record<Exclude<PatientSearchMode, "all">, string> = {
      name: patient.name,
      mrn: patient.mrn,
      mobile: patient.mobile,
      dob: patient.dob,
    };

    if (mode !== "all") {
      return normalizeText(fields[mode]).includes(normalizedQuery);
    }

    return Object.values(fields).some((value) =>
      normalizeText(value).includes(normalizedQuery),
    );
  });
}

export function findDuplicateCandidates(
  identity: RegistrationIdentity,
  patients: PatientAccessRecord[],
): DuplicateCandidate[] {
  if (!identity.fullName.trim() && !identity.dob && !identity.mobile.trim()) {
    return [];
  }

  const normalizedMobile = identity.mobile.replace(/\D/g, "");

  return patients
    .map((patient) => {
      const reasons: string[] = [];
      let score = 0;

      if (
        identity.fullName.trim() &&
        normalizeText(identity.fullName) === normalizeText(patient.name)
      ) {
        reasons.push("Same full name");
        score += 45;
      } else if (
        identity.fullName.trim() &&
        namesAreSimilar(identity.fullName, patient.name)
      ) {
        reasons.push("Very similar name");
        score += 30;
      }

      if (identity.dob && identity.dob === patient.dob) {
        reasons.push("Same date of birth");
        score += 40;
      }

      if (normalizedMobile.length === 10 && normalizedMobile === patient.mobile) {
        reasons.push("Same mobile number");
        score += 55;
      } else if (
        normalizedMobile.length >= 4 &&
        normalizedMobile.slice(-4) === patient.phoneSuffix
      ) {
        reasons.push("Same mobile ending");
        score += 20;
      }

      return {
        patient,
        confidence: score >= 70 ? ("High" as const) : ("Possible" as const),
        reasons,
        score,
      };
    })
    .filter((candidate) => candidate.score >= 30)
    .sort((left, right) => right.score - left.score)
    .map(({ patient, confidence, reasons }) => ({
      patient,
      confidence,
      reasons,
    }));
}
