"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkle, Lightbulb } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export type DashboardInsight = {
  id: string
  title: string
  estimatedSavings: number
  status: 'new' | 'accepted' | 'dismissed'
}

interface AIInsightsListProps {
  insights: DashboardInsight[]
  onGenerate: () => void
  onAccept: (insightId: string) => void
  onDismiss: (insightId: string) => void
  expectedSavingsRange: {
    min: number
    max: number
  }
}

export function AIInsightsList({ insights, onGenerate, onAccept, onDismiss, expectedSavingsRange }: AIInsightsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-primary" weight="duotone" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
            <p className="text-sm font-medium text-foreground">
              No insights yet. Generate AI insights to discover savings opportunities.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Most businesses discover between €{expectedSavingsRange.min.toLocaleString()} and €{expectedSavingsRange.max.toLocaleString()} in monthly savings opportunities.
            </p>
            <Button className="mt-4" onClick={onGenerate}>
              Generate AI Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Lightbulb className="w-5 h-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Estimated savings: €{insight.estimatedSavings.toLocaleString()} / month
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium capitalize text-muted-foreground">
                      {insight.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept(insight.id)}
                      disabled={insight.status === 'accepted'}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDismiss(insight.id)}
                      disabled={insight.status === 'dismissed'}
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
