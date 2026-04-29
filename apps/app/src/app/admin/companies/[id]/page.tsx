import Link from "next/link"
import { notFound, redirect } from "next/navigation"

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
  deleteAdminCompany,
  getAdminCompanyDeleteImpact,
  getAdminCompanyDetail,
  regenerateLocationInsightsAsAdmin,
} from "@/lib/data/admin.actions"

type CompanyDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; notice?: string; delete?: string }>
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
  const deleteState = resolvedSearchParams.delete ?? ""

  const company = await getAdminCompanyDetail(companyId)
  const deleteImpact = deleteState ? await getAdminCompanyDeleteImpact(companyId) : null

  if (!company) {
    notFound()
  }

  const defaultLocationId = company.locations[0]?.id ?? null

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

  async function deleteAction(formData: FormData) {
    "use server"

    const targetCompanyId = String(formData.get("companyId") ?? "").trim()

    try {
      await deleteAdminCompany(targetCompanyId)
      redirect("/admin/companies?notice=Company+deleted")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete company"
      redirect(`/admin/companies/${targetCompanyId}?tab=${tab}&delete=confirm&notice=${encodeURIComponent(message)}`)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <button
            id="generate-report-btn"
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            data-company-id={company.id}
            data-location-id={defaultLocationId ?? ""}
          >
            Generate Report
          </button>
          <a id="generate-report-link" className="hidden text-sm font-medium text-primary underline" href="#" target="_blank" rel="noreferrer">
            Download report
          </a>
        </div>
        <Button type="button" variant="destructive" size="sm" asChild>
          <Link href={`/admin/companies/${company.id}?tab=${tab}&delete=confirm`}>Delete company</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/companies">Back to companies</Link>
        </Button>
      </div>

      <p id="generate-report-error" className="hidden text-xs text-rose-700" />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              const button = document.getElementById("generate-report-btn");
              const link = document.getElementById("generate-report-link");
              const error = document.getElementById("generate-report-error");
              if (!button || !link || !error) return;

              const idleLabel = "Generate Report";
              const loadingLabel = "Generating report...";

              button.addEventListener("click", async function () {
                const companyId = button.getAttribute("data-company-id") || "";
                const locationId = button.getAttribute("data-location-id") || "";

                button.setAttribute("disabled", "true");
                button.textContent = loadingLabel;
                error.textContent = "";
                error.classList.add("hidden");
                link.classList.add("hidden");

                try {
                  const payload = locationId ? { company_id: companyId, location_id: locationId } : { company_id: companyId };
                  const response = await fetch("/api/report/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const data = await response.json();

                  if (!response.ok || !data?.ok) {
                    throw new Error(data?.error || "Failed to generate report");
                  }

                  const url = data?.download_url || data?.url || data?.downloadUrl;
                  if (!url) {
                    throw new Error("Report generated but no download URL was returned");
                  }

                  link.setAttribute("href", url);
                  link.classList.remove("hidden");
                } catch (e) {
                  const message = e instanceof Error ? e.message : "Failed to generate report";
                  error.textContent = message;
                  error.classList.remove("hidden");
                } finally {
                  button.removeAttribute("disabled");
                  button.textContent = idleLabel;
                }
              });
            })();
          `,
        }}
      />

      {resolvedSearchParams.notice ? (
        <SectionCard title="Notice" description="Latest company action result.">
          <div className="p-4">
            <p className="text-sm text-foreground">{resolvedSearchParams.notice}</p>
          </div>
        </SectionCard>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TAB_VALUES.map((tabValue) => {
          const active = tab === tabValue
          return (
            <Link
              key={tabValue}
              href={`/admin/companies/${company.id}?tab=${tabValue}`}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tabValue[0].toUpperCase() + tabValue.slice(1)}
            </Link>
          )
        })}
      </div>

      <SectionCard title="Danger zone" description="Delete this company and all dependent records.">
        <div className="space-y-4 p-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Deleting a company is permanent. Review the cascade impact before confirming.
          </div>

          {deleteImpact ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {deleteImpact.totals.map((item) => (
                  <div key={item.key} className="rounded-xl border border-border/80 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.count}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={deleteAction}>
                  <input type="hidden" name="companyId" value={company.id} />
                  <Button type="submit" size="sm" variant="destructive" className="min-w-52">
                    Confirm delete company
                  </Button>
                </form>
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/companies/${company.id}?tab=${tab}`}>Cancel</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="destructive" size="sm" className="min-w-52" asChild>
                <Link href={`/admin/companies/${company.id}?tab=${tab}&delete=confirm`}>Review delete impact</Link>
              </Button>
            </div>
          )}
        </div>
      </SectionCard>

      {tab === "locations" ? (
        <SectionCard title="Locations" description="Location inventory and AI regeneration actions.">
          {company.locations.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No locations found" description="Locations will appear once this company is configured." />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Name</DataHeaderCell>
                    <DataHeaderCell>Type</DataHeaderCell>
                    <DataHeaderCell>City</DataHeaderCell>
                    <DataHeaderCell>Action</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {company.locations.map((location) => (
                    <tr key={location.id}>
                      <DataCell className="font-medium text-foreground">{location.name}</DataCell>
                      <DataCell>{location.locationType ?? "-"}</DataCell>
                      <DataCell>{location.city ?? "-"}</DataCell>
                      <DataCell>
                        <form action={regenerateAction}>
                          <input type="hidden" name="companyId" value={company.id} />
                          <input type="hidden" name="locationId" value={location.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Regenerate AI insights
                          </Button>
                        </form>
                      </DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>
      ) : null}

      {tab === "insights" ? (
        <SectionCard title="Insights" description="Insight outcomes and estimated savings.">
          {company.insights.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No insights found" description="Generated insights for this company appear here." />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Title</DataHeaderCell>
                    <DataHeaderCell>Status</DataHeaderCell>
                    <DataHeaderCell>Savings</DataHeaderCell>
                    <DataHeaderCell>Created</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {company.insights.map((insight) => (
                    <tr key={insight.id}>
                      <DataCell className="font-medium text-foreground">{insight.title}</DataCell>
                      <DataCell>
                        <StatusBadge tone={insight.status === "accepted" ? "completed" : insight.status === "dismissed" || insight.status === "archived" ? "failed" : "pending"}>
                          {insight.status}
                        </StatusBadge>
                      </DataCell>
                      <DataCell>{formatCurrency(insight.estimatedSavingsValue)}</DataCell>
                      <DataCell>{formatDate(insight.createdAt)}</DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>
      ) : null}

      {tab === "missions" ? (
        <SectionCard title="Missions" description="Mission pipeline and expected savings.">
          {company.missions.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No missions found" description="Accepted insights will create missions for this company." />
            </div>
          ) : (
            <DataTable>
              <DataTableTable>
                <DataTableHead>
                  <tr>
                    <DataHeaderCell>Title</DataHeaderCell>
                    <DataHeaderCell>Status</DataHeaderCell>
                    <DataHeaderCell>Expected Savings</DataHeaderCell>
                    <DataHeaderCell>Created</DataHeaderCell>
                  </tr>
                </DataTableHead>
                <DataTableBody>
                  {company.missions.map((mission) => (
                    <tr key={mission.id}>
                      <DataCell className="font-medium text-foreground">{mission.title}</DataCell>
                      <DataCell>
                        <StatusBadge tone={mission.status === "completed" ? "completed" : mission.status === "canceled" ? "failed" : "active"}>
                          {mission.status}
                        </StatusBadge>
                      </DataCell>
                      <DataCell>{formatCurrency(mission.expectedSavingsValue)}</DataCell>
                      <DataCell>{formatDate(mission.createdAt)}</DataCell>
                    </tr>
                  ))}
                </DataTableBody>
              </DataTableTable>
            </DataTable>
          )}
        </SectionCard>
      ) : null}
    </div>
  )
}
