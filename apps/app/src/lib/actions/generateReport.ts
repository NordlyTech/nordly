"use server"

import { revalidatePath } from "next/cache"

import { generateReportForLocation } from "@/lib/data/reports.actions"
import type { GenerateReportInput, GenerateReportResult } from "@/types/report"

type GenerateReportActionResult =
  | ({ ok: true } & GenerateReportResult)
  | { ok: false; error: string }

function revalidateReportPaths(reportId: string, locationId: string) {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/insights")
  revalidatePath("/insights")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
  revalidatePath("/app/reports")
  revalidatePath("/reports")
  revalidatePath("/app/reports/new")
  revalidatePath(`/app/reports/${reportId}`)
  revalidatePath(`/reports/${reportId}`)
  revalidatePath(`/app/locations/${locationId}`)
}

export async function generateReportAction(input: GenerateReportInput): Promise<GenerateReportActionResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { ok: false, error: "AI report generation is not configured yet." }
    }

    const data = await generateReportForLocation(input)
    revalidateReportPaths(data.reportId, input.locationId)

    return {
      ok: true,
      ...data,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not generate a report right now.",
    }
  }
}