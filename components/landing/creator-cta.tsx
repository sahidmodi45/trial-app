import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export function CreatorCta() {
  return (
    <section className="border-t bg-muted/50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center">
        <h2 className="text-xl font-semibold">Are you a creative?</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          List your portfolio, set your starting price, and get booking requests
          from clients near you.
        </p>
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Join as a creative
        </Link>
      </div>
    </section>
  )
}
