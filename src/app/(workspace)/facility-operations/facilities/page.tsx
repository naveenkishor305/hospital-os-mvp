import type { Metadata } from "next";

import { FacilitiesWorkspace } from "@/components/facility-operations/facilities-workspace";

export const metadata: Metadata = {
  title: "Facilities Management",
};

export default function FacilitiesPage() {
  return <FacilitiesWorkspace />;
}
