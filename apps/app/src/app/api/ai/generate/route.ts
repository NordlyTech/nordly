import { NextRequest, NextResponse } from "next/server"

import { generateInsightsAction } from "@/lib/actions/generateInsights"

type RequestBody = {
  location_id?: unknown
}

type ErrorResponse = {
  ok: false
  error: string
  code?: string
}

type SuccessResponse = {
  ok: true
  summary: string
  insightsCreated: number
}

/**
 * POST /api/ai/generate
 *
 * Generates AI insights for a given location.
 *
 * Request body:
 * {
 *   "location_id": "uuid-string"
 * }
 *
 * Response (success):
 * {
 *   "ok": true,
 *   "summary": "...",
 *   "insightsCreated": 4
 * }
 *
 * Response (error):
 * {
 *   "error": "Error message",
 *   "code": "MISSING_API_KEY" | "INVALID_REQUEST" | "GENERATION_FAILED" | "UNAUTHORIZED"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    let body: RequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body. Expected JSON.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      )
    }

    const locationId = body.location_id
    if (!locationId || typeof locationId !== "string" || locationId.trim() === "") {
      return NextResponse.json(
        {
          ok: false,
          error: "A valid location_id is required.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      )
    }

    const result = await generateInsightsAction(locationId.trim())

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          code: result.error.includes("configured") ? "MISSING_API_KEY" : "GENERATION_FAILED",
        },
        { status: result.error.includes("configured") ? 500 : 400 }
      )
    }

    return NextResponse.json(
      result,
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate insights right now."

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
