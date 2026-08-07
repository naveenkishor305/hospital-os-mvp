import type { Metadata } from "next";

import { ConsultationWorkspace } from "@/components/consultation/consultation-workspace";

export const metadata: Metadata = {
  title: "Clinical Consultation",
};

type ConsultationPageProps = {
  searchParams: Promise<{
    appointment?: string | string[];
    handoff?: string | string[];
  }>;
};

export default async function ConsultationPage({
  searchParams,
}: ConsultationPageProps) {
  const query = await searchParams;
  const appointment =
    typeof query.appointment === "string" ? query.appointment : undefined;
  const handoff = typeof query.handoff === "string" ? query.handoff : undefined;

  return (
    <ConsultationWorkspace
      initialAppointmentId={appointment}
      handoffConfirmed={handoff === "confirmed"}
    />
  );
}
