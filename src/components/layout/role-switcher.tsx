"use client";

import { UserCog } from "lucide-react";

import { useRole } from "@/components/layout/role-context";
import { roles, type RoleId } from "@/lib/roles";

export function RoleSwitcher() {
  const { roleId, setRoleId } = useRole();

  return (
    <label className="hidden items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs text-ink-secondary md:flex">
      <UserCog aria-hidden="true" size={14} className="text-action" />
      <span className="sr-only">Viewing as role</span>
      <select
        value={roleId}
        onChange={(event) => setRoleId(event.target.value as RoleId)}
        className="max-w-40 truncate bg-transparent text-xs font-semibold text-ink-primary outline-none"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </select>
    </label>
  );
}
