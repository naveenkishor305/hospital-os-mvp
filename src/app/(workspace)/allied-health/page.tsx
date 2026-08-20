import type { Metadata } from "next";

import { AlliedHealthWorkspace } from "@/components/allied-health/allied-health-workspace";

export const metadata: Metadata = {
  title: "Allied Health & Care Coordination",
};

export default function AlliedHealthPage() {
  return <AlliedHealthWorkspace />;
}
