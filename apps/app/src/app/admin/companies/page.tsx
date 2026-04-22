import Link from "next/link"
import { redirect } from "next/navigation"

import { impersonateUserAction } from "@/app/admin/actions/impersonateUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminCompanies } from "@/lib/data/admin.actions"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AdminCompaniesPage() {
  const companies = await getAdminCompanies()

  async function submitImpersonation(formData: FormData) {
    "use server"

    const targetUserId = String(formData.get("target_user_id") ?? "").trim()
    const companyName = String(formData.get("company_name") ?? "").trim()
    const loginLink = await impersonateUserAction(targetUserId, companyName)

    redirect(loginLink)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">Portfolio-level company management and metrics.</p>
      </div>

      <Card className="rounded-2xl border-slate-200 py-0">
        <CardHeader className="border-b border-slate-200 py-4">
          <CardTitle className="text-base">All companies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Country</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Locations</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Savings</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Subscription</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/admin/companies/${company.id}`} className="hover:underline">
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{company.country ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{company.locationsCount}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(company.totalEstimatedSavings)}</td>
                    <td className="px-4 py-3 text-slate-600">{company.subscription ?? "free"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.memberUserIds.length > 0 ? (
                        <form action={submitImpersonation} className="flex items-center gap-2">
                          <select
                            name="target_user_id"
                            defaultValue={company.impersonationUserId ?? company.memberUserIds[0]}
                            className="h-8 max-w-40 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700"
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
                        <span className="text-xs text-slate-400">No members</span>
                      )}
                    </td>
                  </tr>
                ))}
                {companies.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      No companies found.
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
