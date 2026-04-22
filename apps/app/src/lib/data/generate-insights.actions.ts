"use server"

import OpenAI from "openai"

import { buildUserPrompt, developerPrompt, promptVersion, systemPrompt } from "@/lib/ai/prompts/generateInsightsPrompt"
import { insightGenerationSchema, type GeneratedInsight, type InsightGenerationOutput } from "@/lib/ai/schemas/insightGeneration"
import { LOCATION_TYPE_LABELS, LOCATION_TYPES, type LocationType } from "@/lib/data/locations.shared"
import { createClient } from "@/lib/supabase/server"

type RecordValue = Record<string, unknown>

type AuthContext = {
  userId: string
  companyId: string | null
  isAdmin: boolean
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
  monthlyEnergyKwh: number | null
  monthlyEnergyCost: number | null
}

type NormalizedGeneratedInsight = GeneratedInsight

function toLoggableDbError(error: unknown) {
  if (!error || typeof error !== "object") {
    return error ?? null
  }

  const candidate = error as Record<string, unknown>
  return {
    message: typeof candidate.message === "string" ? candidate.message : null,
    details: typeof candidate.details === "string" ? candidate.details : null,
    hint: typeof candidate.hint === "string" ? candidate.hint : null,
    code: typeof candidate.code === "string" ? candidate.code : null,
  }
}

export type GenerateInsightsResult = {
  generationId: string
  summary: string
  insightsCreated: number
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

function normalizeInlineText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function normalizeMarkdownText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim()
}

function normalizeBasisItems(items: string[]) {
  const normalized = items
    .map((item) => normalizeInlineText(item))
    .filter((item) => item.length > 0)

  const deduped: string[] = []
  for (const item of normalized) {
    if (!deduped.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      deduped.push(item)
    }
  }

  return deduped.slice(0, 4)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function normalizeTitleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
}

function titleSimilarity(first: string, second: string) {
  const left = new Set(normalizeTitleKey(first).split(" ").filter(Boolean))
  const right = new Set(normalizeTitleKey(second).split(" ").filter(Boolean))

  if (left.size === 0 || right.size === 0) {
    return 0
  }

  let overlap = 0
  for (const token of left) {
    if (right.has(token)) {
      overlap += 1
    }
  }

  return overlap / new Set([...left, ...right]).size
}

function areNearDuplicate(first: NormalizedGeneratedInsight, second: NormalizedGeneratedInsight) {
  if (first.category !== second.category) {
    return false
  }

  const left = normalizeTitleKey(first.title)
  const right = normalizeTitleKey(second.title)

  return left === right || left.includes(right) || right.includes(left) || titleSimilarity(first.title, second.title) >= 0.75
}

function isSparseContext(location: LocationContext) {
  const contextSignals = [
    location.city,
    location.country,
    location.floorAreaSqm,
    location.occupancyNotes,
    location.operatingHoursNotes,
  ].filter((value) => value !== null && value !== undefined && value !== "").length

  return contextSignals <= 2
}

function normalizeInsights(insights: InsightGenerationOutput["insights"], sparseContext: boolean) {
  const normalized: NormalizedGeneratedInsight[] = insights.map((insight) => {
    const estimatedSavingsValue = Math.max(0, Math.round(insight.estimated_savings_value))
    const estimatedSavingsPercent = clamp(roundTo(insight.estimated_savings_percent, 1), 0, 100)
    const sparseSafePercent = sparseContext ? Math.min(estimatedSavingsPercent, 25) : estimatedSavingsPercent
    const confidenceScore = clamp(roundTo(insight.confidence_score, 2), 0.1, 0.9)
    const sparseSafeConfidence = sparseContext ? Math.min(confidenceScore, 0.55) : confidenceScore
    const estimationBasis = normalizeBasisItems(insight.estimation_basis)

    if (estimationBasis.length < 2) {
      throw new Error("AI returned insufficient estimation basis detail.")
    }

    return {
      title: normalizeInlineText(insight.title),
      summary: normalizeInlineText(insight.summary),
      description_md: normalizeMarkdownText(insight.description_md),
      category: insight.category,
      estimated_savings_value: estimatedSavingsValue,
      estimated_savings_percent: sparseSafePercent,
      confidence_score: sparseSafeConfidence,
      estimation_basis: estimationBasis,
      rationale: normalizeInlineText(insight.rationale),
    }
  })

  const deduped: NormalizedGeneratedInsight[] = []
  for (const insight of normalized) {
    const duplicate = deduped.find((candidate) => areNearDuplicate(candidate, insight))
    if (!duplicate) {
      deduped.push(insight)
    }
  }

  const capped = deduped.slice(0, 5)
  if (capped.length < 3) {
    throw new Error("AI returned too few distinct insights.")
  }

  return capped
}

function parseAiResponse(rawContent: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawContent)
  } catch {
    throw new Error("AI returned an invalid JSON response.")
  }

  const result = insightGenerationSchema.safeParse(parsed)
  if (!result.success) {
    console.error("[ai.generate] Invalid AI response payload", {
      issues: result.error.issues,
      rawPreview: rawContent.slice(0, 1500),
    })
    throw new Error("AI returned an invalid response format.")
  }

  return result.data
}

function getSafeErrorMessage(stage: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error"

  if (message.includes("logged in")) {
    return "You must be logged in to generate insights."
  }

  if (message.includes("company membership")) {
    return "Could not resolve your company context."
  }

  if (message.includes("Location type is required before generating insights.")) {
    return "Location type is required before generating insights."
  }

  if (message.includes("Location not found")) {
    return "Location not found."
  }

  if (message.includes("AI generation is not configured yet.")) {
    return "AI generation is not configured yet."
  }

  if (stage === "persist-insights" || stage === "persist-generation") {
    return "Could not save generated insights right now."
  }

  return "Could not generate insights right now."
}

async function requireAuthContext(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to generate insights.")
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  const isAdmin = !profileError && profileData ? profileData.is_admin === true : false

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
    if (isAdmin) {
      return { userId: user.id, companyId: null, isAdmin: true }
    }

    throw new Error("No company membership found for this user.")
  }

  return { userId: user.id, companyId, isAdmin }
}

async function loadGenerationContext(auth: AuthContext, locationId: string) {
  const supabase = await createClient()

  let locationQuery = supabase
    .from("locations")
    .select("id, company_id, name, location_type, city, country, floor_area_sqm, occupancy_notes, operating_hours_notes, monthly_energy_kwh, monthly_energy_cost")
    .eq("id", locationId)

  if (!auth.isAdmin && auth.companyId) {
    locationQuery = locationQuery.eq("company_id", auth.companyId)
  }

  const { data: locationData, error: locationError } = await locationQuery.single()

  if (locationError || !locationData) {
    throw new Error("Location not found.")
  }

  const locationRow = locationData as RecordValue
  const locationTypeRaw = asString(locationRow.location_type)

  if (!locationTypeRaw || !LOCATION_TYPES.includes(locationTypeRaw as LocationType)) {
    throw new Error("Location type is required before generating insights.")
  }

  const locationType = locationTypeRaw as LocationType
  const locationTypeLabel = LOCATION_TYPE_LABELS[locationType] ?? locationTypeRaw

  const location: LocationContext = {
    id: asString(locationRow.id) ?? locationId,
    companyId: asString(locationRow.company_id) ?? auth.companyId ?? "",
    name: asString(locationRow.name) ?? "Location",
    locationType,
    locationTypeLabel,
    city: asString(locationRow.city),
    country: asString(locationRow.country),
    floorAreaSqm: asNumber(locationRow.floor_area_sqm),
    occupancyNotes: asString(locationRow.occupancy_notes),
    operatingHoursNotes: asString(locationRow.operating_hours_notes),
    monthlyEnergyKwh: asNumber(locationRow.monthly_energy_kwh),
    monthlyEnergyCost: asNumber(locationRow.monthly_energy_cost),
  }

  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("id, name, industry, country, subscription_tier")
    .eq("id", location.companyId)
    .single()

  if (companyError || !companyData) {
    throw new Error("Company profile not found.")
  }

  const companyRow = companyData as RecordValue
  const company: CompanyContext = {
    id: asString(companyRow.id) ?? location.companyId,
    name: asString(companyRow.name) ?? "Your company",
    industry: asString(companyRow.industry),
    country: asString(companyRow.country),
    subscriptionTier: asString(companyRow.subscription_tier),
  }

  return { company, location }
}

async function insertGenerationLog(args: {
  companyId: string
  userId: string
  locationId: string
  inputPayload: Record<string, unknown>
  modelName: string
  outputPayload: Record<string, unknown>
  status: "success" | "error"
  promptSummary?: string
  insightCount?: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ai_generations")
    .insert({
      company_id: args.companyId,
      user_id: args.userId,
      location_id: args.locationId,
      generation_type: "location_insights",
      input_payload_json: args.inputPayload,
      prompt_version: promptVersion,
      model_name: args.modelName,
      model: args.modelName,
      prompt_summary: args.promptSummary ?? null,
      insight_count: args.insightCount ?? 0,
      output_payload_json: args.outputPayload,
      status: args.status,
    })
    .select("id")
    .single()

  return { data: data as RecordValue | null, error }
}

export async function generateInsightsForLocation(locationId: string): Promise<GenerateInsightsResult> {
  if (!locationId || typeof locationId !== "string" || locationId.trim() === "") {
    throw new Error("Location not found.")
  }

  const auth = await requireAuthContext()
  const { company, location } = await loadGenerationContext(auth, locationId.trim())
  const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini"
  const sparseContext = isSparseContext(location)

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
    floor_area_sqm: location.floorAreaSqm,
    occupancy_notes: location.occupancyNotes,
    operating_hours_notes: location.operatingHoursNotes,
    monthly_energy_kwh: location.monthlyEnergyKwh,
    monthly_energy_cost: location.monthlyEnergyCost,
    currency: null,
    additional_notes: null,
    equipment_list: [],
    sparse_context: sparseContext,
  }

  let generationId: string | null = null
  let rawContent = ""
  let currentStage = "validate-environment"

  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("AI generation is not configured yet.")
    }

    currentStage = "openai-request"
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: modelName,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "developer", content: developerPrompt },
        {
          role: "user",
          content: buildUserPrompt({
            companyName: company.name,
            companyIndustry: company.industry,
            companyCountry: company.country,
            subscriptionTier: company.subscriptionTier,
            locationName: location.name,
            locationType: location.locationTypeLabel,
            city: location.city,
            locationCountry: location.country,
            floorAreaSqm: location.floorAreaSqm,
            occupancyNotes: location.occupancyNotes,
            operatingHoursNotes: location.operatingHoursNotes,
            monthlyEnergyKwh: location.monthlyEnergyKwh,
            monthlyEnergyCost: location.monthlyEnergyCost,
            currency: null,
            additionalNotes: null,
            equipmentList: [],
          }),
        },
      ],
    })

    rawContent = completion.choices[0]?.message?.content ?? ""

    currentStage = "validate-response"
    const parsedResponse = parseAiResponse(rawContent)
    const summary = normalizeInlineText(parsedResponse.summary)
    const insights = normalizeInsights(parsedResponse.insights, sparseContext)

    currentStage = "persist-generation"
    const generationInsert = await insertGenerationLog({
      companyId: company.id,
      userId: auth.userId,
      locationId: location.id,
      inputPayload,
      modelName,
      outputPayload: {
        summary,
        insight_count: insights.length,
        sparse_context: sparseContext,
        insights,
      },
      status: "success",
      promptSummary: summary.slice(0, 280),
      insightCount: insights.length,
    })

    if (generationInsert.error || !generationInsert.data) {
      console.error("[ai.generate] Failed to insert ai_generations success row", {
        companyId: company.id,
        userId: auth.userId,
        locationId: location.id,
        stage: currentStage,
        error: toLoggableDbError(generationInsert.error),
      })
    } else {
      generationId = asString(generationInsert.data.id)
    }

    currentStage = "persist-insights"
    const supabase = await createClient()
    const insightRows = insights.map((insight) => ({
      company_id: company.id,
      location_id: location.id,
      source_type: "ai_generated",
      title: insight.title,
      summary: insight.summary,
      description_md: insight.description_md,
      category: insight.category,
      confidence_score: insight.confidence_score,
      estimation_basis: insight.estimation_basis,
      estimated_savings_value: insight.estimated_savings_value,
      estimated_savings_percent: insight.estimated_savings_percent,
      status: "new",
      ai_generation_id: generationId,
    }))

    const { error: insightsInsertError } = await supabase.from("insights").insert(insightRows)

    if (insightsInsertError) {
      console.error("[ai.generate] Failed to insert insights rows", {
        companyId: company.id,
        userId: auth.userId,
        locationId: location.id,
        generationId,
        insightCount: insightRows.length,
        error: toLoggableDbError(insightsInsertError),
      })

      if (generationId) {
        await supabase
          .from("ai_generations")
          .update({
            status: "error",
            output_payload_json: {
              error: "Insights insert failed.",
              stage: currentStage,
              insight_count: insightRows.length,
            },
          })
          .eq("id", generationId)
      }

      throw new Error("Failed to save generated insights.")
    }

    return {
      generationId,
      summary,
      insightsCreated: insightRows.length,
    }
  } catch (error) {
    const safeMessage = getSafeErrorMessage(currentStage, error)
    const internalMessage = error instanceof Error ? error.message : "Unknown error"

    console.error("[ai.generate] Generation failed", {
      companyId: company.id,
      userId: auth.userId,
      locationId: location.id,
      stage: currentStage,
      modelName,
      error: internalMessage,
      rawPreview: rawContent ? rawContent.slice(0, 1200) : null,
    })

    if (!generationId) {
      const generationInsert = await insertGenerationLog({
        companyId: company.id,
        userId: auth.userId,
        locationId: location.id,
        inputPayload,
        modelName,
        outputPayload: {
          error: safeMessage,
          diagnostic_message: internalMessage,
          stage: currentStage,
          raw_response_preview: rawContent ? rawContent.slice(0, 1200) : null,
        },
        status: "error",
        promptSummary: safeMessage.slice(0, 280),
      })

      if (generationInsert.error) {
        console.error("[ai.generate] Failed to insert ai_generations error row", {
          companyId: company.id,
          userId: auth.userId,
          locationId: location.id,
          stage: currentStage,
          error: toLoggableDbError(generationInsert.error),
        })
      }
    }

    throw new Error(safeMessage)
  }
}