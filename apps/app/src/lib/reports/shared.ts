import { LOCATION_TYPES, LOCATION_TYPE_LABELS, type LocationType } from "@/lib/data/locations.shared"

export type RecordValue = Record<string, unknown>

const PREMIUM_TIERS = new Set(["premium", "pro", "enterprise"])

export function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => asString(entry))
    .filter((entry): entry is string => entry !== null)
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function normalizeInlineText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function sanitizeMarkdownLikeText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim()
}

export function normalizeLocationType(value: unknown): LocationType | null {
  const candidate = asString(value)

  if (candidate && LOCATION_TYPES.includes(candidate as LocationType)) {
    return candidate as LocationType
  }

  return null
}

export function getLocationTypeLabel(value: string | null) {
  if (!value) {
    return "Unknown"
  }

  const normalized = normalizeLocationType(value)
  if (!normalized) {
    return value
  }

  return LOCATION_TYPE_LABELS[normalized]
}

export function isPremiumTier(value: string | null) {
  if (!value) {
    return false
  }

  return PREMIUM_TIERS.has(value.trim().toLowerCase())
}

export function uniqueTrimmed(values: string[], limit: number) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = normalizeInlineText(value)
    const key = normalized.toLowerCase()

    if (!normalized || seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(normalized)

    if (result.length >= limit) {
      break
    }
  }

  return result
}

export function formatReportDate(value: string | null) {
  if (!value) {
    return "Recently generated"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function confidenceLabel(value: number) {
  if (value >= 0.8) {
    return "High"
  }

  if (value >= 0.6) {
    return "Medium"
  }

  return "Low"
}

export function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "nordly-report"
}

export function markdownToBlocks(markdown: string) {
  const lines = sanitizeMarkdownLikeText(markdown)
    .split("\n")
    .map((line) => line.trim())

  return {
    paragraphs: lines.filter((line) => line.length > 0 && !line.startsWith("- ")),
    bullets: lines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2).trim()),
  }
}