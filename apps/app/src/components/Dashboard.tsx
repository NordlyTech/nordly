"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Buildings,
  ChartLine,
  CheckCircle,
  Clock,
  CurrencyEur,
  Lightbulb,
  ListChecks,
  MapPin,
  RocketLaunch,
  Sparkle,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { LockedPremiumCard } from "@/components/LockedPremiumCard"
import { SavingsLeaderboard } from "@/components/dashboard/SavingsLeaderboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/data/locations.shared"
import type { DashboardActiveMission, DashboardData, DashboardRecentInsight, DashboardTopLocation } from "@/lib/data/dashboard.actions"

type DashboardProps = {
  data?: DashboardData
  errorMessage?: string
}

function formatDate(value: string | null) {
  if (!value) {
    return "Recently updated"
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function insightStatusLabel(value: DashboardRecentInsight["status"]) {
  if (value === "accepted") return "Accepted"
  if (value === "dismissed") return "Dismissed"
  if (value === "archived") return "Archived"
  return "New"
}

function missionStatusLabel(value: DashboardActiveMission["status"]) {
  if (value === "in_progress") return "In progress"
  return "Open"
}

function insightStatusClass(value: DashboardRecentInsight["status"]) {
  if (value === "accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (value === "dismissed") return "border-zinc-200 bg-zinc-100 text-zinc-600"
  if (value === "archived") return "border-slate-200 bg-slate-100 text-slate-600"
  return "border-sky-200 bg-sky-50 text-sky-700"
}

function missionStatusClass(value: DashboardActiveMission["status"]) {
  if (value === "in_progress") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-sky-200 bg-sky-50 text-sky-700"
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  helper: string
  href?: string
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
      {content}
    </div>
  )
}

function TopLocationRow({
  location,
  currencyCode,
}: {
  location: DashboardTopLocation
  currencyCode: string
}) {
  return (
    <Link
      href={`/app/locations/${location.id}`}
      className="block rounded-xl border border-border/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{location.name}</p>
            <Badge className="rounded-full bg-slate-900 px-2.5 py-1 text-white">{location.location_type_label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {location.city || "City not set"}, {location.country || "Country not set"}
          </p>
        </div>
        <p className="text-sm font-semibold text-foreground">{formatCurrency(location.estimatedSavings, currencyCode)} / month</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Insights</p>
          <p className="mt-1 font-semibold text-foreground">{formatNumber(location.insightsCount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Missions</p>
          <p className="mt-1 font-semibold text-foreground">{formatNumber(location.missionsCount)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated value</p>
          <p className="mt-1 font-semibold text-foreground">{formatCurrency(location.estimatedSavings, currencyCode)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Realized value</p>
          <p className="mt-1 font-semibold text-foreground">{formatCurrency(location.actualSavings, currencyCode)}</p>
        </div>
      </div>
    </Link>
  )
}

export function Dashboard({ data, errorMessage }: DashboardProps) {
  const router = useRouter()

  if (errorMessage) {
    return (
      <div className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-10 text-center">
            <CardContent className="mx-auto max-w-xl">
              <h2 className="text-xl font-semibold text-rose-900">Could not load dashboard</h2>
              <p className="mt-2 text-rose-700">{errorMessage}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button asChild>
                  <Link href="/app/locations">View Locations</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/app/insights">Open Insights</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const isPremium = data.company.subscriptionTier === "premium" || data.company.subscriptionTier === "enterprise"
  const companyCurrencyCode = data.company.currencyCode ?? "EUR"

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{data.company.name}</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                {data.company.industry ?? "Energy savings operations"}
                {data.company.country ? ` • ${data.company.country}` : ""}
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/app/locations">
                Portfolio overview
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="mb-6 rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings snapshot</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare pipeline estimates with user-reported realized mission outcomes.
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                Realized savings = user-reported
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
              <MetricCard
                icon={<CurrencyEur size={18} weight="duotone" />}
                label="Monthly savings"
                value={formatCurrency(data.summary.estimatedMonthlySavings, companyCurrencyCode)}
                helper="Open missions + new insights"
              />
              <MetricCard
                icon={<CheckCircle size={18} weight="duotone" />}
                label="Realized savings"
                value={formatCurrency(data.summary.realizedMonthlySavings, companyCurrencyCode)}
                helper="Completed missions with actual reports"
                href="/app/missions"
              />
              <MetricCard
                icon={<Buildings size={18} weight="duotone" />}
                label="Locations"
                value={formatNumber(data.summary.locationsCount)}
                helper="Sites in your current portfolio"
                href="/app/locations"
              />
              <MetricCard
                icon={<ChartLine size={18} weight="duotone" />}
                label="Yearly savings"
                value={formatCurrency(data.summary.estimatedYearlySavings, companyCurrencyCode)}
                helper="Projected from current monthly estimate"
              />
              <MetricCard
                icon={<Lightbulb size={18} weight="duotone" />}
                label="Active insights"
                value={formatNumber(data.summary.activeInsightsCount)}
                helper="New opportunities ready for review"
                href="/app/insights"
              />
              <MetricCard
                icon={<RocketLaunch size={18} weight="duotone" />}
                label="Open missions"
                value={formatNumber(data.summary.openMissionsCount)}
                helper={`In progress ${formatNumber(data.summary.inProgressMissionsCount)} • Completed ${formatNumber(data.summary.completedMissionsCount)}`}
                href="/app/missions"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-primary" weight="duotone" />
                  Generate AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Turn location context into practical cost-reduction opportunities for your team.
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Location type stays central to generation quality and estimated savings quality.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="h-11 border border-primary/30 bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                    onClick={() => router.push("/app/insights")}
                  >
                    Generate AI Insights
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/app/locations">Add Location</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <LockedPremiumCard />
          </div>

          {data.isEmpty ? (
            <Card className="mt-6 rounded-2xl border border-dashed border-border bg-white/95 py-10 text-center shadow-sm">
              <CardContent className="mx-auto max-w-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Buildings className="h-8 w-8" weight="duotone" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Start building your savings pipeline</h2>
                <p className="mt-3 text-muted-foreground">
                  Add your first location, then generate AI insights to turn opportunities into missions and tracked savings.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild>
                    <Link href="/app/locations">Add Location</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/app/insights">Generate AI Insights</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="border border-border bg-white">
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" weight="duotone" />
                    Top Locations
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/app/locations">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.topLocations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No locations yet. Add a location to start ranking estimated savings.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topLocations.map((location) => (
                        <TopLocationRow key={location.id} location={location} currencyCode={companyCurrencyCode} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <SavingsLeaderboard entries={data.savingsLeaderboard} isPremium={isPremium} currencyCode={companyCurrencyCode} />

                <Card className="border border-border bg-white">
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" weight="duotone" />
                      Recent Insights
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/app/insights">View all</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {data.recentInsights.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No insights yet. Generate AI insights to surface estimated savings opportunities.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.recentInsights.map((insight) => (
                          <Link
                            key={insight.id}
                            href={`/app/insights?insightId=${encodeURIComponent(insight.id)}`}
                            className="block rounded-xl border border-border/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {insight.location_name ?? "Portfolio-wide"} • {insight.category}
                                </p>
                              </div>
                              <Badge variant="outline" className={insightStatusClass(insight.status)}>
                                {insightStatusLabel(insight.status)}
                              </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                              <span className="font-medium text-foreground">
                                {formatCurrency(insight.estimated_savings_value, companyCurrencyCode)} / month estimated
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(insight.confidence_score * 100)}% confidence • {formatDate(insight.created_at)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-border bg-white">
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" weight="duotone" />
                      Active Missions
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/app/missions">View all</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {data.activeMissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Accept an insight to create a mission and start tracking execution.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.activeMissions.map((mission) => (
                          <Link
                            key={mission.id}
                            href={`/app/missions?missionId=${encodeURIComponent(mission.id)}`}
                            className="block rounded-xl border border-border/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{mission.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {mission.location_name ?? "Portfolio-wide"}
                                </p>
                              </div>
                              <Badge variant="outline" className={missionStatusClass(mission.status)}>
                                {missionStatusLabel(mission.status)}
                              </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                              <span className="font-medium text-foreground">
                                {formatCurrency(mission.expected_savings_value, companyCurrencyCode)} / month expected
                              </span>
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {formatDate(mission.created_at)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
