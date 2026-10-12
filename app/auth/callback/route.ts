import { NextResponse, type NextRequest } from "next/server"
import { getProfile, safeNext } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// The social provider sends users here with a one-time code. This has to be a route
// handler, not a page: exchanging the code sets the session cookies.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))
  const role = searchParams.get("role")

  if (!code) return NextResponse.redirect(`${origin}/login?error=callback`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=callback`)

  // First login: no profile yet, so ask client-or-creative, name and city.
  const profile = await getProfile(data.user.id)
  if (!profile) {
    const onboarding = new URL("/onboarding", origin)
    onboarding.searchParams.set("next", next)
    if (role === "client" || role === "creative") onboarding.searchParams.set("role", role)
    return NextResponse.redirect(onboarding)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
