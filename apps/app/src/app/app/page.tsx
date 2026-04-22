import { redirect } from "next/navigation"

import { Dashboard } from "@/components/Dashboard"
import { isCurrentUserAdmin } from "@/lib/auth/admin"
import { getDashboardData } from "@/lib/data/dashboard.actions"
import { createClient } from "@/lib/supabase/server"

export default async function AppDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  if (await isCurrentUserAdmin()) {
    redirect("/admin")
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membershipError) {
    return <Dashboard errorMessage="We couldn't load your dashboard right now. Please try again shortly." />
  }

  const membership = memberships?.[0] ?? null

  if (!membership?.company_id) {
    redirect("/onboarding")
  }

  try {
    const dashboardData = await getDashboardData(String(membership.company_id))
    return <Dashboard data={dashboardData} />
  } catch {
    return <Dashboard errorMessage="We couldn't load your dashboard right now. Please try again shortly." />
  }
}
