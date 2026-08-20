"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useRole } from "@/components/layout/role-context";
import { canAccess, roleById } from "@/lib/roles";
import { Button, SystemState } from "@naveenkishor305/spine-ui";

export function RoleGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { roleId, setRoleId } = useRole();

  if (canAccess(roleId, pathname)) {
    return <>{children}</>;
  }

  const role = roleById[roleId];

  return (
    <div className="spine-page-container py-10 md:py-16">
      <div className="mx-auto max-w-xl">
        <SystemState
          kind="restricted"
          title="Not part of your role"
          description={`${role.label} doesn't include this screen in this prototype. Switch roles from the header, or view as Administrator to see everything.`}
          nextStep="Use the role switcher in the top bar to change roles."
          action={
            <Button variant="secondary" size="sm" onClick={() => setRoleId("administrator")}>
              View as Administrator
            </Button>
          }
        />
      </div>
    </div>
  );
}
