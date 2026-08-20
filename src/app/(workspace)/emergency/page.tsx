import type { Metadata } from "next";

import { EmergencyWorkspace } from "@/components/emergency/emergency-workspace";

export const metadata: Metadata = {
  title: "Emergency Department",
};

export default function EmergencyPage() {
  return <EmergencyWorkspace />;
}
