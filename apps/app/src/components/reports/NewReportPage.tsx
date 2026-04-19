"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, Sparkle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateReportAction } from "@/lib/actions/generateReport"
import { getReportGenerationFormContext } from "@/lib/data/reports.actions"
import { getLocationTypeLabel } from "@/lib/reports/shared"
import type { ReportGenerationFormContext } from "@/types/report"

const PROGRESS_MESSAGES = [
  "Analyzing location context",
  "Generating opportunities",
  "Estimating savings",
]

type ToastState = {
  type: "error"
  message: string
}

export function NewReportPage() {
  const router = useRouter()
  const [context, setContext] = useState<ReportGenerationFormContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [floorAreaSqm, setFloorAreaSqm] = useState("")
  const [operatingHoursNotes, setOperatingHoursNotes] = useState("")
  const [occupancyNotes, setOccupancyNotes] = useState("")
  const [monthlyEnergyCost, setMonthlyEnergyCost] = useState("")
  const [monthlyEnergyKwh, setMonthlyEnergyKwh] = useState("")
  const [generating, setGenerating] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setPageError(null)

      try {
        const nextContext = await getReportGenerationFormContext()
        setContext(nextContext)

        if (nextContext.locations.length > 0) {
          const firstLocation = nextContext.locations[0]
          setSelectedLocationId(firstLocation.id)
          setFloorAreaSqm(firstLocation.floor_area_sqm ? String(firstLocation.floor_area_sqm) : "")
          setOperatingHoursNotes(firstLocation.operating_hours_notes ?? "")
          setOccupancyNotes(firstLocation.occupancy_notes ?? "")
        }
      } catch (loadError) {
        setPageError(loadError instanceof Error ? loadError.message : "Failed to load report form.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  useEffect(() => {
    if (!context) {
      return
    }

    const selectedLocation = context.locations.find((location) => location.id === selectedLocationId)
    if (!selectedLocation) {
      return
    }

    setFloorAreaSqm(selectedLocation.floor_area_sqm ? String(selectedLocation.floor_area_sqm) : "")
    setOperatingHoursNotes(selectedLocation.operating_hours_notes ?? "")
    setOccupancyNotes(selectedLocation.occupancy_notes ?? "")
  }, [context, selectedLocationId])

  useEffect(() => {
    if (!generating) {
      setProgressIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setProgressIndex((current) => (current + 1) % PROGRESS_MESSAGES.length)
    }, 1500)

    return () => window.clearInterval(intervalId)
  }, [generating])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const selectedLocation = useMemo(() => {
    return context?.locations.find((location) => location.id === selectedLocationId) ?? null
  }, [context, selectedLocationId])

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-border/80 bg-white py-8">
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading report builder...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-8">
          <CardContent className="text-center">
            <p className="text-lg font-semibold text-rose-900">Could not open the report builder</p>
            <p className="mt-2 text-sm text-rose-700">{pageError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!context || context.locations.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-dashed border-border bg-white py-10">
          <CardContent className="text-center">
            <p className="text-2xl font-semibold text-foreground">Add a location before generating reports</p>
            <p className="mt-3 text-muted-foreground">
              Reports depend on tenant-scoped location context, and location type must be available before AI generation can run.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/app/locations">Add Location</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/reports">Back to reports</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const parseOptionalPositiveNumber = (value: string, fieldLabel: string) => {
    const normalized = value.trim()
    if (!normalized) {
      return null
    }

    const parsed = Number(normalized.replace(/,/g, ""))
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${fieldLabel} must be a positive number when provided.`)
    }

    return parsed
  }

  const handleGenerate = async () => {
    if (!selectedLocation) {
      setToast({ type: "error", message: "Please select a location." })
      return
    }

    if (!selectedLocation.location_type) {
      setToast({ type: "error", message: "Location type is required before generating a report." })
      return
    }

    try {
      const result = await generateReportAction({
        locationId: selectedLocation.id,
        floorAreaSqm: parseOptionalPositiveNumber(floorAreaSqm, "Floor area"),
        operatingHoursNotes: operatingHoursNotes.trim() || null,
        occupancyNotes: occupancyNotes.trim() || null,
        monthlyEnergyCost: parseOptionalPositiveNumber(monthlyEnergyCost, "Monthly energy cost"),
        monthlyEnergyKwh: parseOptionalPositiveNumber(monthlyEnergyKwh, "Monthly energy kWh"),
      })

      if (!result.ok) {
        setToast({ type: "error", message: result.error })
        setGenerating(false)
        return
      }

      router.push(`/app/reports/${result.reportId}`)
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Could not generate a report." })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-lg">
          {toast.message}
        </div>
      ) : null}

      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/reports" className="inline-flex items-center gap-2">
            <ArrowLeft size={14} />
            Back to reports
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Report</h1>
          <p className="mt-2 text-muted-foreground">
            Build a calm, executive-ready savings report from location context, operating notes, and conservative AI estimates.
          </p>
        </div>
        {selectedLocation ? (
          <div className="rounded-2xl border border-border/80 bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-foreground">{selectedLocation.name}</p>
            <p className="mt-1 text-muted-foreground">{getLocationTypeLabel(selectedLocation.location_type)}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl border border-border/80 bg-white">
          <CardHeader>
            <CardTitle>Context input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location_id">Location</Label>
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger id="location_id">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {context.locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} • {getLocationTypeLabel(location.location_type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="floor_area">Floor area (sqm)</Label>
                <Input id="floor_area" value={floorAreaSqm} onChange={(event) => setFloorAreaSqm(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_energy_cost">Monthly energy cost</Label>
                <Input
                  id="monthly_energy_cost"
                  value={monthlyEnergyCost}
                  onChange={(event) => setMonthlyEnergyCost(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_energy_kwh">Monthly energy kWh</Label>
              <Input
                id="monthly_energy_kwh"
                value={monthlyEnergyKwh}
                onChange={(event) => setMonthlyEnergyKwh(event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operating_hours_notes">Operating hours</Label>
              <textarea
                id="operating_hours_notes"
                value={operatingHoursNotes}
                onChange={(event) => setOperatingHoursNotes(event.target.value)}
                rows={4}
                className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupancy_notes">Occupancy notes</Label>
              <textarea
                id="occupancy_notes"
                value={occupancyNotes}
                onChange={(event) => setOccupancyNotes(event.target.value)}
                rows={4}
                className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
              <div>
                <p className="font-medium text-foreground">Generation guardrails</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nordly uses location type as a required reasoning signal and keeps all savings values estimated unless measured data exists.
                </p>
              </div>
              <Button
                className="gap-2"
                disabled={generating}
                onClick={() => {
                  setGenerating(true)
                  void handleGenerate()
                }}
              >
                <Sparkle size={16} weight="fill" />
                {generating ? PROGRESS_MESSAGES[progressIndex] : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Selected location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">{getLocationTypeLabel(selectedLocation?.location_type ?? null)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium text-foreground">{selectedLocation?.city ?? "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium text-foreground">{selectedLocation?.country ?? "Not provided"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} />
                Add equipment for deeper report accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Premium equipment context unlocks more precise recommendations, better system-level reasoning, and deeper savings visibility.
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Equipment-aware load analysis</p>
                <p>More specific retrofit opportunities</p>
                <p>Higher-confidence savings ranges where data supports it</p>
              </div>
              <Button variant="outline" className="mt-5 w-full" disabled={!context.isPremium}>
                {context.isPremium ? "Equipment support ready" : "Upgrade to Premium"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}