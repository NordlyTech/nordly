import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ChartBar, CalendarBlank, FileText } from '@phosphor-icons/react'

export function ESGReportPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Professional ESG reports in seconds
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Generate comprehensive, audit-ready ESG reports that meet international standards. 
              Include CO2 emissions, energy consumption metrics, and actionable sustainability recommendations.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ChartBar size={20} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Detailed Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Visual charts and graphs that make complex data easy to understand
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarBlank size={20} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Historical Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Track progress over time with comparative analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} weight="bold" className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Export Ready</h4>
                  <p className="text-sm text-muted-foreground">
                    Download as PDF or share directly with stakeholders
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 shadow-2xl border-2">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <FileText size={24} weight="bold" className="text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">ESG Report 2024</h3>
                  <p className="text-sm text-muted-foreground">Generated on Jan 15, 2024</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Total Energy Consumption
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    342,500 kWh
                  </div>
                  <div className="text-sm text-primary mt-1">
                    ↓ 12% from last quarter
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    CO2 Emissions
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    156.4 tonnes
                  </div>
                  <div className="text-sm text-primary mt-1">
                    ↓ 18% reduction achieved
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Cost Savings
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    €8,420
                  </div>
                  <div className="text-sm text-primary mt-1">
                    This quarter
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">A</div>
                    <div className="text-xs text-muted-foreground mt-1">Efficiency Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-xs text-muted-foreground mt-1">Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">3.2</div>
                    <div className="text-xs text-muted-foreground mt-1">ESG Score</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
