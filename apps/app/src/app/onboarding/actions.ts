"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { inferCurrencyFromCountry } from "@/lib/data/regional.actions"

const LOCATION_TYPES = [
  "office",
  "hotel",
  "retail",
  "warehouse",
  "restaurant",
  "school",
  "healthcare",
  "industrial_light_use",
  "other",
] as const

type LocationType = (typeof LOCATION_TYPES)[number]

type OnboardingState = {
  error: string | null
  success: boolean
}

function getRequiredString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName)

  if (typeof value !== "string" || !value.trim()) {
    return null
  }

  return value.trim()
}

export async function submitOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const companyName = getRequiredString(formData, "company_name")
  const companyIndustry = getRequiredString(formData, "company_industry")
  const companyCountryCode = getRequiredString(formData, "company_country_code")
  const companyCurrencyCodeInput = getRequiredString(formData, "company_currency_code")

  const locationName = getRequiredString(formData, "location_name")
  const locationTypeValue = getRequiredString(formData, "location_type")
  const locationCountryCode = getRequiredString(formData, "location_country_code")
  const locationCity = getRequiredString(formData, "location_city")

  if (
    !companyName ||
    !companyIndustry ||
    !companyCountryCode ||
    !locationName ||
    !locationTypeValue ||
    !locationCountryCode ||
    !locationCity
  ) {
    return { error: "Please fill in all required fields.", success: false }
  }

  if (!LOCATION_TYPES.includes(locationTypeValue as LocationType)) {
    return {
      error: "Invalid location type. Please pick one of the provided options.",
      success: false,
    }
  }

  const { data: existingMemberships } = await supabase
    .from("company_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)

  if ((existingMemberships?.length ?? 0) > 0) {
    return { error: null, success: true }
  }

  const address = getRequiredString(formData, "location_address")
  const occupancyNotes = getRequiredString(formData, "occupancy_notes")
  const operatingHoursNotes = getRequiredString(formData, "operating_hours_notes")

  const floorAreaRaw = getRequiredString(formData, "floor_area_sqm")
  let floorArea: number | null = null

  if (floorAreaRaw) {
    const normalizedFloorArea = floorAreaRaw.replace(/,/g, "")
    const parsedFloorArea = Number(normalizedFloorArea)

    if (!Number.isFinite(parsedFloorArea) || parsedFloorArea <= 0) {
      return {
        error: "Area (sqm) must be a positive number when provided.",
        success: false,
      }
    }

    floorArea = parsedFloorArea
  }

  if (floorAreaRaw && floorArea === null) {
    return {
      error: "Area (sqm) must be a positive number when provided.",
      success: false,
    }
  }

  const monthlyEnergyKwhRaw = getRequiredString(formData, "monthly_energy_kwh")
  let monthlyEnergyKwh: number | null = null

  if (monthlyEnergyKwhRaw) {
    const parsed = Number(monthlyEnergyKwhRaw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: "Monthly energy consumption must be zero or greater when provided.", success: false }
    }
    monthlyEnergyKwh = parsed
  }

  const monthlyEnergyCostRaw = getRequiredString(formData, "monthly_energy_cost")
  let monthlyEnergyCost: number | null = null

  if (monthlyEnergyCostRaw) {
    const parsed = Number(monthlyEnergyCostRaw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: "Monthly energy cost must be zero or greater when provided.", success: false }
    }
    monthlyEnergyCost = parsed
  }

  const companyCurrencyCode =
    companyCurrencyCodeInput ?? (await inferCurrencyFromCountry(companyCountryCode))

  if (!companyCurrencyCode) {
    return {
      error: "Could not resolve a valid company currency from the selected country.",
      success: false,
    }
  }

  const { error: rpcError } = await supabase.rpc("complete_onboarding", {
    p_company_name: companyName,
    p_company_industry: companyIndustry,
    p_company_country_code: companyCountryCode,
    p_company_currency_code: companyCurrencyCode,
    p_location_name: locationName,
    p_location_type: locationTypeValue,
    p_location_country_code: locationCountryCode,
    p_location_city: locationCity,
    p_location_address: address,
    p_floor_area_sqm: floorArea,
    p_occupancy_notes: occupancyNotes,
    p_operating_hours_notes: operatingHoursNotes,
    p_monthly_energy_kwh: monthlyEnergyKwh,
    p_monthly_energy_cost: monthlyEnergyCost,
  })

  if (rpcError) {
    const msg = rpcError.message ?? ""
    const msgLower = msg.toLowerCase()

    // Log full error for server-side debugging
    console.error("[onboarding] RPC error:", rpcError.code, msg)

    if (msgLower.includes("already onboarded")) {
      return { error: null, success: true }
    }

    if (
      msgLower.includes("could not find") ||
      msgLower.includes("does not exist") ||
      rpcError.code === "PGRST202" ||
      msgLower.includes("pgrst202")
    ) {
      return {
        error:
          "Setup function not found — run supabase/migrations/20260422_regionalization_foundation.sql in your Supabase SQL Editor first.",
        success: false,
      }
    }

    if (rpcError.code === "42501" || msgLower.includes("permission denied")) {
      return {
        error:
          "Permission error — run supabase/migrations/20260422_regionalization_foundation.sql in your Supabase SQL Editor.",
        success: false,
      }
    }

    // Fall through: show actual Postgres/PostgREST message so nothing is silently swallowed
    return { error: msg || "Setup failed. Please try again.", success: false }
  }

  return { error: null, success: true }
}
