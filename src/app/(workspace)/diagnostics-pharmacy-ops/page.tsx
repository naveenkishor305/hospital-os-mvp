import type { Metadata } from "next";

import { DiagnosticsPharmacyOpsWorkspace } from "@/components/diagnostics-pharmacy-ops/diagnostics-pharmacy-ops-workspace";

export const metadata: Metadata = {
  title: "Diagnostics & Pharmacy Operations",
};

export default function DiagnosticsPharmacyOpsPage() {
  return <DiagnosticsPharmacyOpsWorkspace />;
}
