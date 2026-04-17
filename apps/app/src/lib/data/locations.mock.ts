export type LocationType =
  | "office"
  | "hotel"
  | "retail"
  | "warehouse"
  | "restaurant"
  | "school"
  | "healthcare"
  | "industrial_light_use"
  | "other"

export type OpportunityStatus = "high_opportunity" | "moderate" | "optimized"

export type InsightPreview = {
  id: string
  title: string
  monthlySavingsValue: number
}

export type MissionPreview = {
  id: string
  title: string
  status: "open" | "in_progress" | "completed"
}

export type EquipmentItem = {
  id: string
  name: string
  category: string
  annualConsumptionKwh: number
}

export type LocationRecord = {
  id: string
  name: string
  location_type: LocationType
  city: string
  country: string
  floor_area: number | null
  estimated_savings_value: number
  insights_count: number
  missions_count: number
  energy_consumption_kwh?: number
  co2_tonnes?: number
  equipment: EquipmentItem[]
  insights_preview: InsightPreview[]
  missions_preview: MissionPreview[]
}

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

const LOCATIONS_SEED: LocationRecord[] = [
  {
    id: "loc-berlin-hq",
    name: "Berlin HQ",
    location_type: "office",
    city: "Berlin",
    country: "Germany",
    floor_area: 6400,
    estimated_savings_value: 5400,
    insights_count: 12,
    missions_count: 7,
    energy_consumption_kwh: 76500,
    co2_tonnes: 17.9,
    equipment: [
      {
        id: "eq-ber-1",
        name: "HVAC Unit A",
        category: "HVAC",
        annualConsumptionKwh: 102000,
      },
      {
        id: "eq-ber-2",
        name: "Lighting Circuit 3",
        category: "Lighting",
        annualConsumptionKwh: 41500,
      },
    ],
    insights_preview: [
      {
        id: "ins-ber-1",
        title: "Reduce HVAC night setpoint drift",
        monthlySavingsValue: 1500,
      },
      {
        id: "ins-ber-2",
        title: "Optimize meeting-floor lighting schedules",
        monthlySavingsValue: 950,
      },
      {
        id: "ins-ber-3",
        title: "Eliminate weekend base-load spikes",
        monthlySavingsValue: 680,
      },
    ],
    missions_preview: [
      {
        id: "mis-ber-1",
        title: "Reprogram AHU occupancy profile",
        status: "in_progress",
      },
      {
        id: "mis-ber-2",
        title: "Install LED sensor controls",
        status: "open",
      },
      {
        id: "mis-ber-3",
        title: "Validate demand-response fallback",
        status: "completed",
      },
    ],
  },
  {
    id: "loc-stockholm-r1",
    name: "Stockholm Retail North",
    location_type: "retail",
    city: "Stockholm",
    country: "Sweden",
    floor_area: 2200,
    estimated_savings_value: 3800,
    insights_count: 9,
    missions_count: 4,
    energy_consumption_kwh: 48900,
    co2_tonnes: 9.6,
    equipment: [],
    insights_preview: [
      {
        id: "ins-sto-1",
        title: "Trim refrigeration standby load",
        monthlySavingsValue: 1200,
      },
      {
        id: "ins-sto-2",
        title: "Shift defrost cycles off peak",
        monthlySavingsValue: 730,
      },
    ],
    missions_preview: [
      {
        id: "mis-sto-1",
        title: "Pilot adaptive case-temperature control",
        status: "open",
      },
      {
        id: "mis-sto-2",
        title: "Replace failing door seals",
        status: "in_progress",
      },
    ],
  },
  {
    id: "loc-oslo-hotel",
    name: "Oslo Waterfront Hotel",
    location_type: "hotel",
    city: "Oslo",
    country: "Norway",
    floor_area: 9800,
    estimated_savings_value: 2400,
    insights_count: 6,
    missions_count: 3,
    energy_consumption_kwh: 112300,
    co2_tonnes: 22.4,
    equipment: [
      {
        id: "eq-osl-1",
        name: "Boiler 2",
        category: "Heating",
        annualConsumptionKwh: 162000,
      },
    ],
    insights_preview: [
      {
        id: "ins-osl-1",
        title: "Optimize hot water recirculation loops",
        monthlySavingsValue: 840,
      },
      {
        id: "ins-osl-2",
        title: "Automate guest-room ventilation setbacks",
        monthlySavingsValue: 620,
      },
    ],
    missions_preview: [
      {
        id: "mis-osl-1",
        title: "Tune domestic hot-water temperature bands",
        status: "completed",
      },
      {
        id: "mis-osl-2",
        title: "Install occupancy-driven fan controls",
        status: "open",
      },
    ],
  },
  {
    id: "loc-milan-wh",
    name: "Milan Distribution Hub",
    location_type: "warehouse",
    city: "Milan",
    country: "Italy",
    floor_area: 12100,
    estimated_savings_value: 1200,
    insights_count: 3,
    missions_count: 2,
    energy_consumption_kwh: 31200,
    co2_tonnes: 6.5,
    equipment: [],
    insights_preview: [
      {
        id: "ins-mil-1",
        title: "Reduce compressed-air leakage hours",
        monthlySavingsValue: 390,
      },
    ],
    missions_preview: [
      {
        id: "mis-mil-1",
        title: "Rebalance zone heating controls",
        status: "open",
      },
    ],
  },
]

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function getOpportunityStatus(estimatedSavingsValue: number): OpportunityStatus {
  if (estimatedSavingsValue >= 3500) {
    return "high_opportunity"
  }

  if (estimatedSavingsValue >= 1800) {
    return "moderate"
  }

  return "optimized"
}

export function getOpportunityLabel(status: OpportunityStatus): string {
  if (status === "high_opportunity") {
    return "High opportunity"
  }

  if (status === "moderate") {
    return "Moderate"
  }

  return "Optimized"
}

export function getPortfolioLocations(): LocationRecord[] {
  return [...LOCATIONS_SEED].sort((a, b) => b.estimated_savings_value - a.estimated_savings_value)
}

export function getLocationById(locationId: string): LocationRecord | null {
  return LOCATIONS_SEED.find((location) => location.id === locationId) ?? null
}
