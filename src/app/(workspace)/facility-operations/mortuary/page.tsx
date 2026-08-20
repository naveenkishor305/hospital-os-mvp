import type { Metadata } from "next";

import { MortuaryWorkspace } from "@/components/facility-operations/mortuary-workspace";

export const metadata: Metadata = {
  title: "Mortuary Services",
};

export default function MortuaryPage() {
  return <MortuaryWorkspace />;
}
