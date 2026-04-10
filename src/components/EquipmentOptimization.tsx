import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Lightbulb, 
  ForkKni
  TrendUp,
  Crown,
} from '@p
  CookingPot,
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
