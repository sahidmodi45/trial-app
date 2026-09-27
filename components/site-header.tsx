import Link from "next/link"
import { Menu } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          Trial App
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link href="/browse" className={buttonVariants({ variant: "ghost" })}>
            Browse
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "default" })}>
            Sign up
          </Link>
        </nav>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="sm:hidden"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 p-4">
              <Link
                href="/browse"
                className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}
              >
                Browse
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "default" }), "justify-start")}
              >
                Sign up
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
