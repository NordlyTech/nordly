import Link from "next/link"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/admin"

type AdminLayoutProps = {
  children: React.ReactNode
}

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/ai-generations", label: "AI Generations" },
  { href: "/admin/insights", label: "Insights Moderation" },
]

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    await requireAdminContext()
  } catch {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin</p>
          <nav className="mt-3 space-y-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Link href="/app" className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Back to workspace
            </Link>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  )
}
