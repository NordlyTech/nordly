import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminGenerations, rerunAdminGeneration } from "@/lib/data/admin.actions"

type AiGenerationsPageProps = {
  searchParams: Promise<{ notice?: string }>
}

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

function toJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return "{}"
  }
}

export default async function AdminAiGenerationsPage({ searchParams }: AiGenerationsPageProps) {
  const resolvedSearchParams = await searchParams
  const generations = await getAdminGenerations()

  async function rerunAction(formData: FormData) {
    "use server"

    const generationId = String(formData.get("generationId") ?? "").trim()

    try {
      await rerunAdminGeneration(generationId)
      redirect("/admin/ai-generations?notice=Generation+re-run+started")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to re-run generation"
      redirect(`/admin/ai-generations?notice=${encodeURIComponent(message)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">AI Generations</h1>
        <p className="mt-1 text-sm text-slate-500">Audit generation payloads and re-run location insight jobs.</p>
      </div>

      {resolvedSearchParams.notice ? (
        <Card className="rounded-2xl border-slate-200 bg-slate-50 py-3">
          <CardContent>
            <p className="text-sm text-slate-700">{resolvedSearchParams.notice}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl border-slate-200 py-0">
        <CardHeader className="border-b border-slate-200 py-4">
          <CardTitle className="text-base">Generation log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {generations.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.id}</p>
                  <p className="text-xs text-slate-500">
                    {item.generationType ?? "location_insights"} · {item.status ?? "unknown"} · {item.model ?? "-"}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                </div>
                <form action={rerunAction}>
                  <input type="hidden" name="generationId" value={item.id} />
                  <Button size="sm" variant="outline" type="submit">
                    Re-run
                  </Button>
                </form>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                    input_payload_json
                  </summary>
                  <pre className="mt-2 overflow-x-auto text-xs text-slate-700">{toJson(item.inputPayload)}</pre>
                </details>

                <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                    output_payload_json
                  </summary>
                  <pre className="mt-2 overflow-x-auto text-xs text-slate-700">{toJson(item.outputPayload)}</pre>
                </details>
              </div>
            </div>
          ))}

          {generations.length === 0 ? (
            <p className="text-sm text-slate-500">No generation records found.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
