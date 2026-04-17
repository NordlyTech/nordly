"use server"

import { revalidatePath } from "next/cache"

import {
  updateMissionStatus,
  type MissionStatus,
} from "@/lib/data/insights-missions.actions"

type UpdateMissionStatusActionResult =
  | { ok: true }
  | { ok: false; error: string }

function revalidateMissionStatusPaths() {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/missions")
  revalidatePath("/missions")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
}

export async function updateMissionStatusAction(
  missionId: string,
  newStatus: MissionStatus
): Promise<UpdateMissionStatusActionResult> {
  try {
    await updateMissionStatus(missionId, newStatus)
    revalidateMissionStatusPaths()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update mission status right now.",
    }
  }
}
