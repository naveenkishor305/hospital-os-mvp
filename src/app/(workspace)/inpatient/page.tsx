import type { Metadata } from "next";

import { InpatientWardWorkspace } from "@/components/inpatient/inpatient-ward-workspace";

export const metadata: Metadata = {
  title: "Inpatient Ward",
};

export default function InpatientPage() {
  return <InpatientWardWorkspace />;
}
