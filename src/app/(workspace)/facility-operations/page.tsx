import type { Metadata } from "next";

import { FacilityOperationsWorkspace } from "@/components/facility-operations/facility-operations-workspace";

export const metadata: Metadata = {
  title: "Facility Operations",
};

export default function FacilityOperationsPage() {
  return <FacilityOperationsWorkspace />;
}
