import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "Authorized staff";

  return (
    <AppShell userEmail={email} signOutAction={signOut}>
      {children}
    </AppShell>
  );
}
