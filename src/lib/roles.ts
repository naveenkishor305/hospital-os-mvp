export type RoleId =
  | "administrator"
  | "receptionist"
  | "nurse"
  | "doctor"
  | "clinical-pharmacist"
  | "billing"
  | "him-officer"
  | "rehabilitation-therapist"
  | "procurement-manager"
  | "biomedical-engineer"
  | "enterprise-administration-manager";

export type Role = {
  id: RoleId;
  label: string;
  description: string;
};

export const roles: Role[] = [
  {
    id: "administrator",
    label: "Administrator",
    description: "Manages hospital operations, users, configuration and reporting. Full access to every screen.",
  },
  {
    id: "receptionist",
    label: "Receptionist",
    description: "Handles registration, appointments and front-desk workflows.",
  },
  {
    id: "nurse",
    label: "Nurse",
    description: "Handles nursing workflows across OPD, Emergency, wards and critical care.",
  },
  {
    id: "doctor",
    label: "Doctor",
    description: "Handles clinical assessment, diagnosis, orders and treatment.",
  },
  {
    id: "clinical-pharmacist",
    label: "Clinical Pharmacist",
    description: "Reviews medication safety, reconciliation and dispensing decisions.",
  },
  {
    id: "billing",
    label: "Billing Staff",
    description: "Handles billing, payments, invoices and the revenue cycle.",
  },
  {
    id: "him-officer",
    label: "HIM Officer",
    description: "Manages patient identity, duplicate detection and visit closure.",
  },
  {
    id: "rehabilitation-therapist",
    label: "Rehabilitation Therapist",
    description: "Delivers physiotherapy, occupational therapy and allied health care.",
  },
  {
    id: "procurement-manager",
    label: "Procurement Manager",
    description: "Manages supplier sourcing, purchasing and warehouse operations.",
  },
  {
    id: "biomedical-engineer",
    label: "Biomedical Engineer",
    description: "Maintains clinical equipment and facility infrastructure.",
  },
  {
    id: "enterprise-administration-manager",
    label: "Enterprise Administration Manager",
    description: "Governs organizational structure and cross-department analytics.",
  },
];

export const defaultRoleId: RoleId = "nurse";

export const roleById: Record<RoleId, Role> = Object.fromEntries(
  roles.map((role) => [role.id, role]),
) as Record<RoleId, Role>;

/**
 * Route -> roles allowed to see it. Unlisted routes are open to every role
 * (e.g. the login/redirect chrome). An empty array means administrator-only.
 * This is a client-side prototype, not real authorization -- nothing here
 * is enforced server-side.
 */
export const routeAccess: Record<string, RoleId[]> = {
  "/": ["receptionist", "nurse", "doctor"],
  "/patients": ["receptionist", "nurse", "doctor", "him-officer"],
  "/appointments": ["receptionist"],
  "/consultation": ["doctor", "nurse"],
  "/diagnostics": ["doctor"],
  "/pharmacy": ["clinical-pharmacist"],
  "/billing": ["billing"],
  "/visit-closure": ["him-officer", "billing"],
  "/emergency": ["nurse", "doctor"],
  "/inpatient": ["nurse", "doctor", "rehabilitation-therapist"],
  "/surgical-critical-care": ["doctor", "nurse"],
  "/diagnostics-pharmacy-ops": ["doctor", "clinical-pharmacist"],
  "/revenue-cycle": ["billing"],
  "/supply-chain": ["procurement-manager"],
  "/allied-health": ["rehabilitation-therapist"],
  "/facility-operations": ["biomedical-engineer"],
  "/enterprise": ["enterprise-administration-manager"],
  "/design-system": [],
};

/** Resolves dynamic sub-routes (e.g. /patients/abc123) to their parent's access list. */
export function getAllowedRoles(pathname: string): RoleId[] | undefined {
  if (routeAccess[pathname]) {
    return routeAccess[pathname];
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1) {
    const parent = `/${segments[0]}`;
    if (routeAccess[parent]) {
      return routeAccess[parent];
    }
  }

  return undefined;
}

export function canAccess(roleId: RoleId, pathname: string): boolean {
  if (roleId === "administrator") {
    return true;
  }

  const allowed = getAllowedRoles(pathname);
  return !allowed || allowed.includes(roleId);
}
