"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    return {
      error: "Enter your email address and password.",
    };
  }

  const email = emailValue.trim();
  const password = passwordValue;

  if (!email || !email.includes("@") || password.length < 6) {
    return {
      error: "Enter a valid email address and password.",
    };
  }

  const supabase = await createClient();

  const { error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginError) {
    return {
      error: "Incorrect email or password.",
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, is_active")
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    await supabase.auth.signOut();

    return {
      error: "Your staff account is not active. Contact an administrator.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}