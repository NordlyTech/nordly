"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type InsightStatus = "new" | "accepted" | "dismissed" | "archived"
export type MissionStatus = "open" | "in_progress" | "completed" | "canceled"

type RecordValue = Record<string, unknown>

type AuthContext = {
  userId: string
  companyId: string
}

export type InsightRecord = {
  id: string
  company_id: string
  location_id: string | null
  title: string
  summary: string
  description_md: string
  category: string
  status: InsightStatus
  confidence_score: number
  estimated_savings_value: number
  estimated_savings_percent: number | null
  location_name: string | null
  location_type: string | null
  available_context: string[]
  created_at: string | null
}

export type MissionRecord = {
  id: string
  company_id: string
  location_id: string | null
  source_insight_id: string | null
  source_insight_title: string | null
  title: string
  description_md: string
  status: MissionStatus
  expected_savings_value: number
  actual_savings_value: number | null
  actual_savings_note: string | null
  actual_savings_recorded_at: string | null
  due_date: string | null
  owner: string | null
  location_name: string | null
  category: string | null
  created_at: string | null
  completed_at: string | null
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

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asString(entry))
      .filter((entry): entry is string => entry !== null)
  }

  return []
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

async function requireAuthContext(requestedCompanyId?: string | number | null): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access this data.")
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

  if (requestedCompanyId !== undefined && requestedCompanyId !== null && String(requestedCompanyId) !== companyId) {
    throw new Error("Invalid company scope.")
  }

  return {
    userId: user.id,
    companyId,
  }
}

function isMissingCompletedAtColumnError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false
  }

  const message = error.message ?? ""
  return error.code === "42703" || message.toLowerCase().includes("completed_at")
}

function getAllowedMissionTransitions(status: MissionStatus): MissionStatus[] {
  if (status === "open") {
    return ["in_progress", "canceled"]
  }

  if (status === "in_progress") {
    return ["completed", "canceled"]
  }

  if (status === "canceled") {
    return ["open"]
  }

  return []
}

function revalidateInsightAndMissionPaths() {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/insights")
  revalidatePath("/insights")
  revalidatePath("/app/missions")
  revalidatePath("/missions")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
}

async function resolveLocationInfo(locationIds: string[]) {
  if (locationIds.length === 0) {
    return new Map<string, { name: string | null; type: string | null }>()
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, location_type")
    .in("id", locationIds)

  if (error) {
    return new Map<string, { name: string | null; type: string | null }>()
  }

  const map = new Map<string, { name: string | null; type: string | null }>()

  for (const row of data ?? []) {
    const record = row as RecordValue
    const id = asString(record.id)
    if (!id) continue

    map.set(id, {
      name: asString(record.name),
      type: asString(record.location_type),
    })
  }

  return map
}

async function resolveInsightTitleMap(insightIds: string[]) {
  if (insightIds.length === 0) {
    return new Map<string, string>()
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("insights")
    .select("id, title")
    .in("id", insightIds)

  if (error) {
    return new Map<string, string>()
  }

  const map = new Map<string, string>()
  for (const row of data ?? []) {
    const record = row as RecordValue
    const id = asString(record.id)
    const title = asString(record.title)

    if (id && title) {
      map.set(id, title)
    }
  }

  return map
}

export async function getInsights(companyId?: string | number | null): Promise<InsightRecord[]> {
  const auth = await requireAuthContext(companyId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("company_id", auth.companyId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load insights: ${error.message}`)
  }

  const records = (data ?? []) as RecordValue[]
  const locationIds = [...new Set(records.map((row) => asString(row.location_id)).filter((id): id is string => id !== null))]
  const locationMap = await resolveLocationInfo(locationIds)

  return records.map((row) => {
    const locationId = asString(row.location_id)
    const location = locationId ? locationMap.get(locationId) : undefined

    return {
      id: asString(row.id) ?? "",
      company_id: asString(row.company_id) ?? auth.companyId,
      location_id: locationId,
      title: asString(row.title) ?? "Untitled insight",
      summary: asString(row.summary) ?? "",
      description_md: asString(row.description_md) ?? "",
      category: asString(row.category) ?? "General",
      status: normalizeInsightStatus(row.status),
      confidence_score: asNumber(row.confidence_score) ?? 0,
      estimated_savings_value: asNumber(row.estimated_savings_value) ?? 0,
      estimated_savings_percent: asNumber(row.estimated_savings_percent),
      location_name: asString(row.location_name) ?? location?.name ?? null,
      location_type: asString(row.location_type) ?? location?.type ?? null,
      available_context: asStringArray(row.available_context),
      created_at: asString(row.created_at),
    }
  })
}

export async function acceptInsightAsMission(insightId: string): Promise<{ missionId: string; alreadyExisted?: boolean }> {
  if (!insightId || insightId.trim().length === 0) {
    throw new Error("Could not accept this insight right now.")
  }

  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data: insightData, error: insightError } = await supabase
    .from("insights")
    .select("id, company_id, location_id, title, summary, description_md, category, estimated_savings_value, estimated_savings_percent, status")
    .eq("id", insightId)
    .eq("company_id", auth.companyId)
    .maybeSingle()

  if (insightError || !insightData) {
    throw new Error("Could not accept this insight right now.")
  }

  const insight = insightData as RecordValue
  const insightStatus = normalizeInsightStatus(insight.status)
  const sourceInsightId = asString(insight.id)
  const locationId = asString(insight.location_id)
  const title = asString(insight.title)
  const description = asString(insight.description_md) ?? asString(insight.summary) ?? ""
  const expectedSavingsValue = asNumber(insight.estimated_savings_value) ?? 0

  if (!sourceInsightId || !asString(insight.company_id)) {
    throw new Error("Could not accept this insight right now.")
  }

  if (!locationId || !title) {
    throw new Error("Could not accept this insight right now.")
  }

  if (insightStatus === "dismissed" || insightStatus === "archived") {
    throw new Error("Could not accept this insight right now.")
  }

  const { data: existingMission, error: existingMissionError } = await supabase
    .from("missions")
    .select("id")
    .eq("company_id", auth.companyId)
    .eq("source_insight_id", sourceInsightId)
    .limit(1)
    .maybeSingle()

  if (existingMissionError) {
    throw new Error("Could not accept this insight right now.")
  }

  const existingMissionId = asString((existingMission as RecordValue | null)?.id)

  if (existingMissionId) {
    if (insightStatus !== "accepted") {
      const { error: insightUpdateError } = await supabase
        .from("insights")
        .update({ status: "accepted" })
        .eq("id", sourceInsightId)
        .eq("company_id", auth.companyId)

      if (insightUpdateError) {
        throw new Error("Could not accept this insight right now.")
      }
    }

    return { missionId: existingMissionId, alreadyExisted: true }
  }

  const missionPayload: Record<string, unknown> = {
    company_id: auth.companyId,
    location_id: locationId,
    source_insight_id: sourceInsightId,
    title,
    description_md: description,
    expected_savings_value: expectedSavingsValue,
    actual_savings_value: null,
    due_date: null,
    status: "open",
  }

  const { data: missionInsert, error: insertError } = await supabase
    .from("missions")
    .insert(missionPayload)
    .select("id")
    .maybeSingle()

  if (insertError || !missionInsert) {
    throw new Error("Could not accept this insight right now.")
  }

  const insertedMissionId = asString((missionInsert as RecordValue).id)

  const { error: insightUpdateError } = await supabase
    .from("insights")
    .update({ status: "accepted" })
    .eq("id", sourceInsightId)
    .eq("company_id", auth.companyId)

  if (insightUpdateError) {
    if (insertedMissionId) {
      await supabase.from("missions").delete().eq("id", insertedMissionId).eq("company_id", auth.companyId)
    }

    throw new Error("Could not accept this insight right now.")
  }

  if (!insertedMissionId) {
    throw new Error("Could not accept this insight right now.")
  }

  return { missionId: insertedMissionId }
}

export async function dismissInsight(insightId: string): Promise<void> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from("insights")
    .update({ status: "dismissed" })
    .eq("id", insightId)
    .eq("company_id", auth.companyId)

  if (error) {
    throw new Error(`Failed to dismiss insight: ${error.message}`)
  }

  revalidateInsightAndMissionPaths()
}

export async function getMissions(companyId?: string | number | null): Promise<MissionRecord[]> {
  const auth = await requireAuthContext(companyId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("company_id", auth.companyId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load missions: ${error.message}`)
  }

  const records = (data ?? []) as RecordValue[]
  const locationIds = [...new Set(records.map((row) => asString(row.location_id)).filter((id): id is string => id !== null))]
  const sourceInsightIds = [...new Set(records.map((row) => asString(row.source_insight_id)).filter((id): id is string => id !== null))]

  const [locationMap, insightMap] = await Promise.all([
    resolveLocationInfo(locationIds),
    resolveInsightTitleMap(sourceInsightIds),
  ])

  return records.map((row) => {
    const locationId = asString(row.location_id)
    const sourceInsightId = asString(row.source_insight_id)
    const location = locationId ? locationMap.get(locationId) : undefined

    return {
      id: asString(row.id) ?? "",
      company_id: asString(row.company_id) ?? auth.companyId,
      location_id: locationId,
      source_insight_id: sourceInsightId,
      source_insight_title:
        asString(row.source_insight_title) ??
        asString(row.source_insight_name) ??
        (sourceInsightId ? insightMap.get(sourceInsightId) ?? null : null),
      title: asString(row.title) ?? "Untitled mission",
      description_md: asString(row.description_md) ?? "",
      status: normalizeMissionStatus(row.status),
      expected_savings_value: asNumber(row.expected_savings_value) ?? 0,
      actual_savings_value: asNumber(row.actual_savings_value),
      actual_savings_note: asString(row.actual_savings_note),
      actual_savings_recorded_at: asString(row.actual_savings_recorded_at),
      due_date: asString(row.due_date),
      owner: asString(row.owner) ?? asString(row.owner_name) ?? asString(row.owner_user_id),
      location_name: asString(row.location_name) ?? location?.name ?? null,
      category: asString(row.category),
      created_at: asString(row.created_at),
      completed_at: asString(row.completed_at),
    }
  })
}

export async function updateMissionStatus(missionId: string, status: MissionStatus): Promise<void> {
  if (!missionId || missionId.trim().length === 0) {
    throw new Error("Could not update mission status right now.")
  }

  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("id, company_id, location_id, status, expected_savings_value")
    .eq("id", missionId)
    .eq("company_id", auth.companyId)
    .maybeSingle()

  if (missionError || !missionData) {
    throw new Error("Could not update mission status right now.")
  }

  const mission = missionData as RecordValue
  const currentStatus = normalizeMissionStatus(mission.status)

  if (currentStatus === status) {
    return
  }

  const allowedTransitions = getAllowedMissionTransitions(currentStatus)
  if (!allowedTransitions.includes(status)) {
    throw new Error("Could not update mission status right now.")
  }

  const basePayload: Record<string, unknown> = { status }

  if (status === "completed") {
    const withCompletedAt = {
      ...basePayload,
      completed_at: new Date().toISOString(),
    }

    const { error: withCompletedAtError } = await supabase
      .from("missions")
      .update(withCompletedAt)
      .eq("id", missionId)
      .eq("company_id", auth.companyId)

    if (!withCompletedAtError) {
      return
    }

    if (!isMissingCompletedAtColumnError(withCompletedAtError)) {
      throw new Error("Could not update mission status right now.")
    }
  }

  if (status === "open") {
    const reopenPayload = {
      ...basePayload,
      completed_at: null,
    }

    const { error: reopenError } = await supabase
      .from("missions")
      .update(reopenPayload)
      .eq("id", missionId)
      .eq("company_id", auth.companyId)

    if (!reopenError) {
      return
    }

    if (!isMissingCompletedAtColumnError(reopenError)) {
      throw new Error("Could not update mission status right now.")
    }
  }

  const { error: fallbackError } = await supabase
    .from("missions")
    .update(basePayload)
    .eq("id", missionId)
    .eq("company_id", auth.companyId)

  if (fallbackError) {
    throw new Error("Could not update mission status right now.")
  }
}
