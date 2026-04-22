import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  acceptAdminInsightAsMission,
  deleteAdminInsight,
  getAdminInsights,
  updateAdminInsight,
} from "@/lib/data/admin.actions"

type InsightsAdminPageProps = {
  searchParams: Promise<{ notice?: string; edit?: string }>
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

export default async function AdminInsightsPage({ searchParams }: InsightsAdminPageProps) {
  const resolvedSearchParams = await searchParams
  const insights = await getAdminInsights()
  const editingInsight = insights.find((item) => item.id === resolvedSearchParams.edit)

  async function updateAction(formData: FormData) {
    "use server"

    const insightId = String(formData.get("insightId") ?? "").trim()
    const title = String(formData.get("title") ?? "")
    const summary = String(formData.get("summary") ?? "")
    const status = String(formData.get("status") ?? "new")

    try {
      await updateAdminInsight({ insightId, title, summary, status })
      redirect("/admin/insights?notice=Insight+updated")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update insight"
      redirect(`/admin/insights?notice=${encodeURIComponent(message)}&edit=${encodeURIComponent(insightId)}`)
    }
  }

  async function deleteAction(formData: FormData) {
    "use server"

    const insightId = String(formData.get("insightId") ?? "").trim()

    try {
      await deleteAdminInsight(insightId)
      redirect("/admin/insights?notice=Insight+deleted")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete insight"
      redirect(`/admin/insights?notice=${encodeURIComponent(message)}`)
    }
  }

  async function acceptAction(formData: FormData) {
    "use server"

    const insightId = String(formData.get("insightId") ?? "").trim()

    try {
      await acceptAdminInsightAsMission(insightId)
      redirect("/admin/insights?notice=Insight+accepted+as+mission")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept insight"
      redirect(`/admin/insights?notice=${encodeURIComponent(message)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Insights Moderation</h1>
        <p className="mt-1 text-sm text-slate-500">Review, edit, delete, and promote insights into missions.</p>
      </div>

      {resolvedSearchParams.notice ? (
        <Card className="rounded-2xl border-slate-200 bg-slate-50 py-3">
          <CardContent>
            <p className="text-sm text-slate-700">{resolvedSearchParams.notice}</p>
          </CardContent>
        </Card>
      ) : null}

      {editingInsight ? (
        <Card className="rounded-2xl border-slate-200 py-4">
          <CardHeader>
            <CardTitle className="text-base">Edit insight</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="insightId" value={editingInsight.id} />
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Title</label>
                <input
                  name="title"
                  defaultValue={editingInsight.title}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Summary</label>
                <textarea
                  name="summary"
                  defaultValue={editingInsight.summary}
                  className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Status</label>
                <select
                  name="status"
                  defaultValue={editingInsight.status}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="new">new</option>
                  <option value="accepted">accepted</option>
                  <option value="dismissed">dismissed</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">Save changes</Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href="/admin/insights">Cancel</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-slate-200 py-0">
        <CardHeader className="border-b border-slate-200 py-4">
          <CardTitle className="text-base">Insights</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Insight</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Savings</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {insights.map((insight) => (
                  <tr key={insight.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{insight.title}</p>
                      <p className="mt-1 max-w-md truncate text-xs text-slate-500">{insight.summary}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{insight.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{insight.locationName ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{insight.status}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(insight.estimatedSavingsValue)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(insight.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/admin/insights?edit=${insight.id}`}>Edit</a>
                        </Button>
                        <form action={deleteAction}>
                          <input type="hidden" name="insightId" value={insight.id} />
                          <Button size="sm" variant="outline" type="submit">Delete</Button>
                        </form>
                        <form action={acceptAction}>
                          <input type="hidden" name="insightId" value={insight.id} />
                          <Button size="sm" type="submit">Accept as mission</Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {insights.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={7}>
                      No insights found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
