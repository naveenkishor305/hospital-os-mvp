import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-mark";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-login-canvas px-6 py-12 text-login-ink">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <BrandLogo size="md" priority />
        </div>

        <div className="rounded-[24px] border border-login-border bg-white p-6 shadow-[var(--shadow-login)] sm:p-8">
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-login-ink">
            Sign in to Nadi
          </h1>
          <p className="mt-2 text-sm leading-6 text-login-muted">
            Authorized hospital staff only.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-ink-tertiary">
          Access is monitored and restricted to approved hospital staff.
        </p>
      </div>
    </main>
  );
}
