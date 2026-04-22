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

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  const maybeError = error as { code?: unknown; message?: unknown }
  const code = typeof maybeError.code === "string" ? maybeError.code : ""
  const message = typeof maybeError.message === "string" ? maybeError.message : ""

  return (code === "42703" || message.includes("does not exist")) && message.includes(columnName)
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

export type AdminDashboardOverview = {
  stats: {
    companiesTotal: number
    usersTotal: number
    insightsTotal: number
    pendingModerationTotal: number
    premiumCompaniesTotal: number
    failedGenerationsTotal: number
  }
  recentCompanies: Array<{
    id: string
    name: string
    country: string | null
    subscription: string | null
    createdAt: string | null
  }>
  recentGenerations: Array<{
    id: string
    companyId: string | null
    companyName: string | null
    generationType: string | null
    status: string | null
    createdAt: string | null
  }>
  moderationQueue: Array<{
    id: string
    companyId: string
    companyName: string
    title: string
    status: string
    createdAt: string | null
    estimatedSavingsValue: number
  }>
  warnings: Array<{ id: string; title: string; message: string; level: "warning" | "info" }>
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

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  await requireAdminContext()
  const supabase = createAdminClient()

  const [
    companiesResult,
    profilesResult,
    companyMembersResult,
    insightsResult,
    pendingInsightsResult,
    premiumCompaniesResult,
    failedGenerationsResult,
    recentCompaniesResult,
    recentGenerationsResult,
    moderationQueueResult,
  ] = await Promise.all([
    supabase.from("companies").select("id", { head: true, count: "exact" }),
    supabase.from("profiles").select("id", { head: true, count: "exact" }),
    supabase.from("company_members").select("user_id"),
    supabase.from("insights").select("id", { head: true, count: "exact" }),
    supabase.from("insights").select("id", { head: true, count: "exact" }).eq("status", "new"),
    supabase
      .from("companies")
      .select("id", { head: true, count: "exact" })
      .in("subscription_tier", ["premium", "enterprise"]),
    supabase
      .from("ai_generations")
      .select("id", { head: true, count: "exact" })
      .in("status", ["failed", "error"]),
    supabase
      .from("companies")
      .select("id, name, country, subscription_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("ai_generations")
      .select("id, company_id, generation_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("insights")
      .select("id, company_id, title, status, created_at, estimated_savings_value")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const companiesTotal = companiesResult.count ?? 0
  const insightsTotal = insightsResult.count ?? 0
  const pendingModerationTotal = pendingInsightsResult.count ?? 0
  const premiumCompaniesTotal = premiumCompaniesResult.count ?? 0
  const failedGenerationsTotal = failedGenerationsResult.count ?? 0

  let usersTotal = profilesResult.count ?? 0
  if (usersTotal === 0 && !companyMembersResult.error) {
    usersTotal = new Set(
      (companyMembersResult.data ?? [])
        .map((row) => asString((row as RecordValue).user_id))
        .filter((id): id is string => id !== null)
    ).size
  }

  const recentGenerationRows = (recentGenerationsResult.data ?? []) as RecordValue[]
  const moderationRows = (moderationQueueResult.data ?? []) as RecordValue[]
  const companyIds = [
    ...new Set(
      [...recentGenerationRows, ...moderationRows]
        .map((row) => asString(row.company_id))
        .filter((id): id is string => id !== null)
    ),
  ]

  const companiesMap = new Map<string, string>()
  if (companyIds.length > 0) {
    const companyLookupResult = await supabase.from("companies").select("id, name").in("id", companyIds)
    for (const row of companyLookupResult.data ?? []) {
      const id = asString((row as RecordValue).id)
      const name = asString((row as RecordValue).name)

      if (id && name) {
        companiesMap.set(id, name)
      }
    }
  }

  const warnings: Array<{ id: string; title: string; message: string; level: "warning" | "info" }> = []

  if (failedGenerationsTotal > 0) {
    warnings.push({
      id: "failed-generations",
      title: "AI generation failures detected",
      message: `${failedGenerationsTotal} generation jobs are marked as failed or error. Review logs in AI Generations.`,
      level: "warning",
    })
  }

  if (pendingModerationTotal > 20) {
    warnings.push({
      id: "moderation-backlog",
      title: "Insights moderation queue is growing",
      message: `${pendingModerationTotal} insights are waiting for moderation.`,
      level: "warning",
    })
  }

  if (warnings.length === 0) {
    warnings.push({
      id: "healthy-platform",
      title: "Platform status is healthy",
      message: "No critical warnings detected across moderation and generation pipelines.",
      level: "info",
    })
  }

  return {
    stats: {
      companiesTotal,
      usersTotal,
      insightsTotal,
      pendingModerationTotal,
      premiumCompaniesTotal,
      failedGenerationsTotal,
    },
    recentCompanies: ((recentCompaniesResult.data ?? []) as RecordValue[]).map((row) => ({
      id: asString(row.id) ?? "",
      name: asString(row.name) ?? "Untitled company",
      country: asString(row.country),
      subscription: asString(row.subscription_tier),
      createdAt: asString(row.created_at),
    })),
    recentGenerations: recentGenerationRows.map((row) => {
      const companyId = asString(row.company_id)

      return {
        id: asString(row.id) ?? "",
        companyId,
        companyName: companyId ? (companiesMap.get(companyId) ?? null) : null,
        generationType: asString(row.generation_type),
        status: asString(row.status),
        createdAt: asString(row.created_at),
      }
    }),
    moderationQueue: moderationRows.map((row) => {
      const companyId = asString(row.company_id) ?? ""

      return {
        id: asString(row.id) ?? "",
        companyId,
        companyName: companiesMap.get(companyId) ?? "Unknown company",
        title: asString(row.title) ?? "Untitled insight",
        status: asString(row.status) ?? "new",
        createdAt: asString(row.created_at),
        estimatedSavingsValue: asNumber(row.estimated_savings_value) ?? 0,
      }
    }),
    warnings,
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

export type AdminCompanyDeleteImpact = {
  companyId: string
  companyName: string
  totals: Array<{
    key: string
    label: string
    count: number
  }>
}

export async function getAdminCompanyDeleteImpact(companyId: string): Promise<AdminCompanyDeleteImpact | null> {
  await requireAdminContext()

  if (!companyId || companyId.trim().length === 0) {
    return null
  }

  const supabase = createAdminClient()
  const normalizedCompanyId = companyId.trim()

  const [companyResult, membersResult, locationsResult, insightsResult, missionsResult, generationsResult, reportsResult, savingsRecordsResult] = await Promise.all([
    supabase.from("companies").select("id, name").eq("id", normalizedCompanyId).maybeSingle(),
    supabase.from("company_members").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("locations").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("insights").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("missions").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("ai_generations").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("reports").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
    supabase.from("savings_records").select("company_id", { head: true, count: "exact" }).eq("company_id", normalizedCompanyId),
  ])

  if (companyResult.error || !companyResult.data) {
    return null
  }

  const company = companyResult.data as RecordValue

  return {
    companyId: asString(company.id) ?? normalizedCompanyId,
    companyName: asString(company.name) ?? "Untitled company",
    totals: [
      { key: "company_members", label: "Company members", count: membersResult.count ?? 0 },
      { key: "locations", label: "Locations", count: locationsResult.count ?? 0 },
      { key: "insights", label: "Insights", count: insightsResult.count ?? 0 },
      { key: "missions", label: "Missions", count: missionsResult.count ?? 0 },
      { key: "ai_generations", label: "AI generations", count: generationsResult.count ?? 0 },
      { key: "reports", label: "Reports", count: reportsResult.count ?? 0 },
      { key: "savings_records", label: "Savings records", count: savingsRecordsResult.count ?? 0 },
    ],
  }
}

export async function updateAdminCompany(args: {
  companyId: string
  name: string
  country: string
  subscription: string
}): Promise<void> {
  await requireAdminContext()

  const companyId = args.companyId.trim()
  const name = args.name.trim()
  const country = args.country.trim()
  const subscription = args.subscription.trim().toLowerCase()

  if (!companyId) {
    throw new Error("Invalid company id.")
  }

  if (!name) {
    throw new Error("Company name is required.")
  }

  if (!["free", "premium", "enterprise"].includes(subscription)) {
    throw new Error("Subscription must be free, premium, or enterprise.")
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("companies")
    .update({
      name,
      country: country.length > 0 ? country : null,
      subscription_tier: subscription,
    })
    .eq("id", companyId)

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`)
  }

  revalidateAdminPaths()
}

export async function deleteAdminCompany(companyId: string): Promise<void> {
  await requireAdminContext()

  const normalizedCompanyId = companyId.trim()
  if (!normalizedCompanyId) {
    throw new Error("Invalid company id.")
  }

  const supabase = createAdminClient()

  const deleteSteps: Array<{ table: string; column: string }> = [
    { table: "reports", column: "company_id" },
    { table: "savings_records", column: "company_id" },
    { table: "ai_generations", column: "company_id" },
    { table: "missions", column: "company_id" },
    { table: "insights", column: "company_id" },
    { table: "company_members", column: "company_id" },
    { table: "locations", column: "company_id" },
  ]

  for (const step of deleteSteps) {
    const { error } = await supabase
      .from(step.table)
      .delete()
      .eq(step.column, normalizedCompanyId)

    if (error) {
      throw new Error(`Failed to delete ${step.table}: ${error.message}`)
    }
  }

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", normalizedCompanyId)

  if (error) {
    throw new Error(`Failed to delete company: ${error.message}`)
  }

  revalidateAdminPaths()
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

  const initialResult = await supabase
    .from("ai_generations")
    .select("id, generation_type, status, model_name, input_payload_json, output_payload_json, location_id, company_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  let data = (initialResult.data ?? null) as RecordValue[] | null
  let error = initialResult.error

  if (error && isMissingColumnError(error, "location_id")) {
    const fallbackResult = await supabase
      .from("ai_generations")
      .select("id, generation_type, status, model_name, input_payload_json, output_payload_json, company_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    data = (fallbackResult.data ?? null) as RecordValue[] | null
    error = fallbackResult.error
  }

  if (error) {
    throw new Error(`Failed to load AI generation logs: ${error.message}`)
  }

  return ((data ?? []) as RecordValue[]).map((row) => ({
    id: asString(row.id) ?? "",
    generationType: asString(row.generation_type),
    status: asString(row.status),
    model: asString(row.model_name),
    inputPayload: row.input_payload_json ?? null,
    outputPayload: row.output_payload_json ?? null,
    locationId: asString(row.location_id) ?? asString((row.input_payload_json as RecordValue | null)?.location_id),
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

  const initialResult = await supabase
    .from("ai_generations")
    .select("id, location_id, generation_type, input_payload_json")
    .eq("id", generationId)
    .maybeSingle()

  let data = (initialResult.data ?? null) as RecordValue | null
  let error = initialResult.error

  if (error && isMissingColumnError(error, "location_id")) {
    const fallbackResult = await supabase
      .from("ai_generations")
      .select("id, generation_type, input_payload_json")
      .eq("id", generationId)
      .maybeSingle()

    data = (fallbackResult.data ?? null) as RecordValue | null
    error = fallbackResult.error
  }

  if (error || !data) {
    throw new Error("Generation not found.")
  }

  const row = data
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
