"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Buildings,
  Factory,
  ForkKnife,
  Hospital,
  MapPin,
  Plus,
  Sparkle,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateInsightsAction } from "@/lib/actions/generateInsights"
import { getCompanyLocationById } from "@/lib/data/locations.actions"
import {
  formatCurrency,
  formatNumber,
  LOCATION_TYPE_LABELS,
  type CompanyLocationRecord,
  type LocationType,
} from "@/lib/data/locations.shared"

function getLocationTypeIcon(locationType: LocationType) {
  if (locationType === "office" || locationType === "retail") {
    return Buildings
  }

  if (locationType === "hotel" || locationType === "restaurant") {
    return ForkKnife
  }

  if (locationType === "healthcare") {
    return Hospital
  }

  if (locationType === "warehouse" || locationType === "industrial_light_use") {
    return Factory
  }

  return MapPin
}

function getOpportunityLabel(location: CompanyLocationRecord) {
  const area = location.floor_area_sqm ?? 0

  if (area >= 8000) return "High opportunity"
  if (area >= 3000) return "Moderate"
  return "Optimized"
}

export default function LocationDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const locationId = typeof params?.id === "string" ? params.id : ""

  const [location, setLocation] = useState<CompanyLocationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!locationId) {
          setLocation(null)
          return
        }

        const row = await getCompanyLocationById(locationId)
        setLocation(row)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load location details."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [locationId])

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-2xl border border-border/80 bg-white py-8">
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading location details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-8">
          <CardContent className="text-center">
            <p className="text-xl font-semibold text-rose-900">Could not load location</p>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/app/locations")}>
              Back to locations
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-2xl border border-dashed border-border py-8">
          <CardContent className="text-center">
            <p className="text-lg font-semibold text-foreground">Location not found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              The requested location could not be found in your portfolio.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/app/locations">Back to locations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const TypeIcon = getLocationTypeIcon(location.location_type)
  const monthlySavings = location.expected_savings_value
  const yearlySavings = monthlySavings * 12

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {toast ? (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/locations" className="inline-flex items-center gap-2">
            <ArrowLeft size={14} />
            Back to locations
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">
              <TypeIcon size={14} weight="fill" />
              {LOCATION_TYPE_LABELS[location.location_type]}
            </Badge>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
              {getOpportunityLabel(location)}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{location.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {location.city || "City not set"}, {location.country || "Country not set"}
          </p>
        </div>

        <Button
          className="gap-2"
          disabled={generating}
          onClick={() => {
            void (async () => {
              setGenerating(true)
              try {
                const result = await generateInsightsAction(location.id)
                if (!result.ok) {
                  setToast({ type: "error", message: result.error })
                  setGenerating(false)
                  return
                }

                router.refresh()
                setToast({
                  type: "success",
                  message: `Generated ${result.insightsCreated} insights successfully.`,
                })
                router.push("/app/insights")
              } catch (genError) {
                const message = genError instanceof Error ? genError.message : "Failed to generate insights."
                setToast({ type: "error", message })
                setGenerating(false)
              }
            })()
          }}
        >
          <Sparkle size={14} weight="fill" />
          {generating ? "Generating..." : "Generate AI Insights"}
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Expected monthly savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(monthlySavings)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Actual monthly savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(location.actual_savings_value)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Expected yearly savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(yearlySavings)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Insights</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(location.insights_count)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Missions: {formatNumber(location.missions_count)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl py-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>Insights preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
              Insights preview is available once insight generation runs for this location.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-4">
          <CardHeader>
            <CardTitle>Missions preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
              Missions preview is available once accepted insights are converted to missions.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl py-4">
          <CardHeader>
            <CardTitle>Equipment (Premium)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <p className="text-sm font-semibold text-foreground">No equipment added yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add equipment to unlock better insights, more accurate savings estimates, and ROI analysis.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="outline" className="gap-2">
                  <Plus size={14} />
                  Add Equipment
                </Button>
                <Button className="gap-2">
                  <Sparkle size={14} weight="fill" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-4">
          <CardHeader>
            <CardTitle>Basic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Location type</span>
              <span className="font-medium text-foreground">{LOCATION_TYPE_LABELS[location.location_type]}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Floor area</span>
              <span className="font-medium text-foreground">
                {location.floor_area_sqm ? `${formatNumber(location.floor_area_sqm)} sqm` : "Not provided"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">City</span>
              <span className="font-medium text-foreground">{location.city || "Not provided"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium text-foreground">{location.country || "Not provided"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
