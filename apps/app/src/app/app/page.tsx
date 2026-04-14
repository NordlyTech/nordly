import { redirect } from "next/navigation"

import { Dashboard } from "@/components/Dashboard"
import { createClient } from "@/lib/supabase/server"

const LOCATION_TYPE_LABELS: Record<string, string> = {
  office: "Office",
  hotel: "Hotel",
  retail: "Retail",
  warehouse: "Warehouse",
  restaurant: "Restaurant",
  school: "School",
  healthcare: "Healthcare",
  industrial_light_use: "Industrial (Light Use)",
  other: "Other",
}

const BASELINE_KWH_BY_LOCATION_TYPE: Record<string, number> = {
  office: 8500,
  hotel: 18000,
  retail: 12000,
  warehouse: 6000,
  restaurant: 15000,
  school: 9500,
  healthcare: 22000,
  industrial_light_use: 16000,
  other: 10000,
}

function formatLocationType(value: string | null | undefined) {
  if (!value) return "-"
  return LOCATION_TYPE_LABELS[value] ?? value.replace(/_/g, " ")
}

function computeMonthlyKwh(locationType: string | null | undefined, floorAreaSqm: number | null | undefined) {
  const baseline = BASELINE_KWH_BY_LOCATION_TYPE[locationType ?? ""] ?? 10000

  if (floorAreaSqm && floorAreaSqm > 0) {
    const adjusted = Math.round(floorAreaSqm * 12)
    return Math.max(adjusted, 1500)
  }

  return baseline
}

function getInsightText(insight: Record<string, unknown>) {
  const textCandidates = [
    insight.summary,
    insight.text,
    insight.content,
    insight.message,
    insight.insight,
    insight.title,
  ]

  const text = textCandidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
  return typeof text === "string" ? text.trim() : null
}

export default async function AppDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .limit(1)

  const membership = memberships?.[0] ?? null

  if (!membership) {
    redirect("/onboarding")
  }

  const { data: company } = await supabase
    .from("companies")
    .select("name, industry, country, subscription_tier")
    .eq("id", membership.company_id)
    .maybeSingle()

  const { data: firstLocation } = await supabase
    .from("locations")
    .select("id, name, location_type, country, city, floor_area_sqm")
    .eq("company_id", membership.company_id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: rawInsights } = await supabase
    .from("ai_insight")
    .select("*")
    .eq("company_id", membership.company_id)
    .limit(3)

  const aiInsights = (rawInsights ?? [])
    .map((entry) => getInsightText(entry as Record<string, unknown>))
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, 3)

  const monthlyKwh = computeMonthlyKwh(firstLocation?.location_type, firstLocation?.floor_area_sqm)

  const dashboardData = {
    company: {
      name: company?.name ?? "-",
      country: company?.country ?? "-",
    },
    location: {
      name: firstLocation?.name ?? "-",
      type: formatLocationType(firstLocation?.location_type),
      area: firstLocation?.floor_area_sqm ? String(firstLocation.floor_area_sqm) : "",
    },
    energy: {
      monthlyKwh: monthlyKwh.toLocaleString(),
    },
    aiInsights,
  }

  return <Dashboard data={dashboardData} />
}
