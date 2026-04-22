import type { User } from "@supabase/supabase-js"

type DemoCompanyConfig = {
  id: string
  name: string
  industry: string
  country: string
  subscription_tier: string
}

const DEMO_COMPANY_MAP: Record<string, DemoCompanyConfig> = {
  "demo-retail@nordly.app": {
    id: "10000000-0000-0000-0000-000000000001",
    name: "Stockholm Retail Group",
    industry: "retail",
    country: "Sweden",
    subscription_tier: "free",
  },
  "demo-hotel@nordly.app": {
    id: "10000000-0000-0000-0000-000000000002",
    name: "Aurora Stay Stockholm",
    industry: "hospitality",
    country: "Sweden",
    subscription_tier: "premium",
  },
  "demo-office@nordly.app": {
    id: "10000000-0000-0000-0000-000000000003",
    name: "NorthPeak Offices Stockholm",
    industry: "office",
    country: "Sweden",
    subscription_tier: "premium",
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ensureDemoUserLinked(supabase: any, user: User): Promise<void> {
  const email = user.email ?? ""
  const company = DEMO_COMPANY_MAP[email]

  if (!company) return

  // Check if already linked — avoid duplicate inserts.
  const { data: existing } = await supabase
    .from("company_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (existing) return

  // Ensure the company row exists before inserting the membership.
  // If it was already seeded by another user, do nothing on conflict.
  const { error: companyError } = await supabase.from("companies").insert({
    id: company.id,
    name: company.name,
    industry: company.industry,
    country: company.country,
    subscription_tier: company.subscription_tier,
    created_by: user.id,
    created_at: new Date().toISOString(),
  }).select("id").maybeSingle()

  // Ignore unique-violation errors (company already exists from seed).
  if (companyError && companyError.code !== "23505") {
    console.error("[ensureDemoUserLinked] company upsert error", companyError)
  }

  // Insert the membership row.
  const { error: memberError } = await supabase.from("company_members").insert({
    user_id: user.id,
    company_id: company.id,
    role: "admin",
  })

  if (memberError) {
    console.error("[ensureDemoUserLinked] membership insert error", memberError)
  }
}
