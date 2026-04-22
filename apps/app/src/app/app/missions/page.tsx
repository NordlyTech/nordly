"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowsDownUp,
  CheckCircle,
  Circle,
  Clock,
  FadersHorizontal,
  Lightbulb,
  MapPin,
  Sparkle,
  Table,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitMeasuredSavingsAction } from "@/lib/actions/submitMeasuredSavings"
import { updateMissionStatusAction } from "@/lib/actions/updateMissionStatus"
import {
  getMissions,
  type MissionRecord,
  type MissionStatus,
} from "@/lib/data/insights-missions.actions"

type MissionView = "board" | "table"
type MissionSort = "value_desc" | "due_soon" | "newest"
type MissionFilter = "all" | MissionStatus

type ToastState = {
  type: "success" | "error"
  message: string
}

const STATUS_COLUMNS: Array<{ key: MissionStatus; label: string }> = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date?: string | null) {
  if (!date) return "No due date"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatCompletedAgo(date?: string | null) {
  if (!date) {
    return null
  }

  const completedAt = new Date(date)
  if (Number.isNaN(completedAt.getTime())) {
    return null
  }

  const now = Date.now()
  const diffMs = Math.max(0, now - completedAt.getTime())
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays === 0) {
    return "Completed today"
  }

  if (diffDays === 1) {
    return "Completed 1 day ago"
  }

  return `Completed ${diffDays} days ago`
}

function shortDescription(markdown: string) {
  return markdown.replace(/[#*_`>-]/g, "").replace(/\s+/g, " ").trim()
}

function renderMarkdownBlocks(markdown: string) {
  const lines = markdown.split("\n").map((line) => line.trim())
  const bullets = lines.filter((line) => line.startsWith("- "))
  const paragraphs = lines.filter((line) => line.length > 0 && !line.startsWith("- "))

  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      {paragraphs.map((line, index) => (
        <p key={`p-${index}`} className="leading-relaxed text-foreground/90">
          {line.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      ))}
      {bullets.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-foreground/85">
          {bullets.map((line, index) => (
            <li key={`b-${index}`}>{line.replace("- ", "")}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function statusLabel(status: MissionStatus) {
  if (status === "in_progress") return "In Progress"
  if (status === "completed") return "Completed"
  if (status === "canceled") return "Canceled"
  return "Open"
}

function statusBadgeClass(status: MissionStatus) {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (status === "in_progress") {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  if (status === "canceled") {
    return "border-zinc-200 bg-zinc-100 text-zinc-600"
  }

  return "border-sky-200 bg-sky-50 text-sky-700"
}

function getAllowedTransitions(status: MissionStatus): MissionStatus[] {
  if (status === "open") {
    return ["in_progress", "canceled"]
  }

  if (status === "in_progress") {
    return ["completed", "canceled"]
  }

  if (status === "canceled") {
    return ["open"]
  }

  return []
}

function getMissionStatusToast(status: MissionStatus, savingsCreated?: boolean, savingsValue?: number | null) {
  if (status === "in_progress") {
    return "Project started"
  }

  if (status === "completed") {
    if (savingsCreated && savingsValue !== undefined && savingsValue !== null && savingsValue > 0) {
      return `Project completed — estimated savings of €${Math.round(savingsValue).toLocaleString()} recorded`
    }
    return "Project completed"
  }

  if (status === "canceled") {
    return "Project canceled"
  }

  return "Project reopened"
}

function formatDeltaPercent(expectedValue: number, actualValue: number | null) {
  if (actualValue === null || expectedValue <= 0) {
    return null
  }

  const delta = ((actualValue - expectedValue) / expectedValue) * 100
  const rounded = Math.round(delta * 10) / 10

  return rounded
}

function deltaClass(deltaPercent: number | null) {
  if (deltaPercent === null) {
    return "text-muted-foreground"
  }

  if (deltaPercent >= 0) {
    return "text-emerald-700"
  }

  if (deltaPercent <= -10) {
    return "text-rose-700"
  }

  return "text-amber-700"
}

function formatSignedPercent(value: number) {
  if (value > 0) {
    return `+${value}%`
  }

  return `${value}%`
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

type MissionCardProps = {
  mission: MissionRecord
  onViewDetails: (missionId: string) => void
  onTransition: (missionId: string, status: MissionStatus) => void
  onOpenMeasuredSavings: (missionId: string) => void
  updating: boolean
}

function MissionCard({ mission, onViewDetails, onTransition, onOpenMeasuredSavings, updating }: MissionCardProps) {
  const descriptionPreview = shortDescription(mission.description_md)
  const searchParams = useSearchParams()
  const requestedMissionId = searchParams.get("missionId")
  const requestedSourceInsightId = searchParams.get("sourceInsightId")
  const isHighlighted =
    requestedMissionId === mission.id ||
    (requestedSourceInsightId !== null && requestedSourceInsightId === mission.source_insight_id)

  return (
    <Card
      id={`mission-card-${mission.id}`}
      className={`gap-4 rounded-2xl border bg-white py-4 shadow-sm transition-all ${
        isHighlighted ? "border-primary/50 ring-2 ring-primary/20 shadow-md" : "border-border/80"
      }`}
    >
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {mission.category ? <Badge variant="outline">{mission.category}</Badge> : null}
          <Badge variant="outline" className={statusBadgeClass(mission.status)}>
            {statusLabel(mission.status)}
          </Badge>
          {mission.location_name ? (
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
              <MapPin className="h-3.5 w-3.5" />
              {mission.location_name}
            </Badge>
          ) : null}
        </div>

        <div>
          <h3 className="text-base font-semibold text-foreground">{mission.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{descriptionPreview}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Expected monthly savings</p>
            <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(mission.expected_savings_value)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Due date</p>
            <p className="mt-1 text-base font-medium text-foreground">{formatDate(mission.due_date)}</p>
          </div>
        </div>

        {mission.status === "completed" ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-emerald-800">{formatCompletedAgo(mission.completed_at) ?? "Completed"}</p>
              {mission.expected_savings_value > 0 ? (
                <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-700 text-xs">
                  Estimated savings recorded
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-emerald-700">
              Expected: {formatCurrency(mission.expected_savings_value)} / month
            </p>
            <p className="mt-1 text-emerald-700">
              Actual: {mission.actual_savings_value !== null ? `${formatCurrency(mission.actual_savings_value)} / month` : "Not recorded"}
            </p>
            {mission.actual_savings_value !== null ? (
              <p className={`mt-1 font-semibold ${deltaClass(formatDeltaPercent(mission.expected_savings_value, mission.actual_savings_value))}`}>
                Delta: {formatSignedPercent(formatDeltaPercent(mission.expected_savings_value, mission.actual_savings_value) ?? 0)}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{mission.owner ? `Owner: ${mission.owner}` : "Owner: Unassigned"}</span>
          {mission.source_insight_id ? <span>Insight #{mission.source_insight_id}</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(mission.id)}>
            View details
          </Button>
          {mission.status === "open" ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onTransition(mission.id, "in_progress")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Start Mission"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTransition(mission.id, "canceled")}
                disabled={updating}
              >
                Cancel
              </Button>
            </>
          ) : null}
          {mission.status === "in_progress" ? (
            <>
              <Button size="sm" onClick={() => onTransition(mission.id, "completed")} disabled={updating}>
                {updating ? "Updating..." : "Mark as Completed"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTransition(mission.id, "canceled")}
                disabled={updating}
              >
                Cancel
              </Button>
            </>
          ) : null}
          {mission.status === "completed" ? (
            <>
              <Badge className="bg-emerald-600 text-white">
                <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                Completed
              </Badge>
              <Button
                variant={mission.actual_savings_value === null ? "default" : "outline"}
                size="sm"
                onClick={() => onOpenMeasuredSavings(mission.id)}
                disabled={updating}
              >
                {mission.actual_savings_value === null ? "Add Actual Savings" : "Edit Actual Savings"}
              </Button>
            </>
          ) : null}
          {mission.status === "canceled" ? (
            <>
              <Badge variant="outline" className={statusBadgeClass("canceled")}>
                Canceled
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onTransition(mission.id, "open")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Reopen"}
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default function MissionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedMissionId = searchParams.get("missionId")
  const requestedSourceInsightId = searchParams.get("sourceInsightId")
  const [missions, setMissions] = useState<MissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [updatingMissionId, setUpdatingMissionId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<MissionView>("board")
  const [sortBy, setSortBy] = useState<MissionSort>("value_desc")
  const [filterBy, setFilterBy] = useState<MissionFilter>("all")
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [measuredSavingsMissionId, setMeasuredSavingsMissionId] = useState<string | null>(null)
  const [measuredSavingsValue, setMeasuredSavingsValue] = useState("")
  const [measuredSavingsNote, setMeasuredSavingsNote] = useState("")
  const [submittingMeasuredSavings, setSubmittingMeasuredSavings] = useState(false)

  const loadMissions = async () => {
    setLoading(true)
    setPageError(null)

    try {
      const rows = await getMissions(null)
      setMissions(rows)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load missions."
      setPageError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMissions()
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedMissionId) ?? null,
    [missions, selectedMissionId]
  )

  const measuredSavingsMission = useMemo(
    () => missions.find((mission) => mission.id === measuredSavingsMissionId) ?? null,
    [missions, measuredSavingsMissionId]
  )

  useEffect(() => {
    if (loading || (!requestedMissionId && !requestedSourceInsightId)) {
      return
    }

    if (missions.length === 0) {
      setToast({
        type: "error",
        message: "The requested mission could not be found. Showing your current mission board instead.",
      })
      return
    }

    const target = requestedMissionId
      ? missions.find((mission) => mission.id === requestedMissionId)
      : missions.find((mission) => mission.source_insight_id === requestedSourceInsightId)

    if (!target) {
      setToast({
        type: "error",
        message: "The requested mission could not be found. Showing your current mission board instead.",
      })
      return
    }

    setFilterBy("all")
    setSelectedMissionId(target.id)

    window.requestAnimationFrame(() => {
      document.getElementById(`mission-card-${target.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    })
  }, [loading, missions, requestedMissionId, requestedSourceInsightId])

  const summary = useMemo(() => {
    const openCount = missions.filter((item) => item.status === "open").length
    const inProgressCount = missions.filter((item) => item.status === "in_progress").length
    const completedCount = missions.filter((item) => item.status === "completed").length
    const totalExpectedMonthlySavings = missions
      .filter((item) => item.status !== "canceled")
      .reduce((acc, item) => acc + item.expected_savings_value, 0)
    const totalActualMonthlySavings = missions
      .filter((item) => item.status === "completed")
      .reduce((acc, item) => acc + (item.actual_savings_value ?? 0), 0)

    return {
      openCount,
      inProgressCount,
      completedCount,
      totalExpectedMonthlySavings,
      totalActualMonthlySavings,
    }
  }, [missions])

  const visibleMissions = useMemo(() => {
    let result = [...missions]

    if (filterBy !== "all") {
      result = result.filter((mission) => mission.status === filterBy)
    }

    if (sortBy === "value_desc") {
      result.sort((a, b) => b.expected_savings_value - a.expected_savings_value)
    } else if (sortBy === "due_soon") {
      result.sort((a, b) => {
        const first = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER
        const second = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER
        return first - second
      })
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at ?? "1970-01-01").getTime() -
          new Date(a.created_at ?? "1970-01-01").getTime()
      )
    }

    return result
  }, [missions, filterBy, sortBy])

  const missionsByColumn = useMemo(() => {
    return {
      open: visibleMissions.filter((mission) => mission.status === "open"),
      in_progress: visibleMissions.filter((mission) => mission.status === "in_progress"),
      completed: visibleMissions.filter((mission) => mission.status === "completed"),
      canceled: visibleMissions.filter((mission) => mission.status === "canceled"),
    }
  }, [visibleMissions])

  const persistMissionStatus = async (missionId: string, status: MissionStatus) => {
    setUpdatingMissionId(missionId)

    try {
      const result = await updateMissionStatusAction(missionId, status)
      if (!result.ok) {
        setToast({ type: "error", message: "Could not update mission status right now." })
        return
      }

      router.refresh()
      await loadMissions()

      // Get the mission for savings information in toast
      const mission = missions.find((m) => m.id === missionId)
      const savingsValue = mission?.expected_savings_value
      const toastMessage = getMissionStatusToast(status, result.savingsCreated, savingsValue)
      
      setToast({ type: "success", message: toastMessage })
    } catch (error) {
      setToast({ type: "error", message: "Could not update mission status right now." })
    } finally {
      setUpdatingMissionId(null)
    }
  }

  const openMeasuredSavingsDialog = (missionId: string) => {
    const mission = missions.find((item) => item.id === missionId)
    if (!mission || mission.status !== "completed") {
      return
    }

    setMeasuredSavingsMissionId(missionId)
    setMeasuredSavingsValue(mission.actual_savings_value !== null ? String(Math.round(mission.actual_savings_value)) : "")
    setMeasuredSavingsNote(mission.actual_savings_note ?? "")
  }

  const submitMeasuredSavings = async () => {
    if (!measuredSavingsMission || measuredSavingsMission.status !== "completed") {
      setToast({ type: "error", message: "Could not record measured savings right now." })
      return
    }

    const parsedValue = Number(measuredSavingsValue.trim())
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setToast({ type: "error", message: "Could not record measured savings right now." })
      return
    }

    setSubmittingMeasuredSavings(true)

    try {
      const result = await submitMeasuredSavingsAction({
        missionId: measuredSavingsMission.id,
        actualSavingsValue: parsedValue,
        note: measuredSavingsNote,
      })

      if (!result.ok) {
        setToast({ type: "error", message: "Could not record measured savings right now." })
        return
      }

      router.refresh()
      await loadMissions()
      setMeasuredSavingsMissionId(null)
      setMeasuredSavingsValue("")
      setMeasuredSavingsNote("")
      setToast({ type: "success", message: "Actual savings recorded" })
    } catch {
      setToast({ type: "error", message: "Could not record measured savings right now." })
    } finally {
      setSubmittingMeasuredSavings(false)
    }
  }

  const hasMissions = missions.length > 0

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {toast ? (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-start justify-end gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2 px-5" onClick={() => router.push("/app/insights")}>
            <Sparkle className="h-4 w-4" weight="fill" />
            Generate AI Insights
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => router.push("/app/insights")}>
            Add Mission
          </Button>
          <Select value={filterBy} onValueChange={(value) => setFilterBy(value as MissionFilter)}>
            <SelectTrigger className="w-[150px] bg-white">
              <FadersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter: All</SelectItem>
              <SelectItem value="open">Filter: Open</SelectItem>
              <SelectItem value="in_progress">Filter: In Progress</SelectItem>
              <SelectItem value="completed">Filter: Completed</SelectItem>
              <SelectItem value="canceled">Filter: Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as MissionSort)}>
            <SelectTrigger className="w-[180px] bg-white">
              <ArrowsDownUp className="h-4 w-4" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value_desc">Sort: Highest ROI</SelectItem>
              <SelectItem value="due_soon">Sort: Due soon</SelectItem>
              <SelectItem value="newest">Sort: Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border border-border/80 bg-white/95 py-4 shadow-sm">
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <SummaryMetric label="Open missions" value={summary.openCount} />
          <SummaryMetric label="In progress" value={summary.inProgressCount} />
          <SummaryMetric label="Completed" value={summary.completedCount} />
          <SummaryMetric
            label="Expected monthly savings"
            value={formatCurrency(summary.totalExpectedMonthlySavings)}
          />
          <SummaryMetric
            label="Actual monthly savings"
            value={formatCurrency(summary.totalActualMonthlySavings)}
          />
        </CardContent>
      </Card>

      {pageError ? (
        <Card className="rounded-2xl border border-rose-200 bg-rose-50/70 py-10 text-center">
          <CardContent className="mx-auto max-w-xl">
            <h2 className="text-xl font-semibold text-rose-900">Could not load missions</h2>
            <p className="mt-2 text-rose-700">{pageError}</p>
            <Button className="mt-5" onClick={() => void loadMissions()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          <Card className="rounded-2xl border border-border/80 bg-white py-8">
            <CardContent>
              <p className="text-sm text-muted-foreground">Loading missions...</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/80 bg-white py-8">
            <CardContent>
              <p className="text-sm text-muted-foreground">Syncing accepted insight actions into mission tracking...</p>
            </CardContent>
          </Card>
        </div>
      ) : !hasMissions ? (
        <Card className="rounded-2xl border border-dashed border-border bg-white py-12">
          <CardContent className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lightbulb className="h-7 w-7" weight="duotone" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No missions yet</h2>
            <p className="mt-2 text-muted-foreground">
              No missions yet. Accept an AI insight to create your first mission.
            </p>
            <Button className="mt-5" onClick={() => router.push("/app/insights")}>
              Go to Insights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Execution Board</h2>
              <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-white p-1 sm:w-auto">
                <Button
                  variant={activeView === "board" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setActiveView("board")}
                >
                  <Circle className="h-4 w-4" weight={activeView === "board" ? "fill" : "regular"} />
                  Board
                </Button>
                <Button
                  variant={activeView === "table" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setActiveView("table")}
                >
                  <Table className="h-4 w-4" />
                  Table
                </Button>
              </div>
            </div>

            {activeView === "board" ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                {STATUS_COLUMNS.map((column) => (
                  <div key={column.key} className="min-w-0 rounded-2xl border border-border/80 bg-slate-50/70 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
                      <Badge variant="outline" className="bg-white text-muted-foreground">
                        {missionsByColumn[column.key].length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {missionsByColumn[column.key].length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-white p-4 text-xs text-muted-foreground">
                          No missions in this column.
                        </div>
                      ) : (
                        missionsByColumn[column.key].map((mission) => (
                          <MissionCard
                            key={mission.id}
                            mission={mission}
                            onViewDetails={setSelectedMissionId}
                            onTransition={(missionId, status) => void persistMissionStatus(missionId, status)}
                            onOpenMeasuredSavings={openMeasuredSavingsDialog}
                            updating={updatingMissionId === mission.id}
                          />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border border-border/80 bg-white py-2">
                <CardContent className="overflow-x-auto px-2 pb-2">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-3">Project</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Expected Savings</th>
                        <th className="px-3 py-3">Due Date</th>
                        <th className="px-3 py-3">Owner</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleMissions
                        .map((mission) => (
                          <tr
                            key={mission.id}
                            id={`mission-card-${mission.id}`}
                            className={`border-b border-border/70 last:border-0 ${
                              requestedMissionId === mission.id ||
                              (requestedSourceInsightId !== null && requestedSourceInsightId === mission.source_insight_id)
                                ? "bg-primary/5"
                                : ""
                            }`}
                          >
                            <td className="px-3 py-3">
                              <p className="font-medium text-foreground">{mission.title}</p>
                              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{shortDescription(mission.description_md)}</p>
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant="outline" className={statusBadgeClass(mission.status)}>
                                {statusLabel(mission.status)}
                              </Badge>
                            </td>
                            <td className="px-3 py-3 font-semibold text-foreground">
                              {formatCurrency(mission.expected_savings_value)}
                            </td>
                            <td className="px-3 py-3 text-muted-foreground">{formatDate(mission.due_date)}</td>
                            <td className="px-3 py-3 text-muted-foreground">{mission.owner ?? "Unassigned"}</td>
                            <td className="px-3 py-3">
                              <Button variant="outline" size="sm" onClick={() => setSelectedMissionId(mission.id)}>
                                View details
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </section>

          <aside>
            <Card className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white py-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Unlock equipment-aware missions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Add equipment to generate more specific actions, better ROI estimates, and deeper savings opportunities.
                </p>
                <Button className="w-full gap-2">
                  <Sparkle className="h-4 w-4" weight="fill" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      <Dialog open={selectedMission !== null} onOpenChange={(open) => !open && setSelectedMissionId(null)}>
        {selectedMission ? (
          <DialogContent className="right-0 left-auto top-0 h-screen w-full max-w-2xl translate-x-0 translate-y-0 rounded-none border-l border-border p-0 sm:max-w-2xl">
            <div className="h-full overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMission.title}</DialogTitle>
                <DialogDescription>
                  Project execution details and value tracking from accepted insights.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                  {renderMarkdownBlocks(selectedMission.description_md)}
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    {(() => {
                      const allowedTransitions = getAllowedTransitions(selectedMission.status)
                      const selectableStatuses = Array.from(new Set([selectedMission.status, ...allowedTransitions]))

                      return (
                    <Select
                      value={selectedMission.status}
                      disabled={selectableStatuses.length <= 1 || updatingMissionId === selectedMission.id}
                      onValueChange={(value) => void persistMissionStatus(selectedMission.id, value as MissionStatus)}
                    >
                      <SelectTrigger className="mt-1 w-full bg-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      )
                    })()}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{selectedMission.category ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Expected savings</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {formatCurrency(selectedMission.expected_savings_value)} / month
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Actual savings</p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {selectedMission.actual_savings_value
                        ? `${formatCurrency(selectedMission.actual_savings_value)} / month`
                        : "Pending measurement"}
                    </p>
                    <p className={`mt-1 text-xs font-semibold ${deltaClass(formatDeltaPercent(selectedMission.expected_savings_value, selectedMission.actual_savings_value))}`}>
                      {formatDeltaPercent(selectedMission.expected_savings_value, selectedMission.actual_savings_value) === null
                        ? "Delta: N/A"
                        : `Delta: ${formatSignedPercent(formatDeltaPercent(selectedMission.expected_savings_value, selectedMission.actual_savings_value) ?? 0)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Due date</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatDate(selectedMission.due_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{selectedMission.owner ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{selectedMission.location_name ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Source insight</p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {selectedMission.source_insight_title
                        ? `${selectedMission.source_insight_title}${
                            selectedMission.source_insight_id ? ` (#${selectedMission.source_insight_id})` : ""
                          }`
                        : "No linked insight"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {formatCompletedAgo(selectedMission.completed_at) ?? "Not completed"}
                      </p>
                      {selectedMission.status === "completed" && selectedMission.expected_savings_value > 0 ? (
                        <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-700 text-xs">
                          Savings recorded
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  {selectedMission.status === "open" ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => void persistMissionStatus(selectedMission.id, "in_progress")}
                        disabled={updatingMissionId === selectedMission.id}
                      >
                        <Clock className="h-4 w-4" weight="duotone" />
                        {updatingMissionId === selectedMission.id ? "Updating..." : "Start Mission"}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-muted-foreground"
                        onClick={() => void persistMissionStatus(selectedMission.id, "canceled")}
                        disabled={updatingMissionId === selectedMission.id}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : null}

                  {selectedMission.status === "in_progress" ? (
                    <>
                      <Button
                        onClick={() => void persistMissionStatus(selectedMission.id, "completed")}
                        disabled={updatingMissionId === selectedMission.id}
                      >
                        <CheckCircle className="h-4 w-4" weight="fill" />
                        {updatingMissionId === selectedMission.id ? "Updating..." : "Mark as Completed"}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-muted-foreground"
                        onClick={() => void persistMissionStatus(selectedMission.id, "canceled")}
                        disabled={updatingMissionId === selectedMission.id}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : null}

                  {selectedMission.status === "completed" ? (
                    <>
                      <Badge className="bg-emerald-600 text-white">
                        <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                        Completed
                      </Badge>
                      <Button
                        variant={selectedMission.actual_savings_value === null ? "default" : "outline"}
                        onClick={() => openMeasuredSavingsDialog(selectedMission.id)}
                        disabled={submittingMeasuredSavings}
                      >
                        {selectedMission.actual_savings_value === null ? "Add Actual Savings" : "Edit Actual Savings"}
                      </Button>
                    </>
                  ) : null}

                  {selectedMission.status === "canceled" ? (
                    <Button
                      variant="secondary"
                      onClick={() => void persistMissionStatus(selectedMission.id, "open")}
                      disabled={updatingMissionId === selectedMission.id}
                    >
                      {updatingMissionId === selectedMission.id ? "Updating..." : "Reopen"}
                    </Button>
                  ) : null}
                </section>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog
        open={measuredSavingsMission !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMeasuredSavingsMissionId(null)
            setMeasuredSavingsValue("")
            setMeasuredSavingsNote("")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {measuredSavingsMission?.actual_savings_value === null ? "Add Actual Savings" : "Edit Actual Savings"}
            </DialogTitle>
            <DialogDescription>
              Actual savings are user-reported and tracked separately from AI estimated savings.
            </DialogDescription>
          </DialogHeader>

          {measuredSavingsMission ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold text-foreground">{measuredSavingsMission.title}</p>
                <p className="mt-1 text-muted-foreground">
                  Expected: {formatCurrency(measuredSavingsMission.expected_savings_value)} / month
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actual-savings-value">Savings amount</Label>
                <Input
                  id="actual-savings-value"
                  type="number"
                  min="1"
                  step="1"
                  value={measuredSavingsValue}
                  onChange={(event) => setMeasuredSavingsValue(event.target.value)}
                  placeholder="180"
                  disabled={submittingMeasuredSavings}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actual-savings-note">Optional note</Label>
                <textarea
                  id="actual-savings-note"
                  className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={measuredSavingsNote}
                  onChange={(event) => setMeasuredSavingsNote(event.target.value)}
                  placeholder="How this value was measured"
                  disabled={submittingMeasuredSavings}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMeasuredSavingsMissionId(null)
                    setMeasuredSavingsValue("")
                    setMeasuredSavingsNote("")
                  }}
                  disabled={submittingMeasuredSavings}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void submitMeasuredSavings()}
                  disabled={
                    submittingMeasuredSavings ||
                    measuredSavingsValue.trim().length === 0 ||
                    !Number.isFinite(Number(measuredSavingsValue)) ||
                    Number(measuredSavingsValue) <= 0
                  }
                >
                  {submittingMeasuredSavings ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
