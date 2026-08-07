import {
  Bell,
  Building2,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { SyncStatus } from "@/components/clinical/sync-status";
import { AppNavigation } from "@/components/layout/app-navigation";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { StatusBadge } from "@/components/ui/status-badge";

export type AppShellProps = {
  children: ReactNode;
  userEmail: string;
  signOutAction: () => Promise<void>;
};

function ProductIdentity({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <BrandMark size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-[-0.02em] text-ink-primary">
          nadi
        </p>
        <p className="truncate text-[10px] text-ink-tertiary">
          hospital operating system
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  userEmail,
  signOutAction,
}: AppShellProps) {
  const userInitial = userEmail.charAt(0).toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--app-sidebar)] flex-col border-r border-border-subtle bg-surface lg:flex">
        <div className="flex h-[var(--app-header)] items-center border-b border-border-subtle px-5">
          <ProductIdentity compact />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <AppNavigation />
        </div>

        <div className="border-t border-border-subtle p-4">
          <div className="rounded-lg bg-graphite p-4 text-white">
            <div className="flex items-center gap-2 text-spine-accent">
              <ShieldCheck aria-hidden="true" size={15} />
              <p className="text-[10px] font-bold uppercase tracking-[0.1em]">
                Spine foundation
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/65">
              Semantic tokens, clinical safety patterns and shared components.
            </p>
            <StatusBadge className="mt-3 border border-white/10 bg-white/10 text-white/75">
              v1.0 internal
            </StatusBadge>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-[var(--app-header)] items-center border-b border-border-subtle bg-surface/95 px-4 backdrop-blur lg:left-[var(--app-sidebar)] lg:px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:hidden">
            <details className="spine-mobile-menu relative">
              <summary
                className="spine-icon-button"
                aria-label="Open primary navigation"
              >
                <Menu aria-hidden="true" size={18} />
              </summary>
              <div className="absolute left-0 top-12 w-[min(310px,calc(100vw-28px))] rounded-xl border border-border-subtle bg-surface p-4 shadow-[var(--shadow-overlay)]">
                <ProductIdentity compact />
                <div className="my-4 border-t border-border-subtle" />
                <AppNavigation />
              </div>
            </details>
            <span className="hidden sm:block">
              <ProductIdentity compact />
            </span>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="grid size-8 place-items-center rounded-md bg-surface-subtle text-ink-secondary">
              <Building2 aria-hidden="true" size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink-primary">
                Main facility
              </p>
              <p className="text-[10px] text-ink-tertiary">
                Integrated outpatient care
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden h-9 min-w-56 items-center gap-2 rounded-md border border-border-default bg-surface px-3 text-left text-xs text-ink-secondary transition-colors hover:border-action md:flex"
              aria-label="Search patients, encounters and tasks"
            >
              <Search aria-hidden="true" size={15} />
              <span className="flex-1">Search workspace</span>
              <kbd className="spine-mono rounded border border-border-subtle bg-surface-subtle px-1.5 py-0.5 text-[9px]">
                Ctrl K
              </kbd>
            </button>

            <span className="hidden sm:inline-flex">
              <SyncStatus lastSynced="just now" />
            </span>

            <IconButton
              label="View notifications"
              icon={<Bell aria-hidden="true" size={17} />}
              className="size-9"
            />

            <div className="hidden h-8 w-px bg-border-subtle xl:block" />

            <div className="hidden items-center gap-2 xl:flex">
              <span className="grid size-8 place-items-center rounded-full bg-selected text-xs font-bold text-action">
                {userInitial}
              </span>
              <div className="max-w-40">
                <p className="truncate text-xs font-semibold text-ink-primary">
                  {userEmail}
                </p>
                <p className="text-[10px] text-ink-tertiary">
                  Staff workspace
                </p>
              </div>
            </div>

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="tertiary"
                size="sm"
                startIcon={<LogOut aria-hidden="true" size={14} />}
                aria-label="Sign out of Nadi"
              >
                <span className="hidden 2xl:inline">Sign out</span>
                <span className="2xl:hidden">Exit</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-[var(--app-header)] lg:pl-[var(--app-sidebar)]">
        {children}
      </main>
    </div>
  );
}
