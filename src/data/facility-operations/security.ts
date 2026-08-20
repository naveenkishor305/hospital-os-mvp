export type VisitorBadge = {
  id: string;
  visitor: string;
  host: string;
  area: string;
  status: "active" | "revoked";
  issuedAt: string;
};

export const prototypeVisitorBadges: VisitorBadge[] = [
  { id: "vb-1", visitor: "External contractor — R. Menon", host: "Facilities Manager", area: "Main lobby, Rooftop plant room", status: "active", issuedAt: "12 min ago" },
  { id: "vb-2", visitor: "Equipment vendor — MedSupply Co.", host: "Biomedical Engineering", area: "Biomedical workshop", status: "active", issuedAt: "2 hr ago" },
];

export type SecurityIncident = {
  id: string;
  title: string;
  location: string;
  severity: "low" | "moderate" | "high";
  status: "open" | "resolved";
};

export const prototypeSecurityIncidents: SecurityIncident[] = [
  { id: "sec-1", title: "Unattended bag reported", location: "Main lobby", severity: "moderate", status: "open" },
  { id: "sec-2", title: "Tailgating at staff entrance", location: "Block A staff entrance", severity: "low", status: "resolved" },
];

export const accessAreas = ["Main lobby", "OT complex", "ICU", "Biomedical workshop", "Rooftop plant room", "Pharmacy store"];
