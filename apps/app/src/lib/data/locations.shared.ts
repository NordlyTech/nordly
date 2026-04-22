import { formatMoney } from "@/lib/format/money"

export const LOCATION_TYPES = [
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

export type LocationType = (typeof LOCATION_TYPES)[number]

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  office: "Office",
  hotel: "Hotel",
  retail: "Retail",
  warehouse: "Warehouse",
  restaurant: "Restaurant",
  school: "School",
  healthcare: "Healthcare",
  industrial_light_use: "Industrial (Light Use)",
  other: "Other",
}

export type CompanyLocationRecord = {
  id: string
  name: string
  location_type: LocationType
  city: string | null
  country: string | null
  country_code: string | null
  floor_area_sqm: number | null
  insights_count: number
  missions_count: number
  expected_savings_value: number
  actual_savings_value: number
  created_at: string | null
}

export type CreateLocationInput = {
  name: string
  location_type: LocationType
  city?: string
  country?: string
  country_code?: string
  floor_area_sqm?: number | null
  operating_hours_notes?: string
  monthly_energy_kwh?: number | null
  monthly_energy_cost?: number | null
}

export function formatCurrency(value: number, currencyCode: string | null = "EUR") {
  return formatMoney(value, currencyCode, { locale: "en-GB", maximumFractionDigits: 0 })
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function toLocationTypeLabel(value: LocationType) {
  return LOCATION_TYPE_LABELS[value]
}
