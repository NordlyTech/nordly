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
}

type Insight = {
  text: string
  icon: React.ElementType
}

export function AIInsightsList({ companyData }: AIInsightsListProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const generateInsights = async () => {
      try {
        const monthlyKwh = Number(companyData.energy.monthlyKwh.replace(/,/g, ''))
        const locationType = companyData.location.type
        const area = companyData.location.area
        
        const promptText = `You are an energy efficiency expert. Generate exactly 4 actionable energy-saving insights for a ${locationType} business consuming ${monthlyKwh} kWh per month with ${area} square meters of space.

Return ONLY a JSON object (not an array) with this exact structure:
{
  "insights": [
    "First specific, actionable insight under 100 characters",
    "Second specific, actionable insight under 100 characters",
    "Third specific, actionable insight under 100 characters",
    "Fourth specific, actionable insight under 100 characters"
  ]
}

Make each insight:
- Specific to this business type and usage level
- Actionable with clear steps
- Include estimated savings when possible
- Professional and concise`

        const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
        const parsed = JSON.parse(result)
        
        const icons = [Lightbulb, CheckCircle, ChartBar, Sparkle]
        const formattedInsights: Insight[] = parsed.insights.map((text: string, idx: number) => ({
          text,
          icon: icons[idx % icons.length]
        }))
        
        setInsights(formattedInsights)
      } catch (error) {
        setInsights([
          { text: 'Optimize HVAC scheduling to reduce consumption during off-hours', icon: Lightbulb },
          { text: 'Upgrade to LED lighting for 30-40% lighting energy savings', icon: CheckCircle },
          { text: 'Install smart meters to identify and eliminate phantom loads', icon: ChartBar },
          { text: 'Consider solar panels to offset peak consumption periods', icon: Sparkle }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    const timer = setTimeout(generateInsights, 500)
    return () => clearTimeout(timer)
  }, [companyData])
  
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
            {insights.map((insight, idx) => {
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
