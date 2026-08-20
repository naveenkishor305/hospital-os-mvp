import type { Metadata } from "next";

import { TransportWorkspace } from "@/components/facility-operations/transport-workspace";

export const metadata: Metadata = {
  title: "Internal Transportation",
};

export default function TransportPage() {
  return <TransportWorkspace />;
}
