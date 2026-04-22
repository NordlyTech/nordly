"use server"

import { createClient } from "@/lib/supabase/server"

export type SavingsRecord = {
  id: string
  company_id: string
  location_id: string
  mission_id: string | null
  insight_id: string | null
  savings_type: "estimated" | "measured"
  amount_value: number | null
  methodology: string
  period_start: string | null
  period_end: string | null
  notes: string | null
  created_at: string
}

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

/**
 * Check if a savings record already exists for a mission using the mission_completion_estimate methodology.
 * This prevents duplicate auto-generated records if the mission is marked completed multiple times.
 */
export async function getMissionCompletionSavingsRecord(
  companyId: string,
  missionId: string
): Promise<SavingsRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("savings_records")
    .select("*")
    .eq("company_id", companyId)
    .eq("mission_id", missionId)
    .eq("methodology", "mission_completion_estimate")
    .maybeSingle()

  if (error) {
    console.error("Failed to check for existing savings record:", error)
    return null
  }

  if (!data) {
    return null
  }

  const row = data as RecordValue
  return {
    id: asString(row.id) ?? "",
    company_id: asString(row.company_id) ?? companyId,
    location_id: asString(row.location_id) ?? "",
    mission_id: asString(row.mission_id),
    insight_id: asString(row.insight_id),
    savings_type: asString(row.savings_type) === "measured" ? "measured" : "estimated",
    amount_value: asNumber(row.amount_value),
    methodology: asString(row.methodology) ?? "unknown",
    period_start: asString(row.period_start),
    period_end: asString(row.period_end),
    notes: asString(row.notes),
    created_at: asString(row.created_at) ?? "",
  }
}

/**
 * Create an automatic savings record when a mission is marked completed.
 * Skips creation if expected_savings_value is null or 0.
 * Returns true if record was created, false if skipped.
 */
export async function createMissionCompletionSavingsRecord(
  companyId: string,
  locationId: string,
  missionId: string,
  insightId: string | null,
  expectedSavingsValue: number | null
): Promise<boolean> {
  // Skip if no savings value
  if (expectedSavingsValue === null || expectedSavingsValue === 0) {
    return false
  }

  // Check for duplicate
  const existing = await getMissionCompletionSavingsRecord(companyId, missionId)
  if (existing) {
    return false // Already exists, don't create duplicate
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const payload: Record<string, unknown> = {
    company_id: companyId,
    location_id: locationId,
    mission_id: missionId,
    insight_id: insightId,
    savings_type: "estimated",
    amount_value: expectedSavingsValue,
    methodology: "mission_completion_estimate",
    period_start: now,
    period_end: null,
    notes: "Automatically created when mission was marked completed",
  }

  const { error } = await supabase.from("savings_records").insert(payload)

  if (error) {
    console.error("Failed to create mission completion savings record:", error)
    return false
  }

  return true
}

/**
 * Delete the auto-generated savings record for a mission when it's moved back to open/in_progress.
 * Only deletes records with methodology = 'mission_completion_estimate'.
 * Preserves any manually entered or measured records.
 */
export async function deleteMissionCompletionSavingsRecord(companyId: string, missionId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("savings_records")
    .delete()
    .eq("company_id", companyId)
    .eq("mission_id", missionId)
    .eq("methodology", "mission_completion_estimate")

  if (error) {
    console.error("Failed to delete mission completion savings record:", error)
    return false
  }

  return true
}

/**
 * Get all savings records for a location (for dashboard/savings views).
 */
export async function getLocationSavingsRecords(
  companyId: string,
  locationId: string
): Promise<SavingsRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("savings_records")
    .select("*")
    .eq("company_id", companyId)
    .eq("location_id", locationId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load location savings records:", error)
    return []
  }

  return (data ?? []).map((row) => {
    const record = row as RecordValue
    return {
      id: asString(record.id) ?? "",
      company_id: asString(record.company_id) ?? companyId,
      location_id: asString(record.location_id) ?? locationId,
      mission_id: asString(record.mission_id),
      insight_id: asString(record.insight_id),
      savings_type: asString(record.savings_type) === "measured" ? "measured" : "estimated",
      amount_value: asNumber(record.amount_value),
      methodology: asString(record.methodology) ?? "unknown",
      period_start: asString(record.period_start),
      period_end: asString(record.period_end),
      notes: asString(record.notes),
      created_at: asString(record.created_at) ?? "",
    }
  })
}

/**
 * Get total savings (estimated + measured) for a location by type.
 */
export async function getLocationSavingsSummary(
  companyId: string,
  locationId: string
): Promise<{ estimatedSavings: number; measuredSavings: number }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("savings_records")
    .select("savings_type, amount_value")
    .eq("company_id", companyId)
    .eq("location_id", locationId)

  if (error) {
    console.error("Failed to load location savings summary:", error)
    return { estimatedSavings: 0, measuredSavings: 0 }
  }

  let estimatedSavings = 0
  let measuredSavings = 0

  for (const row of data ?? []) {
    const record = row as RecordValue
    const savingsType = asString(record.savings_type)
    const amount = asNumber(record.amount_value) ?? 0

    if (savingsType === "measured") {
      measuredSavings += amount
    } else {
      estimatedSavings += amount
    }
  }

  return { estimatedSavings, measuredSavings }
}
