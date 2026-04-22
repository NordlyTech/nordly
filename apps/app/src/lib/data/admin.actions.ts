"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateInsightsForLocation } from "@/lib/data/generate-insights.actions"

type RecordValue = Record<string, unknown>

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

function asBoolean(value: unknown): boolean {
  return value === true
}

function revalidateAdminPaths() {
  revalidatePath("/admin")
  revalidatePath("/admin/companies")
  revalidatePath("/admin/ai-generations")
  revalidatePath("/admin/insights")
}

export type AdminDashboardStats = {
  companiesTotal: number
  usersTotal: number
  insightsTotal: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const [companiesResult, profilesResult, companyMembersResult, insightsResult] = await Promise.all([
    supabase.from("companies").select("id", { head: true, count: "exact" }),
    supabase.from("profiles").select("id", { head: true, count: "exact" }),
    supabase.from("company_members").select("user_id"),
    supabase.from("insights").select("id", { head: true, count: "exact" }),
  ])

  const companiesTotal = companiesResult.count ?? 0
  const insightsTotal = insightsResult.count ?? 0

  let usersTotal = profilesResult.count ?? 0
  if (usersTotal === 0 && !profilesResult.error) {
    usersTotal = 0
  }

  if (usersTotal === 0 && !companyMembersResult.error) {
    usersTotal = new Set(
      (companyMembersResult.data ?? [])
        .map((row) => asString((row as RecordValue).user_id))
        .filter((id): id is string => id !== null)
    ).size
  }

  return {
    companiesTotal,
    usersTotal,
    insightsTotal,
  }
}

export type AdminCompanyListItem = {
  id: string
  name: string
  country: string | null
  subscription: string | null
  locationsCount: number
  totalEstimatedSavings: number
  impersonationUserId: string | null
  memberUserIds: string[]
}

export async function getAdminCompanies(): Promise<AdminCompanyListItem[]> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const [companiesResult, locationsResult, insightsResult, companyMembersResult] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, country, subscription_tier")
      .order("created_at", { ascending: false }),
    supabase.from("locations").select("id, company_id"),
    supabase.from("insights").select("company_id, estimated_savings_value"),
    supabase
      .from("company_members")
      .select("company_id, user_id, created_at")
      .order("created_at", { ascending: true }),
  ])

  if (companiesResult.error) {
    throw new Error(`Failed to load companies: ${companiesResult.error.message}`)
  }

  const locationsByCompany = new Map<string, number>()
  for (const row of locationsResult.data ?? []) {
    const companyId = asString((row as RecordValue).company_id)
    if (!companyId) continue

    locationsByCompany.set(companyId, (locationsByCompany.get(companyId) ?? 0) + 1)
  }

  const savingsByCompany = new Map<string, number>()
  for (const row of insightsResult.data ?? []) {
    const companyId = asString((row as RecordValue).company_id)
    if (!companyId) continue

    const value = asNumber((row as RecordValue).estimated_savings_value) ?? 0
    savingsByCompany.set(companyId, (savingsByCompany.get(companyId) ?? 0) + value)
  }

  const memberUsersByCompany = new Map<string, string[]>()
  for (const row of companyMembersResult.data ?? []) {
    const companyId = asString((row as RecordValue).company_id)
    const userId = asString((row as RecordValue).user_id)

    if (!companyId || !userId) {
      continue
    }

    const existing = memberUsersByCompany.get(companyId) ?? []
    if (!existing.includes(userId)) {
      existing.push(userId)
      memberUsersByCompany.set(companyId, existing)
    }
  }

  return ((companiesResult.data ?? []) as RecordValue[]).map((row) => {
    const id = asString(row.id) ?? ""
    const memberUserIds = memberUsersByCompany.get(id) ?? []

    return {
      id,
      name: asString(row.name) ?? "Untitled company",
      country: asString(row.country),
      subscription: asString(row.subscription_tier),
      locationsCount: locationsByCompany.get(id) ?? 0,
      totalEstimatedSavings: savingsByCompany.get(id) ?? 0,
      impersonationUserId: memberUserIds[0] ?? null,
      memberUserIds,
    }
  })
}

export type AdminCompanyLocation = {
  id: string
  name: string
  city: string | null
  country: string | null
  locationType: string | null
}

export type AdminCompanyInsight = {
  id: string
  locationId: string | null
  title: string
  status: string
  estimatedSavingsValue: number
  createdAt: string | null
}

export type AdminCompanyMission = {
  id: string
  locationId: string | null
  title: string
  status: string
  expectedSavingsValue: number
  createdAt: string | null
}

export type AdminCompanyDetail = {
  id: string
  name: string
  country: string | null
  industry: string | null
  subscription: string | null
  locations: AdminCompanyLocation[]
  insights: AdminCompanyInsight[]
  missions: AdminCompanyMission[]
}

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail | null> {
  await requireAdminContext()

  if (!companyId || companyId.trim().length === 0) {
    return null
  }

  const supabase = createAdminClient()

  const [companyResult, locationsResult, insightsResult, missionsResult] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, country, industry, subscription_tier")
      .eq("id", companyId)
      .maybeSingle(),
    supabase
      .from("locations")
      .select("id, name, city, country, location_type")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("insights")
      .select("id, location_id, title, status, estimated_savings_value, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("missions")
      .select("id, location_id, title, status, expected_savings_value, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  ])

  if (companyResult.error || !companyResult.data) {
    return null
  }

  const company = companyResult.data as RecordValue

  return {
    id: asString(company.id) ?? companyId,
    name: asString(company.name) ?? "Untitled company",
    country: asString(company.country),
    industry: asString(company.industry),
    subscription: asString(company.subscription_tier),
    locations: ((locationsResult.data ?? []) as RecordValue[]).map((row) => ({
      id: asString(row.id) ?? "",
      name: asString(row.name) ?? "Untitled location",
      city: asString(row.city),
      country: asString(row.country),
      locationType: asString(row.location_type),
    })),
    insights: ((insightsResult.data ?? []) as RecordValue[]).map((row) => ({
      id: asString(row.id) ?? "",
      locationId: asString(row.location_id),
      title: asString(row.title) ?? "Untitled insight",
      status: asString(row.status) ?? "new",
      estimatedSavingsValue: asNumber(row.estimated_savings_value) ?? 0,
      createdAt: asString(row.created_at),
    })),
    missions: ((missionsResult.data ?? []) as RecordValue[]).map((row) => ({
      id: asString(row.id) ?? "",
      locationId: asString(row.location_id),
      title: asString(row.title) ?? "Untitled mission",
      status: asString(row.status) ?? "open",
      expectedSavingsValue: asNumber(row.expected_savings_value) ?? 0,
      createdAt: asString(row.created_at),
    })),
  }
}

export type AdminGenerationRecord = {
  id: string
  generationType: string | null
  status: string | null
  model: string | null
  inputPayload: unknown
  outputPayload: unknown
  locationId: string | null
  companyId: string | null
  createdAt: string | null
}

export async function getAdminGenerations(limit = 120): Promise<AdminGenerationRecord[]> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("ai_generations")
    .select("id, generation_type, status, model_name, model, input_payload_json, output_payload_json, location_id, company_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to load AI generation logs: ${error.message}`)
  }

  return ((data ?? []) as RecordValue[]).map((row) => ({
    id: asString(row.id) ?? "",
    generationType: asString(row.generation_type),
    status: asString(row.status),
    model: asString(row.model_name) ?? asString(row.model),
    inputPayload: row.input_payload_json ?? null,
    outputPayload: row.output_payload_json ?? null,
    locationId: asString(row.location_id),
    companyId: asString(row.company_id),
    createdAt: asString(row.created_at),
  }))
}

export async function rerunAdminGeneration(generationId: string): Promise<{ summary: string; insightsCreated: number }> {
  await requireAdminContext()

  if (!generationId || generationId.trim().length === 0) {
    throw new Error("Invalid generation id.")
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("ai_generations")
    .select("id, location_id, generation_type, input_payload_json")
    .eq("id", generationId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Generation not found.")
  }

  const row = data as RecordValue
  const generationType = asString(row.generation_type)
  if (generationType && generationType !== "location_insights") {
    throw new Error("Only location insight generations can be re-run.")
  }

  const directLocationId = asString(row.location_id)
  const payload = (row.input_payload_json ?? null) as RecordValue | null
  const payloadLocationId = payload ? asString(payload.location_id) : null
  const locationId = directLocationId ?? payloadLocationId

  if (!locationId) {
    throw new Error("Generation does not include a valid location id.")
  }

  const result = await generateInsightsForLocation(locationId)
  revalidateAdminPaths()

  return {
    summary: result.summary,
    insightsCreated: result.insightsCreated,
  }
}

export async function regenerateLocationInsightsAsAdmin(locationId: string) {
  await requireAdminContext()

  if (!locationId || locationId.trim().length === 0) {
    throw new Error("Invalid location id.")
  }

  const result = await generateInsightsForLocation(locationId)
  revalidateAdminPaths()
  return result
}

export type AdminInsightRecord = {
  id: string
  companyId: string
  companyName: string
  locationId: string | null
  locationName: string | null
  title: string
  summary: string
  status: string
  estimatedSavingsValue: number
  createdAt: string | null
}

export async function getAdminInsights(limit = 200): Promise<AdminInsightRecord[]> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("insights")
    .select("id, company_id, location_id, title, summary, status, estimated_savings_value, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to load insights: ${error.message}`)
  }

  const rows = (data ?? []) as RecordValue[]
  const companyIds = [...new Set(rows.map((row) => asString(row.company_id)).filter((id): id is string => id !== null))]
  const locationIds = [...new Set(rows.map((row) => asString(row.location_id)).filter((id): id is string => id !== null))]

  const [companiesResult, locationsResult] = await Promise.all([
    companyIds.length > 0
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length > 0
      ? supabase.from("locations").select("id, name").in("id", locationIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const companyMap = new Map<string, string>()
  for (const row of companiesResult.data ?? []) {
    const item = row as RecordValue
    const id = asString(item.id)
    const name = asString(item.name)
    if (id && name) {
      companyMap.set(id, name)
    }
  }

  const locationMap = new Map<string, string>()
  for (const row of locationsResult.data ?? []) {
    const item = row as RecordValue
    const id = asString(item.id)
    const name = asString(item.name)
    if (id && name) {
      locationMap.set(id, name)
    }
  }

  return rows.map((row) => {
    const companyId = asString(row.company_id) ?? ""
    const locationId = asString(row.location_id)

    return {
      id: asString(row.id) ?? "",
      companyId,
      companyName: companyMap.get(companyId) ?? "Unknown company",
      locationId,
      locationName: locationId ? (locationMap.get(locationId) ?? null) : null,
      title: asString(row.title) ?? "Untitled insight",
      summary: asString(row.summary) ?? "",
      status: asString(row.status) ?? "new",
      estimatedSavingsValue: asNumber(row.estimated_savings_value) ?? 0,
      createdAt: asString(row.created_at),
    }
  })
}

export async function updateAdminInsight(args: {
  insightId: string
  title: string
  summary: string
  status: string
}): Promise<void> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const payload: Record<string, unknown> = {
    title: args.title.trim(),
    summary: args.summary.trim(),
    status: args.status.trim() || "new",
  }

  const { error } = await supabase
    .from("insights")
    .update(payload)
    .eq("id", args.insightId)

  if (error) {
    throw new Error(`Failed to update insight: ${error.message}`)
  }

  revalidateAdminPaths()
}

export async function deleteAdminInsight(insightId: string): Promise<void> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("insights")
    .delete()
    .eq("id", insightId)

  if (error) {
    throw new Error(`Failed to delete insight: ${error.message}`)
  }

  revalidateAdminPaths()
}

export async function acceptAdminInsightAsMission(insightId: string): Promise<{ missionId: string; alreadyExisted?: boolean }> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const { data: insightData, error: insightError } = await supabase
    .from("insights")
    .select("id, company_id, location_id, title, summary, description_md, estimated_savings_value, status")
    .eq("id", insightId)
    .maybeSingle()

  if (insightError || !insightData) {
    throw new Error("Could not accept this insight right now.")
  }

  const insight = insightData as RecordValue
  const sourceInsightId = asString(insight.id)
  const companyId = asString(insight.company_id)
  const locationId = asString(insight.location_id)
  const title = asString(insight.title)
  const description = asString(insight.description_md) ?? asString(insight.summary) ?? ""
  const expectedSavingsValue = asNumber(insight.estimated_savings_value) ?? 0
  const status = asString(insight.status)

  if (!sourceInsightId || !companyId || !locationId || !title) {
    throw new Error("Could not accept this insight right now.")
  }

  if (status === "dismissed" || status === "archived") {
    throw new Error("Could not accept this insight right now.")
  }

  const { data: existingMission, error: existingMissionError } = await supabase
    .from("missions")
    .select("id")
    .eq("company_id", companyId)
    .eq("source_insight_id", sourceInsightId)
    .limit(1)
    .maybeSingle()

  if (existingMissionError) {
    throw new Error("Could not accept this insight right now.")
  }

  const existingMissionId = asString((existingMission as RecordValue | null)?.id)
  if (existingMissionId) {
    if (status !== "accepted") {
      const { error: updateError } = await supabase
        .from("insights")
        .update({ status: "accepted" })
        .eq("id", sourceInsightId)
        .eq("company_id", companyId)

      if (updateError) {
        throw new Error("Could not accept this insight right now.")
      }
    }

    revalidateAdminPaths()
    return { missionId: existingMissionId, alreadyExisted: true }
  }

  const { data: insertedMission, error: insertError } = await supabase
    .from("missions")
    .insert({
      company_id: companyId,
      location_id: locationId,
      source_insight_id: sourceInsightId,
      title,
      description_md: description,
      expected_savings_value: expectedSavingsValue,
      status: "open",
    })
    .select("id")
    .maybeSingle()

  if (insertError || !insertedMission) {
    throw new Error("Could not accept this insight right now.")
  }

  const missionId = asString((insertedMission as RecordValue).id)
  if (!missionId) {
    throw new Error("Could not accept this insight right now.")
  }

  const { error: insightUpdateError } = await supabase
    .from("insights")
    .update({ status: "accepted" })
    .eq("id", sourceInsightId)
    .eq("company_id", companyId)

  if (insightUpdateError) {
    await supabase
      .from("missions")
      .delete()
      .eq("id", missionId)
      .eq("company_id", companyId)

    throw new Error("Could not accept this insight right now.")
  }

  revalidateAdminPaths()
  return { missionId }
}
