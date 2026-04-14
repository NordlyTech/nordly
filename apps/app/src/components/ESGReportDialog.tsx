"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Calendar, Buildings, Leaf, Lightning } from '@phosphor-icons/react'

interface ESGReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    companyName: string
    energyKwh: number
    co2Kg: number
    savings: number
    locationType: string
  }
}

export function ESGReportDialog({ open, onOpenChange, data }: ESGReportDialogProps) {
  const [downloading, setDownloading] = useState(false)
  
  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      onOpenChange(false)
    }, 1500)
  }
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" weight="duotone" />
            ESG Sustainability Report
          </DialogTitle>
          <DialogDescription>
            Environmental, Social, and Governance metrics for {data.companyName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Generated on {today}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Buildings className="w-5 h-5 text-primary mt-0.5" weight="duotone" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Organization</h4>
                <p className="text-sm text-muted-foreground">{data.companyName}</p>
                <p className="text-sm text-muted-foreground">Type: {data.locationType}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Lightning className="w-5 h-5 text-primary mt-0.5" weight="duotone" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Energy Consumption</h4>
                <p className="text-2xl font-mono font-bold">{data.energyKwh.toLocaleString()} kWh</p>
                <p className="text-sm text-muted-foreground mt-1">Monthly energy usage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Leaf className="w-5 h-5 text-accent mt-0.5" weight="duotone" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Carbon Footprint</h4>
                <p className="text-2xl font-mono font-bold">{data.co2Kg.toLocaleString()} kg CO₂</p>
                <p className="text-sm text-muted-foreground mt-1">Monthly carbon emissions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold mb-1 text-accent">Sustainability Score</h4>
                <p className="text-3xl font-bold text-accent">B+</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Above average compared to similar {data.locationType.toLowerCase()}s
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-semibold">Key Recommendations</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Implement energy-efficient HVAC scheduling to reduce consumption</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Upgrade to LED lighting systems for improved efficiency</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Consider renewable energy sources to offset carbon emissions</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button onClick={handleDownload} disabled={downloading} className="flex-1">
            <Download className="w-4 h-4 mr-2" weight="bold" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
