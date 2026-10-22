import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { signOut } from "@/app/(auth)/actions"
import { getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

// min-h-11 keeps every phone tap target at 44px; the button's own h-8 is too short.
const tap = "min-h-11"

export async function SiteHeader() {
  const user = await getUser()

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className={cn(tap, "flex items-center font-display text-lg font-bold")}
        >
          Trial App
        </Link>

        {/* Phones: Browse and Dashboard live in the bottom tab bar. */}
        <nav className="flex items-center gap-2 md:hidden">
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline" }), tap)}
              >
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), tap)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "default" }), tap)}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/browse" className={buttonVariants({ variant: "ghost" })}>
            Browse
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "outline" })}
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className={buttonVariants({ variant: "default" })}
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline" })}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "default" })}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
