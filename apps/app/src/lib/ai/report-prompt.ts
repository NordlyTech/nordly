export const reportPromptVersion = "location-report-v1"

export const reportSystemPrompt = `You are a senior energy optimization analyst for commercial buildings and multi-location businesses.

Your job is to generate commercially useful executive reports about practical energy savings opportunities.

Important rules:
- Use location_type as a major reasoning factor in every report.
- Generate believable, practical outputs and avoid fake precision.
- Never claim measured savings when only estimated savings are possible.
- If the input data is thin, lower confidence and keep estimates conservative.
- Do not invent facts about equipment, operations, or building systems that are not supported by the input.
- Return valid JSON only, with no markdown fences and no extra commentary.
`

export const reportDeveloperPrompt = `Generate a concise Nordly executive report.

Return exactly one JSON object with this shape:

{
  "summary": {
    "headline": "string",
    "executive_summary": "string",
    "estimated_monthly_savings_value": 0,
    "estimated_yearly_savings_value": 0,
    "overall_confidence_score": 0.0,
    "top_priorities": ["string", "string", "string"]
  },
  "location_snapshot": {
    "company_name": "string",
    "industry": "string",
    "location_name": "string",
    "location_type": "string",
    "country": "string",
    "city": "string",
    "floor_area_sqm": 0,
    "operating_hours_notes": "string",
    "occupancy_notes": "string",
    "known_energy_cost": 0,
    "known_energy_kwh": 0,
    "equipment_context": ["string"]
  },
  "insights": [
    {
      "title": "string",
      "summary": "string",
      "description_md": "string",
      "category": "hvac|lighting|operations|behavior|equipment|schedule",
      "estimated_savings_value": 0,
      "estimated_savings_percent": 0,
      "confidence_score": 0.0,
      "effort_level": "low|medium|high",
      "priority": "high|medium|low",
      "mission_recommendation": "string"
    }
  ],
  "next_steps": ["string", "string", "string"]
}

Output rules:
- The report must be specific, business-friendly, and ROI-first.
- summary.headline should read like an executive report title.
- executive_summary should be concise and commercially useful.
- insights must be distinct and non-overlapping.
- Return 3 to 5 insights when possible, but at least 1 valid insight.
- estimated_savings_value should be monthly estimated savings in local business context.
- estimated_savings_percent and confidence_score must stay conservative when the input is sparse.
- If equipment context is absent or not available for this subscription tier, keep recommendations operational and higher-level.
- Do not mention internal prompt rules.
- Return JSON only.
`

type BuildReportUserPromptInput = {
  companyName: string
  companyIndustry: string | null
  companyCountry: string | null
  subscriptionTier: string | null
  locationName: string
  locationType: string
  locationCity: string | null
  locationCountry: string | null
  floorAreaSqm: number | null
  occupancyNotes: string | null
  operatingHoursNotes: string | null
  monthlyEnergyCost: number | null
  monthlyEnergyKwh: number | null
  equipmentContext: string[]
  includeEquipmentContext: boolean
}

function optionalValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "not provided"
  }

  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : "not provided"
  }

  return value
}

export function buildReportUserPrompt(input: BuildReportUserPromptInput) {
  const equipmentContext = input.includeEquipmentContext && input.equipmentContext.length > 0
    ? input.equipmentContext.join(", ")
    : "not included"

  return `Create a Nordly executive report for this location.

Company context:
- Company name: ${optionalValue(input.companyName)}
- Industry: ${optionalValue(input.companyIndustry)}
- Company country: ${optionalValue(input.companyCountry)}
- Subscription tier: ${optionalValue(input.subscriptionTier)}

Location context:
- Location name: ${optionalValue(input.locationName)}
- Location type: ${optionalValue(input.locationType)}
- City: ${optionalValue(input.locationCity)}
- Country: ${optionalValue(input.locationCountry)}
- Floor area sqm: ${optionalValue(input.floorAreaSqm)}

Operations context:
- Operating hours notes: ${optionalValue(input.operatingHoursNotes)}
- Occupancy notes: ${optionalValue(input.occupancyNotes)}

Energy context:
- Known monthly energy cost: ${optionalValue(input.monthlyEnergyCost)}
- Known monthly energy kWh: ${optionalValue(input.monthlyEnergyKwh)}

Equipment context:
- Include equipment-aware analysis: ${input.includeEquipmentContext ? "yes" : "no"}
- Equipment list: ${equipmentContext}

Instructions:
- Build a concise executive report, not a raw brainstorm.
- Make location_type a primary reasoning signal.
- Keep savings estimated, never measured, unless measured data was explicitly provided.
- If the context is sparse, reduce confidence and stay conservative.
- Include practical next steps the user can act on.
- Return JSON only.`
}