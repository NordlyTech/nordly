import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartLine, TrendUp, TrendDown, Leaf, Lightning, MapPin, Buildings } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

type OnboardingData = {
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

interface DashboardProps {
  data: OnboardingData
  onReset?: () => void
}

type Insight = {
  title: string
  value: string
  change: number
  icon: React.ElementType
  description: string
}

export function Dashboard({ data, onReset }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<Insight[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      const monthlyKwh = Number(data.energy.monthlyKwh.replace(/,/g, ''))
      const annualKwh = monthlyKwh * 12
      const co2Tons = (annualKwh * 0.0004).toFixed(1)
      const monthlyCost = (monthlyKwh * 0.15).toFixed(0)
      const savingsPotential = (monthlyKwh * 0.2 * 0.15).toFixed(0)
      
      setInsights([
        {
          title: 'CO₂ Emissions',
          value: `${co2Tons} tons/year`,
          change: -12,
          icon: Leaf,
          description: `Based on ${monthlyKwh.toLocaleString()} kWh monthly consumption`
        },
        {
          title: 'Energy Cost',
          value: `$${Number(monthlyCost).toLocaleString()}/month`,
          change: 8,
          icon: Lightning,
          description: 'Estimated based on regional averages'
        },
        {
          title: 'Savings Potential',
          value: `$${Number(savingsPotential).toLocaleString()}/month`,
          change: 20,
          icon: TrendDown,
          description: 'Achievable through efficiency improvements'
        }
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Energy Data</h3>
          <p className="text-muted-foreground">Generating personalized insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Nordly, {data.company.name}!</h1>
                <p className="text-lg text-muted-foreground">Your energy insights dashboard</p>
              </div>
              {onReset && (
                <Button variant="outline" onClick={onReset}>
                  Reset Demo
                </Button>
              )}
            </div>
            
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-3 flex-1">
                  <Buildings className="w-6 h-6 text-primary mt-1" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-semibold">{data.company.name}</p>
                    <p className="text-sm text-muted-foreground">{data.company.country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <MapPin className="w-6 h-6 text-primary mt-1" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{data.location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.location.type}
                      {data.location.area && ` • ${Number(data.location.area).toLocaleString()} sqm`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <Lightning className="w-6 h-6 text-primary mt-1" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Usage</p>
                    <p className="font-semibold">{data.energy.monthlyKwh} kWh</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Key Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" weight="duotone" />
                      </div>
                      <Badge variant={insight.change < 0 ? 'default' : 'secondary'} className="flex items-center gap-1">
                        {insight.change > 0 ? (
                          <TrendUp className="w-3 h-3" weight="bold" />
                        ) : (
                          <TrendDown className="w-3 h-3" weight="bold" />
                        )}
                        {Math.abs(insight.change)}%
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{insight.title}</h3>
                    <p className="text-2xl font-bold mb-2">{insight.value}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-r from-primary to-accent text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Ready to optimize your energy usage?</h3>
                  <p className="text-white/90">Get detailed recommendations and track your progress over time with AI-powered insights.</p>
                </div>
                <Button size="lg" variant="secondary" className="shrink-0">
                  View Full Report
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Optimize HVAC Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on your {data.location.type.toLowerCase()} profile, adjusting temperature settings during off-hours could reduce consumption by 15-20%.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">LED Lighting Upgrade</h4>
                    <p className="text-sm text-muted-foreground">
                      Switching to LED lighting could save approximately $50-80 monthly on your energy bill.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Energy Monitoring System</h4>
                    <p className="text-sm text-muted-foreground">
                      Installing smart meters can help identify peak usage times and optimize consumption patterns.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
