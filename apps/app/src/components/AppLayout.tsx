"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  ChartBar,
  Gear,
  Lightbulb,
  List,
  MapPin,
  RocketLaunch,
  Sparkle,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppLayoutProps = {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: ChartBar },
  { label: "Locations", href: "/app/locations", icon: MapPin },
  { label: "Insights", href: "/app/insights", icon: Lightbulb },
  { label: "Missions", href: "/app/missions", icon: RocketLaunch },
  { label: "Settings", href: "/app/settings", icon: Gear },
]

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="px-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Workspace
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 to-accent/10 p-4">
          <p className="text-sm font-semibold">Upgrade to Premium</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Unlock detailed mission tracking and advanced optimization recommendations.
          </p>
          <Button className="mt-3 w-full" size="sm">
            <Sparkle size={16} weight="fill" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentSection = useMemo(() => {
    const active = NAV_ITEMS.find((item) => (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)))
    return active?.label ?? "Dashboard"
  }, [pathname])

  return (
    <div className="h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="text-lg font-bold tracking-tight">Nordly</span>
        </div>
        <SidebarNav pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col border-r border-border bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-base font-semibold">Nordly</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} />
              </Button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex h-full flex-col md:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <List size={18} />
            </Button>
            <p className="text-sm font-medium text-foreground">{currentSection}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
