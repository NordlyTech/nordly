import { pdf } from "@react-pdf/renderer"
import { NextResponse, type NextRequest } from "next/server"

import { buildReportPdfDocument } from "@/components/reports/ReportPdfDocument"
import { getReportById } from "@/lib/data/reports.actions"
import { slugifyFileName } from "@/lib/reports/shared"

export const dynamic = "force-dynamic"

function isWebReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof value === "object" && value !== null && "getReader" in value
}

function isAsyncIterable(value: unknown): value is AsyncIterable<Uint8Array | ArrayBuffer | string> {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value
}

function toUint8Array(value: Uint8Array | ArrayBuffer | string) {
  if (value instanceof Uint8Array) {
    return value
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value)
  }

  return new TextEncoder().encode(value)
}

async function streamToUint8Array(stream: unknown) {
  const chunks: Uint8Array[] = []
  let totalLength = 0

  if (isWebReadableStream(stream)) {
    const reader = stream.getReader()

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      if (value) {
        chunks.push(value)
        totalLength += value.byteLength
      }
    }
  } else if (isAsyncIterable(stream)) {
    for await (const value of stream) {
      const chunk = toUint8Array(value)
      chunks.push(chunk)
      totalLength += chunk.byteLength
    }
  } else {
    throw new Error("PDF generation returned an unsupported stream format.")
  }

  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }

  return result
}

function getStatusFromMessage(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("logged in")) {
    return 401
  }

  if (normalized.includes("not found")) {
    return 404
  }

  return 500
}

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/reports/[id]/pdf">) {
  const { id } = await ctx.params

  try {
    const report = await getReportById(id)

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 })
    }

    const fileName = `${slugifyFileName(report.title)}.pdf`
    const pdfStream = await pdf(buildReportPdfDocument(report)).toBuffer()
    const pdfBytes = await streamToUint8Array(pdfStream)

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not export PDF right now."
    console.error("[reports.pdf] Export failed", { reportId: id, error: message })

    return NextResponse.json(
      { error: "Could not export PDF right now." },
      { status: getStatusFromMessage(message) }
    )
  }
}