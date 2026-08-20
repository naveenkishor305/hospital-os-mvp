import type { Metadata } from "next";

import { InfectionPreventionWorkspace } from "@/components/facility-operations/infection-prevention-workspace";

export const metadata: Metadata = {
  title: "Infection Prevention",
};

export default function InfectionPreventionPage() {
  return <InfectionPreventionWorkspace />;
}
