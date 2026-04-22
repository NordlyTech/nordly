import { redirect } from "next/navigation"

import {
  DataCell,
  DataHeaderCell,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableTable,
  EmptyState,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui/primitives"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-5">
      {resolvedSearchParams.notice ? (
        <SectionCard title="Notice" description="Latest moderation action result.">
          <div className="p-4">
            <p className="text-sm text-foreground">{resolvedSearchParams.notice}</p>
          </div>
        </SectionCard>
      ) : null}

      {editingInsight ? (
        <SectionCard title="Edit insight" description="Update title, summary, and moderation status.">
          <div className="p-4">
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="insightId" value={editingInsight.id} />
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Title</label>
                <input
                  name="title"
                  defaultValue={editingInsight.title}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Summary</label>
                <textarea
                  name="summary"
                  defaultValue={editingInsight.summary}
                  className="min-h-24 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={editingInsight.status}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
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
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Insights" description="Moderation queue and operational actions.">
        {insights.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No insights found"
              description="Insights will appear here after generation jobs complete."
            />
          </div>
        ) : (
          <DataTable>
            <DataTableTable>
              <DataTableHead>
                <tr>
                  <DataHeaderCell>Insight</DataHeaderCell>
                  <DataHeaderCell>Company</DataHeaderCell>
                  <DataHeaderCell>Location</DataHeaderCell>
                  <DataHeaderCell>Status</DataHeaderCell>
                  <DataHeaderCell>Savings</DataHeaderCell>
                  <DataHeaderCell>Created</DataHeaderCell>
                  <DataHeaderCell>Actions</DataHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {insights.map((insight) => (
                  <tr key={insight.id}>
                    <DataCell>
                      <p className="font-medium text-foreground">{insight.title}</p>
                      <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">{insight.summary}</p>
                    </DataCell>
                    <DataCell>{insight.companyName}</DataCell>
                    <DataCell>{insight.locationName ?? "-"}</DataCell>
                    <DataCell>
                      <StatusBadge tone={insight.status === "accepted" ? "completed" : insight.status === "dismissed" || insight.status === "archived" ? "failed" : "pending"}>
                        {insight.status === "new" ? "pending moderation" : insight.status}
                      </StatusBadge>
                    </DataCell>
                    <DataCell>{formatCurrency(insight.estimatedSavingsValue)}</DataCell>
                    <DataCell>{formatDate(insight.createdAt)}</DataCell>
                    <DataCell>
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
                    </DataCell>
                  </tr>
                ))}
              </DataTableBody>
            </DataTableTable>
          </DataTable>
        )}
      </SectionCard>
    </div>
  )
}
