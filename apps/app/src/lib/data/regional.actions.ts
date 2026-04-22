"use server"

import { createClient } from "@/lib/supabase/server"

type RecordValue = Record<string, unknown>

export type RegionalCurrency = {
  code: string
  name: string
  symbol: string | null
  minor_unit: number
}

export type RegionalCountry = {
  code: string
  name: string
  currency_code: string
  region: string | null
}

export type CompanyRegionalSettings = {
  companyId: string
  companyCountryCode: string | null
  companyCurrencyCode: string | null
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

function mapCurrency(row: RecordValue): RegionalCurrency {
  return {
    code: asString(row.code) ?? "",
    name: asString(row.name) ?? "",
    symbol: asString(row.symbol),
    minor_unit: asNumber(row.minor_unit) ?? 2,
  }
}

function mapCountry(row: RecordValue): RegionalCountry {
  return {
    code: asString(row.code) ?? "",
    name: asString(row.name) ?? "",
    currency_code: asString(row.currency_code) ?? "",
    region: asString(row.region),
  }
}

async function requireCompanyId(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)

  if (error) {
    throw new Error("Failed to resolve company membership.")
  }

  const membership = (data?.[0] ?? null) as RecordValue | null
  const companyId = asString(membership?.company_id)

  if (!companyId) {
    throw new Error("No company membership found for this user.")
  }

  return companyId
}

export async function getActiveCountries(): Promise<RegionalCountry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("countries")
    .select("code, name, currency_code, region")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    return []
  }

  return ((data ?? []) as RecordValue[]).map(mapCountry).filter((entry) => Boolean(entry.code && entry.name && entry.currency_code))
}

export async function getActiveCurrencies(): Promise<RegionalCurrency[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("currencies")
    .select("code, name, symbol, minor_unit")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    return []
  }

  return ((data ?? []) as RecordValue[]).map(mapCurrency).filter((entry) => Boolean(entry.code && entry.name))
}

export async function getCountryByCode(code: string): Promise<RegionalCountry | null> {
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("countries")
    .select("code, name, currency_code, region")
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapCountry(data as RecordValue)
}

export async function inferCurrencyFromCountry(countryCode: string): Promise<string | null> {
  const country = await getCountryByCode(countryCode)
  return country?.currency_code ?? null
}

export async function getCompanyRegionalSettings(): Promise<CompanyRegionalSettings | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const companyId = await requireCompanyId(user.id)
  const { data, error } = await supabase
    .from("companies")
    .select("id, country_code, currency_code")
    .eq("id", companyId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const row = data as RecordValue

  return {
    companyId,
    companyCountryCode: asString(row.country_code),
    companyCurrencyCode: asString(row.currency_code),
  }
}

export async function getRegionalBootstrap() {
  const [countries, currencies, settings] = await Promise.all([
    getActiveCountries(),
    getActiveCurrencies(),
    getCompanyRegionalSettings(),
  ])

  return {
    countries,
    currencies,
    settings,
  }
}
