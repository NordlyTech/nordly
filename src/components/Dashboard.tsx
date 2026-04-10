import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Lightning, Leaf, CurrencyEur, FileText } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { MetricCard } from '@/components/MetricCard'
import { AIInsightsList } from '@/components/AIInsightsList'
import { ComparisonChart } from '@/components/ComparisonChart'
import { LockedPremiumCard } from '@/components/LockedPremiumCard'
import { ESGReportDialog } from '@/components/ESGReportDialog'

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

export function Dashboard({ data, onReset }: DashboardProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  
  const metrics = useMemo(() => {
    const monthlyKwh = Number(data.energy.monthlyKwh.replace(/,/g, ''))
    const co2Kg = Math.round(monthlyKwh * 0.4)
    const averageCostPerKwh = 0.12
    const monthlyCost = Math.round(monthlyKwh * averageCostPerKwh)
    const savingsPercent = 18
    const monthlySavings = Math.round(monthlyCost * (savingsPercent / 100))
    
    return {
      monthlyKwh,
      co2Kg,
      monthlyCost,
      monthlySavings,
      savingsPercent
    }
  }, [data.energy.monthlyKwh])
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                {data.company.name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {data.location.type} • {data.location.name}
              </p>
            </div>
            {onReset && (
              <Button variant="outline" onClick={onReset} size="sm">
                Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Energy Consumption"
              value={metrics.monthlyKwh.toLocaleString()}
              unit="kWh/mo"
              icon={<Lightning className="w-6 h-6 text-primary" weight="duotone" />}
              delay={0}
            />
            
            <MetricCard
              label="CO₂ Emissions"
              value={metrics.co2Kg.toLocaleString()}
              unit="kg/mo"
              icon={<Leaf className="w-6 h-6 text-accent" weight="duotone" />}
              trend={{ value: -12, label: "12% lower" }}
              delay={0.1}
            />
            
            <MetricCard
              label="Estimated Savings"
              value={`€${metrics.monthlySavings.toLocaleString()}`}
              unit="/mo"
              icon={<CurrencyEur className="w-6 h-6 text-accent" weight="duotone" />}
              trend={{ value: metrics.savingsPercent, label: `${metrics.savingsPercent}%` }}
              delay={0.2}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <Button 
                size="lg" 
                className="w-full h-full min-h-[140px] flex-col gap-2"
                onClick={() => setReportDialogOpen(true)}
              >
                <FileText className="w-8 h-8" weight="duotone" />
                <span className="text-base font-semibold">Generate ESG Report</span>
              </Button>
            </motion.div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ComparisonChart 
              userValue={metrics.monthlyKwh} 
              locationType={data.location.type} 
            />
            
            <AIInsightsList companyData={data} />
          </div>
          
          <LockedPremiumCard />
        </motion.div>
      </div>
      
      <ESGReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        data={{
          companyName: data.company.name,
          energyKwh: metrics.monthlyKwh,
          co2Kg: metrics.co2Kg,
          savings: metrics.monthlySavings,
          locationType: data.location.type
        }}
      />
    </div>
  )
}
