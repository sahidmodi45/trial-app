"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/lib/validation";

type ActionState = { error?: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function signUp(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "That email is already registered. Try logging in instead." };
    }
    return { error: GENERIC_ERROR };
  }

  // redirect() throws, so it must stay outside any try/catch.
  redirect("/onboarding");
}

export async function signIn(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "Wrong email or password" };
    }
    return { error: GENERIC_ERROR };
  }

  redirect(safeNext(formData.get("next")?.toString()));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
