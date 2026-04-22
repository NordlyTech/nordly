"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, DownloadSimple, Lock, RocketLaunch } from "@phosphor-icons/react"

import { acceptInsightAction } from "@/lib/actions/acceptInsight"
import { getReportById } from "@/lib/data/reports.actions"
import {
  confidenceLabel,
  formatReportDate,
  getLocationTypeLabel,
  isPremiumTier,
  markdownToBlocks,
} from "@/lib/reports/shared"
import { formatCurrency, formatNumber } from "@/lib/data/locations.shared"
import { PremiumUnlockModal } from "@/components/premium/PremiumUnlockModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReportDetailRecord } from "@/types/report"

type ToastState = {
  type: "success" | "error"
  message: string
}

function confidenceBadgeClass(score: number) {
  if (score >= 0.8) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (score >= 0.6) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-slate-200 bg-slate-100 text-slate-700"
}

function priorityBadgeClass(priority: string) {
  if (priority === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  if (priority === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-slate-200 bg-slate-100 text-slate-700"
}

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [report, setReport] = useState<ReportDetailRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [busyInsightId, setBusyInsightId] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)

  const handleExportPdf = async () => {
    if (!report || exportingPdf) {
      return
    }

    setExportingPdf(true)

    try {
      const response = await fetch(`/api/reports/${report.id}/pdf`, { method: "GET" })

      if (!response.ok) {
        let message = "Could not export PDF right now."

        try {
          const errorPayload = await response.json()
          if (typeof errorPayload?.error === "string" && errorPayload.error.length > 0) {
            message = errorPayload.error
          }
        } catch {
          // Keep the default error message if the response body is not JSON.
        }

        throw new Error(message)
      }

      const blob = await response.blob()
      const fileName = `${(report.title || "nordly-report")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "nordly-report"}.pdf`

      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      anchor.download = fileName
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (exportError) {
      setToast({
        type: "error",
        message: exportError instanceof Error ? exportError.message : "Could not export PDF right now.",
      })
    } finally {
      setExportingPdf(false)
    }
  }

  const loadReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const nextReport = await getReportById(reportId)
      setReport(nextReport)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load report details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)

      try {
        const nextReport = await getReportById(reportId)
        setReport(nextReport)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load report details.")
      } finally {
        setLoading(false)
      }
    })()
  }, [reportId])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-border/80 bg-white py-8">
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading report...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-8">
          <CardContent className="text-center">
            <p className="text-xl font-semibold text-rose-900">Could not load report</p>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-dashed border-border bg-white py-8">
          <CardContent className="text-center">
            <p className="text-lg font-semibold text-foreground">Report not found</p>
            <p className="mt-2 text-sm text-muted-foreground">The requested report could not be found in your company workspace.</p>
            <Button className="mt-4" asChild>
              <Link href="/app/reports">Back to reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const snapshot = report.report_payload_json.location_snapshot
  const premium = isPremiumTier(report.subscription_tier)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg">
          <div
            className={toast.type === "success"
              ? "text-emerald-800"
              : "text-rose-800"}
          >
            {toast.message}
          </div>
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

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={confidenceBadgeClass(report.overall_confidence_score)}>
              {confidenceLabel(report.overall_confidence_score)} confidence
            </Badge>
            {report.location_type ? (
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                {getLocationTypeLabel(report.location_type)}
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{report.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {report.location_name ?? snapshot.location_name} • {formatReportDate(report.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={() => void handleExportPdf()} disabled={exportingPdf}>
            <DownloadSimple size={16} />
            {exportingPdf ? "Preparing PDF..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Estimated monthly savings</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(report.estimated_monthly_savings_value)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Estimated yearly savings</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(report.estimated_yearly_savings_value)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Confidence</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{Math.round(report.overall_confidence_score * 100)}%</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Top priorities</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {report.summary_json.top_priorities.slice(0, 2).join(" • ") || "No priorities available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Executive summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-foreground/90">{report.summary_json.executive_summary}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Top opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.insights.map((insight) => {
                const markdown = markdownToBlocks(insight.description_md)

                return (
                  <div key={insight.id || insight.title} className="rounded-2xl border border-border/80 bg-slate-50/60 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{insight.title}</p>
                          <Badge variant="outline" className={priorityBadgeClass(insight.priority)}>
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">{insight.category}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{insight.summary}</p>
                      </div>

                      {insight.id ? (
                        <Button
                          variant="outline"
                          className="gap-2"
                          disabled={busyInsightId === insight.id || insight.status === "accepted"}
                          onClick={() => {
                            void (async () => {
                              setBusyInsightId(insight.id)

                              try {
                                const result = await acceptInsightAction(insight.id)
                                if (!result.ok) {
                                  setToast({ type: "error", message: result.error })
                                  return
                                }

                                setToast({
                                  type: "success",
                                  message: result.alreadyExisted ? "Mission already exists for this insight." : "Mission created successfully.",
                                })

                                await loadReport()
                                router.push(`/app/missions?missionId=${result.missionId}&sourceInsightId=${insight.id}`)
                              } finally {
                                setBusyInsightId(null)
                              }
                            })()
                          }}
                        >
                          <RocketLaunch size={16} />
                          {insight.status === "accepted" ? "Mission created" : "Create Mission"}
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Estimated value</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(insight.estimated_savings_value)}</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Estimated savings</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{insight.estimated_savings_percent}%</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Effort level</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{insight.effort_level}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      {markdown.paragraphs.map((paragraph, index) => (
                        <p key={`${insight.id}-p-${index}`} className="leading-relaxed text-foreground/90">
                          {paragraph}
                        </p>
                      ))}
                      {markdown.bullets.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-5 text-foreground/85">
                          {markdown.bullets.map((bullet, index) => (
                            <li key={`${insight.id}-b-${index}`}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Location snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium text-foreground">{snapshot.company_name}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Industry</span>
                <span className="font-medium text-foreground">{snapshot.industry}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium text-foreground">{snapshot.location_name}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Location type</span>
                <span className="font-medium text-foreground">{snapshot.location_type}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium text-foreground">{snapshot.city}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Country</span>
                <span className="font-medium text-foreground">{snapshot.country}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-muted-foreground">Floor area</span>
                <span className="font-medium text-foreground">{snapshot.floor_area_sqm > 0 ? `${formatNumber(snapshot.floor_area_sqm)} sqm` : "Not provided"}</span>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-muted-foreground">Operating hours</p>
                <p className="mt-1 text-foreground">{snapshot.operating_hours_notes}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-muted-foreground">Occupancy notes</p>
                <p className="mt-1 text-foreground">{snapshot.occupancy_notes}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-muted-foreground">Known energy inputs</p>
                <p className="mt-1 text-foreground">
                  Cost: {snapshot.known_energy_cost > 0 ? formatCurrency(snapshot.known_energy_cost) : "Not provided"}
                </p>
                <p className="mt-1 text-foreground">
                  kWh: {snapshot.known_energy_kwh > 0 ? formatNumber(snapshot.known_energy_kwh) : "Not provided"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-white">
            <CardHeader>
              <CardTitle>Action plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-foreground/90">
                {report.next_steps.map((step, index) => (
                  <li key={`step-${index}`} className="rounded-xl bg-slate-50 px-4 py-3">
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {!premium ? (
            <Card className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={18} />
                  Unlock deeper savings visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add equipment to unlock more precise recommendations, stronger confidence where data supports it, and deeper savings visibility.
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Add equipment</p>
                  <p>Unlock more precise recommendations</p>
                  <p>Unlock deeper savings visibility</p>
                </div>
                <Button className="mt-5 w-full" onClick={() => setPremiumModalOpen(true)}>
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <PremiumUnlockModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} context="insight" />
    </div>
  )
}