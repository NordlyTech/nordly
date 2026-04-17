import { Brain, Rocket, ChartLineUp } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

const loopSteps = [
  {
    icon: Brain,
    title: 'Insights',
    description: 'AI identifies hidden energy waste and reveals your biggest savings opportunities.',
  },
  {
    icon: Rocket,
    title: 'Missions',
    description: 'Turn insights into clear missions your team can execute across every location.',
  },
  {
    icon: ChartLineUp,
    title: 'Savings',
    description: 'Track expected and real savings over time so impact is measurable and visible.',
  },
]

export function ValueLoop() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            From insights to measurable savings
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Nordly turns energy intelligence into action with a practical loop your team can run every week.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loopSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              <Card className="h-full p-7 border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon size={24} weight="bold" className="text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>

              {index < loopSteps.length - 1 && (
                <div className="hidden md:flex items-center justify-center absolute top-1/2 -right-5 z-10">
                  <span className="text-primary text-2xl font-bold">→</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
