import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SocialButtons } from "@/components/auth/social-buttons"
import { getUser, safeNext } from "@/lib/auth"
import { signInWithSocial } from "./actions"

export const metadata: Metadata = { title: "Log in" }

const ERRORS: Record<string, string> = {
  provider: "We couldn't start that login. Please try again.",
  callback: "Login didn't finish. Please try again.",
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams
  const nextPath = safeNext(next)
  if (await getUser()) redirect(nextPath)

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back to Trial App.</p>
      </div>

      {typeof error === "string" && ERRORS[error] && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {ERRORS[error]}
        </p>
      )}

      <form action={signInWithSocial}>
        <input type="hidden" name="next" value={nextPath} />
        <SocialButtons />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </section>
  )
}
