import Link from "next/link"
import { redirect } from "next/navigation"

import { impersonateUserAction } from "@/app/admin/actions/impersonateUser"
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
  getAdminCompanies,
  getAdminCompanyDeleteImpact,
  updateAdminCompany,
} from "@/lib/data/admin.actions"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

type AdminCompaniesPageProps = {
  searchParams: Promise<{ notice?: string; edit?: string; delete?: string }>
}

export default async function AdminCompaniesPage({ searchParams }: AdminCompaniesPageProps) {
  const resolvedSearchParams = await searchParams
  const companies = await getAdminCompanies()
  const editingCompany = companies.find((item) => item.id === resolvedSearchParams.edit)
  const deleteState = resolvedSearchParams.delete ?? ""
  const deleteImpact = editingCompany && deleteState === "confirm"
    ? await getAdminCompanyDeleteImpact(editingCompany.id)
    : null

  async function submitImpersonation(formData: FormData) {
    "use server"

    const targetUserId = String(formData.get("target_user_id") ?? "").trim()
    const companyName = String(formData.get("company_name") ?? "").trim()

    let loginLink: string

    try {
      loginLink = await impersonateUserAction(targetUserId, companyName)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate impersonation token."
      redirect(`/admin/companies?notice=${encodeURIComponent(`Impersonation failed: ${message}`)}`)
    }

    redirect(loginLink)
  }

  async function updateAction(formData: FormData) {
    "use server"

    const companyId = String(formData.get("companyId") ?? "").trim()
    const name = String(formData.get("name") ?? "")
    const country = String(formData.get("country") ?? "")
    const subscription = String(formData.get("subscription") ?? "free")

    try {
      await updateAdminCompany({ companyId, name, country, subscription })
      redirect("/admin/companies?notice=Company+updated")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update company"
      redirect(`/admin/companies?notice=${encodeURIComponent(message)}&edit=${encodeURIComponent(companyId)}`)
    }
  }

  async function deleteAction(formData: FormData) {
    "use server"

    const companyId = String(formData.get("companyId") ?? "").trim()

    try {
      await deleteAdminCompany(companyId)
      redirect("/admin/companies?notice=Company+deleted")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete company"
      redirect(`/admin/companies?notice=${encodeURIComponent(message)}&edit=${encodeURIComponent(companyId)}&delete=confirm`)
    }
  }

  return (
    <div className="space-y-5">
      {resolvedSearchParams.notice ? (
        <SectionCard title="Notice" description="Latest company action result.">
          <div className="p-4">
            <p className="text-sm text-foreground">{resolvedSearchParams.notice}</p>
          </div>
        </SectionCard>
      ) : null}

      {editingCompany ? (
        <SectionCard title="Edit company" description="Update basic company profile fields.">
          <div className="p-4">
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="companyId" value={editingCompany.id} />
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Name</label>
                <input
                  name="name"
                  defaultValue={editingCompany.name}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Country</label>
                <input
                  name="country"
                  defaultValue={editingCompany.country ?? ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Subscription</label>
                <select
                  name="subscription"
                  defaultValue={editingCompany.subscription ?? "free"}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="free">free</option>
                  <option value="premium">premium</option>
                  <option value="enterprise">enterprise</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">Save changes</Button>
                <button
                  id="generate-report-btn"
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  data-company-id={editingCompany.id}
                >
                  Generate Report
                </button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href="/admin/companies">Cancel</Link>
                </Button>
                <Button type="button" variant="destructive" size="sm" asChild>
                  <Link href={`/admin/companies?edit=${editingCompany.id}&delete=confirm`}>Delete company</Link>
                </Button>
              </div>
              <div className="min-h-5">
                <p id="generate-report-error" className="hidden text-xs text-rose-700" />
                <a
                  id="generate-report-link"
                  className="hidden text-xs font-medium text-primary underline"
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download report
                </a>
              </div>
            </form>

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

                      button.setAttribute("disabled", "true");
                      button.textContent = loadingLabel;
                      error.textContent = "";
                      error.classList.add("hidden");
                      link.classList.add("hidden");

                      try {
                        const response = await fetch("/api/report/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ company_id: companyId }),
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
          </div>
        </SectionCard>
      ) : null}

      {deleteImpact ? (
        <SectionCard
          title={`Delete ${deleteImpact.companyName}?`}
          description="This permanently removes the company and dependent records."
        >
          <div className="space-y-4 p-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              This action cannot be undone. Confirm only after reviewing the cascade totals.
            </div>

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
                <input type="hidden" name="companyId" value={deleteImpact.companyId} />
                <Button type="submit" size="sm" variant="destructive">
                  Confirm delete company
                </Button>
              </form>
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/admin/companies?edit=${deleteImpact.companyId}`}>Cancel</Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="All companies" description="Company metrics and operational actions.">
        {companies.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No companies found" description="Companies will appear here once onboarding begins." />
          </div>
        ) : (
          <DataTable>
            <DataTableTable>
              <DataTableHead>
                <tr>
                  <DataHeaderCell>Name</DataHeaderCell>
                  <DataHeaderCell>Country</DataHeaderCell>
                  <DataHeaderCell>Locations</DataHeaderCell>
                  <DataHeaderCell>Savings</DataHeaderCell>
                  <DataHeaderCell>Subscription</DataHeaderCell>
                  <DataHeaderCell>Action</DataHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {companies.map((company) => {
                  const isSelected = editingCompany?.id === company.id
                  const rowClassName = isSelected
                    ? "bg-primary/10 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.22)] hover:bg-primary/10"
                    : "hover:bg-slate-100"
                  const cellClassName = isSelected
                    ? "bg-primary/10 transition-colors"
                    : "transition-colors group-hover:bg-slate-100"

                  return (
                  <tr
                    key={company.id}
                    className={`group cursor-pointer ${rowClassName}`}
                  >
                    <DataCell className={`font-medium text-foreground ${cellClassName}`}>
                      <Link
                        href={`/admin/companies?edit=${company.id}`}
                        className="-mx-4 -my-3 block px-4 py-3"
                      >
                        {company.name}
                      </Link>
                    </DataCell>
                    <DataCell className={cellClassName}>
                      <Link
                        href={`/admin/companies?edit=${company.id}`}
                        className="-mx-4 -my-3 block px-4 py-3"
                      >
                        {company.country ?? "-"}
                      </Link>
                    </DataCell>
                    <DataCell className={cellClassName}>
                      <Link
                        href={`/admin/companies?edit=${company.id}`}
                        className="-mx-4 -my-3 block px-4 py-3"
                      >
                        {company.locationsCount}
                      </Link>
                    </DataCell>
                    <DataCell className={cellClassName}>
                      <Link
                        href={`/admin/companies?edit=${company.id}`}
                        className="-mx-4 -my-3 block px-4 py-3"
                      >
                        {formatCurrency(company.totalEstimatedSavings)}
                      </Link>
                    </DataCell>
                    <DataCell className={cellClassName}>
                      <Link
                        href={`/admin/companies?edit=${company.id}`}
                        className="-mx-4 -my-3 flex px-4 py-3"
                      >
                        {company.subscription === "premium" || company.subscription === "enterprise" ? (
                          <StatusBadge tone="premium">{company.subscription}</StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">{company.subscription ?? "free"}</StatusBadge>
                        )}
                      </Link>
                    </DataCell>
                    <DataCell className={cellClassName}>
                      {company.memberUserIds.length > 0 ? (
                        <form action={submitImpersonation} className="flex items-center gap-2">
                          <select
                            name="target_user_id"
                            defaultValue={company.impersonationUserId ?? company.memberUserIds[0]}
                            className="h-8 max-w-40 rounded-md border border-border bg-white px-2 text-xs text-foreground"
                          >
                            {company.memberUserIds.map((userId) => (
                              <option key={userId} value={userId}>
                                {userId}
                              </option>
                            ))}
                          </select>
                          <input type="hidden" name="company_name" value={company.name} />
                          <Button type="submit" size="sm" variant="outline">
                            Impersonate
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">No members</span>
                      )}
                    </DataCell>
                  </tr>
                )})}
              </DataTableBody>
            </DataTableTable>
          </DataTable>
        )}
      </SectionCard>
    </div>
  )
}
