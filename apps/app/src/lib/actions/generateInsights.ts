"use server"

import { revalidatePath } from "next/cache"

import {
  generateInsightsForLocation,
  type GenerateInsightsResult,
} from "@/lib/data/generate-insights.actions"

type GenerateInsightsActionResult =
  | ({ ok: true } & Omit<GenerateInsightsResult, "generationId">)
  | { ok: false; error: string }

function revalidateGenerateInsightsPaths(locationId: string) {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/insights")
  revalidatePath("/insights")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
  revalidatePath(`/app/locations/${locationId}`)
}

export async function generateInsightsAction(locationId: string): Promise<GenerateInsightsActionResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { ok: false, error: "AI generation is not configured yet." }
    }

    const data = await generateInsightsForLocation(locationId)
    revalidateGenerateInsightsPaths(locationId)
    return {
      ok: true,
      summary: data.summary,
      insightsCreated: data.insightsCreated,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate insights.",
    }
  }
}
