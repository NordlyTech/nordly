"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  ChartBar,
  Gear,
  Leaf,
  Lightbulb,
  List,
  MapPin,
  PresentationChart,
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
  { label: "Reports", href: "/app/reports", icon: PresentationChart },
  { label: "Insights", href: "/app/insights", icon: Lightbulb },
  { label: "Missions", href: "/app/missions", icon: RocketLaunch },
  { label: "Settings", href: "/app/settings", icon: Gear },
]

function NordlyMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-[#168bb4] text-white shadow-sm shadow-sky-950/10",
        className
      )}
      aria-hidden="true"
    >
      <Leaf size={26} weight="bold" />
    </div>
  )
}

function SidebarNav({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <>
      <div className={cn("px-3", collapsed && "px-2")}>
        {!collapsed ? (
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
        ) : (
          <div className="py-3" />
        )}

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2" : "gap-3 px-3",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {!collapsed ? (
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
      ) : (
        <div className="mt-auto p-2">
          <div
            className="flex justify-center rounded-lg border border-primary/25 bg-gradient-to-br from-primary/10 to-accent/10 p-2"
            title="Upgrade to Premium"
          >
            <Sparkle size={18} weight="fill" className="text-primary" />
          </div>
        </div>
      )}
    </>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const currentSection = useMemo(() => {
    const active = NAV_ITEMS.find((item) =>
      item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)
    )

    return active?.label ?? "Dashboard"
  }, [pathname])

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-72"
  const contentPadding = sidebarCollapsed ? "md:pl-16" : "md:pl-72"
  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev)
      return
    }

    setSidebarCollapsed((prev) => !prev)
  }

  return (
    <div className="h-screen bg-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-white transition-all duration-200 md:flex md:flex-col",
          sidebarWidth
        )}
      >
        <div
          className={cn(
            "flex h-24 items-center border-b border-border",
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {sidebarCollapsed ? (
            <NordlyMark className="h-11 w-11" />
          ) : (
            <>
              <Link href="/app" className="flex items-center gap-4">
                <NordlyMark />
                <div>
                  <p className="text-xl font-bold tracking-tight text-foreground">Nordly</p>
                  <p className="text-sm text-muted-foreground">Energy intelligence</p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Collapse sidebar">
                <List size={18} />
              </Button>
            </>
          )}
        </div>

        <SidebarNav pathname={pathname} collapsed={sidebarCollapsed} />
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
            <div className="flex h-24 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <NordlyMark className="h-11 w-11" />
                <div>
                  <p className="text-lg font-bold tracking-tight text-foreground">Nordly</p>
                  <p className="text-sm text-muted-foreground">Energy intelligence</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} />
              </Button>
            </div>

            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("flex h-full flex-col transition-all duration-200", contentPadding)}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={cn(!sidebarCollapsed && "md:hidden")}
              onClick={toggleSidebar}
              aria-label={mobileOpen ? "Close menu" : sidebarCollapsed ? "Expand sidebar" : "Open menu"}
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
