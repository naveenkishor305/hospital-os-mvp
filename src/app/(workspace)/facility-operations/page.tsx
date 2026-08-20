import type { Metadata } from "next";

import { FacilityOperationsHub } from "@/components/facility-operations/hub";

export const metadata: Metadata = {
  title: "Facility Operations",
};

export default function FacilityOperationsPage() {
  return <FacilityOperationsHub />;
}
