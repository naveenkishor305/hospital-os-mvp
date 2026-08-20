"use client";

import {
  ArrowRight,
  Building2,
  Shirt,
  ShieldAlert,
  ShieldCheck,
  Skull,
  SprayCan,
  Stethoscope,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@naveenkishor305/spine-ui";

import { ModulePageHeader } from "@/components/prototype/module-page-header";
import { useRole } from "@/components/layout/role-context";
import { roleById, type RoleId } from "@/lib/roles";

type FacilityModule = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  roleId: RoleId;
};

const facilityModules: FacilityModule[] = [
  { href: "/facility-operations/biomedical", title: "Biomedical engineering", description: "Equipment lifecycle, preventive maintenance and calibration.", icon: Wrench, roleId: "biomedical-engineer" },
  { href: "/facility-operations/facilities", title: "Facilities management", description: "Building assets, HVAC, electrical and work orders.", icon: Building2, roleId: "facilities-manager" },
  { href: "/facility-operations/security", title: "Security & access control", description: "Visitor badges, area access and incident response.", icon: ShieldCheck, roleId: "security-supervisor" },
  { href: "/facility-operations/transport", title: "Internal transportation", description: "Patient, specimen and equipment transport dispatch.", icon: Truck, roleId: "transport-dispatcher" },
  { href: "/facility-operations/mortuary", title: "Mortuary services", description: "Deceased patient intake and chain-of-custody handoffs.", icon: Skull, roleId: "mortuary-supervisor" },
  { href: "/facility-operations/environmental", title: "Environmental services", description: "Housekeeping, isolation terminal cleans and turnover.", icon: SprayCan, roleId: "evs-supervisor" },
  { href: "/facility-operations/linen", title: "Linen & laundry", description: "Par-level linen inventory and ward distribution.", icon: Shirt, roleId: "linen-services-supervisor" },
  { href: "/facility-operations/infection-prevention", title: "Infection prevention", description: "Isolation precautions and hand hygiene compliance.", icon: ShieldAlert, roleId: "infection-preventionist" },
  { href: "/facility-operations/clinical-equipment", title: "Clinical equipment operations", description: "Point-of-care equipment check-out and reprocessing.", icon: Stethoscope, roleId: "clinical-equipment-coordinator" },
];

export function FacilityOperationsHub() {
  const { roleId } = useRole();

  return (
    <div className="spine-page-container py-7 md:py-9">
      <ModulePageHeader
        eyebrow="Facility & support services"
        title="Facility operations"
        description="Nine support-service modules, each with its own specialist role and workspace. Pick a module below."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {facilityModules.map((module) => {
          const Icon = module.icon;
          const isYourArea = module.roleId === roleId;

          return (
            <Link
              key={module.href}
              href={module.href}
              className="group flex flex-col justify-between rounded-lg border border-border-subtle bg-surface p-5 shadow-panel transition-colors hover:border-action"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  {isYourArea ? <StatusBadge tone="information">Your area</StatusBadge> : null}
                </div>
                <h2 className="mt-3 text-sm font-semibold text-ink-primary">{module.title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-ink-secondary">{module.description}</p>
                <p className="mt-2 text-[11px] text-ink-tertiary">{roleById[module.roleId].label}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-action">
                Open workspace
                <ArrowRight aria-hidden="true" size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
