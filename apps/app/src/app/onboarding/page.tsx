import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/OnboardingWizard"
import { isCurrentUserAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { getOnboardingStatus } from "@/lib/auth/onboarding"
import { getActiveCountries, getActiveCurrencies } from "@/lib/data/regional.actions"

export default async function OnboardingPage() {
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

  // Check comprehensive onboarding status
  const status = await getOnboardingStatus()

  // If already complete, redirect to app
  if (status.isComplete) {
    redirect("/app")
  }

  const [countries, currencies] = await Promise.all([
    getActiveCountries(),
    getActiveCurrencies(),
  ])

  return <OnboardingWizard countries={countries} currencies={currencies} />
}
