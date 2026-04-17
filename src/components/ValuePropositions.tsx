import { TrendDown, Rocket, ChartLineUp, FileText } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

const values = [
  {
    icon: TrendDown,
    title: 'Reduce costs',
    description: 'Identify inefficiencies and reduce energy costs by up to 30%.',
    stat: 'Up to 30%',
    statLabel: 'Cost reduction potential',
  },
  {
    icon: Rocket,
    title: 'Take action',
    description: 'Turn AI insights into missions your team can execute.',
    stat: 'Faster',
    statLabel: 'From insight to action',
  },
  {
    icon: ChartLineUp,
    title: 'Track savings',
    description: 'See expected and real savings across locations.',
    stat: 'Live',
    statLabel: 'Savings visibility',
  },
  {
    icon: FileText,
    title: 'ESG reporting',
    description: 'Generate ESG reports automatically from real improvements.',
    stat: 'Auto',
    statLabel: 'Reporting generated',
  },
]

export function ValuePropositions() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Built to reduce costs and prove outcomes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Nordly helps teams find waste, execute improvements, and document impact at scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-2 hover:border-primary/20">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                  <value.icon size={28} weight="bold" className="text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {value.description}
                </p>
                <div className="pt-6 border-t border-border">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {value.stat}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {value.statLabel}
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
