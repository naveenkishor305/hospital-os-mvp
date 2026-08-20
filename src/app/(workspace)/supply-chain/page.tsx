import type { Metadata } from "next";

import { SupplyChainWorkspace } from "@/components/supply-chain/supply-chain-workspace";

export const metadata: Metadata = {
  title: "Supply Chain & Procurement",
};

export default function SupplyChainPage() {
  return <SupplyChainWorkspace />;
}
