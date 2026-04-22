import Link from "next/link"

import {
  ActionBar,
  DataCell,
  DataHeaderCell,
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableTable,
  EmptyState,
  RowLink,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui/primitives"
import { Button } from "@/components/ui/button"
import { getAdminDashboardOverview } from "@/lib/data/admin.actions"

function formatDate(value: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function statusTone(value: string | null): "active" | "pending" | "failed" | "completed" | "neutral" {
  const normalized = (value ?? "").toLowerCase()
  if (normalized === "new" || normalized === "pending") return "pending"
  if (normalized === "failed" || normalized === "error") return "failed"
  if (normalized === "completed" || normalized === "accepted") return "completed"
  if (normalized === "running" || normalized === "in_progress") return "active"

  return "neutral"
}

export default async function AdminDashboardPage() {
  const overview = await getAdminDashboardOverview()
  const stats = overview.stats

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total companies" value={stats.companiesTotal} />
        <StatCard label="Total users" value={stats.usersTotal} />
        <StatCard label="Total insights" value={stats.insightsTotal} />
        <StatCard label="Pending moderation" value={stats.pendingModerationTotal} helper="Insights waiting review" />
        <StatCard label="Premium companies" value={stats.premiumCompaniesTotal} />
        <StatCard label="Failed AI generations" value={stats.failedGenerationsTotal} helper="Requires operator attention" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Recent companies"
          description="Latest company records entering the platform."
          actions={<Button variant="outline" size="sm" asChild><Link href="/admin/companies">View all</Link></Button>}
        >
          {overview.recentCompanies.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No companies yet"
                description="Companies will appear here once onboarding starts."
              />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Company</DataHeaderCell>
                    <DataHeaderCell>Country</DataHeaderCell>
                    <DataHeaderCell>Tier</DataHeaderCell>
                    <DataHeaderCell>Created</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {overview.recentCompanies.map((company) => (
                    <tr key={company.id}>
                      <DataCell className="font-medium text-foreground"><RowLink href={`/admin/companies/${company.id}`}>{company.name}</RowLink></DataCell>
                      <DataCell>{company.country ?? "-"}</DataCell>
                      <DataCell>
                        {company.subscription === "premium" || company.subscription === "enterprise" ? (
                          <StatusBadge tone="premium">{company.subscription}</StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">{company.subscription ?? "free"}</StatusBadge>
                        )}
                      </DataCell>
                      <DataCell>{formatDate(company.createdAt)}</DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>

        <SectionCard
          title="Recent AI generations"
          description="Most recent generation jobs and their status."
          actions={<Button variant="outline" size="sm" asChild><Link href="/admin/ai-generations">Open logs</Link></Button>}
        >
          {overview.recentGenerations.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No generation activity" description="Generation jobs will appear once jobs run." />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Type</DataHeaderCell>
                    <DataHeaderCell>Company</DataHeaderCell>
                    <DataHeaderCell>Status</DataHeaderCell>
                    <DataHeaderCell>Created</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {overview.recentGenerations.map((generation) => (
                    <tr key={generation.id}>
                      <DataCell className="font-medium text-foreground">{generation.generationType ?? "location_insights"}</DataCell>
                      <DataCell>{generation.companyName ?? "-"}</DataCell>
                      <DataCell><StatusBadge tone={statusTone(generation.status)}>{generation.status ?? "unknown"}</StatusBadge></DataCell>
                      <DataCell>{formatDate(generation.createdAt)}</DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <SectionCard
          title="Moderation queue"
          description="Newest insights waiting for moderation."
          actions={<Button variant="outline" size="sm" asChild><Link href="/admin/insights">Review queue</Link></Button>}
        >
          {overview.moderationQueue.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Moderation queue is clear"
                description="New insights will appear here for review as they are generated."
              />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Insight</DataHeaderCell>
                    <DataHeaderCell>Company</DataHeaderCell>
                    <DataHeaderCell>Status</DataHeaderCell>
                    <DataHeaderCell>Savings</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {overview.moderationQueue.map((insight) => (
                    <tr key={insight.id}>
                      <DataCell className="font-medium text-foreground">{insight.title}</DataCell>
                      <DataCell>{insight.companyName}</DataCell>
                      <DataCell><StatusBadge tone="pending">pending moderation</StatusBadge></DataCell>
                      <DataCell>EUR {Math.round(insight.estimatedSavingsValue).toLocaleString("en-US")}</DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>

        <SectionCard title="System warnings" description="Platform-level health and ops signals.">
          <div className="space-y-3 p-4">
            {overview.warnings.map((warning) => (
              <div key={warning.id} className="rounded-xl border border-border/80 bg-muted/20 px-3 py-3">
                <div className="flex items-center gap-2">
                  <StatusBadge tone={warning.level === "warning" ? "failed" : "active"}>
                    {warning.level === "warning" ? "warning" : "ok"}
                  </StatusBadge>
                  <p className="text-sm font-medium text-foreground">{warning.title}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{warning.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Quick admin actions" description="Common operations across core admin modules.">
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionBar>
            <p className="text-sm font-medium text-foreground">Company directory</p>
            <Button variant="outline" size="sm" asChild><Link href="/admin/companies">Open</Link></Button>
          </ActionBar>
          <ActionBar>
            <p className="text-sm font-medium text-foreground">Insights moderation</p>
            <Button variant="outline" size="sm" asChild><Link href="/admin/insights">Open</Link></Button>
          </ActionBar>
          <ActionBar>
            <p className="text-sm font-medium text-foreground">AI generation logs</p>
            <Button variant="outline" size="sm" asChild><Link href="/admin/ai-generations">Open</Link></Button>
          </ActionBar>
          <ActionBar>
            <p className="text-sm font-medium text-foreground">Workspace view</p>
            <Button variant="outline" size="sm" asChild><Link href="/app">Open app</Link></Button>
          </ActionBar>
        </div>
      </SectionCard>
    </div>
  )
}
