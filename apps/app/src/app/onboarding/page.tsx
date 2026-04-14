import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/OnboardingWizard"
import { createClient } from "@/lib/supabase/server"

type OnboardingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = await createClient()

  const params = (await searchParams) ?? {}
  const registrationSuccess = params.registered === "1"

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: memberships } = await supabase
    .from("company_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)

  const membership = memberships?.[0] ?? null

  if (membership) {
    redirect("/app")
  }

  return <OnboardingWizard showRegistrationSuccess={registrationSuccess} />
}
