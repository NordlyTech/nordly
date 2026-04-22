import { redirect } from "next/navigation"

import { AppShell } from "@/components/admin-ui/AppShell"
import { requireAdminContext } from "@/lib/auth/admin"
import { logoutAction } from "@/lib/actions/settings"

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

  return <AppShell navItems={ADMIN_NAV} onLogoutAction={logoutAction}>{children}</AppShell>
}
