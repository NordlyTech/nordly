import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Fan, Lightbulb, HardDrives, ForkKnife, Trash } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Equipment } from '@/components/EquipmentOptimization'

const EQUIPMENT_ICONS = {
  hvac: Fan,
  lighting: Lightbulb,
  servers: HardDrives,
  kitchen: ForkKnife
}

interface EquipmentCardProps {
  equipment: Equipment
  onDelete: (id: string) => void
  delay?: number
}

export function EquipmentCard({ equipment, onDelete, delay = 0 }: EquipmentCardProps) {
  const Icon = EQUIPMENT_ICONS[equipment.type]
  const dailyKwh = (equipment.powerRating / 1000) * equipment.hoursPerDay * equipment.quantity
  const monthlyKwh = dailyKwh * 30

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{equipment.name}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Qty:</span> {equipment.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Power:</span> {equipment.powerRating}W
                  </div>
                  <div>
                    <span className="font-medium">Usage:</span> {equipment.hoursPerDay}h/day
                  </div>
                  {equipment.age && (
                    <div>
                      <span className="font-medium">Age:</span> {equipment.age} years
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm font-semibold text-primary">
                  {monthlyKwh.toFixed(0)} kWh/month
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              onClick={() => onDelete(equipment.id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
