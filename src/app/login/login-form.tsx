"use client";

import { ArrowRight } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Alert, Button, SelectField, TextField } from "@naveenkishor305/spine-ui";

import { defaultRoleId, roles, ROLE_STORAGE_KEY, type RoleId } from "@/lib/roles";

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
  const [roleId, setRoleId] = useState<RoleId>(defaultRoleId);

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  function handleSubmit() {
    // Written client-side, synchronously, before the form action navigates
    // away -- RoleProvider reads this on mount so the workspace opens
    // already scoped to the role chosen here.
    window.localStorage.setItem(ROLE_STORAGE_KEY, roleId);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-5">
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

      <SelectField
        id="role"
        label="Sign in as"
        description="Scopes the prototype to that role's screens. Switch anytime from the header."
        value={roleId}
        onChange={(event) => setRoleId(event.target.value as RoleId)}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </SelectField>

      {state.error ? <Alert tone="error" title={state.error} /> : null}

      <SubmitButton />

      <button
        type="button"
        onClick={fillDemoCredentials}
        className="w-full text-center text-xs font-semibold text-brand hover:underline"
      >
        Use demo credentials ({DEMO_EMAIL})
      </button>
    </form>
  );
}
