import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
import {
  Plus,
  ArrowRight,
  Sparkle,
  ForkKn
  Fan,
  Lightbulb,
  HardDrives,
import { Equ
  TrendUp
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog'
import { EquipmentCard } from '@/components/EquipmentCard'
import { SavingsOpportunityCard } from '@/components/SavingsOpportunityCard'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export interface Equipment {
  id: string
  type: 'hvac' | 'lighting' | 'servers' | 'kitchen'
  name: string
  quantity: number
  powerRating: number
  servers: HardDrives
  age?: number


      const currentMonthly
      const monthlySavings = Ma
      const roiMonths = Math.round(
      return {
        savingsPercent,
 

    })

    const monthlyKwh =
      name: eq.name,
      type: eq.type,
 

    const equipmentWithId = {
      id: Date.now().toString()
    setEquipment((current) => [...(current || []), eq

  const handleDeleteEquipment = (id: st

  return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
          initial={{ opacity: 0,
       

          <p className="text-muted-foregr

            <Crown className="w-3 h-3 mr-1" 
          </Badge>

          <motion.div
            animate={{ opacit
          >
              <CardHeader>
                  <Lightbulb className="w-5 h-5 text-primary" weight="duo
                </CardTitle>
              <CardContent>

            </
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
          >
      name: eq.name,
                  <Spark
      type: eq.type,
      percentage: totalEnergyKwh > 0 ? (monthlyKwh / totalEnergyKwh) * 100 : 0
    }
  })

  const handleAddEquipment = (newEquipment: Omit<Equipment, 'id'>) => {
    const equipmentWithId = {
            transition
      id: Date.now().toString()
     
    setEquipment((current) => [...(current || []), equipmentWithId])
                    Add 
  }

  const handleDeleteEquipment = (id: string) => {
    setEquipment((current) => (current || []).filter(eq => eq.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
                   
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
                      <Sparkle clas
          </Badge>
                  <Ca

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
                      ))}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
              <mot
              <CardHeader>
              >
                  <CardHeader>
                  </CardHeader
                </CardTitle>
                        <Pi
              <CardContent>
                <div className="text-3xl font-bold text-primary">{totalEnergyKwh.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">kWh per month</div>
              </CardContent>
            </Card>
          </motion.div>

                     
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
           
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
                   
          </motion.div>

          <motion.div
            <motion.div
            animate={{ opacity: 1, y: 0 }}
            >
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
        </div>
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
    </div>
            <Card>

                <div className="flex items-center justify-between">
                  <CardTitle>Your Equipment</CardTitle>
                  <Button onClick={() => setDialogOpen(true)} size="sm">

                    Add Equipment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {equipmentList.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">


                    <p className="text-sm text-muted-foreground mb-4">
                      No equipment added yet. Start tracking your energy usage!
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Equipment
                    </Button>

                ) : (

                    {equipmentList.map((eq, index) => (
                      <EquipmentCard
                        key={eq.id}

                        onDelete={handleDeleteEquipment}
                        delay={index * 0.05}
                      />

                  </div>

              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {savingsOpportunities.length > 0 && (
              <motion.div

                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >

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

                          delay={index * 0.05}
                        />
                      ))}

                  </CardContent>

              </motion.div>


            {equipmentList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >

                  <CardHeader>

                  </CardHeader>

                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={energyShareData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}

                          dataKey="value"

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

                      </PieChart>


                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {Object.entries(EQUIPMENT_ICONS).map(([type, Icon]) => {
                        const typeEquipment = equipmentList.filter(eq => eq.type === type)
                        if (typeEquipment.length === 0) return null

                        const typeShare = energyShareData

                          .reduce((sum, data) => sum + data.percentage, 0)

                        return (

                            key={type}
                            className="flex items-center gap-2 p-3 rounded-lg border"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: EQUIPMENT_COLORS[type as keyof typeof EQUIPMENT_COLORS] }}
                            />

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



              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" weight="fill" />
                    Premium Features
                  </CardTitle>
                </CardHeader>

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

                    </div>

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

          </div>

      </div>

      <AddEquipmentDialog

        onOpenChange={setDialogOpen}

      />

  )

