"use server"

import { createClient } from "@/lib/supabase/server"

type RecordValue = Record<string, unknown>

const BILLING_SOURCE_TYPES = ["onboarding", "manual", "csv", "pdf", "api"] as const

export type BillingSourceType = (typeof BILLING_SOURCE_TYPES)[number]

export type BillingRecord = {
  id: string
  company_id: string
  location_id: string
  billing_period_start: string | null
  billing_period_end: string | null
  energy_kwh: number | null
  energy_cost: number | null
  currency_code: string | null
  source_type: BillingSourceType | null
  created_at: string | null
}

export type LocationEnergyBaseline = {
  avg_kwh: number | null
  avg_cost: number | null
  data_points_count: number
  cost_per_kwh: number | null
}

type AuthContext = {
  userId: string
  companyId: string
}

type BillingInsertInput = {
  companyId?: string
  locationId: string
  billingPeriodStart: string
  billingPeriodEnd: string
  energyKwh: number | null
  energyCost: number | null
  currencyCode: string | null
  sourceType: BillingSourceType
}

export type ManualBillingRecordInput = {
  locationId: string
  billingPeriodStart: string
  billingPeriodEnd: string
  energyKwh: number
  energyCost: number
  currencyCode: string
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

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function normalizeSourceType(value: unknown): BillingSourceType | null {
  const candidate = asString(value)

  if (candidate && BILLING_SOURCE_TYPES.includes(candidate as BillingSourceType)) {
    return candidate as BillingSourceType
  }

  return null
}

function mapBillingRecord(row: RecordValue): BillingRecord {
  return {
    id: asString(row.id) ?? "",
    company_id: asString(row.company_id) ?? "",
    location_id: asString(row.location_id) ?? "",
    billing_period_start: asString(row.billing_period_start),
    billing_period_end: asString(row.billing_period_end),
    energy_kwh: asNumber(row.energy_kwh),
    energy_cost: asNumber(row.energy_cost),
    currency_code: asString(row.currency_code),
    source_type: normalizeSourceType(row.source_type),
    created_at: asString(row.created_at),
  }
}

async function requireAuthContext(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in to access billing records.")
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

export async function getCurrentMonthBillingPeriod(referenceDate = new Date()) {
  const year = referenceDate.getUTCFullYear()
  const month = referenceDate.getUTCMonth()
  const monthStart = new Date(Date.UTC(year, month, 1))
  const monthEnd = new Date(Date.UTC(year, month + 1, 0))

  return {
    billingPeriodStart: monthStart.toISOString().slice(0, 10),
    billingPeriodEnd: monthEnd.toISOString().slice(0, 10),
  }
}

async function resolveLocationCompanyId(locationId: string, companyId?: string) {
  if (companyId) {
    return companyId
  }

  const auth = await requireAuthContext()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("locations")
    .select("company_id")
    .eq("id", locationId)
    .eq("company_id", auth.companyId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to resolve billing company context: ${error.message}`)
  }

  const resolvedCompanyId = asString((data as RecordValue | null)?.company_id)
  if (!resolvedCompanyId) {
    throw new Error("Location not found.")
  }

  return resolvedCompanyId
}

export async function getLocationBillingRecords(locationId: string, limit = 24): Promise<BillingRecord[]> {
  const auth = await requireAuthContext()
  const supabase = await createClient()
  const normalizedLimit = Number.isFinite(limit) ? Math.max(1, Math.min(Math.trunc(limit), 60)) : 24

  const { data, error } = await supabase
    .from("billing_records")
    .select("id, company_id, location_id, billing_period_start, billing_period_end, energy_kwh, energy_cost, currency_code, source_type, created_at")
    .eq("company_id", auth.companyId)
    .eq("location_id", locationId)
    .order("billing_period_end", { ascending: false })
    .limit(normalizedLimit)

  if (error) {
    throw new Error(`Failed to load billing records: ${error.message}`)
  }

  return ((data ?? []) as RecordValue[]).map(mapBillingRecord)
}

export async function getLocationEnergyBaseline(
  locationId: string,
  options?: { companyId?: string | null; isAdmin?: boolean }
): Promise<LocationEnergyBaseline> {
  const supabase = await createClient()
  let query = supabase
    .from("billing_records")
    .select("energy_kwh, energy_cost")
    .eq("location_id", locationId)
    .order("billing_period_end", { ascending: false })
    .limit(6)

  if (!options?.isAdmin) {
    const companyId = options?.companyId ?? (await requireAuthContext()).companyId
    query = query.eq("company_id", companyId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to load billing baseline: ${error.message}`)
  }

  const rows = ((data ?? []) as RecordValue[])
  const populatedRows = rows.filter((row) => asNumber(row.energy_kwh) !== null || asNumber(row.energy_cost) !== null)
  const dataPointsCount = populatedRows.length
  if (dataPointsCount === 0) {
    return {
      avg_kwh: null,
      avg_cost: null,
      data_points_count: 0,
      cost_per_kwh: null,
    }
  }

  const kwhValues = populatedRows
    .map((row) => asNumber(row.energy_kwh))
    .filter((value): value is number => value !== null)
  const costValues = populatedRows
    .map((row) => asNumber(row.energy_cost))
    .filter((value): value is number => value !== null)

  const avgKwh = kwhValues.length > 0 ? roundTo(kwhValues.reduce((sum, value) => sum + value, 0) / kwhValues.length, 2) : null
  const avgCost = costValues.length > 0 ? roundTo(costValues.reduce((sum, value) => sum + value, 0) / costValues.length, 2) : null
  const costPerKwh = avgKwh && avgKwh > 0 && avgCost !== null ? roundTo(avgCost / avgKwh, 4) : null

  return {
    avg_kwh: avgKwh,
    avg_cost: avgCost,
    data_points_count: dataPointsCount,
    cost_per_kwh: costPerKwh,
  }
}

export async function insertBillingRecord(input: BillingInsertInput): Promise<BillingRecord> {
  if (!input.locationId.trim()) {
    throw new Error("Location is required for billing records.")
  }

  if (!input.billingPeriodStart || !input.billingPeriodEnd) {
    throw new Error("Billing period start and end are required.")
  }

  if (input.energyKwh !== null && (!Number.isFinite(input.energyKwh) || input.energyKwh < 0)) {
    throw new Error("Energy kWh must be zero or greater when provided.")
  }

  if (input.energyCost !== null && (!Number.isFinite(input.energyCost) || input.energyCost < 0)) {
    throw new Error("Energy cost must be zero or greater when provided.")
  }

  const startDate = new Date(`${input.billingPeriodStart}T00:00:00.000Z`)
  const endDate = new Date(`${input.billingPeriodEnd}T00:00:00.000Z`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    throw new Error("Billing period end must be on or after the billing period start.")
  }

  const companyId = await resolveLocationCompanyId(input.locationId, input.companyId)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("billing_records")
    .insert({
      company_id: companyId,
      location_id: input.locationId,
      billing_period_start: input.billingPeriodStart,
      billing_period_end: input.billingPeriodEnd,
      energy_kwh: input.energyKwh,
      energy_cost: input.energyCost,
      currency_code: input.currencyCode,
      source_type: input.sourceType,
    })
    .select("id, company_id, location_id, billing_period_start, billing_period_end, energy_kwh, energy_cost, currency_code, source_type, created_at")
    .single()

  if (error || !data) {
    throw new Error(`Failed to save billing record: ${error?.message ?? "Unknown error"}`)
  }

  return mapBillingRecord(data as RecordValue)
}

export async function createManualBillingRecord(input: ManualBillingRecordInput): Promise<BillingRecord> {
  return insertBillingRecord({
    locationId: input.locationId,
    billingPeriodStart: input.billingPeriodStart,
    billingPeriodEnd: input.billingPeriodEnd,
    energyKwh: input.energyKwh,
    energyCost: input.energyCost,
    currencyCode: input.currencyCode,
    sourceType: "manual",
  })
}