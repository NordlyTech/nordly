"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { List, SignOut, X } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { NordlyMark } from "@/components/brand/NordlyMark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppShellNavItem = {
  href: string
  label: string
}

type AppShellProps = {
  navItems: AppShellNavItem[]
  onLogoutAction: (formData: FormData) => void
  children: React.ReactNode
}

function matchesPath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  return pathname.startsWith(href)
}

function SidebarNav({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: AppShellNavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = matchesPath(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({ navItems, onLogoutAction, children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageLabel = useMemo(() => {
    const current = navItems.find((item) => matchesPath(pathname, item.href))
    return current?.label ?? "Admin"
  }, [navItems, pathname])

  return (
    <div className="h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-white md:flex md:flex-col">
        <div className="flex h-24 items-center border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <NordlyMark />
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">Nordly</p>
              <p className="text-xs text-muted-foreground">Admin operations</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Navigation</p>
          <SidebarNav navItems={navItems} pathname={pathname} />
        </div>

        <div className="mt-auto border-t border-border p-3">
          <Link href="/app" className="px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
            Back to workspace
          </Link>
          <form action={onLogoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="w-full justify-start gap-2">
              <SignOut size={16} />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col border-r border-border bg-white shadow-xl">
            <div className="flex h-20 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <NordlyMark className="h-9 w-9" iconSize={20} />
                <div>
                  <p className="text-base font-semibold text-foreground">Nordly Admin</p>
                  <p className="text-xs text-muted-foreground">Operations</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} />
              </Button>
            </div>

            <div className="px-3 py-3">
              <SidebarNav navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex h-full flex-col md:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Toggle navigation"
              title="Toggle navigation"
            >
              <List size={18} />
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">{pageLabel}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Platform control center</p>
            </div>
          </div>

          <Badge className="border border-primary/25 bg-primary/10 text-primary">Admin</Badge>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7">{children}</div>
        </main>
      </div>
    </div>
  )
}
