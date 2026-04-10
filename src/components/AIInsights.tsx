import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Lightning, TrendUp, Warning } from '@phosphor-icons/react'

const insights = [
  {
    type: 'optimization',
    icon: Lightning,
    title: 'Peak Load Optimization',
    description: 'Your facility peaks at 2-4 PM. Shifting 15% of operations to off-peak hours could save €2,400/month.',
    impact: 'High Impact',
    impactColor: 'bg-primary text-primary-foreground',
    savings: '€2,400/mo',
  },
  {
    type: 'trend',
    icon: TrendUp,
    title: 'Energy Efficiency Improving',
    description: 'Your energy efficiency has improved 12% this quarter after implementing LED upgrades. ROI achieved in 18 months.',
    impact: 'Positive',
    impactColor: 'bg-secondary text-secondary-foreground',
    savings: '12% improvement',
  },
  {
    type: 'alert',
    icon: Warning,
    title: 'Anomaly Detected',
    description: 'HVAC system showing 23% higher consumption than baseline. Maintenance check recommended to prevent waste.',
    impact: 'Action Required',
    impactColor: 'bg-destructive text-destructive-foreground',
    savings: 'Prevent €800/mo loss',
  },
]

export function AIInsights() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            AI insights in action
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Real examples of how Nordly identifies opportunities and alerts you to issues
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <insight.icon size={20} weight="bold" className="text-primary" />
                  </div>
                  <Badge className={insight.impactColor}>
                    {insight.impact}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {insight.description}
                </p>
                <div className="pt-4 border-t border-border">
                  <div className="text-lg font-bold text-primary">
                    {insight.savings}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
