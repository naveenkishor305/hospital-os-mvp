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
  | "enterprise-administration-manager"
  | "facilities-manager"
  | "security-supervisor"
  | "transport-dispatcher"
  | "mortuary-supervisor"
  | "evs-supervisor"
  | "linen-services-supervisor"
  | "infection-preventionist"
  | "clinical-equipment-coordinator";

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
  {
    id: "facilities-manager",
    label: "Facilities Manager",
    description: "Manages building assets, work orders and preventive maintenance for building systems.",
  },
  {
    id: "security-supervisor",
    label: "Security Supervisor",
    description: "Oversees access control, visitor management and security incident response.",
  },
  {
    id: "transport-dispatcher",
    label: "Transport Dispatcher",
    description: "Dispatches patient transport, specimen courier and internal logistics requests.",
  },
  {
    id: "mortuary-supervisor",
    label: "Mortuary Supervisor",
    description: "Manages deceased patient intake, storage and body release with chain-of-custody.",
  },
  {
    id: "evs-supervisor",
    label: "Environmental Services Supervisor",
    description: "Manages housekeeping, isolation room decontamination and waste management.",
  },
  {
    id: "linen-services-supervisor",
    label: "Linen Services Supervisor",
    description: "Manages linen inventory, laundry processing and distribution logistics.",
  },
  {
    id: "infection-preventionist",
    label: "Infection Preventionist",
    description: "Monitors isolation precautions, outbreak detection and IPC compliance.",
  },
  {
    id: "clinical-equipment-coordinator",
    label: "Clinical Equipment Coordinator",
    description: "Manages point-of-care equipment check-out, reprocessing and competency training.",
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
  "/facility-operations": [
    "biomedical-engineer",
    "facilities-manager",
    "security-supervisor",
    "transport-dispatcher",
    "mortuary-supervisor",
    "evs-supervisor",
    "linen-services-supervisor",
    "infection-preventionist",
    "clinical-equipment-coordinator",
  ],
  "/facility-operations/biomedical": ["biomedical-engineer"],
  "/facility-operations/facilities": ["facilities-manager"],
  "/facility-operations/security": ["security-supervisor"],
  "/facility-operations/transport": ["transport-dispatcher"],
  "/facility-operations/mortuary": ["mortuary-supervisor"],
  "/facility-operations/environmental": ["evs-supervisor"],
  "/facility-operations/linen": ["linen-services-supervisor"],
  "/facility-operations/infection-prevention": ["infection-preventionist"],
  "/facility-operations/clinical-equipment": ["clinical-equipment-coordinator"],
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
