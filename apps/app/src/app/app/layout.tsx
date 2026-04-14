import Link from "next/link"
import { Leaf } from "@phosphor-icons/react/dist/ssr"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Leaf size={16} weight="bold" className="text-primary-foreground" />
            </span>
            <span className="text-lg font-bold tracking-tight">Nordly</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-medium">
            <Link href="/app" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/app/locations" className="text-muted-foreground hover:text-primary transition-colors">
              Locations
            </Link>
            <Link href="/app/insights" className="text-muted-foreground hover:text-primary transition-colors">
              Insights
            </Link>
            <Link href="/app/settings" className="text-muted-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
