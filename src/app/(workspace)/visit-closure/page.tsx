import type { Metadata } from "next";

import { VisitClosureWorkspace } from "@/components/visit-closure/visit-closure-workspace";

export const metadata: Metadata = {
  title: "Visit Closure and Continuity",
};

type VisitClosurePageProps = {
  searchParams: Promise<{
    patient?: string | string[];
    encounter?: string | string[];
  }>;
};

export default async function VisitClosurePage({
  searchParams,
}: VisitClosurePageProps) {
  const query = await searchParams;
  const patient =
    typeof query.patient === "string" ? query.patient : undefined;
  const encounter =
    typeof query.encounter === "string" ? query.encounter : undefined;

  return (
    <VisitClosureWorkspace
      initialPatientId={patient}
      initialEncounterId={encounter}
    />
  );
}
