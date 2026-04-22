"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  CaretDown,
  ChartBar,
  Gear,
  Lifebuoy,
  Lightbulb,
  List,
  MapPin,
  PresentationChart,
  RocketLaunch,
  SignOut,
  Sparkle,
  UserCircle,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { NordlyMark } from "@/components/brand/NordlyMark"
import { UPGRADE_ROUTE } from "@/lib/routes"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type AppLayoutProps = {
  title?: string
  description?: string
  userName?: string | null
  userEmail?: string | null
  children: React.ReactNode
}

type RouteHeaderMeta = {
  title: string
  description: string
}

const ROUTE_HEADERS: Record<string, RouteHeaderMeta> = {
  "/app": {
    title: "Dashboard",
    description: "Track performance, mission progress, and savings opportunities across your portfolio.",
  },
  "/app/reports": {
    title: "Reports",
    description: "Generate, review, and export energy savings reports across your portfolio.",
  },
  "/app/settings": {
    title: "Settings",
    description: "Manage your account, security, and workspace configuration.",
  },
  "/app/locations": {
    title: "Locations",
    description: "Manage your sites and discover where the biggest savings opportunities are.",
  },
  "/app/insights": {
    title: "Insights",
    description: "AI-generated opportunities for your locations.",
  },
  "/app/missions": {
    title: "Missions",
    description: "Track accepted actions and move opportunities toward measurable savings.",
  },
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: ChartBar },
  { label: "Locations", href: "/app/locations", icon: MapPin },
  { label: "Reports", href: "/app/reports", icon: PresentationChart },
  { label: "Insights", href: "/app/insights", icon: Lightbulb },
  { label: "Missions", href: "/app/missions", icon: RocketLaunch },
]

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
      <div className={cn("px-3", collapsed && "flex flex-1 flex-col items-center px-0 pt-2")}>
        {!collapsed ? (
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Workspace
          </p>
        ) : (
          <div className="h-2" />
        )}

        <nav className={cn("space-y-1", collapsed && "mt-2 flex flex-col items-center gap-2 space-y-0")}>
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
                  collapsed ? "h-10 w-10 justify-center px-0" : "gap-3 px-3",
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
            <Button className="mt-3 w-full" size="sm" asChild>
              <Link href={UPGRADE_ROUTE}>
                <Sparkle size={16} weight="fill" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-auto p-2">
          <Link
            href={UPGRADE_ROUTE}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-gradient-to-br from-primary/10 to-accent/10 p-0"
            title="Upgrade to Premium"
          >
            <Sparkle size={18} weight="fill" className="text-primary" />
          </Link>
        </div>
      )}
    </>
  )
}

export function AppLayout({
  title,
  description,
  userName,
  userEmail,
  children,
}: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const routeHeader = ROUTE_HEADERS[pathname]
  const headerTitle = title ?? routeHeader?.title
  const headerDescription = description ?? routeHeader?.description
  const userLabel = userName?.trim() || userEmail?.trim() || "User"
  const userInitials = useMemo(() => {
    const source = userName?.trim() || userEmail?.trim() || "User"
    const fromEmail = source.includes("@") ? source.split("@")[0] : source
    const parts = fromEmail
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
  }, [userEmail, userName])

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-72"
  const contentPadding = isSidebarCollapsed ? "md:pl-16" : "md:pl-72"
  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev)
      return
    }

    setIsSidebarCollapsed((prev) => !prev)
  }

  useEffect(() => {
    setIsUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  const getFocusableMenuItems = () => {
    if (!userMenuRef.current) {
      return [] as HTMLElement[]
    }

    return Array.from(
      userMenuRef.current.querySelectorAll<HTMLElement>("[data-menu-item='true']:not([disabled])")
    )
  }

  const closeUserMenu = (restoreFocus = false) => {
    setIsUserMenuOpen(false)

    if (restoreFocus) {
      requestAnimationFrame(() => {
        userMenuTriggerRef.current?.focus()
      })
    }
  }

  const focusMenuItem = (index: number) => {
    const items = getFocusableMenuItems()
    if (items.length === 0) return

    const normalizedIndex = ((index % items.length) + items.length) % items.length
    items[normalizedIndex]?.focus()
  }

  const openUserMenu = (focusTarget?: "first" | "last") => {
    setIsUserMenuOpen(true)

    if (!focusTarget) return

    requestAnimationFrame(() => {
      const items = getFocusableMenuItems()
      if (items.length === 0) return

      if (focusTarget === "last") {
        items[items.length - 1]?.focus()
        return
      }

      items[0]?.focus()
    })
  }

  const handleUserMenuTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab" && isUserMenuOpen) {
      event.preventDefault()

      const items = getFocusableMenuItems()
      if (items.length === 0) return

      if (event.shiftKey) {
        items[items.length - 1]?.focus()
        return
      }

      items[0]?.focus()
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()

      if (isUserMenuOpen) {
        focusMenuItem(0)
      } else {
        openUserMenu("first")
      }

      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      if (isUserMenuOpen) {
        const items = getFocusableMenuItems()
        if (items.length > 0) {
          focusMenuItem(items.length - 1)
        }
      } else {
        openUserMenu("last")
      }

      return
    }

    if (event.key === "Escape" && isUserMenuOpen) {
      event.preventDefault()
      closeUserMenu(true)
    }
  }

  const handleUserMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = getFocusableMenuItems()
    if (items.length === 0) return

    const activeIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === "Escape") {
      event.preventDefault()
      closeUserMenu(true)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      focusMenuItem(activeIndex >= 0 ? activeIndex + 1 : 0)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      focusMenuItem(activeIndex >= 0 ? activeIndex - 1 : items.length - 1)
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      focusMenuItem(0)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      focusMenuItem(items.length - 1)
      return
    }

    if (event.key === "Tab") {
      const firstItem = items[0]
      const lastItem = items[items.length - 1]

      if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem?.focus()
        return
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem?.focus()
      }
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="h-screen bg-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-white transition-all duration-200 md:flex md:flex-col",
          sidebarWidth
        )}
      >
        {!isSidebarCollapsed ? (
          <div className="flex h-24 items-center justify-between border-b border-border px-4">
            <Link href="/app" className="flex items-center gap-4">
              <NordlyMark />
              <div>
                <p className="text-xl font-bold tracking-tight text-foreground">Nordly</p>
                <p className="text-sm text-muted-foreground">Energy intelligence</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="border-b border-border">
            <div className="flex justify-center py-4">
              <NordlyMark className="h-8 w-8" />
            </div>
          </div>
        )}

        <SidebarNav pathname={pathname} collapsed={isSidebarCollapsed} />
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
              title="Toggle navigation"
            >
              <List size={18} />
            </Button>

            {headerTitle || headerDescription ? (
              <div className="min-w-0">
                {headerTitle ? (
                  <p className="truncate text-sm font-semibold text-foreground sm:text-base">{headerTitle}</p>
                ) : null}
                {headerDescription ? (
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">{headerDescription}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-2 sm:ml-4 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label="Help and support"
              title="Help and support"
            >
              <Lifebuoy size={18} />
            </Button>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                ref={userMenuTriggerRef}
                className="flex h-9 items-center gap-2 rounded-full border border-border bg-white pl-1 pr-2 text-sm transition-colors hover:bg-muted"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                onClick={() => (isUserMenuOpen ? closeUserMenu() : openUserMenu())}
                onKeyDown={handleUserMenuTriggerKeyDown}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {userInitials}
                </span>
                <CaretDown size={14} className="text-muted-foreground" />
              </button>

              {isUserMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-white p-1 shadow-sm"
                  onKeyDown={handleUserMenuKeyDown}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{userLabel}</p>
                  </div>

                  <Link
                    href="/app/settings"
                    role="menuitem"
                    data-menu-item="true"
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => closeUserMenu()}
                  >
                    <Gear size={16} />
                    Settings
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    data-menu-item="true"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <SignOut size={16} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>

                  <div className="my-1 border-t border-border" />

                  <button
                    type="button"
                    role="menuitem"
                    data-menu-item="true"
                    disabled
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground"
                  >
                    <UserCircle size={16} />
                    Billing (soon)
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    data-menu-item="true"
                    disabled
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground"
                  >
                    <UserCircle size={16} />
                    Team (soon)
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 pt-6 sm:px-6">
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
