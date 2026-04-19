import { NextRequest, NextResponse } from "next/server"

import { generateReportAction } from "@/lib/actions/generateReport"

type RequestBody = {
  location_id?: unknown
  floor_area_sqm?: unknown
  operating_hours_notes?: unknown
  occupancy_notes?: unknown
  monthly_energy_cost?: unknown
  monthly_energy_kwh?: unknown
}

type ErrorResponse = {
  ok: false
  error: string
  code?: string
}

type SuccessResponse = {
  ok: true
  reportId: string
  generationId: string | null
  title: string
}

function asOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function asOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    let body: RequestBody

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body. Expected JSON.", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    const locationId = asOptionalString(body.location_id)
    if (!locationId) {
      return NextResponse.json(
        { ok: false, error: "A valid location_id is required.", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    const result = await generateReportAction({
      locationId,
      floorAreaSqm: asOptionalNumber(body.floor_area_sqm),
      operatingHoursNotes: asOptionalString(body.operating_hours_notes),
      occupancyNotes: asOptionalString(body.occupancy_notes),
      monthlyEnergyCost: asOptionalNumber(body.monthly_energy_cost),
      monthlyEnergyKwh: asOptionalNumber(body.monthly_energy_kwh),
    })

    if (!result.ok) {
      const message = result.error.toLowerCase()
      const status = message.includes("logged in") ? 401 : message.includes("configured") ? 500 : 400
      const code = message.includes("logged in")
        ? "UNAUTHORIZED"
        : message.includes("configured")
          ? "MISSING_API_KEY"
          : "GENERATION_FAILED"

      return NextResponse.json({ ok: false, error: result.error, code }, { status })
    }

    return NextResponse.json(
      {
        ok: true,
        reportId: result.reportId,
        generationId: result.generationId,
        title: result.title,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate a report right now."

    return NextResponse.json(
      {
        ok: false,
        error: message,
        code: message.includes("logged in") ? "UNAUTHORIZED" : "GENERATION_FAILED",
      },
      { status: message.includes("logged in") ? 401 : 400 }
    )
  }
}