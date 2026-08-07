import type { Metadata } from "next";

import { PharmacyWorkspace } from "@/components/pharmacy/pharmacy-workspace";

export const metadata: Metadata = {
  title: "Medication and Pharmacy",
};

type PharmacyPageProps = {
  searchParams: Promise<{
    patient?: string | string[];
    encounter?: string | string[];
  }>;
};

export default async function PharmacyPage({
  searchParams,
}: PharmacyPageProps) {
  const query = await searchParams;
  const patient =
    typeof query.patient === "string" ? query.patient : undefined;
  const encounter =
    typeof query.encounter === "string" ? query.encounter : undefined;

  return (
    <PharmacyWorkspace
      initialPatientId={patient}
      initialEncounterId={encounter}
    />
  );
}
