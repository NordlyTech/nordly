import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fan, Lightbulb, HardDrives, ForkKnife, TrendUp, CurrencyEur, CalendarBlank } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

type EquipmentType = 'hvac' | 'lighting' | 'servers' | 'kitchen'

interface Equipment {
  type: EquipmentType
  name: string
  age: number
}

const EQUIPMENT_ICONS: Record<EquipmentType, typeof Fan> = {
  hvac: Fan,
  lighting: Lightbulb,
  servers: HardDrives,
  kitchen: ForkKnife
}

interface SavingsOpportunity {
  equipment: Equipment
  savingsPercent: number
  potentialSavingsKwh: number
  monthlySavings: number
  upgradeCost: number
  roiMonths: number
}

interface SavingsOpportunityCardProps {
  opportunity: SavingsOpportunity
  delay?: number
}

export function SavingsOpportunityCard({ opportunity, delay = 0 }: SavingsOpportunityCardProps) {
  const Icon = EQUIPMENT_ICONS[opportunity.equipment.type]
  const { equipment, savingsPercent, potentialSavingsKwh, monthlySavings, upgradeCost, roiMonths } = opportunity

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-accent" weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{equipment.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {equipment.age} years old
                </p>
              </div>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {savingsPercent}% savings
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <TrendUp className="w-3 h-3" />
                Savings
              </div>
              <div className="font-semibold text-sm">{potentialSavingsKwh} kWh</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <CurrencyEur className="w-3 h-3" />
                Monthly
              </div>
              <div className="font-semibold text-sm text-accent">€{monthlySavings}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <CalendarBlank className="w-3 h-3" />
                ROI
              </div>
              <div className="font-semibold text-sm">{roiMonths}mo</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Upgrade cost: <span className="font-semibold text-foreground">€{upgradeCost.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
