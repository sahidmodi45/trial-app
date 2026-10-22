"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, Search, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Profile sits under /dashboard, so Dashboard must not claim it too.
const tabs = [
  { label: "Home", href: "/", icon: Home, isActive: (p: string) => p === "/" },
  {
    label: "Browse",
    href: "/browse",
    icon: Search,
    isActive: (p: string) => p.startsWith("/browse") || p.startsWith("/creatives"),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (p: string) =>
      (p === "/dashboard" || p.startsWith("/dashboard/")) &&
      !p.startsWith("/dashboard/profile"),
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    isActive: (p: string) => p.startsWith("/dashboard/profile"),
  },
]

// app/layout.tsx pads the body by 4.5rem + safe area on phones, so keep the bar within h-16.
export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid h-16 grid-cols-4">
        {tabs.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
