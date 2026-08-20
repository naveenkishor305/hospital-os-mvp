import type { Metadata } from "next";

import { ClinicalEquipmentWorkspace } from "@/components/facility-operations/clinical-equipment-workspace";

export const metadata: Metadata = {
  title: "Clinical Equipment Operations",
};

export default function ClinicalEquipmentPage() {
  return <ClinicalEquipmentWorkspace />;
}
