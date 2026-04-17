import { Buildings, Lightning, Rocket, ChartLineUp } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

const steps = [
  {
    icon: Buildings,
    title: 'Add your locations',
    description: 'Choose location type such as office, hotel, retail, or warehouse.',
  },
  {
    icon: Lightning,
    title: 'Get AI insights',
    description: 'Nordly analyzes your context and identifies savings opportunities.',
  },
  {
    icon: Rocket,
    title: 'Turn insights into missions',
    description: 'Convert recommendations into clear actions for your team.',
  },
  {
    icon: ChartLineUp,
    title: 'Track savings',
    description: 'See expected and real savings over time.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Locations to savings in four simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <Card className="relative p-8 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <div className="absolute -top-4 left-8">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                    <step.icon size={24} weight="bold" className="text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-muted-foreground">
                      STEP {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
