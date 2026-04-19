import { z } from "zod"

import {
  REPORT_EFFORT_LEVELS,
  REPORT_INSIGHT_CATEGORIES,
  REPORT_PRIORITIES,
} from "@/types/report"

export const reportInsightCategorySchema = z.enum(REPORT_INSIGHT_CATEGORIES)
export const reportEffortLevelSchema = z.enum(REPORT_EFFORT_LEVELS)
export const reportPrioritySchema = z.enum(REPORT_PRIORITIES)

export const generatedReportSummarySchema = z.object({
  headline: z.string().default(""),
  executive_summary: z.string().default(""),
  estimated_monthly_savings_value: z.coerce.number().finite().catch(0),
  estimated_yearly_savings_value: z.coerce.number().finite().catch(0),
  overall_confidence_score: z.coerce.number().finite().catch(0),
  top_priorities: z.array(z.string()).default([]),
})

export const generatedReportLocationSnapshotSchema = z.object({
  company_name: z.string().default(""),
  industry: z.string().default(""),
  location_name: z.string().default(""),
  location_type: z.string().default(""),
  country: z.string().default(""),
  city: z.string().default(""),
  floor_area_sqm: z.coerce.number().finite().catch(0),
  operating_hours_notes: z.string().default(""),
  occupancy_notes: z.string().default(""),
  known_energy_cost: z.coerce.number().finite().catch(0),
  known_energy_kwh: z.coerce.number().finite().catch(0),
  equipment_context: z.array(z.string()).default([]),
})

export const generatedReportInsightSchema = z.object({
  title: z.string().default(""),
  summary: z.string().default(""),
  description_md: z.string().default(""),
  category: reportInsightCategorySchema.catch("operations"),
  estimated_savings_value: z.coerce.number().finite().catch(0),
  estimated_savings_percent: z.coerce.number().finite().catch(0),
  confidence_score: z.coerce.number().finite().catch(0),
  effort_level: reportEffortLevelSchema.catch("medium"),
  priority: reportPrioritySchema.catch("medium"),
  mission_recommendation: z.string().default(""),
})

export const reportGenerationSchema = z.object({
  summary: generatedReportSummarySchema,
  location_snapshot: generatedReportLocationSnapshotSchema,
  insights: z.array(generatedReportInsightSchema).min(1).max(8),
  next_steps: z.array(z.string()).default([]),
})

export type RawReportGenerationOutput = z.infer<typeof reportGenerationSchema>