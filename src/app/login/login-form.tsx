"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="brand"
      size="lg"
      fullWidth
      loading={pending}
      endIcon={<ArrowRight aria-hidden="true" size={16} />}
    >
      {pending ? "Signing in securely..." : "Sign in to workspace"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <TextField
        id="email"
        name="email"
        type="email"
        label="Work email"
        autoComplete="email"
        required
        autoFocus
        placeholder="name@hospital.com"
        appearance="login"
      />

      <TextField
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        autoComplete="current-password"
        required
        minLength={6}
        placeholder="Enter your password"
        appearance="login"
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-pressed={showPassword}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-brand transition hover:bg-brand-soft focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      {state.error ? <Alert tone="error" title={state.error} /> : null}

      <SubmitButton />

      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-login-muted">
        <span className="h-2 w-2 rounded-full bg-login-live" />
        Encrypted staff session
      </div>
    </form>
  );
}
