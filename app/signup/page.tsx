import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RolePicker } from "@/components/auth/role-picker"
import { SocialButtons } from "@/components/auth/social-buttons"
import { getUser } from "@/lib/auth"
import { signInWithSocial } from "@/app/login/actions"

export const metadata: Metadata = { title: "Sign up" }

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { as } = await searchParams
  if (await getUser()) redirect("/")

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign up in one tap with Google or Facebook.
        </p>
      </div>

      <form action={signInWithSocial} className="flex flex-col gap-6">
        <RolePicker defaultValue={as === "creative" ? "creative" : as === "client" ? "client" : undefined} />
        <SocialButtons />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </section>
  )
}
