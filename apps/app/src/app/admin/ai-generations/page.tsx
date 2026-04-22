import { redirect } from "next/navigation"

import {
  EmptyState,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui/primitives"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-5">
      {resolvedSearchParams.notice ? (
        <SectionCard title="Notice" description="Latest action result.">
          <div className="p-4">
            <p className="text-sm text-slate-700">{resolvedSearchParams.notice}</p>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Generation log" description="Recent AI generation activity.">
        <div className="space-y-4 p-4">
          {generations.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/80 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.id}</p>
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

              <div className="mt-2">
                <StatusBadge tone={item.status === "failed" || item.status === "error" ? "failed" : item.status === "completed" ? "completed" : "active"}>
                  {item.status ?? "unknown"}
                </StatusBadge>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <details className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    input_payload_json
                  </summary>
                  <pre className="mt-2 overflow-x-auto text-xs text-foreground/90">{toJson(item.inputPayload)}</pre>
                </details>

                <details className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    output_payload_json
                  </summary>
                  <pre className="mt-2 overflow-x-auto text-xs text-foreground/90">{toJson(item.outputPayload)}</pre>
                </details>
              </div>
            </div>
          ))}

          {generations.length === 0 ? (
            <EmptyState
              title="No generation records found"
              description="Run generation jobs and logs will show up here with payload context."
            />
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
