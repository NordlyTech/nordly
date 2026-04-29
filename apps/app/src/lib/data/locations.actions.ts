"use server"

import { revalidatePath } from "next/cache"

import { getCurrentMonthBillingPeriod, insertBillingRecord } from "@/lib/data/billing-records.actions"
import { createClient } from "@/lib/supabase/server"
import {
  LOCATION_TYPES,
  type CompanyLocationRecord,
  type CreateLocationInput,
  type LocationType,
} from "@/lib/data/locations.shared"

type RecordValue = Record<string, unknown>

type AuthContext = {
  userId: string
  companyId: string
}

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

function normalizeLocationType(value: unknown): LocationType {
  const candidate = asString(value)

  if (candidate && LOCATION_TYPES.includes(candidate as LocationType)) {
    return candidate as LocationType
  }

  return "other"
}

function mapLocationRow(row: RecordValue): CompanyLocationRecord {
  return {
    id: asString(row.id) ?? "",
    name: asString(row.name) ?? "Untitled location",
    location_type: normalizeLocationType(row.location_type),
    city: asString(row.city),
    country: asString(row.country),
    country_code: asString(row.country_code),
    floor_area_sqm: asNumber(row.floor_area_sqm),
    monthly_energy_kwh: asNumber(row.monthly_energy_kwh),
    monthly_energy_cost: asNumber(row.monthly_energy_cost),
    insights_count: 0,
    missions_count: 0,
    expected_savings_value: 0,
    actual_savings_value: 0,
    billing_records_count: 0,
    created_at: asString(row.created_at),
  }
}

async function resolveLocationMetrics(companyId: string) {
  const supabase = await createClient()

  const [insightsResult, missionsResult, billingResult] = await Promise.all([
    supabase
      .from("insights")
      .select("location_id")
      .eq("company_id", companyId),
    supabase
      .from("missions")
      .select("location_id, status, expected_savings_value, actual_savings_value")
      .eq("company_id", companyId),
    supabase
      .from("billing_records")
      .select("location_id, energy_kwh, energy_cost")
      .eq("company_id", companyId),
  ])

  const metrics = new Map<string, {
    insightsCount: number
    missionsCount: number
    expectedSavingsValue: number
    actualSavingsValue: number
    billingRecordsCount: number
  }>()

  if (!insightsResult.error) {
    for (const row of insightsResult.data ?? []) {
      const record = row as RecordValue
      const locationId = asString(record.location_id)
      if (!locationId) continue

      const current = metrics.get(locationId) ?? {
        insightsCount: 0,
        missionsCount: 0,
        expectedSavingsValue: 0,
        actualSavingsValue: 0,
        billingRecordsCount: 0,
      }
      current.insightsCount += 1
      metrics.set(locationId, current)
    }
  }

  if (!missionsResult.error) {
    for (const row of missionsResult.data ?? []) {
      const record = row as RecordValue
      const locationId = asString(record.location_id)
      if (!locationId) continue

      const current = metrics.get(locationId) ?? {
        insightsCount: 0,
        missionsCount: 0,
        expectedSavingsValue: 0,
        actualSavingsValue: 0,
        billingRecordsCount: 0,
      }

      current.missionsCount += 1

      const status = asString(record.status)
      if (status === "open" || status === "in_progress" || status === "completed") {
        current.expectedSavingsValue += asNumber(record.expected_savings_value) ?? 0
      }

      if (status === "completed") {
        current.actualSavingsValue += asNumber(record.actual_savings_value) ?? 0
      }

      metrics.set(locationId, current)
    }
  }

  if (!billingResult.error) {
    for (const row of billingResult.data ?? []) {
      const record = row as RecordValue
      const locationId = asString(record.location_id)
      if (!locationId) continue

      const hasBillingData = asNumber(record.energy_kwh) !== null || asNumber(record.energy_cost) !== null
      if (!hasBillingData) continue

      const current = metrics.get(locationId) ?? {
        insightsCount: 0,
        missionsCount: 0,
        expectedSavingsValue: 0,
        actualSavingsValue: 0,
        billingRecordsCount: 0,
      }

      current.billingRecordsCount += 1
      metrics.set(locationId, current)
    }
  }

  return metrics
}

function revalidateLocationMutationPaths(locationId?: string) {
  revalidatePath("/app")
  revalidatePath("/dashboard")
  revalidatePath("/app/locations")
  revalidatePath("/locations")

  if (locationId) {
    revalidatePath(`/app/locations/${locationId}`)
  }
}

async function requireAuthContext(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access locations.")
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  if (membershipError) {
    throw new Error("Failed to resolve company membership.")
  }

  const membership = memberships?.[0] as RecordValue | undefined
  const companyId = asString(membership?.company_id)

  if (!companyId) {
    throw new Error("No company membership found for this user.")
  }

  return {
    userId: user.id,
    companyId,
  }
}

export async function getCompanyLocations(): Promise<CompanyLocationRecord[]> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("locations")
    .select("id, name, location_type, city, country, country_code, floor_area_sqm, monthly_energy_kwh, monthly_energy_cost, created_at")
    .eq("company_id", auth.companyId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load locations: ${error.message}`)
  }

  const metrics = await resolveLocationMetrics(auth.companyId)

  return ((data ?? []) as RecordValue[]).map((row) => {
    const location = mapLocationRow(row)
    const locationMetrics = metrics.get(location.id)

    return {
      ...location,
      insights_count: locationMetrics?.insightsCount ?? 0,
      missions_count: locationMetrics?.missionsCount ?? 0,
      expected_savings_value: locationMetrics?.expectedSavingsValue ?? 0,
      actual_savings_value: locationMetrics?.actualSavingsValue ?? 0,
      billing_records_count: locationMetrics?.billingRecordsCount ?? 0,
    }
  })
}

export async function getCompanyLocationById(locationId: string): Promise<CompanyLocationRecord | null> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("locations")
    .select("id, name, location_type, city, country, country_code, floor_area_sqm, monthly_energy_kwh, monthly_energy_cost, created_at")
    .eq("company_id", auth.companyId)
    .eq("id", locationId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load location details: ${error.message}`)
  }

  if (!data) {
    return null
  }

  const location = mapLocationRow(data as RecordValue)
  const metrics = await resolveLocationMetrics(auth.companyId)
  const locationMetrics = metrics.get(location.id)

  return {
    ...location,
    insights_count: locationMetrics?.insightsCount ?? 0,
    missions_count: locationMetrics?.missionsCount ?? 0,
    expected_savings_value: locationMetrics?.expectedSavingsValue ?? 0,
    actual_savings_value: locationMetrics?.actualSavingsValue ?? 0,
    billing_records_count: locationMetrics?.billingRecordsCount ?? 0,
  }
}

export async function createCompanyLocation(input: CreateLocationInput): Promise<CompanyLocationRecord> {
  const auth = await requireAuthContext()
  const supabase = await createClient()

  const normalizedName = input.name?.trim()
  if (!normalizedName) {
    throw new Error("Location name is required.")
  }

  if (!input.location_type || !LOCATION_TYPES.includes(input.location_type)) {
    throw new Error("Location type is required.")
  }

  if (input.floor_area_sqm !== undefined && input.floor_area_sqm !== null) {
    if (!Number.isFinite(input.floor_area_sqm) || input.floor_area_sqm <= 0) {
      throw new Error("Floor area must be a positive number when provided.")
    }
  }

  if (input.monthly_energy_kwh !== undefined && input.monthly_energy_kwh !== null) {
    if (!Number.isFinite(input.monthly_energy_kwh) || input.monthly_energy_kwh < 0) {
      throw new Error("Monthly energy kWh must be zero or greater when provided.")
    }
  }

  if (input.monthly_energy_cost !== undefined && input.monthly_energy_cost !== null) {
    if (!Number.isFinite(input.monthly_energy_cost) || input.monthly_energy_cost < 0) {
      throw new Error("Monthly energy cost must be zero or greater when provided.")
    }
  }

  const normalizedCity = input.city?.trim() || null
  const normalizedCountry = input.country?.trim() || null
  const normalizedCountryCode = input.country_code?.trim().toUpperCase() || null
  const normalizedOperatingHoursNotes = input.operating_hours_notes?.trim() || null
  const normalizedMonthlyEnergyKwh = input.monthly_energy_kwh ?? null
  const normalizedMonthlyEnergyCost = input.monthly_energy_cost ?? null

  const payload: Record<string, unknown> = {
    company_id: auth.companyId,
    name: normalizedName,
    location_type: input.location_type,
    city: normalizedCity,
    country: normalizedCountry,
    country_code: normalizedCountryCode,
    floor_area_sqm: input.floor_area_sqm ?? null,
    operating_hours_notes: normalizedOperatingHoursNotes,
    monthly_energy_kwh: normalizedMonthlyEnergyKwh,
    monthly_energy_cost: normalizedMonthlyEnergyCost,
  }

  const { data, error } = await supabase
    .from("locations")
    .insert(payload)
    .select("id, name, location_type, city, country, country_code, floor_area_sqm, monthly_energy_kwh, monthly_energy_cost, created_at")
    .maybeSingle()

  if (error || !data) {
    throw new Error(`Failed to create location: ${error?.message ?? "Unknown error"}`)
  }

  const location = {
    ...mapLocationRow(data as RecordValue),
    city: normalizedCity,
    country: normalizedCountry,
    country_code: normalizedCountryCode,
    monthly_energy_kwh: normalizedMonthlyEnergyKwh,
    monthly_energy_cost: normalizedMonthlyEnergyCost,
  }

  if (normalizedMonthlyEnergyKwh !== null || normalizedMonthlyEnergyCost !== null) {
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("currency_code")
      .eq("id", auth.companyId)
      .maybeSingle()

    if (companyError) {
      await supabase.from("locations").delete().eq("company_id", auth.companyId).eq("id", location.id)
      throw new Error(`Failed to resolve company currency: ${companyError.message}`)
    }

    try {
      const { billingPeriodStart, billingPeriodEnd } = await getCurrentMonthBillingPeriod()
      await insertBillingRecord({
        companyId: auth.companyId,
        locationId: location.id,
        billingPeriodStart,
        billingPeriodEnd,
        energyKwh: normalizedMonthlyEnergyKwh,
        energyCost: normalizedMonthlyEnergyCost,
        currencyCode: asString((companyData as RecordValue | null)?.currency_code),
        sourceType: "onboarding",
      })
      location.billing_records_count = 1
    } catch (billingError) {
      await supabase.from("locations").delete().eq("company_id", auth.companyId).eq("id", location.id)
      throw billingError instanceof Error ? billingError : new Error("Failed to create billing record.")
    }
  }

  revalidateLocationMutationPaths(location.id)
  return location
}
