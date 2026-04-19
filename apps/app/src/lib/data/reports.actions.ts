"use server"

import OpenAI from "openai"

import {
  buildReportUserPrompt,
  reportDeveloperPrompt,
  reportPromptVersion,
  reportSystemPrompt,
} from "@/lib/ai/report-prompt"
import { normalizeReportOutput } from "@/lib/ai/report-normalize"
import { LOCATION_TYPE_LABELS, LOCATION_TYPES, type LocationType } from "@/lib/data/locations.shared"
import { createClient } from "@/lib/supabase/server"
import {
  asNumber,
  asString,
  clamp,
  isPremiumTier,
  normalizeInlineText,
  type RecordValue,
} from "@/lib/reports/shared"
import type {
  GenerateReportInput,
  GenerateReportResult,
  ReportDetailRecord,
  ReportGenerationFormContext,
  ReportGenerationLocationOption,
  ReportListRecord,
  ReportPayload,
  StoredReportInsight,
} from "@/types/report"

type AuthContext = {
  userId: string
  companyId: string
}

type CompanyContext = {
  id: string
  name: string
  industry: string | null
  country: string | null
  subscriptionTier: string | null
}

type LocationContext = {
  id: string
  companyId: string
  name: string
  locationType: LocationType
  locationTypeLabel: string
  city: string | null
  country: string | null
  floorAreaSqm: number | null
  occupancyNotes: string | null
  operatingHoursNotes: string | null
}

type GenerationContext = {
  company: CompanyContext
  location: LocationContext
}

function isSparseContext(context: {
  city: string | null
  country: string | null
  floorAreaSqm: number | null
  occupancyNotes: string | null
  operatingHoursNotes: string | null
  monthlyEnergyCost: number | null
  monthlyEnergyKwh: number | null
  equipmentContext: string[]
}) {
  const contextSignals = [
    context.city,
    context.country,
    context.floorAreaSqm,
    context.occupancyNotes,
    context.operatingHoursNotes,
    context.monthlyEnergyCost,
    context.monthlyEnergyKwh,
    context.equipmentContext.length > 0 ? "equipment" : null,
  ].filter((value) => value !== null && value !== undefined && value !== "").length

  return contextSignals <= 3
}

function normalizeReportStatus(value: unknown): "generated" | "archived" {
  const status = asString(value)
  return status === "archived" ? "archived" : "generated"
}

function normalizeInsightStatus(value: unknown): "new" | "accepted" | "dismissed" | "archived" {
  const status = asString(value)

  if (status === "accepted" || status === "dismissed" || status === "archived") {
    return status
  }

  return "new"
}

function normalizeInsightTitleKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
}

function mapReportLocationOption(row: RecordValue): ReportGenerationLocationOption {
  return {
    id: asString(row.id) ?? "",
    name: asString(row.name) ?? "Untitled location",
    location_type: asString(row.location_type),
    city: asString(row.city),
    country: asString(row.country),
    floor_area_sqm: asNumber(row.floor_area_sqm),
    occupancy_notes: asString(row.occupancy_notes),
    operating_hours_notes: asString(row.operating_hours_notes),
  }
}

function mapStoredInsight(row: RecordValue): StoredReportInsight {
  return {
    id: asString(row.id) ?? "",
    title: asString(row.title) ?? "Untitled insight",
    summary: asString(row.summary) ?? "",
    description_md: asString(row.description_md) ?? "",
    category: (asString(row.category) as StoredReportInsight["category"]) ?? "operations",
    estimated_savings_value: asNumber(row.estimated_savings_value) ?? 0,
    estimated_savings_percent: asNumber(row.estimated_savings_percent) ?? 0,
    confidence_score: clamp(asNumber(row.confidence_score) ?? 0, 0, 1),
    effort_level: "medium",
    priority: "medium",
    mission_recommendation: "Review and convert into a mission.",
    status: normalizeInsightStatus(row.status),
  }
}

function mergeStoredInsights(payloadInsights: ReportPayload["insights"], rows: RecordValue[]) {
  const rowMap = new Map<string, RecordValue>()

  for (const row of rows) {
    const title = asString(row.title)
    if (!title) {
      continue
    }

    rowMap.set(normalizeInsightTitleKey(title), row)
  }

  return payloadInsights.map((insight, index) => {
    const matchedRow = rowMap.get(normalizeInsightTitleKey(insight.title)) ?? rows[index]
    const stored = matchedRow ? mapStoredInsight(matchedRow) : null

    return {
      id: stored?.id ?? "",
      title: insight.title,
      summary: stored?.summary ?? insight.summary,
      description_md: stored?.description_md ?? insight.description_md,
      category: stored?.category ?? insight.category,
      estimated_savings_value: stored?.estimated_savings_value ?? insight.estimated_savings_value,
      estimated_savings_percent: stored?.estimated_savings_percent ?? insight.estimated_savings_percent,
      confidence_score: stored?.confidence_score ?? insight.confidence_score,
      effort_level: insight.effort_level,
      priority: insight.priority,
      mission_recommendation: insight.mission_recommendation,
      status: stored?.status ?? "new",
    }
  })
}

async function requireAuthContext(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access reports.")
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
    throw new Error("No active company found for this user.")
  }

  return {
    userId: user.id,
    companyId,
  }
}

async function loadCompanyContext(companyId: string): Promise<CompanyContext> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, industry, country, subscription_tier")
    .eq("id", companyId)
    .single()

  if (error || !data) {
    throw new Error("Company profile not found.")
  }

  const row = data as RecordValue
  return {
    id: asString(row.id) ?? companyId,
    name: asString(row.name) ?? "Your company",
    industry: asString(row.industry),
    country: asString(row.country),
    subscriptionTier: asString(row.subscription_tier),
  }
}

async function loadLocationContext(auth: AuthContext, locationId: string): Promise<LocationContext> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("locations")
    .select("id, company_id, name, location_type, city, country, floor_area_sqm, occupancy_notes, operating_hours_notes")
    .eq("company_id", auth.companyId)
    .eq("id", locationId)
    .single()

  if (error || !data) {
    throw new Error("Location not found.")
  }

  const row = data as RecordValue
  const locationTypeRaw = asString(row.location_type)

  if (!locationTypeRaw || !LOCATION_TYPES.includes(locationTypeRaw as LocationType)) {
    throw new Error("Location type is required before generating a report.")
  }

  const locationType = locationTypeRaw as LocationType

  return {
    id: asString(row.id) ?? locationId,
    companyId: asString(row.company_id) ?? auth.companyId,
    name: asString(row.name) ?? "Location",
    locationType,
    locationTypeLabel: LOCATION_TYPE_LABELS[locationType],
    city: asString(row.city),
    country: asString(row.country),
    floorAreaSqm: asNumber(row.floor_area_sqm),
    occupancyNotes: asString(row.occupancy_notes),
    operatingHoursNotes: asString(row.operating_hours_notes),
  }
}

async function loadGenerationContext(auth: AuthContext, locationId: string): Promise<GenerationContext> {
  const [company, location] = await Promise.all([
    loadCompanyContext(auth.companyId),
    loadLocationContext(auth, locationId),
  ])

  return { company, location }
}

async function loadEquipmentContext(companyId: string, locationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("company_id", companyId)
    .eq("location_id", locationId)
    .limit(20)

  if (error || !data) {
    return []
  }

  return (data as RecordValue[])
    .map((row) => {
      const name = asString(row.name) ?? asString(row.equipment_name)
      const type = asString(row.type) ?? asString(row.equipment_type)
      const manufacturer = asString(row.manufacturer)
      const model = asString(row.model)
      const parts = [name, type, manufacturer, model].filter((value): value is string => Boolean(value))

      return parts.length > 0 ? normalizeInlineText(parts.join(" • ")) : null
    })
    .filter((entry): entry is string => entry !== null)
}

async function insertGenerationLog(args: {
  auth: AuthContext
  locationId: string
  modelName: string
  inputPayload: Record<string, unknown>
  outputPayload: Record<string, unknown>
  status: "success" | "error"
  promptSummary: string
  insightCount: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ai_generations")
    .insert({
      company_id: args.auth.companyId,
      user_id: args.auth.userId,
      location_id: args.locationId,
      generation_type: "report",
      input_payload_json: args.inputPayload,
      output_payload_json: args.outputPayload,
      prompt_version: reportPromptVersion,
      model_name: args.modelName,
      model: args.modelName,
      prompt_summary: args.promptSummary,
      insight_count: args.insightCount,
      status: args.status,
    })
    .select("id")
    .single()

  return { data: data as RecordValue | null, error }
}

function getSafeErrorMessage(stage: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error"

  if (message.includes("logged in")) {
    return "You must be logged in to generate a report."
  }

  if (message.includes("active company") || message.includes("company membership")) {
    return "Could not resolve your company context."
  }

  if (message.includes("Location type is required")) {
    return "Location type is required before generating a report."
  }

  if (message.includes("Location not found")) {
    return "Location not found."
  }

  if (message.includes("configured")) {
    return "AI report generation is not configured yet."
  }

  if (stage === "persist-report" || stage === "persist-insights") {
    return "Could not save the generated report right now."
  }

  return "Could not generate a report right now."
}

export async function getReportGenerationFormContext(): Promise<ReportGenerationFormContext> {
  const auth = await requireAuthContext()
  const supabase = await createClient()
  const company = await loadCompanyContext(auth.companyId)
  const { data, error } = await supabase
    .from("locations")
    .select("id, name, location_type, city, country, floor_area_sqm, occupancy_notes, operating_hours_notes")
    .eq("company_id", auth.companyId)
    .order("name", { ascending: true })

  if (error) {
    throw new Error("Failed to load report generation context.")
  }

  return {
    companyName: company.name,
    subscriptionTier: company.subscriptionTier,
    isPremium: isPremiumTier(company.subscriptionTier),
    locations: ((data ?? []) as RecordValue[]).map(mapReportLocationOption),
  }
}

export async function getReports(): Promise<ReportListRecord[]> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reports")
    .select("id, title, company_id, location_id, estimated_monthly_savings_value, estimated_yearly_savings_value, overall_confidence_score, status, created_at")
    .eq("company_id", auth.companyId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to load reports.")
  }

  const reportRows = (data ?? []) as RecordValue[]
  const locationIds = [...new Set(reportRows.map((row) => asString(row.location_id)).filter((value): value is string => value !== null))]

  let locationMap = new Map<string, { name: string | null; type: string | null }>()
  if (locationIds.length > 0) {
    const { data: locationsData } = await supabase
      .from("locations")
      .select("id, name, location_type")
      .in("id", locationIds)

    locationMap = new Map(
      ((locationsData ?? []) as RecordValue[])
        .map((row) => {
          const id = asString(row.id)
          if (!id) {
            return null
          }

          return [
            id,
            {
              name: asString(row.name),
              type: asString(row.location_type),
            },
          ] as const
        })
        .filter((entry): entry is readonly [string, { name: string | null; type: string | null }] => entry !== null)
    )
  }

  return reportRows.map((row) => {
    const locationId = asString(row.location_id)
    const location = locationId ? locationMap.get(locationId) : undefined

    return {
      id: asString(row.id) ?? "",
      title: asString(row.title) ?? "Generated report",
      company_id: asString(row.company_id) ?? auth.companyId,
      location_id: locationId,
      location_name: location?.name ?? null,
      location_type: location?.type ?? null,
      estimated_monthly_savings_value: asNumber(row.estimated_monthly_savings_value) ?? 0,
      estimated_yearly_savings_value: asNumber(row.estimated_yearly_savings_value) ?? 0,
      overall_confidence_score: clamp(asNumber(row.overall_confidence_score) ?? 0, 0, 1),
      status: normalizeReportStatus(row.status),
      created_at: asString(row.created_at),
    }
  })
}

export async function getReportById(reportId: string): Promise<ReportDetailRecord | null> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reports")
    .select("id, title, company_id, location_id, ai_generation_id, summary_json, report_payload_json, estimated_monthly_savings_value, estimated_yearly_savings_value, overall_confidence_score, status, created_at")
    .eq("company_id", auth.companyId)
    .eq("id", reportId)
    .maybeSingle()

  if (error) {
    throw new Error("Failed to load report details.")
  }

  if (!data) {
    return null
  }

  const row = data as RecordValue
  const company = await loadCompanyContext(auth.companyId)
  const locationId = asString(row.location_id)

  let locationName: string | null = null
  let locationType: string | null = null

  if (locationId) {
    const { data: locationData } = await supabase
      .from("locations")
      .select("name, location_type")
      .eq("company_id", auth.companyId)
      .eq("id", locationId)
      .maybeSingle()

    const locationRow = locationData as RecordValue | null
    locationName = asString(locationRow?.name)
    locationType = asString(locationRow?.location_type)
  }

  const { data: insightsData } = await supabase
    .from("insights")
    .select("id, title, summary, description_md, category, estimated_savings_value, estimated_savings_percent, confidence_score, status")
    .eq("company_id", auth.companyId)
    .eq("report_id", reportId)
    .order("created_at", { ascending: true })

  const reportPayload = row.report_payload_json as ReportPayload
  const insights = mergeStoredInsights(reportPayload.insights, (insightsData ?? []) as RecordValue[])

  return {
    id: asString(row.id) ?? reportId,
    title: asString(row.title) ?? reportPayload.summary.headline,
    company_id: asString(row.company_id) ?? auth.companyId,
    location_id: locationId,
    location_name: locationName,
    location_type: locationType,
    ai_generation_id: asString(row.ai_generation_id),
    estimated_monthly_savings_value: asNumber(row.estimated_monthly_savings_value) ?? reportPayload.summary.estimated_monthly_savings_value,
    estimated_yearly_savings_value: asNumber(row.estimated_yearly_savings_value) ?? reportPayload.summary.estimated_yearly_savings_value,
    overall_confidence_score: clamp(asNumber(row.overall_confidence_score) ?? reportPayload.summary.overall_confidence_score, 0, 1),
    status: normalizeReportStatus(row.status),
    created_at: asString(row.created_at),
    summary_json: row.summary_json as ReportDetailRecord["summary_json"],
    report_payload_json: reportPayload,
    company_name: company.name,
    company_industry: company.industry,
    company_country: company.country,
    subscription_tier: company.subscriptionTier,
    insights,
    next_steps: reportPayload.next_steps,
  }
}

export async function generateReportForLocation(input: GenerateReportInput): Promise<GenerateReportResult> {
  const locationId = input.locationId?.trim()

  if (!locationId) {
    throw new Error("Location not found.")
  }

  const auth = await requireAuthContext()
  const { company, location } = await loadGenerationContext(auth, locationId)
  const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini"
  const floorAreaSqm = input.floorAreaSqm ?? location.floorAreaSqm
  const operatingHoursNotes = input.operatingHoursNotes?.trim() || location.operatingHoursNotes
  const occupancyNotes = input.occupancyNotes?.trim() || location.occupancyNotes
  const monthlyEnergyCost = input.monthlyEnergyCost ?? null
  const monthlyEnergyKwh = input.monthlyEnergyKwh ?? null
  const rawEquipmentContext = await loadEquipmentContext(auth.companyId, location.id)
  const includeEquipmentContext = isPremiumTier(company.subscriptionTier) && rawEquipmentContext.length > 0
  const promptEquipmentContext = includeEquipmentContext ? rawEquipmentContext : []
  const sparseContext = isSparseContext({
    city: location.city,
    country: location.country,
    floorAreaSqm,
    occupancyNotes,
    operatingHoursNotes,
    monthlyEnergyCost,
    monthlyEnergyKwh,
    equipmentContext: promptEquipmentContext,
  })

  const inputPayload = {
    company_id: company.id,
    company_name: company.name,
    company_industry: company.industry,
    company_country: company.country,
    subscription_tier: company.subscriptionTier,
    location_id: location.id,
    location_name: location.name,
    location_type: location.locationType,
    location_type_label: location.locationTypeLabel,
    city: location.city,
    location_country: location.country,
    floor_area_sqm: floorAreaSqm,
    occupancy_notes: occupancyNotes,
    operating_hours_notes: operatingHoursNotes,
    monthly_energy_cost: monthlyEnergyCost,
    monthly_energy_kwh: monthlyEnergyKwh,
    equipment_available: rawEquipmentContext.length > 0,
    equipment_context_included: includeEquipmentContext,
    equipment_list: promptEquipmentContext,
    sparse_context: sparseContext,
  }

  let generationId: string | null = null
  let reportId: string | null = null
  let rawContent = ""
  let currentStage = "validate-environment"

  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("AI generation is not configured yet.")
    }

    currentStage = "openai-request"
    const openai = new OpenAI({ apiKey, timeout: 45_000 })
    const completion = await openai.chat.completions.create({
      model: modelName,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: reportSystemPrompt },
        { role: "developer", content: reportDeveloperPrompt },
        {
          role: "user",
          content: buildReportUserPrompt({
            companyName: company.name,
            companyIndustry: company.industry,
            companyCountry: company.country,
            subscriptionTier: company.subscriptionTier,
            locationName: location.name,
            locationType: location.locationTypeLabel,
            locationCity: location.city,
            locationCountry: location.country,
            floorAreaSqm,
            occupancyNotes,
            operatingHoursNotes,
            monthlyEnergyCost,
            monthlyEnergyKwh,
            equipmentContext: promptEquipmentContext,
            includeEquipmentContext,
          }),
        },
      ],
    })

    rawContent = completion.choices[0]?.message?.content ?? ""

    currentStage = "validate-response"
    const reportPayload = normalizeReportOutput(rawContent, {
      companyName: company.name,
      companyIndustry: company.industry,
      locationName: location.name,
      locationType: location.locationTypeLabel,
      locationCountry: location.country,
      locationCity: location.city,
      floorAreaSqm,
      operatingHoursNotes,
      occupancyNotes,
      knownEnergyCost: monthlyEnergyCost,
      knownEnergyKwh: monthlyEnergyKwh,
      equipmentContext: promptEquipmentContext,
      sparseContext,
    })

    currentStage = "persist-generation"
    const generationInsert = await insertGenerationLog({
      auth,
      locationId: location.id,
      modelName,
      inputPayload,
      outputPayload: reportPayload,
      status: "success",
      promptSummary: reportPayload.summary.executive_summary.slice(0, 280),
      insightCount: reportPayload.insights.length,
    })

    if (generationInsert.error || !generationInsert.data) {
      console.error("[report.generate] Failed to insert ai_generations success row — continuing without generation log", {
        companyId: auth.companyId,
        locationId: location.id,
        error: generationInsert.error,
      })
    } else {
      generationId = asString(generationInsert.data.id) ?? null
    }

    currentStage = "persist-report"
    const supabase = await createClient()
    const reportTitle = normalizeInlineText(reportPayload.summary.headline || `${location.name} executive savings report`)

    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert({
        company_id: auth.companyId,
        location_id: location.id,
        ai_generation_id: generationId,
        title: reportTitle,
        summary_json: reportPayload.summary,
        report_payload_json: reportPayload,
        estimated_monthly_savings_value: reportPayload.summary.estimated_monthly_savings_value,
        estimated_yearly_savings_value: reportPayload.summary.estimated_yearly_savings_value,
        overall_confidence_score: reportPayload.summary.overall_confidence_score,
        status: "generated",
        created_by: auth.userId,
      })
      .select("id")
      .single()

    if (reportError || !reportData) {
      console.error("[report.generate] Failed to insert report row", {
        companyId: auth.companyId,
        locationId: location.id,
        generationId,
        error: reportError,
      })
      throw new Error("Failed to save report.")
    }

    reportId = asString((reportData as RecordValue).id)
    if (!reportId) {
      throw new Error("Failed to save report.")
    }

    currentStage = "persist-insights"
    const insightRows = reportPayload.insights.map((insight) => ({
      company_id: auth.companyId,
      location_id: location.id,
      report_id: reportId,
      ai_generation_id: generationId,
      source_type: "report_generation",
      title: insight.title,
      summary: insight.summary,
      description_md: insight.description_md,
      category: insight.category,
      confidence_score: insight.confidence_score,
      estimated_savings_value: insight.estimated_savings_value,
      estimated_savings_percent: insight.estimated_savings_percent,
      status: "new",
    }))

    const { data: insertedInsights, error: insightsError } = await supabase
      .from("insights")
      .insert(insightRows)
      .select("id, title, summary, description_md, category, estimated_savings_value, estimated_savings_percent, confidence_score, status")

    if (insightsError) {
      console.error("[report.generate] Failed to insert report insights", {
        companyId: auth.companyId,
        locationId: location.id,
        reportId,
        generationId,
        error: insightsError,
      })

      await supabase.from("reports").delete().eq("id", reportId).eq("company_id", auth.companyId)
      if (generationId) {
        await supabase
          .from("ai_generations")
          .update({
            status: "error",
            output_payload_json: {
              error: "Report insights insert failed.",
              stage: currentStage,
            },
          })
          .eq("id", generationId)
      }

      throw new Error("Failed to save generated insights.")
    }

    return {
      reportId,
      generationId,
      title: reportTitle,
      summary: reportPayload.summary,
      insights: mergeStoredInsights(reportPayload.insights, (insertedInsights ?? []) as RecordValue[]),
    }
  } catch (error) {
    const safeMessage = getSafeErrorMessage(currentStage, error)
    const internalMessage = error instanceof Error ? error.message : "Unknown error"

    console.error("[report.generate] Generation failed", {
      companyId: auth.companyId,
      locationId,
      stage: currentStage,
      reportId,
      generationId,
      modelName,
      error: internalMessage,
      rawPreview: rawContent ? rawContent.slice(0, 1200) : null,
    })

    if (!generationId) {
      const generationInsert = await insertGenerationLog({
        auth,
        locationId,
        modelName,
        inputPayload,
        outputPayload: {
          error: safeMessage,
          diagnostic_message: internalMessage,
          stage: currentStage,
          raw_response_preview: rawContent ? rawContent.slice(0, 1200) : null,
        },
        status: "error",
        promptSummary: safeMessage,
        insightCount: 0,
      })

      if (generationInsert.error) {
        console.error("[report.generate] Failed to insert ai_generations error row", {
          companyId: auth.companyId,
          locationId,
          stage: currentStage,
          error: generationInsert.error,
        })
      }
    }

    throw new Error(safeMessage)
  }
}