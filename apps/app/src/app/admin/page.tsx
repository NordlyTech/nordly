import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminDashboardStats } from "@/lib/data/admin.actions"

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Internal overview of platform-wide activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total companies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{stats.companiesTotal}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{stats.usersTotal}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{stats.insightsTotal}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
