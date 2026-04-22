import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminCompanyDetail, regenerateLocationInsightsAsAdmin } from "@/lib/data/admin.actions"

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; notice?: string }>
}

const TAB_VALUES = ["locations", "insights", "missions"] as const

type CompanyTab = (typeof TAB_VALUES)[number]

function isTab(value: string | undefined): value is CompanyTab {
  return value !== undefined && TAB_VALUES.includes(value as CompanyTab)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default async function AdminCompanyDetailPage({ params, searchParams }: CompanyDetailPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const companyId = resolvedParams.id
  const tab: CompanyTab = isTab(resolvedSearchParams.tab) ? resolvedSearchParams.tab : "locations"

  const company = await getAdminCompanyDetail(companyId)

  if (!company) {
    notFound()
  }

  async function regenerateAction(formData: FormData) {
    "use server"

    const locationId = String(formData.get("locationId") ?? "").trim()
    const targetCompanyId = String(formData.get("companyId") ?? "").trim()

    if (!locationId || !targetCompanyId) {
      redirect(`/admin/companies/${targetCompanyId}?tab=locations&notice=Missing+location+id`)
    }

    try {
      const result = await regenerateLocationInsightsAsAdmin(locationId)
      redirect(
        `/admin/companies/${targetCompanyId}?tab=locations&notice=Generated+${result.insightsCreated}+insights`
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to regenerate insights"
      redirect(`/admin/companies/${targetCompanyId}?tab=locations&notice=${encodeURIComponent(message)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Company</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{company.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {company.country ?? "-"} · {company.industry ?? "-"} · {company.subscription ?? "free"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/companies">Back to companies</Link>
        </Button>
      </div>

      {resolvedSearchParams.notice ? (
        <Card className="rounded-2xl border-slate-200 bg-slate-50 py-3">
          <CardContent>
            <p className="text-sm text-slate-700">{resolvedSearchParams.notice}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TAB_VALUES.map((tabValue) => {
          const active = tab === tabValue
          return (
            <Link
              key={tabValue}
              href={`/admin/companies/${company.id}?tab=${tabValue}`}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tabValue[0].toUpperCase() + tabValue.slice(1)}
            </Link>
          )
        })}
      </div>

      {tab === "locations" ? (
        <Card className="rounded-2xl border-slate-200 py-0">
          <CardHeader className="border-b border-slate-200 py-4">
            <CardTitle className="text-base">Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">City</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {company.locations.map((location) => (
                    <tr key={location.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{location.name}</td>
                      <td className="px-4 py-3 text-slate-600">{location.locationType ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{location.city ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <form action={regenerateAction}>
                          <input type="hidden" name="companyId" value={company.id} />
                          <input type="hidden" name="locationId" value={location.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Regenerate AI insights
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {company.locations.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={4}>
                        No locations found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "insights" ? (
        <Card className="rounded-2xl border-slate-200 py-0">
          <CardHeader className="border-b border-slate-200 py-4">
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Savings</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {company.insights.map((insight) => (
                    <tr key={insight.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{insight.title}</td>
                      <td className="px-4 py-3 text-slate-600">{insight.status}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(insight.estimatedSavingsValue)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(insight.createdAt)}</td>
                    </tr>
                  ))}
                  {company.insights.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={4}>
                        No insights found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "missions" ? (
        <Card className="rounded-2xl border-slate-200 py-0">
          <CardHeader className="border-b border-slate-200 py-4">
            <CardTitle className="text-base">Missions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Expected Savings</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {company.missions.map((mission) => (
                    <tr key={mission.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{mission.title}</td>
                      <td className="px-4 py-3 text-slate-600">{mission.status}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(mission.expectedSavingsValue)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(mission.createdAt)}</td>
                    </tr>
                  ))}
                  {company.missions.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={4}>
                        No missions found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
