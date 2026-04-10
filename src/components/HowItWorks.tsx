import { UploadSimple, Lightning, FileText } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

const steps = [
  {
    icon: UploadSimple,
    title: 'Upload energy data',
    description: 'Import your energy consumption data from any source—CSV, API, or manual entry. Takes less than 2 minutes.',
  },
  {
    icon: Lightning,
    title: 'Get AI insights',
    description: 'Our AI analyzes patterns, identifies inefficiencies, and finds cost-saving opportunities in real-time.',
  },
  {
    icon: FileText,
    title: 'Generate ESG report',
    description: 'Receive comprehensive ESG reports with CO2 metrics, compliance data, and actionable recommendations.',
  },
]

export function HowItWorks() {
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
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            From data to insights in three simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
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
