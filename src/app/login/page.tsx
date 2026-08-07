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
    <main className="min-h-screen bg-login-canvas text-login-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-login-graphite px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="login-hero-grid absolute inset-0" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-cyan/20 blur-3xl" />
          <div className="absolute -bottom-40 left-10 h-[420px] w-[420px] rounded-full bg-brand/20 blur-3xl" />

          <header className="relative">
            <BrandLogo tone="inverse" size="lg" priority />
          </header>

          <div className="relative max-w-2xl py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-login-cyan-mid/20 bg-login-cyan-mid/10 px-3 py-1.5 text-xs font-semibold text-accent-cyan-light">
              <span className="h-1.5 w-1.5 rounded-full bg-login-cyan-mid" />
              Connected clinical operations
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em]">
              One clear view across every stage of care.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-ink-inverse-secondary">
              Give reception, clinical teams and billing a secure shared
              workspace for coordinated patient care.
            </p>

            <div className="mt-10 max-w-xl rounded-[24px] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold">Patient journey</p>
                  <p className="mt-1 text-xs text-white/55">
                    Coordinated across departments
                  </p>
                </div>
                <span className="rounded-full bg-login-live/15 px-2.5 py-1 text-xs font-semibold text-login-live-light">
                  Live
                </span>
              </div>

              <div className="mt-2">
                {[
                  ["01", "Patient arrival", "Identity and visit verified"],
                  ["02", "Clinical handoff", "Care context available"],
                  ["03", "Billing closure", "Services reconciled"],
                ].map(([number, title, detail], index) => (
                  <div
                    key={number}
                    className="flex items-center gap-4 border-b border-white/[0.08] py-4 last:border-0 last:pb-1"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/20 text-xs font-bold text-login-blue-light">
                      {number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs text-ink-inverse-tertiary">
                        {detail}
                      </p>
                    </div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === 0 ? "bg-login-cyan-mid" : "bg-white/25"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="relative flex items-center justify-between text-xs text-login-muted-faint">
            <span>Authorized hospital staff only</span>
            <span>Secure by design</span>
          </footer>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="absolute right-8 top-8 hidden items-center gap-2 text-xs font-medium text-login-muted sm:flex">
            <span className="h-2 w-2 rounded-full bg-login-live" />
            System online
          </div>

          <div className="w-full max-w-[430px]">
            <div className="mb-12 lg:hidden">
              <BrandLogo size="md" priority />
            </div>

            <div className="rounded-[24px] border border-login-border bg-white p-6 shadow-[var(--shadow-login)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Staff portal
              </p>
              <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.04em] text-login-ink">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-login-muted">
                Enter your authorized staff credentials to access the clinical
                workspace.
              </p>
              <LoginForm />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-ink-tertiary">
              Access is monitored and restricted to approved hospital staff.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
