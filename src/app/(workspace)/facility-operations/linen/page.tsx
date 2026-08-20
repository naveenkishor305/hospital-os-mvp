import type { Metadata } from "next";

import { LinenWorkspace } from "@/components/facility-operations/linen-workspace";

export const metadata: Metadata = {
  title: "Linen & Laundry",
};

export default function LinenPage() {
  return <LinenWorkspace />;
}
