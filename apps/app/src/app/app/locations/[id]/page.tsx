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
import { generateInsightsAction } from "@/lib/actions/generateInsights"
import {
  createManualBillingRecord,
  getLocationBillingRecords,
  getLocationEnergyBaseline,
  type BillingRecord,
  type LocationEnergyBaseline,
} from "@/lib/data/billing-records.actions"
import { getCompanyLocationById } from "@/lib/data/locations.actions"
import { getCompanyRegionalSettings } from "@/lib/data/regional.actions"
import {
  formatCurrency,
  formatNumber,
  LOCATION_TYPE_LABELS,
  type CompanyLocationRecord,
  type LocationType,
} from "@/lib/data/locations.shared"

type LocationTab = "overview" | "billing"

type BillingFormState = {
  billing_period_start: string
  billing_period_end: string
  energy_kwh: string
  energy_cost: string
  currency_code: string
}

const INITIAL_BILLING_FORM_STATE: BillingFormState = {
  billing_period_start: "",
  billing_period_end: "",
  energy_kwh: "",
  energy_cost: "",
  currency_code: "EUR",
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

function getOpportunityLabel(location: CompanyLocationRecord) {
  const area = location.floor_area_sqm ?? 0

  if (area >= 8000) return "High opportunity"
  if (area >= 3000) return "Moderate"
  return "Optimized"
}

function getDataQualityBadge(location: CompanyLocationRecord) {
  if (location.billing_records_count > 0) {
    return {
      label: "Based on real data",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    }
  }

  return {
    label: "Estimated",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  }
}

function formatBillingPeriod(record: BillingRecord) {
  if (!record.billing_period_start) {
    return "Unknown period"
  }

  const start = new Date(`${record.billing_period_start}T00:00:00.000Z`)
  if (Number.isNaN(start.getTime())) {
    return record.billing_period_start
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(start)
}

function formatSourceType(sourceType: BillingRecord["source_type"]) {
  if (!sourceType) {
    return "Unknown"
  }

  return sourceType.charAt(0).toUpperCase() + sourceType.slice(1)
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
  const [companyCurrencyCode, setCompanyCurrencyCode] = useState<string>("EUR")
  const [activeTab, setActiveTab] = useState<LocationTab>("overview")
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [billingBaseline, setBillingBaseline] = useState<LocationEnergyBaseline | null>(null)
  const [billingLoading, setBillingLoading] = useState(true)
  const [addBillOpen, setAddBillOpen] = useState(false)
  const [savingBill, setSavingBill] = useState(false)
  const [billingForm, setBillingForm] = useState<BillingFormState>(INITIAL_BILLING_FORM_STATE)

  const loadLocation = async () => {
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

  const loadBilling = async () => {
    if (!locationId) {
      setBillingRecords([])
      setBillingBaseline(null)
      setBillingLoading(false)
      return
    }

    setBillingLoading(true)

    try {
      const [records, baseline] = await Promise.all([
        getLocationBillingRecords(locationId, 24),
        getLocationEnergyBaseline(locationId),
      ])

      setBillingRecords(records)
      setBillingBaseline(baseline)
    } catch (billingError) {
      const message = billingError instanceof Error ? billingError.message : "Failed to load billing records."
      setToast({ type: "error", message })
    } finally {
      setBillingLoading(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    void loadLocation()
    void loadBilling()
  }, [locationId])

  useEffect(() => {
    void (async () => {
      try {
        const settings = await getCompanyRegionalSettings()
        if (settings?.companyCurrencyCode) {
          const resolvedCurrencyCode = settings.companyCurrencyCode ?? "EUR"
          setCompanyCurrencyCode(resolvedCurrencyCode)
          setBillingForm((prev) => ({
            ...prev,
            currency_code: prev.currency_code.trim() ? prev.currency_code : resolvedCurrencyCode,
          }))
        }
      } catch {
        // Non-fatal; default EUR formatting remains.
      }
    })()
  }, [])

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
  const dataQualityBadge = getDataQualityBadge(location)

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
            <Badge variant="outline" className={dataQualityBadge.className}>
              {dataQualityBadge.label}
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
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(monthlySavings, companyCurrencyCode)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Actual monthly savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(location.actual_savings_value, companyCurrencyCode)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Expected yearly savings</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(yearlySavings, companyCurrencyCode)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Insights</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(location.insights_count)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Missions: {formatNumber(location.missions_count)} · Bills: {formatNumber(location.billing_records_count)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-border bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview" ? "bg-slate-900 text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "billing" ? "bg-slate-900 text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Billing
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
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
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-muted-foreground">Fallback monthly kWh</span>
                  <span className="font-medium text-foreground">
                    {location.monthly_energy_kwh !== null ? formatNumber(location.monthly_energy_kwh) : "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-muted-foreground">Fallback monthly cost</span>
                  <span className="font-medium text-foreground">
                    {location.monthly_energy_cost !== null ? formatCurrency(location.monthly_energy_cost, companyCurrencyCode) : "Not provided"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Billing records</h2>
              <p className="text-sm text-muted-foreground">Use real utility data to improve savings estimates and AI quality.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled>
                Upload CSV
              </Button>
              <Button variant="outline" disabled>
                Upload PDF
              </Button>
              <Button className="gap-2" onClick={() => setAddBillOpen(true)}>
                <Plus size={14} weight="bold" />
                Add bill
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-2xl py-4">
              <CardContent>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Average monthly kWh</p>
                <p className="mt-2 text-2xl font-semibold">
                  {billingBaseline?.avg_kwh !== null && billingBaseline?.avg_kwh !== undefined
                    ? formatNumber(billingBaseline.avg_kwh)
                    : "-"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl py-4">
              <CardContent>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Average monthly cost</p>
                <p className="mt-2 text-2xl font-semibold">
                  {billingBaseline?.avg_cost !== null && billingBaseline?.avg_cost !== undefined
                    ? formatCurrency(billingBaseline.avg_cost, companyCurrencyCode)
                    : "-"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl py-4">
              <CardContent>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Cost per kWh</p>
                <p className="mt-2 text-2xl font-semibold">
                  {billingBaseline?.cost_per_kwh !== null && billingBaseline?.cost_per_kwh !== undefined
                    ? formatCurrency(billingBaseline.cost_per_kwh, companyCurrencyCode)
                    : "-"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl py-4">
              <CardContent>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Data points</p>
                <p className="mt-2 text-2xl font-semibold">{formatNumber(billingBaseline?.data_points_count ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl py-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Month</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">kWh</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Cost</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {billingLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={4}>Loading billing records...</td>
                    </tr>
                  ) : billingRecords.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted-foreground" colSpan={4}>No billing records yet. Add a bill to improve AI accuracy.</td>
                    </tr>
                  ) : (
                    billingRecords.map((record) => (
                      <tr key={record.id} className="border-t border-border/70">
                        <td className="px-4 py-3 font-medium text-foreground">{formatBillingPeriod(record)}</td>
                        <td className="px-4 py-3 text-foreground">
                          {record.energy_kwh !== null ? formatNumber(record.energy_kwh) : "-"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {record.energy_cost !== null ? formatCurrency(record.energy_cost, record.currency_code || companyCurrencyCode) : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatSourceType(record.source_type)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <Dialog open={addBillOpen} onOpenChange={setAddBillOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add bill</DialogTitle>
            <DialogDescription>Add a billing record for this location. Manual entries are tagged as manual source data.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="billing-period-start">Billing period start</Label>
                <Input
                  id="billing-period-start"
                  type="date"
                  value={billingForm.billing_period_start}
                  onChange={(event) => setBillingForm((prev) => ({ ...prev, billing_period_start: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing-period-end">Billing period end</Label>
                <Input
                  id="billing-period-end"
                  type="date"
                  value={billingForm.billing_period_end}
                  onChange={(event) => setBillingForm((prev) => ({ ...prev, billing_period_end: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="billing-energy-kwh">Energy kWh</Label>
                <Input
                  id="billing-energy-kwh"
                  type="number"
                  min="0"
                  step="0.01"
                  value={billingForm.energy_kwh}
                  onChange={(event) => setBillingForm((prev) => ({ ...prev, energy_kwh: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billing-energy-cost">Energy cost</Label>
                <Input
                  id="billing-energy-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={billingForm.energy_cost}
                  onChange={(event) => setBillingForm((prev) => ({ ...prev, energy_cost: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing-currency-code">Currency code</Label>
              <Input
                id="billing-currency-code"
                placeholder="EUR"
                maxLength={3}
                value={billingForm.currency_code}
                onChange={(event) =>
                  setBillingForm((prev) => ({
                    ...prev,
                    currency_code: event.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBillOpen(false)} disabled={savingBill}>
              Cancel
            </Button>
            <Button
              disabled={savingBill}
              onClick={() => {
                void (async () => {
                  const energyKwh = Number(billingForm.energy_kwh)
                  const energyCost = Number(billingForm.energy_cost)

                  if (!billingForm.billing_period_start || !billingForm.billing_period_end) {
                    setToast({ type: "error", message: "Billing period start and end are required." })
                    return
                  }

                  if (!Number.isFinite(energyKwh) || energyKwh < 0) {
                    setToast({ type: "error", message: "Energy kWh must be zero or greater." })
                    return
                  }

                  if (!Number.isFinite(energyCost) || energyCost < 0) {
                    setToast({ type: "error", message: "Energy cost must be zero or greater." })
                    return
                  }

                  if (!billingForm.currency_code.trim() || billingForm.currency_code.trim().length !== 3) {
                    setToast({ type: "error", message: "Currency code must be a 3-letter ISO code." })
                    return
                  }

                  setSavingBill(true)

                  try {
                    await createManualBillingRecord({
                      locationId: location.id,
                      billingPeriodStart: billingForm.billing_period_start,
                      billingPeriodEnd: billingForm.billing_period_end,
                      energyKwh,
                      energyCost,
                      currencyCode: billingForm.currency_code.trim().toUpperCase(),
                    })

                    setAddBillOpen(false)
                    setBillingForm({
                      ...INITIAL_BILLING_FORM_STATE,
                      currency_code: companyCurrencyCode,
                    })
                    await Promise.all([loadLocation(), loadBilling()])
                    setToast({ type: "success", message: "Billing record added successfully." })
                  } catch (saveError) {
                    const message = saveError instanceof Error ? saveError.message : "Failed to add billing record."
                    setToast({ type: "error", message })
                  } finally {
                    setSavingBill(false)
                  }
                })()
              }}
            >
              {savingBill ? "Saving..." : "Save bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
