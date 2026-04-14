"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkle, CheckCircle, Lightbulb, ChartBar } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AIInsightsListProps {
  companyData: {
    company: {
      name: string
      country: string
    }
    location: {
      name: string
      type: string
      area: string
    }
    energy: {
      monthlyKwh: string
    }
  }
  insights: string[]
}

type Insight = {
  text: string
  icon: React.ElementType
}

export function AIInsightsList({ insights: insightItems }: AIInsightsListProps) {
  const [displayedInsights, setDisplayedInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const icons = [Lightbulb, CheckCircle, ChartBar]
      const resolvedInsights = insightItems.slice(0, 3).map((text, idx) => ({
        text,
        icon: icons[idx % icons.length],
      }))

      setDisplayedInsights(resolvedInsights)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [insightItems])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-primary" weight="duotone" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedInsights.length === 0 && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  No AI insights yet. New recommendations will appear once enough usage data is available.
                </p>
              </div>
            )}

            {displayedInsights.map((insight, idx) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" weight="duotone" />
                  </div>
                  <p className="text-sm leading-relaxed pt-1">{insight.text}</p>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
