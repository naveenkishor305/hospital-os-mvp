"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { defaultRoleId, ROLE_STORAGE_KEY, type RoleId } from "@/lib/roles";

const STORAGE_KEY = ROLE_STORAGE_KEY;
const ROLE_CHANGE_EVENT = "nadi-role-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ROLE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ROLE_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): RoleId {
  return (window.localStorage.getItem(STORAGE_KEY) as RoleId | null) ?? defaultRoleId;
}

function getServerSnapshot(): RoleId {
  return defaultRoleId;
}

type RoleContextValue = {
  roleId: RoleId;
  setRoleId: (roleId: RoleId) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const roleId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setRoleId = useCallback((nextRoleId: RoleId) => {
    window.localStorage.setItem(STORAGE_KEY, nextRoleId);
    // The native "storage" event only fires in *other* tabs, not this one --
    // dispatch a synthetic event so useSyncExternalStore re-reads locally too.
    window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
  }, []);

  return (
    <RoleContext.Provider value={{ roleId, setRoleId }}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
