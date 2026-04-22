import { createClient } from "@/lib/supabase/server"
import { getSavingsLeaderboard, type SavingsLeaderboardEntry } from "@/lib/api/leaderboard/getSavingsLeaderboard"
import { LOCATION_TYPE_LABELS, type LocationType } from "@/lib/data/locations.shared"

type RecordValue = Record<string, unknown>

type InsightStatus = "new" | "accepted" | "dismissed" | "archived"
type MissionStatus = "open" | "in_progress" | "completed" | "canceled"

export type DashboardSummary = {
  locationsCount: number
  activeInsightsCount: number
  openMissionsCount: number
  inProgressMissionsCount: number
  completedMissionsCount: number
  estimatedMonthlySavings: number
  realizedMonthlySavings: number
  estimatedYearlySavings: number
}

export type DashboardTopLocation = {
  id: string
  name: string
  location_type: LocationType
  location_type_label: string
  city: string | null
  country: string | null
  insightsCount: number
  missionsCount: number
  estimatedSavings: number
  actualSavings: number
}

export type DashboardRecentInsight = {
  id: string
  title: string
  category: string
  status: InsightStatus
  confidence_score: number
  estimated_savings_value: number
  location_id: string | null
  location_name: string | null
  created_at: string | null
}

export type DashboardActiveMission = {
  id: string
  title: string
  status: Extract<MissionStatus, "open" | "in_progress">
  expected_savings_value: number
  location_id: string | null
  location_name: string | null
  created_at: string | null
}

export type DashboardData = {
  company: {
    id: string
    name: string
    industry: string | null
    country: string | null
    subscriptionTier: string | null
  }
  summary: DashboardSummary
  topLocations: DashboardTopLocation[]
  savingsLeaderboard: SavingsLeaderboardEntry[]
  recentInsights: DashboardRecentInsight[]
  activeMissions: DashboardActiveMission[]
  isEmpty: boolean
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeInsightStatus(value: unknown): InsightStatus {
  const status = asString(value)

  if (status === "accepted" || status === "dismissed" || status === "archived") {
    return status
  }

  return "new"
}

function normalizeMissionStatus(value: unknown): MissionStatus {
  const status = asString(value)

  if (status === "in_progress" || status === "completed" || status === "canceled") {
    return status
  }

  return "open"
}

async function requireAuthContext(requestedCompanyId?: string | null): Promise<{ userId: string; companyId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access dashboard data.")
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membershipError) {
    throw new Error("Failed to resolve company membership.")
  }

  const membership = memberships?.[0] as RecordValue | undefined
  const companyId = asString(membership?.company_id)

  if (!companyId) {
    throw new Error("No company membership found for this user.")
  }

  if (requestedCompanyId && requestedCompanyId !== companyId) {
    throw new Error("Invalid company scope.")
  }

  return { userId: user.id, companyId }
}

function asLocationType(value: unknown): LocationType {
  const raw = asString(value)

  if (raw && raw in LOCATION_TYPE_LABELS) {
    return raw as LocationType
  }

  return "other"
}

export async function getDashboardData(requestedCompanyId?: string | null): Promise<DashboardData> {
  const auth = await requireAuthContext(requestedCompanyId)
  const supabase = await createClient()

  const [companyResult, locationsResult, insightsResult, missionsResult] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, industry, country, subscription_tier")
      .eq("id", auth.companyId)
      .single(),
    supabase
      .from("locations")
      .select("id, name, location_type, city, country")
      .eq("company_id", auth.companyId),
    supabase
      .from("insights")
      .select("id, title, category, status, confidence_score, estimated_savings_value, location_id, created_at")
      .eq("company_id", auth.companyId),
    supabase
      .from("missions")
      .select("id, title, status, expected_savings_value, actual_savings_value, location_id, created_at")
      .eq("company_id", auth.companyId),
  ])

  if (companyResult.error || !companyResult.data) {
    throw new Error(`Failed to load company profile: ${companyResult.error?.message ?? "Unknown error"}`)
  }

  if (locationsResult.error) {
    throw new Error(`Failed to load locations: ${locationsResult.error.message}`)
  }

  if (insightsResult.error) {
    throw new Error(`Failed to load insights: ${insightsResult.error.message}`)
  }

  if (missionsResult.error) {
    throw new Error(`Failed to load missions: ${missionsResult.error.message}`)
  }

  const company = companyResult.data as RecordValue
  const locationRows = (locationsResult.data ?? []) as RecordValue[]
  const insightRows = (insightsResult.data ?? []) as RecordValue[]
  const missionRows = (missionsResult.data ?? []) as RecordValue[]
  const savingsLeaderboard = await getSavingsLeaderboard(auth.companyId)

  const locationMap = new Map<string, { name: string; location_type: LocationType; city: string | null; country: string | null }>()

  const topLocationSeed: DashboardTopLocation[] = locationRows.map((row) => {
    const id = asString(row.id) ?? ""
    const locationType = asLocationType(row.location_type)
    const item: DashboardTopLocation = {
      id,
      name: asString(row.name) ?? "Untitled location",
      location_type: locationType,
      location_type_label: LOCATION_TYPE_LABELS[locationType],
      city: asString(row.city),
      country: asString(row.country),
      insightsCount: 0,
      missionsCount: 0,
      estimatedSavings: 0,
      actualSavings: 0,
    }

    if (id) {
      locationMap.set(id, {
        name: item.name,
        location_type: item.location_type,
        city: item.city,
        country: item.country,
      })
    }

    return item
  })

  const topLocationMap = new Map(topLocationSeed.map((item) => [item.id, item]))

  const recentInsights: DashboardRecentInsight[] = insightRows.map((row) => {
    const locationId = asString(row.location_id)
    const location = locationId ? locationMap.get(locationId) : undefined
    const status = normalizeInsightStatus(row.status)
    const estimatedSavings = asNumber(row.estimated_savings_value) ?? 0

    if (locationId) {
      const target = topLocationMap.get(locationId)
      if (target) {
        target.insightsCount += 1
        if (status === "new") {
          target.estimatedSavings += estimatedSavings
        }
      }
    }

    return {
      id: asString(row.id) ?? "",
      title: asString(row.title) ?? "Untitled insight",
      category: asString(row.category) ?? "General",
      status,
      confidence_score: asNumber(row.confidence_score) ?? 0,
      estimated_savings_value: estimatedSavings,
      location_id: locationId,
      location_name: location?.name ?? null,
      created_at: asString(row.created_at),
    }
  })

  const activeMissions: DashboardActiveMission[] = missionRows
    .flatMap((row) => {
      const locationId = asString(row.location_id)
      const location = locationId ? locationMap.get(locationId) : undefined
      const status = normalizeMissionStatus(row.status)
      const expectedSavings = asNumber(row.expected_savings_value) ?? 0
      const actualSavings = asNumber(row.actual_savings_value) ?? 0

      if (locationId) {
        const target = topLocationMap.get(locationId)
        if (target) {
          target.missionsCount += 1
          if (status === "open" || status === "in_progress" || status === "completed") {
            target.estimatedSavings += expectedSavings
          }
          if (status === "completed" && actualSavings > 0) {
            target.actualSavings += actualSavings
          }
        }
      }

      if (status !== "open" && status !== "in_progress") {
        return []
      }

      return [
        {
          id: asString(row.id) ?? "",
          title: asString(row.title) ?? "Untitled mission",
          status,
          expected_savings_value: expectedSavings,
          location_id: locationId,
          location_name: location?.name ?? null,
          created_at: asString(row.created_at),
        } satisfies DashboardActiveMission,
      ]
    })

  const summary: DashboardSummary = {
    locationsCount: topLocationSeed.length,
    activeInsightsCount: recentInsights.filter((item) => item.status === "new").length,
    openMissionsCount: missionRows.filter((row) => {
      const status = normalizeMissionStatus(row.status)
      return status === "open"
    }).length,
    inProgressMissionsCount: missionRows.filter((row) => {
      const status = normalizeMissionStatus(row.status)
      return status === "in_progress"
    }).length,
    completedMissionsCount: missionRows.filter((row) => {
      const status = normalizeMissionStatus(row.status)
      return status === "completed"
    }).length,
    estimatedMonthlySavings:
      missionRows.reduce((total, row) => {
        const status = normalizeMissionStatus(row.status)
        if (status === "open" || status === "in_progress" || status === "completed") {
          return total + (asNumber(row.expected_savings_value) ?? 0)
        }
        return total
      }, 0) +
      recentInsights.reduce((total, item) => {
        if (item.status === "new") {
          return total + item.estimated_savings_value
        }
        return total
      }, 0),
    realizedMonthlySavings: missionRows.reduce((total, row) => {
      const status = normalizeMissionStatus(row.status)
      if (status === "completed") {
        return total + (asNumber(row.actual_savings_value) ?? 0)
      }

      return total
    }, 0),
    estimatedYearlySavings: 0,
  }

  summary.estimatedYearlySavings = summary.estimatedMonthlySavings * 12

  return {
    company: {
      id: asString(company.id) ?? auth.companyId,
      name: asString(company.name) ?? "Your company",
      industry: asString(company.industry),
      country: asString(company.country),
      subscriptionTier: asString(company.subscription_tier),
    },
    summary,
    topLocations: topLocationSeed
      .sort((first, second) => second.estimatedSavings - first.estimatedSavings)
      .slice(0, 5),
    savingsLeaderboard,
    recentInsights: recentInsights
      .sort((first, second) => {
        const firstTime = first.created_at ? new Date(first.created_at).getTime() : 0
        const secondTime = second.created_at ? new Date(second.created_at).getTime() : 0
        return secondTime - firstTime
      })
      .slice(0, 5),
    activeMissions: activeMissions
      .sort((first, second) => {
        const firstTime = first.created_at ? new Date(first.created_at).getTime() : 0
        const secondTime = second.created_at ? new Date(second.created_at).getTime() : 0
        return secondTime - firstTime
      })
      .slice(0, 5),
    isEmpty: topLocationSeed.length === 0 && recentInsights.length === 0 && missionRows.length === 0,
  }
}
