"use client";

import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/cn";

const BOOT_STEPS = [
  "Establishing secure channel",
  "Verifying staff directory",
  "Loading clinical safety patterns",
  "Preparing OPD command centre",
] as const;

const STORAGE_KEY = "nadi:boot-complete";
const STEP_DURATION_MS = 380;
const HOLD_DURATION_MS = 300;
const FADE_DURATION_MS = 420;

export function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let alreadyBooted = false;

    try {
      alreadyBooted = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      alreadyBooted = false;
    }

    if (alreadyBooted) {
      return;
    }

    const markBooted = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Storage unavailable (private browsing, etc.) — safe to ignore.
      }
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      markBooted();
      return;
    }

    const beginBoot = () => setVisible(true);
    const advanceStep = (index: number) => setStepIndex(index);
    const beginFadeOut = () => setFading(true);
    const completeBoot = () => {
      setVisible(false);
      markBooted();
    };

    beginBoot();

    const timers: number[] = [];

    BOOT_STEPS.forEach((_, index) => {
      timers.push(
        window.setTimeout(
          () => advanceStep(index),
          index * STEP_DURATION_MS,
        ),
      );
    });

    const totalStepsMs = BOOT_STEPS.length * STEP_DURATION_MS;

    timers.push(
      window.setTimeout(beginFadeOut, totalStepsMs + HOLD_DURATION_MS),
    );

    timers.push(
      window.setTimeout(
        completeBoot,
        totalStepsMs + HOLD_DURATION_MS + FADE_DURATION_MS,
      ),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "login-hero-grid fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8 bg-login-graphite text-white transition-opacity duration-[420ms] ease-out",
        fading ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="relative grid place-items-center">
        <span className="absolute size-20 animate-ping rounded-full bg-accent-cyan/15" />
        <span className="absolute size-20 rounded-full bg-accent-cyan/10 blur-xl" />
        <BrandMark size="md" className="relative" />
      </div>

      <div className="text-center">
        <p className="spine-mono text-[11px] font-bold uppercase tracking-[0.32em] text-accent-cyan-light">
          nadi
        </p>
        <p className="mt-1 text-xs text-white/50">
          hospital operating system
        </p>
      </div>

      <div className="w-64">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-login-cyan-mid to-login-blue-light transition-[width] duration-300 ease-out"
            style={{
              width: `${((stepIndex + 1) / BOOT_STEPS.length) * 100}%`,
            }}
          />
        </div>
        <p className="spine-mono mt-3 text-center text-[11px] text-white/60">
          {BOOT_STEPS[stepIndex]}…
        </p>
      </div>
    </div>
  );
}
