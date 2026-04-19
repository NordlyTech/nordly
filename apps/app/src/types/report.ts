export const REPORT_INSIGHT_CATEGORIES = [
  "hvac",
  "lighting",
  "operations",
  "behavior",
  "equipment",
  "schedule",
] as const

export const REPORT_EFFORT_LEVELS = ["low", "medium", "high"] as const
export const REPORT_PRIORITIES = ["high", "medium", "low"] as const

export type ReportInsightCategory = (typeof REPORT_INSIGHT_CATEGORIES)[number]
export type ReportEffortLevel = (typeof REPORT_EFFORT_LEVELS)[number]
export type ReportPriority = (typeof REPORT_PRIORITIES)[number]
export type ReportStatus = "generated" | "archived"

export type ReportSummary = {
  headline: string
  executive_summary: string
  estimated_monthly_savings_value: number
  estimated_yearly_savings_value: number
  overall_confidence_score: number
  top_priorities: string[]
}

export type ReportLocationSnapshot = {
  company_name: string
  industry: string
  location_name: string
  location_type: string
  country: string
  city: string
  floor_area_sqm: number
  operating_hours_notes: string
  occupancy_notes: string
  known_energy_cost: number
  known_energy_kwh: number
  equipment_context: string[]
}

export type ReportInsight = {
  title: string
  summary: string
  description_md: string
  category: ReportInsightCategory
  estimated_savings_value: number
  estimated_savings_percent: number
  confidence_score: number
  effort_level: ReportEffortLevel
  priority: ReportPriority
  mission_recommendation: string
}

export type ReportPayload = {
  summary: ReportSummary
  location_snapshot: ReportLocationSnapshot
  insights: ReportInsight[]
  next_steps: string[]
}

export type ReportListRecord = {
  id: string
  title: string
  company_id: string
  location_id: string | null
  location_name: string | null
  location_type: string | null
  estimated_monthly_savings_value: number
  estimated_yearly_savings_value: number
  overall_confidence_score: number
  status: ReportStatus
  created_at: string | null
}

export type StoredReportInsight = ReportInsight & {
  id: string
  status: "new" | "accepted" | "dismissed" | "archived"
}

export type ReportDetailRecord = ReportListRecord & {
  ai_generation_id: string | null
  summary_json: ReportSummary
  report_payload_json: ReportPayload
  company_name: string
  company_industry: string | null
  company_country: string | null
  subscription_tier: string | null
  insights: StoredReportInsight[]
  next_steps: string[]
}

export type ReportGenerationLocationOption = {
  id: string
  name: string
  location_type: string | null
  city: string | null
  country: string | null
  floor_area_sqm: number | null
  occupancy_notes: string | null
  operating_hours_notes: string | null
}

export type GenerateReportInput = {
  locationId: string
  floorAreaSqm?: number | null
  operatingHoursNotes?: string | null
  occupancyNotes?: string | null
  monthlyEnergyCost?: number | null
  monthlyEnergyKwh?: number | null
}

export type GenerateReportResult = {
  reportId: string
  generationId: string | null
  title: string
  summary: ReportSummary
  insights: StoredReportInsight[]
}

export type ReportGenerationFormContext = {
  companyName: string
  subscriptionTier: string | null
  isPremium: boolean
  locations: ReportGenerationLocationOption[]
}