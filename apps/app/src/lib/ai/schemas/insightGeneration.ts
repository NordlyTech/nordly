import { z } from "zod"

export const insightCategorySchema = z.enum(["hvac", "lighting", "operations", "behavior", "equipment", "schedule"])

export const generatedInsightSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  description_md: z.string().trim().min(1),
  category: insightCategorySchema,
  estimated_savings_value: z.number().finite(),
  estimated_savings_percent: z.number().finite(),
  confidence_score: z.number().finite(),
  rationale: z.string().trim().min(1),
})

export const insightGenerationSchema = z.object({
  summary: z.string().trim().min(1),
  insights: z.array(generatedInsightSchema).min(3).max(5),
})

export type InsightCategory = z.infer<typeof insightCategorySchema>
export type GeneratedInsight = z.infer<typeof generatedInsightSchema>
export type InsightGenerationOutput = z.infer<typeof insightGenerationSchema>