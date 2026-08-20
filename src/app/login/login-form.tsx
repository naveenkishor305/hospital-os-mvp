"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Alert, Button, StatusBadge, TextField } from "@naveenkishor305/spine-ui";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {
  error: null,
};

const DEMO_EMAIL = "nkishor305@gmail.com";
const DEMO_PASSWORD = "NNnn7088@";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      fullWidth
      loading={pending}
      className="spine-button--brand"
      endIcon={<ArrowRight aria-hidden="true" size={16} />}
    >
      {pending ? "Signing in securely..." : "Sign in to workspace"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setShowPassword(true);
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="rounded-2xl border border-dashed border-brand/35 bg-brand-soft/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
            Recruiter demo access
          </p>
          <StatusBadge tone="information">Prototype data</StatusBadge>
        </div>

        <dl className="spine-mono mt-3 space-y-1 text-xs text-login-ink">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-login-muted">Email</dt>
            <dd className="truncate font-semibold">{DEMO_EMAIL}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-login-muted">Password</dt>
            <dd className="truncate font-semibold">{DEMO_PASSWORD}</dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          className="mt-3"
          startIcon={<Sparkles aria-hidden="true" size={14} />}
          onClick={fillDemoCredentials}
        >
          Fill demo credentials
        </Button>
      </div>

      <TextField
        id="email"
        name="email"
        type="email"
        label="Work email"
        autoComplete="email"
        required
        autoFocus
        placeholder="name@hospital.com"
        fieldClassName="spine-field--login"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
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
        fieldClassName="spine-field--login"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
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
