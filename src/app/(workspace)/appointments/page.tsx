import type { Metadata } from "next";

import { AppointmentQueueWorkspace } from "@/components/appointments/appointment-queue-workspace";

export const metadata: Metadata = {
  title: "Appointment Calendar",
};

type AppointmentPageProps = {
  searchParams: Promise<{ patient?: string | string[] }>;
};

export default async function AppointmentPage({
  searchParams,
}: AppointmentPageProps) {
  const patient = (await searchParams).patient;
  const initialPatientId = typeof patient === "string" ? patient : undefined;

  return <AppointmentQueueWorkspace initialPatientId={initialPatientId} />;
}
