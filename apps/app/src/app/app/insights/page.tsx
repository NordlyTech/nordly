"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowsDownUp,
  CheckCircle,
  Circle,
  FadersHorizontal,
  Lightbulb,
  MapPin,
  RocketLaunch,
  Sparkle,
  XCircle,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  dismissInsight,
  getInsights,
  type InsightRecord,
  type InsightStatus,
} from "@/lib/data/insights-missions.actions"
import { acceptInsightAction } from "@/lib/actions/acceptInsight"
import { generateInsightsAction } from "@/lib/actions/generateInsights"
import { getCompanyLocations } from "@/lib/data/locations.actions"
import { type CompanyLocationRecord } from "@/lib/data/locations.shared"

type InsightTab = "all" | "new" | "accepted" | "dismissed" | "archived"
type SortKey = "confidence_desc" | "savings_desc" | "new_first"
type CategoryFilter = "all" | "hvac" | "lighting" | "operations" | "behavior" | "equipment" | "schedule"

const INSIGHT_TABS: Array<{ value: InsightTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "dismissed", label: "Dismissed" },
  { value: "archived", label: "Archived" },
]

type ToastState = {
  type: "success" | "error" | "info"
  message: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function getConfidenceLabel(score: number) {
  if (score >= 0.9) return "High"
  if (score >= 0.75) return "Medium"
  return "Low"
}

function renderMarkdownPreview(text: string) {
  const lines = text.split("\n").map((line) => line.trim())
  const bulletLines = lines.filter((line) => line.startsWith("- "))
  const paragraphs = lines.filter((line) => line.length > 0 && !line.startsWith("- "))

  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      {paragraphs.map((line, index) => (
        <p key={`p-${index}`} className="leading-relaxed text-foreground/90">
          {line}
        </p>
      ))}
      {bulletLines.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-foreground/85">
          {bulletLines.map((line, index) => (
            <li key={`b-${index}`}>{line.replace("- ", "")}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function InsightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedInsightId = searchParams.get("insightId")
  const [insights, setInsights] = useState<InsightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [busyInsightId, setBusyInsightId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<InsightTab>("all")
  const [sortBy, setSortBy] = useState<SortKey>("new_first")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [selectedInsight, setSelectedInsight] = useState<InsightRecord | null>(null)
  const [locations, setLocations] = useState<CompanyLocationRecord[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  const loadInsights = async () => {
    setLoading(true)
    setPageError(null)

    try {
      const rows = await getInsights(null)
      setInsights(rows)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load insights."
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInsights()
    // Load locations for the picker (non-blocking)
    getCompanyLocations()
      .then((rows) => {
        setLocations(rows)
        if (rows.length > 0 && !selectedLocationId) {
          setSelectedLocationId(rows[0].id)
        }
      })
      .catch(() => { /* non-fatal */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const summary = useMemo(() => {
    const totalSavings = insights.reduce((acc, item) => acc + item.estimated_savings_value, 0)
    const highConfidenceCount = insights.filter((item) => item.confidence_score >= 0.85).length
    const acceptedCount = insights.filter((item) => item.status === "accepted").length

    return {
      totalInsights: insights.length,
      totalSavings,
      highConfidenceCount,
      acceptedCount,
    }
  }, [insights])

  const visibleInsights = useMemo(() => {
    let result = [...insights]

    if (activeTab === "new") {
      result = result.filter((item) => item.status === "new")
    } else if (activeTab === "accepted") {
      result = result.filter((item) => item.status === "accepted")
    } else if (activeTab === "dismissed") {
      result = result.filter((item) => item.status === "dismissed")
    } else if (activeTab === "archived") {
      result = result.filter((item) => item.status === "archived")
    }

    if (categoryFilter !== "all") {
      const mappedCategory = categoryFilter.toLowerCase()
      result = result.filter((item) => item.category.toLowerCase() === mappedCategory)
    }

    if (sortBy === "confidence_desc") {
      result.sort((a, b) => b.confidence_score - a.confidence_score)
    } else if (sortBy === "savings_desc") {
      result.sort((a, b) => b.estimated_savings_value - a.estimated_savings_value)
    } else {
      const statusOrder: Record<InsightStatus, number> = {
        new: 0,
        accepted: 1,
        dismissed: 2,
        archived: 3,
      }
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    }

    return result
  }, [insights, activeTab, sortBy, categoryFilter])

  useEffect(() => {
    if (loading || !requestedInsightId) {
      return
    }

    if (insights.length === 0) {
      setToast({
        type: "error",
        message: "The requested insight could not be found. Showing your latest insights instead.",
      })
      return
    }

    const target = insights.find((item) => item.id === requestedInsightId)

    if (!target) {
      setToast({
        type: "error",
        message: "The requested insight could not be found. Showing your latest insights instead.",
      })
      return
    }

    setActiveTab("all")
    setCategoryFilter("all")
    setSelectedInsight(target)

    window.requestAnimationFrame(() => {
      document.getElementById(`insight-card-${target.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    })
  }, [insights, loading, requestedInsightId])

  const handleAccept = async (insightId: string) => {
    setBusyInsightId(insightId)

    try {
      const result = await acceptInsightAction(insightId)
      if (!result.ok) {
        setToast({ type: "error", message: "Could not accept this insight right now." })
        return
      }

      router.refresh()
      await loadInsights()
      if (result.alreadyExisted) {
        setToast({
          type: "info",
          message: "Mission already exists for this insight.",
        })
      } else {
        setToast({
          type: "success",
          message: "Mission created successfully.",
        })
      }
      setSelectedInsight(null)
      router.push(`/app/missions?missionId=${encodeURIComponent(result.missionId)}`)
    } catch (error) {
      setToast({ type: "error", message: "Could not accept this insight right now." })
    } finally {
      setBusyInsightId(null)
    }
  }

  const handleDismiss = async (insightId: string) => {
    setBusyInsightId(insightId)

    try {
      await dismissInsight(insightId)
      router.refresh()
      await loadInsights()
      setToast({ type: "success", message: "Insight dismissed." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to dismiss insight."
      setToast({ type: "error", message })
    } finally {
      setBusyInsightId(null)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {toast ? (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : toast.type === "info"
                  ? "border-sky-200 bg-sky-50 text-sky-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="mt-2 text-muted-foreground">AI-generated opportunities for your locations</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setCategoryFilter("all")
              setSortBy("new_first")
              setActiveTab("all")
            }}
            disabled={loading}
          >
            <FadersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
            <SelectTrigger className="w-[180px] bg-white">
              <ArrowsDownUp className="h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_first">Sort: New first</SelectItem>
              <SelectItem value="confidence_desc">Sort: Confidence</SelectItem>
              <SelectItem value="savings_desc">Sort: Savings</SelectItem>
            </SelectContent>
          </Select>
          {locations.length > 0 ? (
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-[200px] bg-white">
                <MapPin className="h-4 w-4" />
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button className="gap-2 px-5"
            disabled={loading || generating}
            onClick={() => {
              if (!selectedLocationId) {
                setToast({ type: "error", message: "Select a location to generate insights for." })
                return
              }
              void (async () => {
                setGenerating(true)
                try {
                  const result = await generateInsightsAction(selectedLocationId)
                  if (!result.ok) {
                    setToast({ type: "error", message: result.error })
                    return
                  }

                  router.refresh()
                  setToast({
                    type: "success",
                    message: `Generated ${result.insightsCreated} insights successfully.`,
                  })
                  await loadInsights()
                } catch (genError) {
                  const message = genError instanceof Error ? genError.message : "Failed to generate insights."
                  setToast({ type: "error", message })
                } finally {
                  setGenerating(false)
                }
              })()
            }}
          >
            <Sparkle className="h-4 w-4" weight="fill" />
            {generating ? "Generating..." : "Generate AI Insights"}
          </Button>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border border-border/80 bg-white/95 py-4 shadow-sm">
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total insights</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.totalInsights}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated monthly savings</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(summary.totalSavings)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">High-confidence insights</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.highConfidenceCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Accepted insights</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.acceptedCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {INSIGHT_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="behavior">Behavior</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pageError ? (
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-10 text-center">
          <CardContent className="mx-auto max-w-xl">
            <h2 className="text-xl font-semibold text-rose-900">Could not load insights</h2>
            <p className="mt-2 text-rose-700">{pageError}</p>
            <Button className="mt-5" onClick={() => void loadInsights()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          <Card className="rounded-2xl border border-border/80 bg-white py-8">
            <CardContent>
              <p className="text-sm text-muted-foreground">Loading insights...</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/80 bg-white py-8">
            <CardContent>
              <p className="text-sm text-muted-foreground">Fetching opportunities and estimated savings...</p>
            </CardContent>
          </Card>
        </div>
      ) : insights.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border bg-white/90 py-10 text-center">
          <CardContent className="mx-auto max-w-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lightbulb className="h-8 w-8" weight="duotone" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No insights yet</h2>
            <p className="mt-2 text-muted-foreground">
              No insights yet. Generate AI insights to discover personalized savings opportunities.
            </p>
            <Button
              className="mt-5"
              disabled={generating}
              onClick={() => {
                if (!selectedLocationId) {
                  setToast({ type: "error", message: "Select a location to generate insights for." })
                  return
                }
                void (async () => {
                  setGenerating(true)
                  try {
                    const result = await generateInsightsAction(selectedLocationId)
                      if (!result.ok) {
                      setToast({ type: "error", message: result.error })
                      return
                    }

                    router.refresh()
                    setToast({
                      type: "success",
                        message: `Generated ${result.insightsCreated} insights successfully.`,
                    })
                    await loadInsights()
                  } catch (genError) {
                    const message = genError instanceof Error ? genError.message : "Failed to generate insights."
                    setToast({ type: "error", message })
                  } finally {
                    setGenerating(false)
                  }
                })()
              }}
            >
              {generating ? "Generating..." : "Generate AI Insights"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleInsights.map((insight, index) => (
            <div key={insight.id} className="space-y-4">
              <Card
                id={`insight-card-${insight.id}`}
                className={`rounded-2xl border bg-white py-5 transition-all ${
                  requestedInsightId === insight.id
                    ? "border-primary/50 ring-2 ring-primary/20 shadow-md"
                    : "border-border/80"
                }`}
              >
                <CardContent>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                      {insight.category}
                    </Badge>

                    {insight.status === "accepted" ? (
                      <Badge className="gap-1 bg-emerald-600 text-white">
                        <CheckCircle className="h-3 w-3" weight="fill" />
                        Accepted
                      </Badge>
                    ) : insight.status === "dismissed" ? (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" weight="fill" />
                        Dismissed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Circle className="h-3 w-3" />
                        New
                      </Badge>
                    )}

                    <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground">
                      {getConfidenceLabel(insight.confidence_score)} confidence ({Math.round(insight.confidence_score * 100)}%)
                    </Badge>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{insight.title}</h2>
                      <p className="mt-2 text-sm font-medium text-foreground/90">{insight.summary}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{insight.description_md}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                          {formatCurrency(insight.estimated_savings_value)} / month
                        </span>
                        {typeof insight.estimated_savings_percent === "number" ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                            {insight.estimated_savings_percent}% estimated reduction
                          </span>
                        ) : null}
                        {insight.location_name ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {insight.location_name}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:w-[320px] lg:justify-end">
                      {insight.status === "accepted" ? (
                        <>
                          <Badge className="w-full justify-center bg-emerald-600 py-1.5 text-white lg:w-auto">
                            Accepted as mission
                          </Badge>
                          <Button
                            className="w-full gap-2 lg:w-auto"
                            onClick={() => router.push(`/app/missions?sourceInsightId=${encodeURIComponent(insight.id)}`)}
                          >
                            <RocketLaunch className="h-4 w-4" weight="duotone" />
                            View Mission
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="w-full lg:w-auto"
                            onClick={() => void handleAccept(insight.id)}
                            disabled={busyInsightId === insight.id}
                          >
                            Accept as Mission
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full lg:w-auto"
                            onClick={() => void handleDismiss(insight.id)}
                            disabled={busyInsightId === insight.id || insight.status === "archived"}
                          >
                            Dismiss
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full text-primary lg:w-auto"
                        onClick={() => setSelectedInsight(insight)}
                      >
                        View details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {index % 2 === 0 ? (
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/90">
                  Add equipment to unlock deeper recommendations and more accurate savings estimates.
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selectedInsight)} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="top-0 right-0 left-auto h-screen w-full max-w-[560px] translate-x-0 translate-y-0 rounded-none border-l border-border p-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          {selectedInsight ? (
            <div className="flex h-full flex-col bg-white">
              <DialogHeader className="border-b border-border px-6 py-5 text-left">
                <DialogTitle className="text-xl">{selectedInsight.title}</DialogTitle>
                <DialogDescription className="pt-2 text-sm text-muted-foreground">
                  {selectedInsight.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h3>
                  {renderMarkdownPreview(selectedInsight.description_md)}
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated savings</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {formatCurrency(selectedInsight.estimated_savings_value)} / month
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {getConfidenceLabel(selectedInsight.confidence_score)} ({Math.round(selectedInsight.confidence_score * 100)}%)
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedInsight.location_name ?? "Portfolio-wide"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{selectedInsight.category}</p>
                  </div>
                </section>

                <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Why Nordly suggested this</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Location type is a critical AI input. This recommendation is tuned for
                    <span className="font-medium text-foreground"> {selectedInsight.location_type ?? "this location"}</span>
                    , using the following available context:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedInsight.available_context.length > 0 ? (
                      selectedInsight.available_context.map((entry) => (
                        <Badge key={entry} variant="outline" className="bg-white text-foreground/80">
                          {entry}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional context was stored for this insight.</p>
                    )}
                  </div>
                </section>
              </div>

              {selectedInsight.status === "new" ? (
                <div className="border-t border-border px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      className="flex-1 gap-2"
                      disabled={busyInsightId === selectedInsight.id}
                      onClick={() => void handleAccept(selectedInsight.id)}
                    >
                      {busyInsightId === selectedInsight.id ? "Accepting..." : "Accept as Mission"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={busyInsightId === selectedInsight.id}
                      onClick={() => {
                        void handleDismiss(selectedInsight.id)
                        setSelectedInsight(null)
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : selectedInsight.status === "accepted" ? (
                <div className="border-t border-border px-6 py-4">
                  <Button
                    className="w-full gap-2"
                    onClick={() => router.push(`/app/missions?sourceInsightId=${encodeURIComponent(selectedInsight.id)}`)}
                  >
                    <RocketLaunch className="h-4 w-4" weight="duotone" />
                    View in Missions
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
