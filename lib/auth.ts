import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type SessionUser = {
  id: string
  email?: string
  // From the social provider (Google, Facebook), used to prefill onboarding.
  fullName?: string
}

// getClaims verifies the JWT, unlike getSession, so it is safe to trust on the server.
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) return null

  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>
  const fullName = meta.full_name ?? meta.name
  return {
    id: claims.sub,
    email: claims.email,
    fullName: typeof fullName === "string" ? fullName : undefined,
  }
})

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("id, role, name, city")
    .eq("id", userId)
    .maybeSingle()
  return data
})

export async function requireUser(next = "/") {
  const user = await getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`)
  return user
}

// Signed in AND finished onboarding (picked client or creative).
export async function requireProfile(next = "/") {
  const user = await requireUser(next)
  const profile = await getProfile(user.id)
  if (!profile) redirect(`/onboarding?next=${encodeURIComponent(next)}`)
  return { user, profile }
}

// Only allow same-site relative paths, so ?next= can't send users to another site.
export function safeNext(value: unknown, fallback = "/") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback
}
