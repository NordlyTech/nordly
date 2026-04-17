"use server"

import { revalidatePath } from "next/cache"

import { acceptInsightAsMission } from "@/lib/data/insights-missions.actions"

type AcceptInsightActionResult =
  | { ok: true; missionId: string; alreadyExisted?: boolean }
  | { ok: false; error: string }

function revalidateAcceptInsightPaths() {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/insights")
  revalidatePath("/insights")
  revalidatePath("/app/missions")
  revalidatePath("/missions")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
}

export async function acceptInsightAction(insightId: string): Promise<AcceptInsightActionResult> {
  try {
    const data = await acceptInsightAsMission(insightId)
    revalidateAcceptInsightPaths()
    return {
      ok: true,
      missionId: data.missionId,
      alreadyExisted: data.alreadyExisted,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not accept this insight right now.",
    }
  }
}
