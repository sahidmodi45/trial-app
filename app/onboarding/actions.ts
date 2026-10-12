"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"
import { requireUser, safeNext } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { onboardingSchema } from "@/lib/validation"

export type OnboardingState = { error?: string; fieldErrors?: Record<string, string[]> }

export async function createProfile(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser("/onboarding")
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }

  const { role, name, city, next } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").insert({ id: user.id, role, name, city })
  // 23505 = profile already exists (double submit); carry on as if it worked.
  if (error && error.code !== "23505") {
    return { error: "We couldn't save your profile. Please try again." }
  }

  revalidatePath("/", "layout")
  redirect(safeNext(next))
}
