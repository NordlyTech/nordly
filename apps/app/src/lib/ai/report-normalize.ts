import { reportGenerationSchema, type RawReportGenerationOutput } from "@/lib/ai/schemas/reportGeneration"
import {
  clamp,
  normalizeInlineText,
  roundTo,
  sanitizeMarkdownLikeText,
  uniqueTrimmed,
} from "@/lib/reports/shared"
import type { ReportInsight, ReportPayload } from "@/types/report"

type NormalizeReportContext = {
  companyName: string
  companyIndustry: string | null
  locationName: string
  locationType: string
  locationCountry: string | null
  locationCity: string | null
  floorAreaSqm: number | null
  operatingHoursNotes: string | null
  occupancyNotes: string | null
  knownEnergyCost: number | null
  knownEnergyKwh: number | null
  equipmentContext: string[]
  sparseContext: boolean
}

function safeText(value: string, fallback: string) {
  const normalized = normalizeInlineText(value)
  return normalized.length > 0 ? normalized : fallback
}

function normalizeInsightTitleKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
}

function areDuplicateInsights(left: ReportInsight, right: ReportInsight) {
  return normalizeInsightTitleKey(left.title) === normalizeInsightTitleKey(right.title)
}

function parseAiReportResponse(rawContent: string): RawReportGenerationOutput {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawContent)
  } catch {
    throw new Error("AI returned an invalid JSON response.")
  }

  const result = reportGenerationSchema.safeParse(parsed)
  if (!result.success) {
    console.error("[report.generate] Invalid AI response payload", {
      issues: result.error.issues,
      rawPreview: rawContent.slice(0, 1500),
    })
    throw new Error("AI returned an invalid response format.")
  }

  return result.data
}

export function normalizeReportOutput(rawContent: string, context: NormalizeReportContext): ReportPayload {
  const parsed = parseAiReportResponse(rawContent)
  const sparseConfidenceCap = context.sparseContext ? 0.58 : 0.92
  const sparseSavingsPercentCap = context.sparseContext ? 18 : 40
  const normalizedInsights: ReportInsight[] = []

  for (const insight of parsed.insights) {
    const normalized: ReportInsight = {
      title: safeText(insight.title, "Efficiency opportunity"),
      summary: safeText(insight.summary, "Potential savings opportunity identified for this location."),
      description_md: sanitizeMarkdownLikeText(insight.description_md || insight.summary),
      category: insight.category,
      estimated_savings_value: Math.max(0, Math.round(insight.estimated_savings_value)),
      estimated_savings_percent: clamp(roundTo(insight.estimated_savings_percent, 1), 0, sparseSavingsPercentCap),
      confidence_score: clamp(roundTo(insight.confidence_score, 2), 0.1, sparseConfidenceCap),
      effort_level: insight.effort_level,
      priority: insight.priority,
      mission_recommendation: safeText(insight.mission_recommendation, `Turn ${insight.title} into a mission for site review.`),
    }

    if (!normalizedInsights.find((candidate) => areDuplicateInsights(candidate, normalized))) {
      normalizedInsights.push(normalized)
    }
  }

  const insights = normalizedInsights.slice(0, 5)
  if (insights.length === 0) {
    throw new Error("AI returned no usable insights.")
  }

  const monthlySavings = Math.max(
    0,
    Math.round(parsed.summary.estimated_monthly_savings_value || insights.reduce((total, insight) => total + insight.estimated_savings_value, 0))
  )
  const yearlySavings = Math.max(
    monthlySavings * 12,
    Math.round(parsed.summary.estimated_yearly_savings_value || monthlySavings * 12)
  )
  const confidence = clamp(roundTo(parsed.summary.overall_confidence_score, 2), 0.1, sparseConfidenceCap)
  const topPriorities = uniqueTrimmed(
    [
      ...parsed.summary.top_priorities,
      ...insights.map((insight) => insight.title),
    ],
    3
  )

  const nextSteps = uniqueTrimmed(
    [
      ...parsed.next_steps,
      ...insights.slice(0, 3).map((insight) => insight.mission_recommendation),
      "Review assumptions before committing budget or measured savings targets.",
    ],
    3
  )

  return {
    summary: {
      headline: safeText(parsed.summary.headline, `${context.locationName} executive savings report`),
      executive_summary: safeText(
        parsed.summary.executive_summary,
        `Nordly identified estimated savings opportunities for ${context.locationName} based on the available location context.`
      ),
      estimated_monthly_savings_value: monthlySavings,
      estimated_yearly_savings_value: yearlySavings,
      overall_confidence_score: confidence,
      top_priorities: topPriorities.length > 0 ? topPriorities : insights.slice(0, 3).map((insight) => insight.title),
    },
    location_snapshot: {
      company_name: safeText(parsed.location_snapshot.company_name, context.companyName),
      industry: safeText(parsed.location_snapshot.industry, context.companyIndustry ?? "Not provided"),
      location_name: safeText(parsed.location_snapshot.location_name, context.locationName),
      location_type: safeText(parsed.location_snapshot.location_type, context.locationType),
      country: safeText(parsed.location_snapshot.country, context.locationCountry ?? "Not provided"),
      city: safeText(parsed.location_snapshot.city, context.locationCity ?? "Not provided"),
      floor_area_sqm: Math.max(0, Math.round(parsed.location_snapshot.floor_area_sqm || context.floorAreaSqm || 0)),
      operating_hours_notes: safeText(parsed.location_snapshot.operating_hours_notes, context.operatingHoursNotes ?? "Not provided"),
      occupancy_notes: safeText(parsed.location_snapshot.occupancy_notes, context.occupancyNotes ?? "Not provided"),
      known_energy_cost: Math.max(0, roundTo(parsed.location_snapshot.known_energy_cost || context.knownEnergyCost || 0, 0)),
      known_energy_kwh: Math.max(0, roundTo(parsed.location_snapshot.known_energy_kwh || context.knownEnergyKwh || 0, 0)),
      equipment_context: context.equipmentContext,
    },
    insights,
    next_steps: nextSteps,
  }
}