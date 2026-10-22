"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";

type ActionState = { error?: string };

export async function completeOnboarding(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/onboarding");

  const parsed = onboardingSchema.safeParse({
    role: formData.get("role"),
    full_name: formData.get("full_name"),
    city: formData.get("city"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { role, full_name, city, phone } = parsed.data;
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, role, full_name, city });
  if (profileError) {
    return { error: "Something went wrong saving your details. Please try again." };
  }

  const { error: phoneError } = await supabase
    .from("contact_details")
    .insert({ user_id: user.id, phone });
  if (phoneError) {
    return { error: "Something went wrong saving your phone number. Please try again." };
  }

  // redirect() throws, so it must stay outside any try/catch.
  redirect("/dashboard");
}
