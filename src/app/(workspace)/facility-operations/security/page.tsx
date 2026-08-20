import type { Metadata } from "next";

import { SecurityWorkspace } from "@/components/facility-operations/security-workspace";

export const metadata: Metadata = {
  title: "Security & Access Control",
};

export default function SecurityPage() {
  return <SecurityWorkspace />;
}
