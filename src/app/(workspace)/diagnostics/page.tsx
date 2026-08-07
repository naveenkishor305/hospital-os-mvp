import type { Metadata } from "next";

import { DiagnosticsWorkspace } from "@/components/diagnostics/diagnostics-workspace";

export const metadata: Metadata = {
  title: "Diagnostics and Results",
};

type DiagnosticsPageProps = {
  searchParams: Promise<{
    patient?: string | string[];
    encounter?: string | string[];
  }>;
};

export default async function DiagnosticsPage({
  searchParams,
}: DiagnosticsPageProps) {
  const query = await searchParams;
  const patient =
    typeof query.patient === "string" ? query.patient : undefined;
  const encounter =
    typeof query.encounter === "string" ? query.encounter : undefined;

  return (
    <DiagnosticsWorkspace
      initialPatientId={patient}
      initialEncounterId={encounter}
    />
  );
}

