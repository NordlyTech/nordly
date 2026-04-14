"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface MetricCardProps {
  label: string
  value: string
  unit?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  delay?: number
}

export function MetricCard({ label, value, unit, icon, trend, delay = 0, containerBg = '#D9F0F7' }: MetricCardProps & { containerBg?: string }) {
  const [displayValue, setDisplayValue] = useState('0')
  
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (isNaN(numericValue)) {
      setDisplayValue(value)
      return
    }
    
    const duration = 800
    const steps = 60
    const increment = numericValue / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        const formatted = value.includes(',') 
          ? Math.floor(current).toLocaleString()
          : current.toFixed(value.includes('.') ? 1 : 0)
        setDisplayValue(formatted)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: containerBg }}>
              {icon}
            </div>
            {trend && (
              <Badge 
                variant={trend.value < 0 ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {trend.value > 0 ? (
                  <TrendUp className="w-3 h-3" weight="bold" />
                ) : (
                  <TrendDown className="w-3 h-3" weight="bold" />
                )}
                {trend.label}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className="font-mono text-4xl font-bold tracking-tight">
            {displayValue}
            {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
