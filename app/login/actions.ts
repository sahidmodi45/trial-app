"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { safeNext } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { socialLoginSchema } from "@/lib/validation"

// Used by both /login and /signup. Sends the user to Google/Facebook, which returns
// them to /auth/callback; the chosen role rides along so onboarding can preselect it.
export async function signInWithSocial(formData: FormData) {
  const parsed = socialLoginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect("/login?error=provider")

  const { provider, role, next } = parsed.data
  // The request's own origin, so Vercel preview URLs return to the preview, not production.
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL
  const callback = new URL("/auth/callback", origin)
  callback.searchParams.set("next", safeNext(next))
  if (role) callback.searchParams.set("role", role)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString() },
  })
  if (error || !data.url) redirect("/login?error=provider")

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
