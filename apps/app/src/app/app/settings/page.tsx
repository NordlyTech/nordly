import { redirect } from "next/navigation"
import { SignOut } from "@phosphor-icons/react/dist/ssr"

import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SettingsProfileCard } from "@/components/settings/SettingsProfileCard"
import { SettingsSecurityCard } from "@/components/settings/SettingsSecurityCard"
import { SettingsCompanyCard } from "@/components/settings/SettingsCompanyCard"
import { SettingsPlanCard } from "@/components/settings/SettingsPlanCard"
import { logoutAction } from "@/lib/actions/settings"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Load company via membership
  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  const companyId = memberships?.[0]?.company_id ?? null

  type CompanyRow = {
    id: string
    name: string
    industry: string | null
    country: string | null
    subscription_tier: string | null
  }

  let company: CompanyRow | null = null

  if (companyId) {
    const { data } = await supabase
      .from("companies")
      .select("id, name, industry, country, subscription_tier")
      .eq("id", companyId)
      .single()

    company = data as CompanyRow | null
  }

  const fullName: string =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : ""
  const hasCompany = Boolean(company)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-end gap-4">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="gap-2 border-border/80 bg-white text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <SignOut size={16} />
            Log out
          </Button>
        </form>
      </div>

      <Card className="mb-6 rounded-2xl border border-border/80 bg-white/95 py-4 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Profile</Badge>
          <Badge variant="secondary">Security</Badge>
          {hasCompany ? <Badge variant="secondary">Company</Badge> : null}
          <Badge variant="secondary">Plan &amp; Billing</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SettingsProfileCard fullName={fullName} email={user.email ?? ""} />
          <SettingsSecurityCard />
        </div>

        <div className="space-y-6">
          {company ? (
            <SettingsCompanyCard
              companyId={company.id}
              name={company.name}
              industry={company.industry}
              country={company.country}
            />
          ) : null}

          <SettingsPlanCard subscriptionTier={company?.subscription_tier ?? null} />
        </div>
      </div>
    </div>
  )
}
