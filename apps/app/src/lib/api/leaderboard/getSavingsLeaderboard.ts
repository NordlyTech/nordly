import { createClient } from "@/lib/supabase/server"

type RecordValue = Record<string, unknown>

export type SavingsLeaderboardEntry = {
  rank: number
  location_id: string
  location_name: string
  total_expected_savings: number
  total_completed_savings: number
  mission_count: number
  completed_missions_count: number
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

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

async function requireAuthContext(requestedCompanyId?: string | null): Promise<{ companyId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access leaderboard data.")
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membershipError) {
    throw new Error("Failed to resolve company membership.")
  }

  const companyId = asString((memberships?.[0] as RecordValue | undefined)?.company_id)

  if (!companyId) {
    throw new Error("No company membership found for this user.")
  }

  if (requestedCompanyId && requestedCompanyId !== companyId) {
    throw new Error("Invalid company scope.")
  }

  return { companyId }
}

export async function getSavingsLeaderboard(requestedCompanyId?: string | null): Promise<SavingsLeaderboardEntry[]> {
  const auth = await requireAuthContext(requestedCompanyId)
  const supabase = await createClient()

  const [locationsResult, missionsResult] = await Promise.all([
    supabase
      .from("locations")
      .select("id, name")
      .eq("company_id", auth.companyId),
    supabase
      .from("missions")
      .select("location_id, status, expected_savings_value, actual_savings_value")
      .eq("company_id", auth.companyId),
  ])

  if (locationsResult.error) {
    throw new Error(`Failed to load locations: ${locationsResult.error.message}`)
  }

  if (missionsResult.error) {
    throw new Error(`Failed to load missions: ${missionsResult.error.message}`)
  }

  const locations = (locationsResult.data ?? []) as RecordValue[]
  const missions = (missionsResult.data ?? []) as RecordValue[]

  const leaderboardMap = new Map<string, Omit<SavingsLeaderboardEntry, "rank">>()

  for (const row of locations) {
    const locationId = asString(row.id)
    if (!locationId) {
      continue
    }

    leaderboardMap.set(locationId, {
      location_id: locationId,
      location_name: asString(row.name) ?? "Untitled location",
      total_expected_savings: 0,
      total_completed_savings: 0,
      mission_count: 0,
      completed_missions_count: 0,
    })
  }

  for (const row of missions) {
    const locationId = asString(row.location_id)
    if (!locationId) {
      continue
    }

    const entry = leaderboardMap.get(locationId)
    if (!entry) {
      continue
    }

    const status = asString(row.status) ?? "open"
    entry.mission_count += 1
    entry.total_expected_savings += asNumber(row.expected_savings_value)

    if (status === "completed") {
      entry.completed_missions_count += 1
      entry.total_completed_savings += asNumber(row.actual_savings_value)
    }
  }

  return [...leaderboardMap.values()]
    .filter((entry) => entry.mission_count > 0)
    .sort((left, right) => right.total_expected_savings - left.total_expected_savings)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }))
}