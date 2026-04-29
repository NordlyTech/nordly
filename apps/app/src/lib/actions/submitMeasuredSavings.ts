"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

type SubmitMeasuredSavingsInput = {
  missionId: string
  actualSavingsValue: number
  note?: string
}

type SubmitMeasuredSavingsResult =
  | { ok: true; overwroteExisting?: boolean }
  | { ok: false; error: string }

type RecordValue = Record<string, unknown>

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

function normalizeMissionStatus(value: unknown): "open" | "in_progress" | "completed" | "canceled" {
  const status = asString(value)

  if (status === "in_progress" || status === "completed" || status === "canceled") {
    return status
  }

  return "open"
}

function isMissingColumnError(error: unknown, columnName: string) {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as Record<string, unknown>
  const message = asString(candidate.message)?.toLowerCase() ?? ""
  const details = asString(candidate.details)?.toLowerCase() ?? ""
  const hint = asString(candidate.hint)?.toLowerCase() ?? ""
  const column = columnName.toLowerCase()

  return (
    message.includes("column") &&
    (message.includes(column) || details.includes(column) || hint.includes(column))
  )
}

function revalidateMeasuredSavingsPaths() {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/missions")
  revalidatePath("/missions")
  revalidatePath("/app/locations")
  revalidatePath("/locations")
}

async function requireAuthContext() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Could not record measured savings right now.")
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membershipError) {
    throw new Error("Could not record measured savings right now.")
  }

  const membership = memberships?.[0] as RecordValue | undefined
  const companyId = asString(membership?.company_id)

  if (!companyId) {
    throw new Error("Could not record measured savings right now.")
  }

  return { userId: user.id, companyId }
}

export async function submitMeasuredSavingsAction(
  input: SubmitMeasuredSavingsInput
): Promise<SubmitMeasuredSavingsResult> {
  try {
    const missionId = input.missionId?.trim()

    if (!missionId) {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    const value = Number(input.actualSavingsValue)
    if (!Number.isFinite(value) || value <= 0) {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    const auth = await requireAuthContext()
    const supabase = await createClient()

    const { data: missionData, error: missionError } = await supabase
      .from("missions")
      .select("id, company_id, status, expected_savings_value, actual_savings_value")
      .eq("id", missionId)
      .eq("company_id", auth.companyId)
      .maybeSingle()

    if (missionError || !missionData) {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    const mission = missionData as RecordValue
    const missionStatus = normalizeMissionStatus(mission.status)

    if (missionStatus !== "completed") {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    const expectedSavingsValue = asNumber(mission.expected_savings_value)
    if (expectedSavingsValue !== null && expectedSavingsValue > 0 && value > expectedSavingsValue * 10) {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    if ((expectedSavingsValue === null || expectedSavingsValue <= 0) && value > 1_000_000) {
      return { ok: false, error: "Could not record measured savings right now." }
    }

    const note = typeof input.note === "string" ? input.note.trim().slice(0, 1000) : ""

    const { error: updateError } = await supabase
      .from("missions")
      .update({
        actual_savings_value: Math.round(value),
        actual_savings_note: note.length > 0 ? note : null,
        actual_savings_recorded_at: new Date().toISOString(),
      })
      .eq("id", missionId)
      .eq("company_id", auth.companyId)

    if (updateError) {
      const missingNoteColumn = isMissingColumnError(updateError, "actual_savings_note")
      const missingRecordedAtColumn = isMissingColumnError(updateError, "actual_savings_recorded_at")

      if (!missingNoteColumn && !missingRecordedAtColumn) {
        return { ok: false, error: "Could not record measured savings right now." }
      }

      const { error: fallbackUpdateError } = await supabase
        .from("missions")
        .update({
          actual_savings_value: Math.round(value),
        })
        .eq("id", missionId)
        .eq("company_id", auth.companyId)

      if (fallbackUpdateError) {
        return { ok: false, error: "Could not record measured savings right now." }
      }
    }

    revalidateMeasuredSavingsPaths()

    return {
      ok: true,
      overwroteExisting: asNumber(mission.actual_savings_value) !== null,
    }
  } catch {
    return { ok: false, error: "Could not record measured savings right now." }
  }
}
