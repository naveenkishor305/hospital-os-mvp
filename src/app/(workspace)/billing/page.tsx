import type { Metadata } from "next";

import { BillingWorkspace } from "@/components/billing/billing-workspace";

export const metadata: Metadata = {
  title: "Billing, Insurance and Payments",
};

type BillingPageProps = {
  searchParams: Promise<{
    patient?: string | string[];
    encounter?: string | string[];
  }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const query = await searchParams;
  const patient =
    typeof query.patient === "string" ? query.patient : undefined;
  const encounter =
    typeof query.encounter === "string" ? query.encounter : undefined;

  return (
    <BillingWorkspace
      initialPatientId={patient}
      initialEncounterId={encounter}
    />
  );
}
