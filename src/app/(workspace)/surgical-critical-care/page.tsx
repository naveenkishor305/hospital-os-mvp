import type { Metadata } from "next";

import { SurgicalCriticalCareWorkspace } from "@/components/surgical-critical-care/surgical-critical-care-workspace";

export const metadata: Metadata = {
  title: "Surgical & Critical Care",
};

export default function SurgicalCriticalCarePage() {
  return <SurgicalCriticalCareWorkspace />;
}
