import { pdf } from "@react-pdf/renderer"
import { NextRequest, NextResponse } from "next/server"

import { buildReportPdfDocument } from "@/components/reports/ReportPdfDocument"
import { generateReportForLocation } from "@/lib/data/reports.actions"
import { createClient } from "@/lib/supabase/server"
import type { ReportDetailRecord } from "@/types/report"

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
  title: string
  downloadUrl: string
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

async function streamToUint8Array(stream: unknown) {
  const chunks: Uint8Array[] = []
  let totalLength = 0

  if (
    typeof stream === "object" &&
    stream !== null &&
    "getReader" in stream
  ) {
    const reader = (stream as ReadableStream<Uint8Array>).getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        totalLength += value.byteLength
      }
    }
  } else if (
    typeof stream === "object" &&
    stream !== null &&
    Symbol.asyncIterator in stream
  ) {
    for await (const value of stream as AsyncIterable<Uint8Array | ArrayBuffer | string>) {
      const chunk =
        value instanceof Uint8Array
          ? value
          : value instanceof ArrayBuffer
            ? new Uint8Array(value)
            : new TextEncoder().encode(value as string)
      chunks.push(chunk)
      totalLength += chunk.byteLength
    }
  } else {
    throw new Error("Unsupported stream format")
  }

  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    let body: RequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON request body", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    const locationId = asOptionalString(body.location_id)
    if (!locationId) {
      return NextResponse.json(
        { ok: false, error: "location_id is required", code: "INVALID_REQUEST" },
        { status: 400 }
      )
    }

    // Generate report content
    const reportResult = await generateReportForLocation({
      locationId,
      floorAreaSqm: asOptionalNumber(body.floor_area_sqm),
      operatingHoursNotes: asOptionalString(body.operating_hours_notes),
      occupancyNotes: asOptionalString(body.occupancy_notes),
      monthlyEnergyCost: asOptionalNumber(body.monthly_energy_cost),
      monthlyEnergyKwh: asOptionalNumber(body.monthly_energy_kwh),
    })

    // Fetch report from DB to get full details for PDF
    const { data: reportData } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportResult.reportId)
      .single()

    if (!reportData) {
      return NextResponse.json(
        { ok: false, error: "Report not found after generation", code: "GENERATION_FAILED" },
        { status: 500 }
      )
    }

    const report = reportData as ReportDetailRecord

    // Generate PDF
    const pdfStream = await pdf(buildReportPdfDocument(report)).toBuffer()
    const pdfBytes = await streamToUint8Array(pdfStream)

    // Upload to Supabase Storage
    const fileName = `${report.id}.pdf`
    const bucketName = "reports"

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      })

    if (uploadError) {
      console.error("PDF upload error:", uploadError)
      return NextResponse.json(
        { ok: false, error: "Failed to upload PDF", code: "STORAGE_ERROR" },
        { status: 500 }
      )
    }

    // Get signed download URL (valid for 24 hours)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 86400) // 24 hours

    if (urlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", urlError)
      return NextResponse.json(
        { ok: false, error: "Failed to generate download URL", code: "STORAGE_ERROR" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        reportId: report.id,
        title: report.title,
        downloadUrl: signedUrlData.signedUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Report generation error:", error)

    return NextResponse.json(
      {
        ok: false,
        error: message,
        code: "GENERATION_FAILED",
      },
      { status: 500 }
    )
  }
}
