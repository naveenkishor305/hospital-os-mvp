import type { Metadata } from "next";

import { EnvironmentalWorkspace } from "@/components/facility-operations/environmental-workspace";

export const metadata: Metadata = {
  title: "Environmental Services",
};

export default function EnvironmentalPage() {
  return <EnvironmentalWorkspace />;
}
