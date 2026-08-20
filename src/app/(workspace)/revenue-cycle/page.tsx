import type { Metadata } from "next";

import { RevenueCycleWorkspace } from "@/components/revenue-cycle/revenue-cycle-workspace";

export const metadata: Metadata = {
  title: "Revenue Cycle Management",
};

export default function RevenueCyclePage() {
  return <RevenueCycleWorkspace />;
}
