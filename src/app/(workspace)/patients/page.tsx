import type { Metadata } from "next";

import { PatientAccessWorkspace } from "@/components/patient-access/patient-access-workspace";

export const metadata: Metadata = {
  title: "Patient Search",
};

export default function PatientSearchPage() {
  return <PatientAccessWorkspace />;
}
