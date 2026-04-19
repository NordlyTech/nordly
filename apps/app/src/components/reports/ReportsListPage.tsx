"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarBlank, MapPin, PresentationChart, Sparkle } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getReports } from "@/lib/data/reports.actions"
import { confidenceLabel, formatReportDate, getLocationTypeLabel } from "@/lib/reports/shared"
import { formatCurrency } from "@/lib/data/locations.shared"
import type { ReportListRecord } from "@/types/report"

function confidenceBadgeClass(score: number) {
  if (score >= 0.8) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (score >= 0.6) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-slate-200 bg-slate-100 text-slate-700"
}

export function ReportsListPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportListRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const rows = await getReports()
        setReports(rows)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load reports.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const summary = useMemo(() => {
    return {
      reportCount: reports.length,
      monthlySavings: reports.reduce((total, report) => total + report.estimated_monthly_savings_value, 0),
      highConfidence: reports.filter((report) => report.overall_confidence_score >= 0.8).length,
    }
  }, [reports])

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card className="rounded-2xl border border-border/80 bg-white py-8">
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading reports...</p>
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
            <p className="text-lg font-semibold text-rose-900">Could not load reports</p>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Reports</h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Executive AI reports built from tenant-scoped location context and estimated savings opportunities.
          </p>
        </div>
        <Button className="gap-2" size="lg" onClick={() => router.push("/app/reports/new")}>
          <Sparkle size={16} weight="fill" />
          Generate Report
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-white py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Generated reports</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{summary.reportCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/80 bg-white py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Estimated monthly savings</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(summary.monthlySavings)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/80 bg-white py-4">
          <CardContent>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">High-confidence reports</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{summary.highConfidence}</p>
          </CardContent>
        </Card>
      </div>

      {reports.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border bg-white/95 py-10 text-center shadow-sm">
          <CardContent className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PresentationChart className="h-8 w-8" weight="duotone" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Generate your first executive report</h2>
            <p className="mt-3 text-muted-foreground">
              Select a location, enrich the operational context, and turn AI recommendations into a business-ready savings report.
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => router.push("/app/reports/new")}>Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/app/reports/${report.id}`}
              className="block rounded-2xl border border-border/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <Card className="h-full rounded-2xl border-0 py-0 shadow-none hover:shadow-none">
                <CardHeader className="pb-3 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl text-foreground">{report.title}</CardTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />
                          {report.location_name ?? "Portfolio-wide"}
                        </span>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                          {getLocationTypeLabel(report.location_type)}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className={confidenceBadgeClass(report.overall_confidence_score)}>
                      {confidenceLabel(report.overall_confidence_score)} confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Monthly savings</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {formatCurrency(report.estimated_monthly_savings_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Yearly savings</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {formatCurrency(report.estimated_yearly_savings_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Generated</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                        <CalendarBlank size={14} />
                        {formatReportDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}