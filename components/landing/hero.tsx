import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <div className="flex flex-col items-start gap-6">
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Find and book creatives near you
        </h1>
        <p className="text-lg text-muted-foreground">
          Photographers, videographers, editors and artists across India,
          ready to book for your next shoot.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/browse"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}
          >
            Find a creative
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
          >
            Join as a creative
          </Link>
        </div>
      </div>
    </section>
  )
}
