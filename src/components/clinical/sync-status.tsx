"use client";

import {
  CloudOff,
  CloudUpload,
  RefreshCw,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/ui/status-badge";

export type SyncStatusProps = {
  queuedChanges?: number;
  conflictCount?: number;
  lastSynced?: string;
  syncing?: boolean;
};

export function SyncStatus({
  queuedChanges = 0,
  conflictCount = 0,
  lastSynced = "Just now",
  syncing = false,
}: SyncStatusProps) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateConnectivity = () => setOnline(navigator.onLine);

    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);

    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
    };
  }, []);

  if (conflictCount > 0) {
    return (
      <StatusBadge
        tone="critical"
        role="status"
        aria-live="assertive"
        icon={<ShieldAlert aria-hidden="true" size={13} />}
        title={`${conflictCount} changes require field-level review`}
      >
        {conflictCount} sync conflict{conflictCount === 1 ? "" : "s"}
      </StatusBadge>
    );
  }

  if (!online) {
    return (
      <StatusBadge
        tone="warning"
        role="status"
        aria-live="polite"
        icon={<CloudOff aria-hidden="true" size={13} />}
        title={`Offline. ${queuedChanges} queued changes. Last synced ${lastSynced}.`}
      >
        Offline · {queuedChanges} queued
      </StatusBadge>
    );
  }

  if (syncing) {
    return (
      <StatusBadge
        tone="information"
        role="status"
        aria-live="polite"
        icon={<RefreshCw aria-hidden="true" size={13} />}
        title={`Synchronizing ${queuedChanges} queued changes`}
      >
        Syncing {queuedChanges} changes
      </StatusBadge>
    );
  }

  if (queuedChanges > 0) {
    return (
      <StatusBadge
        tone="information"
        role="status"
        icon={<CloudUpload aria-hidden="true" size={13} />}
        title={`${queuedChanges} changes are queued for synchronization`}
      >
        {queuedChanges} queued
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      tone="success"
      showDot
      role="status"
      icon={<Wifi aria-hidden="true" size={13} />}
      title={`System online. Last synchronized ${lastSynced}.`}
    >
      Online
    </StatusBadge>
  );
}
