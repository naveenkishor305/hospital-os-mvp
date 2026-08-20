import type { Metadata } from "next";

import { EnterpriseWorkspace } from "@/components/enterprise/enterprise-workspace";

export const metadata: Metadata = {
  title: "Enterprise & Analytics",
};

export default function EnterprisePage() {
  return <EnterpriseWorkspace />;
}
