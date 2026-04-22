"use client"

import { useState } from "react"

import { PremiumUnlockModal } from "@/components/premium/PremiumUnlockModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/data/locations.shared"
import type { SavingsLeaderboardEntry } from "@/lib/api/leaderboard/getSavingsLeaderboard"

type SavingsLeaderboardProps = {
  entries: SavingsLeaderboardEntry[]
  isPremium: boolean
}

function medalForRank(rank: number) {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return null
}

function missionSummary(entry: SavingsLeaderboardEntry) {
  if (entry.completed_missions_count > 0) {
    return `${formatNumber(entry.mission_count)} missions • ${formatNumber(entry.completed_missions_count)} completed`
  }

  return `${formatNumber(entry.mission_count)} missions`
}

export function SavingsLeaderboard({ entries, isPremium }: SavingsLeaderboardProps) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) {
    return (
      <Card className="border border-border bg-white">
        <CardHeader>
          <CardTitle>Top savings locations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data yet — start by generating insights and accepting missions.
          </p>
        </CardContent>
      </Card>
    )
  }

  const visibleEntries = isPremium ? entries : entries.slice(0, 3)
  const lockedEntries = isPremium ? [] : entries.slice(3)

  return (
    <>
      <Card className="border border-border bg-white">
        <CardHeader>
          <CardTitle>Top savings locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleEntries.map((entry) => {
            const medal = medalForRank(entry.rank)
            const topRow = entry.rank === 1

            return (
              <div
                key={entry.location_id}
                className={`rounded-xl border px-4 py-3 ${topRow ? "border-primary/30 bg-primary/5" : "border-border/70 bg-slate-50/80"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">#{entry.rank}</span>
                      {medal ? <span aria-hidden="true">{medal}</span> : null}
                      <p className="truncate text-sm font-semibold text-foreground">{entry.location_name}</p>
                      {topRow ? <Badge className="bg-slate-900 text-white">Leader</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{missionSummary(entry)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{formatCurrency(entry.total_expected_savings)}</p>
                    <p className="text-xs text-muted-foreground">expected savings</p>
                  </div>
                </div>
              </div>
            )
          })}

          {lockedEntries.length > 0 ? (
            <div
              className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setOpen(true)
                }
              }}
            >
              <div className="space-y-2">
                {lockedEntries.map((entry) => (
                  <div key={entry.location_id} className="rounded-lg bg-white/80 px-3 py-2 opacity-70 blur-[1px]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">#{entry.rank} {entry.location_name}</p>
                      <p className="text-sm font-semibold text-primary">{formatCurrency(entry.total_expected_savings)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-sm font-medium text-foreground">Unlock full leaderboard with Premium</p>
                  <Button size="sm" onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setOpen(true)
                  }}>
                    Unlock
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <PremiumUnlockModal open={open} onOpenChange={setOpen} context="analytics" />
    </>
  )
}