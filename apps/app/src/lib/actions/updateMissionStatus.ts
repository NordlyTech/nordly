"use server"

import { revalidatePath } from "next/cache"

import {
  updateMissionStatus,
  type MissionStatus,
  getMissions,
} from "@/lib/data/insights-missions.actions"

type UpdateMissionStatusActionResult =
  | { ok: true; missionStatus: MissionStatus; savingsCreated?: boolean }
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
    
    // Fetch the updated mission to get the savings value for toast messaging
    const missions = await getMissions()
    const updatedMission = missions.find((m) => m.id === missionId)
    
    const savingsCreated = newStatus === "completed" && 
      updatedMission && 
      updatedMission.expected_savings_value !== null && 
      updatedMission.expected_savings_value > 0
    
    revalidateMissionStatusPaths()
    return {
      ok: true,
      missionStatus: newStatus,
      savingsCreated,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update mission status right now.",
    }
  }
}
