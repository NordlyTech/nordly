"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function LockedPremiumCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="relative overflow-hidden border-2 border-dashed border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" weight="duotone" />
            Premium Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Detailed Equipment Savings Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock granular insights into individual equipment efficiency, ROI calculations, 
                and customized upgrade recommendations.
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                Equipment-level energy breakdown
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                Custom maintenance schedules
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkle className="w-4 h-4 text-accent" weight="fill" />
                Replacement ROI calculator
              </div>
            </div>
            
            <Button className="w-full mt-4" size="lg">
              Unlock Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
