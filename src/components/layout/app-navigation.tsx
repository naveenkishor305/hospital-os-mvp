"use client";

import {
  CalendarDays,
  ClipboardPlus,
  ClipboardCheck,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  PackageOpen,
  Pill,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";

type NavigationItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
};

const workspaceNavigation: NavigationItem[] = [
  { label: "OPD overview", icon: LayoutDashboard, href: "/" },
  { label: "Patient access", icon: UsersRound, href: "/patients" },
  { label: "Appointments", icon: CalendarDays, href: "/appointments" },
  { label: "Consultation", icon: Stethoscope, href: "/consultation" },
  { label: "Diagnostics", icon: FlaskConical, href: "/diagnostics" },
  { label: "Medication", icon: Pill, href: "/pharmacy" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Visit closure", icon: ClipboardCheck, href: "/visit-closure" },
];

const systemNavigation: NavigationItem[] = [
  { label: "Spine inventory", icon: PackageOpen, href: "/design-system" },
  { label: "Audit trail", icon: ClipboardPlus },
];

function NavigationGroup({
  label,
  items,
}: {
  label: string;
  items: NavigationItem[];
}) {
  const pathname = usePathname();

  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-tertiary">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;

          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-selected font-semibold text-action"
                      : "text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary",
                  )}
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-tertiary"
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span className="flex-1">{item.label}</span>
                  <StatusBadge className="min-h-5 px-1.5 text-[9px]">
                    Next
                  </StatusBadge>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppNavigation() {
  return (
    <nav aria-label="Nadi primary navigation" className="space-y-7">
      <NavigationGroup label="Integrated OPD" items={workspaceNavigation} />
      <NavigationGroup label="System" items={systemNavigation} />
    </nav>
  );
}
