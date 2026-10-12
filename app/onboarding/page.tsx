import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { getProfile, requireUser, safeNext } from "@/lib/auth"

export const metadata: Metadata = { title: "Finish signing up" }

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { next, role } = await searchParams
  const nextPath = safeNext(next)
  const user = await requireUser("/onboarding")
  if (await getProfile(user.id)) redirect(nextPath)

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Almost there</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us a little about you{user.email ? ` (${user.email})` : ""}.
        </p>
      </div>
      <OnboardingForm
        next={nextPath}
        defaultName={user.fullName ?? ""}
        defaultRole={role === "creative" ? "creative" : role === "client" ? "client" : undefined}
      />
    </section>
  )
}
