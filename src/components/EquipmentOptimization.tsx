import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
import { 
  ForkKnife,
  TrendUp,
  Crown,
  Plus,
  Arrow
  HardDriv
import { mot
import { AddEquipmentDialog } 
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
  servers: HardDrives
  age?: number


  })
  const savingsOpportunities = 
    .map(eq => {
      const savingsPercent = eq.ty
      const costPerKwh = 0.12
 


        equipmen
        potentialSavin
        upgradeCos
      }
 

    setDialogOpen(false)

    setEquipment((current = []) => current.filter(eq 

    <div className="min-h-screen bg-gradient-to-br from-
        <motion.div
          animate={{ opacity: 
       

              <h1 className="text-3xl font-bold
                <Crown className="w-3 h-3 mr-1" weight="fill" />
              </Badge>
            
            </p>
        </motion.div
        <div className="
            initial={{ opacity: 0, y: 20 }}
     
    

                  Total Energy Usage
              </CardHeader>
                
              </CardContent>
          </motion.div>
          <motion.div
            animate={{ opacit
          >
              <CardHeader>
                  <TrendUp className="w-5 h-5 text-accent" weight=
                </CardTitle>
              <CardContent>

              
            </Card>

            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2
            <Card>
                <
       
      
                <div className="text-sm text-muted-foreg

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
   

                <CardHeader>
                    <CardTitle>Your Equipment</CardTitle>
   

          
                  {equipment.length === 0 ? (
                      <div className="w-16 h-16 rounded-full bg-mut
                   
                      <p className="text-s
                      </p>
                        <Plus className=
                      </Button>
         
               
                          key={eq.id}
                          onDelete={handleDeleteEquipment}
                        />
                    </div>
                </CardC
            </motion.d
            {savin
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                
                
                     

                    <div className="space-y-4">
                     
                          opportunity={oppo
                        />
                    </div>
           
            )}

            {equipment.length > 0 && (
                initial={{ opacity: 0, y: 20 }}
                transition={{ durati
                <Card>
                    <CardTi
                  <CardCont
                      <PieChart>
                          data={energyShareData}
                          cy
                   
                       

                     
                        </Pie>
                          formatter={(valu
                            backgroundColor: 'oklch(1 0
           
                  
                    </Resp
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        const typeEquipment = equipment.filter(eq => eq.typ
                        
                          .f

                          <
                            className="flex items-center gap-2 p
                            <div
                      
                            <Icon className="w-4 h-4" />
                            
                   
                       

                </Car
            )}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
           
                <C
                    <Crown
                  </CardTitle>
                <CardContent clas
                    You're u
                  
                    <div cl
                      Real-time equipment monitoring
                    <div className="flex items-center gap-2">
                      Predic
                   
                      C
              

                    <ArrowRight className="w-4 h-4 ml-2" />
                </CardContent>
            </motion.di
        </div>

        open={dialogOpen}
        onAdd
    </div>
}

































































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
from '@/components/AddEquipmentDialog'
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

const EQUIPMENT_ICONS = {
  hvac: Fan,
  lighting: Lightbulb,
  servers: HardDrives,
  kitchen: ForkKnife
}

const EQUIPMENT_COLORS = {
  hvac: 'oklch(0.58 0.12 230)',
  lighting: 'oklch(0.65 0.14 155)',
  servers: 'oklch(0.7 0.15 280)',
  kitchen: 'oklch(0.75 0.12 60)'
}

export function EquipmentOptimization() {
  const [equipment, setEquipment] = useKV<Equipment[]>('equipment', [])
  const [dialogOpen, setDialogOpen] = useState(false)

  const equipmentList = equipment || []

  const totalEnergyKwh = equipmentList.reduce((sum, eq) => {
    const dailyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity
    return sum + (dailyKwh * 30)
  }, 0)

  const totalCost = totalEnergyKwh * 0.12

  const savingsOpportunities = equipmentList
    .filter(eq => eq.age && eq.age >= 5)
    .map(eq => {
      const savingsPercent = eq.type === 'hvac' ? 25 : eq.type === 'lighting' ? 40 : eq.type === 'servers' ? 30 : 20
      const costPerKwh = 0.12
      const currentMonthlyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity * 30
      const potentialSavingsKwh = Math.round(currentMonthlyKwh * (savingsPercent / 100))
      const monthlySavings = Math.round(potentialSavingsKwh * costPerKwh)
      const upgradeCost = eq.type === 'hvac' ? 5000 : eq.type === 'servers' ? 3000 : eq.type === 'lighting' ? 500 : 2000
      const roiMonths = Math.round(upgradeCost / monthlySavings)

      return {
        equipment: eq,
        savingsPercent,
        potentialSavingsKwh,
        monthlySavings,
        upgradeCost,
        roiMonths
      }
    })
    .sort((a, b) => b.monthlySavings - a.monthlySavings)

  const energyShareData = equipmentList.map(eq => {
    const monthlyKwh = (eq.powerRating / 1000) * eq.hoursPerDay * eq.quantity * 30
    return {
      name: eq.name,
      value: monthlyKwh,
      type: eq.type,
      percentage: totalEnergyKwh > 0 ? (monthlyKwh / totalEnergyKwh) * 100 : 0
    }
  })

  const handleAddEquipment = (newEquipment: Omit<Equipment, 'id'>) => {
    const equipmentWithId = {
      ...newEquipment,
      id: Date.now().toString()
    }
    setEquipment((current) => [...(current || []), equipmentWithId])
    setDialogOpen(false)
  }

  const handleDeleteEquipment = (id: string) => {
    setEquipment((current) => (current || []).filter(eq => eq.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">Equipment Energy Optimizer</h1>
          <p className="text-muted-foreground">
            Track your equipment energy usage and discover savings opportunities
          </p>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Crown className="w-3 h-3 mr-1" weight="fill" />
            Premium Features Enabled
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CookingPot className="w-5 h-5 text-primary" weight="duotone" />
                  Total Energy Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{totalEnergyKwh.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">kWh per month</div>
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
                  <TrendUp className="w-5 h-5 text-accent" weight="duotone" />
                  Monthly Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">€{totalCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">at €0.12/kWh</div>
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
                  <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{savingsOpportunities.length}</div>
                <div className="text-sm text-muted-foreground">savings found</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {equipmentList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <CookingPot className="w-8 h-8 text-muted-foreground" weight="duotone" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      No equipment added yet. Start tracking your energy usage!
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Equipment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {equipmentList.map((eq, index) => (
                      <EquipmentCard
                        key={eq.id}
                        equipment={eq}
                        onDelete={handleDeleteEquipment}
                        delay={index * 0.05}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {savingsOpportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkle className="w-5 h-5 text-accent" weight="fill" />
                      Savings Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {savingsOpportunities.map((opportunity, index) => (
                        <SavingsOpportunityCard
                          key={opportunity.equipment.id}
                          opportunity={opportunity}
                          delay={index * 0.05}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {equipmentList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
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
                        const typeEquipment = equipmentList.filter(eq => eq.type === type)
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
              transition={{ duration: 0.4, delay: 0.4 }}
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
