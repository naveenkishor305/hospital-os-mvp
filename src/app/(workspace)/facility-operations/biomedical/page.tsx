import type { Metadata } from "next";

import { BiomedicalWorkspace } from "@/components/facility-operations/biomedical-workspace";

export const metadata: Metadata = {
  title: "Biomedical Engineering",
};

export default function BiomedicalPage() {
  return <BiomedicalWorkspace />;
}
