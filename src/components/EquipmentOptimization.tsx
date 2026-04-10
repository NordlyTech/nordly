import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Fan, 
  Lightbulb, 
  HardDrives, 
  ForkKnife,
  Plus,
  TrendUp,
  Sparkle,
  Crown,
  ArrowRight
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog'
import { EquipmentCard } from '@/components/EquipmentCard'
import { SavingsOpportunityCard } from '@/components/SavingsOpportunityCard'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export type Equipment = {
  id: string
  type: 'hvac' | 'lighting' | 'servers' | 'kitchen'
  name: string
  quantity: number
  powerRating: number
  hoursPerDay: number
  age?: number
}

const EQUIPMENT_COLORS = {
  hvac: 'oklch(0.65 0.14 155)',
  lighting: 'oklch(0.75 0.15 85)',
  servers: 'oklch(0.58 0.12 230)',
  kitchen: 'oklch(0.65 0.12 25)'
}

const EQUIPMENT_ICONS = {
  hvac: Fan,
  lighting: Lightbulb,
  servers: HardDrives,
  kitchen: ForkKnife
}

export function EquipmentOptimization() {
  const [equipment = [], setEquipment] = useKV<Equipment[]>('nordly-equipment', [])
  const [dialogOpen, setDialogOpen] = useState(false)

  const totalEnergyKwh = equipment.reduce((sum, eq) => {
    const dailyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity
    return sum + dailyKwh * 30
  }, 0)

  const energyShareData = equipment.map(eq => {
    const dailyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity
    const monthlyKwh = dailyKwh * 30
    return {
      name: eq.name,
      type: eq.type,
      value: monthlyKwh,
      percentage: totalEnergyKwh > 0 ? (monthlyKwh / totalEnergyKwh) * 100 : 0
    }
  })

  const savingsOpportunities = equipment
    .filter(eq => eq.age && eq.age > 5)
    .map(eq => {
      const currentMonthlyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity * 30
      const savingsPercent = eq.type === 'lighting' ? 60 : eq.type === 'hvac' ? 30 : eq.type === 'servers' ? 25 : 20
      const potentialSavings = currentMonthlyKwh * (savingsPercent / 100)
      const costPerKwh = 0.12
      const monthlySavings = potentialSavings * costPerKwh
      const upgradeCost = eq.type === 'lighting' ? 150 * eq.quantity : 
                         eq.type === 'hvac' ? 3000 * eq.quantity :
                         eq.type === 'servers' ? 2000 * eq.quantity : 1200 * eq.quantity
      const roiMonths = Math.round(upgradeCost / monthlySavings)

      return {
        equipment: eq,
        savingsPercent,
        potentialSavingsKwh: Math.round(potentialSavings),
        monthlySavings: Math.round(monthlySavings),
        upgradeCost,
        roiMonths
      }
    })
    .sort((a, b) => b.monthlySavings - a.monthlySavings)

  const handleAddEquipment = (newEquipment: Omit<Equipment, 'id'>) => {
    setEquipment((current = []) => [...current, { ...newEquipment, id: Date.now().toString() }])
    setDialogOpen(false)
  }

  const handleDeleteEquipment = (id: string) => {
    setEquipment((current = []) => current.filter(eq => eq.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Equipment Optimization</h1>
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                <Crown className="w-3 h-3 mr-1" weight="fill" />
                PREMIUM
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Track equipment energy usage and identify upgrade opportunities
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-accent" weight="fill" />
                  Total Energy Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalEnergyKwh.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">kWh/month</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendUp className="w-5 h-5 text-accent" weight="fill" />
                  Potential Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  €{savingsOpportunities.reduce((sum, opp) => sum + opp.monthlySavings, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">per month</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Equipment Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{equipment.length}</div>
                <div className="text-sm text-muted-foreground mt-1">items tracked</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Equipment</CardTitle>
                    <Button onClick={() => setDialogOpen(true)} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Equipment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {equipment.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-2">No equipment added yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start tracking your energy usage by adding equipment
                      </p>
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Your First Equipment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {equipment.map((eq, index) => (
                        <EquipmentCard
                          key={eq.id}
                          equipment={eq}
                          onDelete={handleDeleteEquipment}
                          delay={0.3 + index * 0.05}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {savingsOpportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendUp className="w-5 h-5 text-accent" weight="duotone" />
                      Savings Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {savingsOpportunities.map((opportunity, index) => (
                        <SavingsOpportunityCard
                          key={opportunity.equipment.id}
                          opportunity={opportunity}
                          delay={0.35 + index * 0.05}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Energy Share by Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={energyShareData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {energyShareData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={EQUIPMENT_COLORS[entry.type]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${Math.round(value)} kWh`}
                          contentStyle={{
                            backgroundColor: 'oklch(1 0 0)',
                            border: '1px solid oklch(0.90 0.005 240)',
                            borderRadius: '0.75rem'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {Object.entries(EQUIPMENT_ICONS).map(([type, Icon]) => {
                        const typeEquipment = equipment.filter(eq => eq.type === type)
                        if (typeEquipment.length === 0) return null
                        
                        const typeShare = energyShareData
                          .filter(data => data.type === type)
                          .reduce((sum, data) => sum + data.percentage, 0)

                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2 p-3 rounded-lg border"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: EQUIPMENT_COLORS[type as keyof typeof EQUIPMENT_COLORS] }}
                            />
                            <Icon className="w-4 h-4" />
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground capitalize">{type}</div>
                              <div className="text-sm font-semibold">{typeShare.toFixed(1)}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" weight="fill" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You're using all premium equipment optimization features. Upgrade to unlock even more advanced analytics.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                      Real-time equipment monitoring
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                      Predictive maintenance alerts
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                      Custom efficiency benchmarks
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Upgrade to Enterprise
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <AddEquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddEquipment}
      />
    </div>
  )
}
