"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowsDownUp,
  Buildings,
  Factory,
  ForkKnife,
  GridFour,
  Hospital,
  MapPin,
  Plus,
  Sparkle,
  Table,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateInsightsAction } from "@/lib/actions/generateInsights"
import { createCompanyLocation, getCompanyLocations } from "@/lib/data/locations.actions"
import { getRegionalBootstrap } from "@/lib/data/regional.actions"
import {
  formatCurrency,
  formatNumber,
  LOCATION_TYPES,
  LOCATION_TYPE_LABELS,
  type CompanyLocationRecord,
  type CreateLocationInput,
  type LocationType,
} from "@/lib/data/locations.shared"

type ViewMode = "grid" | "table"
type SortMode = "created_desc" | "name_asc"
type OpportunityStatus = "high_opportunity" | "moderate" | "optimized"
type OpportunityFilter = "all" | OpportunityStatus

type ToastState = {
  type: "success" | "error"
  message: string
}

type AddLocationFormState = {
  name: string
  location_type: string
  city: string
  country: string
  country_code: string
  floor_area_sqm: string
  operating_hours_notes: string
}

const INITIAL_FORM_STATE: AddLocationFormState = {
  name: "",
  location_type: "",
  city: "",
  country: "",
  country_code: "",
  floor_area_sqm: "",
  operating_hours_notes: "",
}

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

function getOpportunityStatus(location: CompanyLocationRecord): OpportunityStatus {
  const area = location.floor_area_sqm ?? 0

  if (area >= 8000) {
    return "high_opportunity"
  }

  if (area >= 3000) {
    return "moderate"
  }

  return "optimized"
}

function getOpportunityLabel(status: OpportunityStatus) {
  if (status === "high_opportunity") {
    return "High opportunity"
  }

  if (status === "moderate") {
    return "Moderate"
  }

  return "Optimized"
}

function statusBadgeClass(status: OpportunityStatus) {
  if (status === "high_opportunity") {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  if (status === "moderate") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function metricLabelClass() {
  return "text-xs uppercase tracking-[0.08em] text-muted-foreground"
}

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<CompanyLocationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortMode, setSortMode] = useState<SortMode>("created_desc")
  const [filterMode, setFilterMode] = useState<OpportunityFilter>("all")

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [creatingLocation, setCreatingLocation] = useState(false)
  const [formState, setFormState] = useState<AddLocationFormState>(INITIAL_FORM_STATE)
  const [generatingLocationId, setGeneratingLocationId] = useState<string | null>(null)
  const [countryOptions, setCountryOptions] = useState<Array<{ code: string; name: string }>>([])
  const [companyDefaultCountryCode, setCompanyDefaultCountryCode] = useState<string>("")
  const [companyCurrencyCode, setCompanyCurrencyCode] = useState<string>("EUR")

  const loadLocations = async () => {
    setLoading(true)
    setPageError(null)

    try {
      const rows = await getCompanyLocations()
      setLocations(rows)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load locations."
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLocations()
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const regional = await getRegionalBootstrap()
        setCountryOptions(regional.countries.map((c) => ({ code: c.code, name: c.name })))
        const defaultCountry = regional.settings?.companyCountryCode ?? ""
        setCompanyDefaultCountryCode(defaultCountry)
        setCompanyCurrencyCode(regional.settings?.companyCurrencyCode ?? "EUR")

        if (defaultCountry) {
          const selectedCountry = regional.countries.find((c) => c.code === defaultCountry)
          setFormState((prev) => {
            if (prev.country_code) {
              return prev
            }

            return {
              ...prev,
              country_code: defaultCountry,
              country: selectedCountry?.name ?? prev.country,
            }
          })
        }
      } catch {
        // Non-fatal: forms continue to work with legacy country text only.
      }
    })()
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const summary = useMemo(() => {
    return {
      locationCount: locations.length,
      totalEstimatedSavings: locations.reduce((total, location) => total + location.expected_savings_value, 0),
      totalRealizedSavings: locations.reduce((total, location) => total + location.actual_savings_value, 0),
      totalInsights: locations.reduce((total, location) => total + location.insights_count, 0),
      totalMissions: locations.reduce((total, location) => total + location.missions_count, 0),
    }
  }, [locations])

  const visibleLocations = useMemo(() => {
    let result = [...locations]

    if (filterMode !== "all") {
      result = result.filter((location) => getOpportunityStatus(location) === filterMode)
    }

    if (sortMode === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result.sort((a, b) => {
        const first = a.created_at ? new Date(a.created_at).getTime() : 0
        const second = b.created_at ? new Date(b.created_at).getTime() : 0
        return second - first
      })
    }

    return result
  }, [locations, filterMode, sortMode])

  const resetForm = () => {
    setFormState({
      ...INITIAL_FORM_STATE,
      country_code: companyDefaultCountryCode,
      country: countryOptions.find((entry) => entry.code === companyDefaultCountryCode)?.name ?? "",
    })
  }

  const handleCreateLocation = async () => {
    const name = formState.name.trim()
    const selectedType = formState.location_type.trim()

    if (!name) {
      setToast({ type: "error", message: "Location name is required." })
      return
    }

    if (!selectedType || !LOCATION_TYPES.includes(selectedType as LocationType)) {
      setToast({ type: "error", message: "Location type is required." })
      return
    }

    const areaRaw = formState.floor_area_sqm.trim()
    let floorArea: number | null = null

    if (areaRaw.length > 0) {
      const parsed = Number(areaRaw.replace(/,/g, ""))

      if (!Number.isFinite(parsed) || parsed <= 0) {
        setToast({ type: "error", message: "Floor area must be a positive number when provided." })
        return
      }

      floorArea = parsed
    }

    const payload: CreateLocationInput = {
      name,
      location_type: selectedType as LocationType,
      city: formState.city.trim(),
      country: formState.country.trim(),
      country_code: formState.country_code.trim() || undefined,
      floor_area_sqm: floorArea,
      operating_hours_notes: formState.operating_hours_notes.trim(),
    }

    setCreatingLocation(true)

    try {
      await createCompanyLocation(payload)
      router.refresh()
      setAddDialogOpen(false)
      resetForm()
      await loadLocations()
      setToast({ type: "success", message: "Location created successfully." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create location."
      setToast({ type: "error", message })
    } finally {
      setCreatingLocation(false)
    }
  }

  const renderHeader = () => (
    <div className="mb-6 flex flex-wrap items-start justify-end gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setFilterMode("all")}>
          Filter
        </Button>
        <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
          <SelectTrigger className="w-[200px] bg-white">
            <ArrowsDownUp className="h-4 w-4" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Sort: Newest first</SelectItem>
            <SelectItem value="name_asc">Sort: Name A-Z</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2 px-5" onClick={() => setAddDialogOpen(true)}>
          <Plus size={16} weight="bold" />
          Add Location
        </Button>
      </div>
    </div>
  )

  const renderSummary = () => (
    <Card className="mb-6 rounded-2xl border border-border/80 bg-white/95 py-4 shadow-sm">
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div>
          <p className={metricLabelClass()}>Locations</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{summary.locationCount}</p>
        </div>
        <div>
          <p className={metricLabelClass()}>Expected monthly savings</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(summary.totalEstimatedSavings, companyCurrencyCode)}</p>
        </div>
        <div>
          <p className={metricLabelClass()}>Actual monthly savings</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(summary.totalRealizedSavings, companyCurrencyCode)}</p>
        </div>
        <div>
          <p className={metricLabelClass()}>Total insights</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatNumber(summary.totalInsights)}</p>
        </div>
        <div>
          <p className={metricLabelClass()}>Total missions</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatNumber(summary.totalMissions)}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {renderHeader()}
        <Card className="rounded-2xl border border-border/80 bg-white py-10">
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading locations...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
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

        {renderHeader()}

        {pageError ? (
          <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-10 text-center">
            <CardContent className="mx-auto max-w-xl">
              <h2 className="text-xl font-semibold text-rose-900">Could not load locations</h2>
              <p className="mt-2 text-rose-700">{pageError}</p>
              <Button className="mt-5" onClick={() => void loadLocations()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : locations.length === 0 ? (
          <div>
            {renderSummary()}
            <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center shadow-sm">
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                No locations yet. Add your first location to start discovering savings opportunities.
              </p>
              <Button className="mt-6 gap-2" onClick={() => setAddDialogOpen(true)}>
                <Plus size={16} weight="bold" />
                Add Location
              </Button>
            </div>
          </div>
        ) : (
          <>
            {renderSummary()}

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-slate-300 bg-slate-50 px-3 py-1 text-slate-700">
                  Portfolio View
                </Badge>
                <Select value={filterMode} onValueChange={(value) => setFilterMode(value as OpportunityFilter)}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Opportunity filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All opportunity levels</SelectItem>
                    <SelectItem value="high_opportunity">High opportunity</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="optimized">Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="inline-flex rounded-lg border border-border bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "grid" ? "bg-slate-900 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GridFour size={16} />
                  Grid view
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "table" ? "bg-slate-900 text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Table size={16} />
                  Table view
                </button>
              </div>
            </div>

            {visibleLocations.length === 0 ? (
              <Card className="rounded-2xl border border-dashed border-border py-10">
                <CardContent className="text-center">
                  <p className="text-base font-medium text-foreground">No locations match the current filter.</p>
                  <p className="mt-2 text-sm text-muted-foreground">Try another opportunity level or reset filters.</p>
                </CardContent>
              </Card>
            ) : null}

            {visibleLocations.length > 0 && viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleLocations.map((location) => {
                  const locationStatus = getOpportunityStatus(location)
                  const TypeIcon = getLocationTypeIcon(location.location_type)

                  return (
                    <Card key={location.id} className="gap-4 rounded-2xl border border-border/80 bg-white py-4 shadow-sm">
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">
                            <TypeIcon size={14} weight="fill" />
                            {LOCATION_TYPE_LABELS[location.location_type]}
                          </Badge>
                          <Badge variant="outline" className={statusBadgeClass(locationStatus)}>
                            {getOpportunityLabel(locationStatus)}
                          </Badge>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-foreground">{location.name}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {location.city || "City not set"}, {location.country || "Country not set"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={metricLabelClass()}>Expected / month</p>
                            <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(location.expected_savings_value, companyCurrencyCode)}</p>
                          </div>
                          <div>
                            <p className={metricLabelClass()}>Actual / month</p>
                            <p className="mt-1 text-base font-medium text-foreground">{formatCurrency(location.actual_savings_value, companyCurrencyCode)}</p>
                          </div>
                          <div>
                            <p className={metricLabelClass()}>Insights</p>
                            <p className="mt-1 text-base font-medium text-foreground">{formatNumber(location.insights_count)}</p>
                          </div>
                          <div>
                            <p className={metricLabelClass()}>Missions</p>
                            <p className="mt-1 text-base font-medium text-foreground">{formatNumber(location.missions_count)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/app/locations/${location.id}`}>View details</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-2"
                            disabled={generatingLocationId === location.id}
                            onClick={() => {
                              void (async () => {
                                setGeneratingLocationId(location.id)
                                try {
                                  const result = await generateInsightsAction(location.id)
                                  if (!result.ok) {
                                    setToast({ type: "error", message: result.error })
                                    return
                                  }

                                  router.refresh()
                                  setToast({
                                    type: "success",
                                    message: `Generated ${result.insightsCreated} insights successfully.`,
                                  })
                                  await loadLocations()
                                } catch (error) {
                                  const message = error instanceof Error ? error.message : "Failed to generate insights."
                                  setToast({ type: "error", message })
                                } finally {
                                  setGeneratingLocationId(null)
                                }
                              })()
                            }}
                          >
                            <Sparkle size={14} weight="fill" />
                            {generatingLocationId === location.id ? "Generating..." : "Generate AI Insights"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : null}

            {visibleLocations.length > 0 && viewMode === "table" ? (
              <Card className="overflow-hidden rounded-2xl border border-border/80 bg-white py-0 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Location</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">City / Country</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Estimated savings</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Insights</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Missions</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLocations.map((location) => {
                        const TypeIcon = getLocationTypeIcon(location.location_type)
                        const locationStatus = getOpportunityStatus(location)

                        return (
                          <tr key={location.id} className="border-t border-border/70">
                            <td className="px-4 py-3">
                              <Badge className="rounded-full bg-slate-900 px-2.5 py-1 text-white">
                                <TypeIcon size={12} weight="fill" />
                                {LOCATION_TYPE_LABELS[location.location_type]}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">{location.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {location.city || "City not set"}, {location.country || "Country not set"}
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {formatCurrency(location.expected_savings_value, companyCurrencyCode)}
                              <span className="block text-xs text-muted-foreground">
                                Actual: {formatCurrency(location.actual_savings_value, companyCurrencyCode)}
                              </span>
                            </td>
                            <td className="px-4 py-3">{formatNumber(location.insights_count)}</td>
                            <td className="px-4 py-3">{formatNumber(location.missions_count)}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={statusBadgeClass(locationStatus)}>
                                {getOpportunityLabel(locationStatus)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/app/locations/${location.id}`}>View details</Link>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}
          </>
        )}
      </div>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>
              Add a new site to your portfolio. Location type is required and drives AI recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="location-name">Name</Label>
              <Input
                id="location-name"
                placeholder="Berlin HQ"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location-type">Location type</Label>
              <Select
                value={formState.location_type}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, location_type: value }))}
              >
                <SelectTrigger id="location-type" className="w-full bg-white">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {LOCATION_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location-city">City</Label>
                <Input
                  id="location-city"
                  placeholder="Berlin"
                  value={formState.city}
                  onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location-country">Country</Label>
                <Select
                  value={formState.country_code}
                  onValueChange={(value) => {
                    const selectedCountry = countryOptions.find((entry) => entry.code === value)
                    setFormState((prev) => ({
                      ...prev,
                      country_code: value,
                      country: selectedCountry?.name ?? prev.country,
                    }))
                  }}
                >
                  <SelectTrigger id="location-country" className="w-full bg-white">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location-floor-area">Floor area (sqm)</Label>
              <Input
                id="location-floor-area"
                placeholder="6400"
                value={formState.floor_area_sqm}
                onChange={(event) => setFormState((prev) => ({ ...prev, floor_area_sqm: event.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location-hours-notes">Operating hours notes</Label>
              <Input
                id="location-hours-notes"
                placeholder="Mon-Fri 08:00-18:00"
                value={formState.operating_hours_notes}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    operating_hours_notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={creatingLocation}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateLocation()} disabled={creatingLocation}>
              {creatingLocation ? "Saving..." : "Save Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
