import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Buildings, MapPin, Lightning, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'

type CompanyData = {
  name: string
  country: string
}

type LocationData = {
  name: string
  type: string
  area: string
}

type EnergyData = {
  monthlyKwh: string
}

type OnboardingData = {
  company: CompanyData
  location: LocationData
  energy: EnergyData
}

const COUNTRIES = [
  'Norway', 'Sweden', 'Denmark', 'Finland', 'United States', 'United Kingdom', 
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria',
  'Switzerland', 'Poland', 'Canada', 'Australia', 'Japan', 'Singapore'
]

const LOCATION_TYPES = [
  'Office', 'Retail Store', 'Hotel', 'Restaurant', 'Warehouse', 
  'Manufacturing Facility', 'Data Center', 'Shopping Mall', 'Gym', 'Hospital'
]

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState<CompanyData>({ name: '', country: '' })
  const [location, setLocation] = useState<LocationData>({ name: '', type: '', area: '' })
  const [energy, setEnergy] = useState<EnergyData>({ monthlyKwh: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!company.name.trim()) newErrors.name = 'Company name is required'
    if (!company.country) newErrors.country = 'Please select a country'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!location.name.trim()) newErrors.locationName = 'Location name is required'
    if (!location.type) newErrors.locationType = 'Please select a location type'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!energy.monthlyKwh.trim()) {
      newErrors.monthlyKwh = 'Monthly kWh is required'
    } else if (isNaN(Number(energy.monthlyKwh.replace(/,/g, '')))) {
      newErrors.monthlyKwh = 'Please enter a valid number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    if (step === 1) isValid = validateStep1()
    if (step === 2) isValid = validateStep2()
    
    if (isValid) {
      setStep(step + 1)
      setErrors({})
    }
  }

  const handleComplete = () => {
    if (validateStep3()) {
      onComplete({ company, location, energy })
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, '')
    if (num && !isNaN(Number(num))) {
      return Number(num).toLocaleString()
    }
    return value
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <Card className="w-full max-w-2xl p-8 md:p-12 shadow-lg">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    s < step ? 'bg-accent text-white' : s === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s < step ? <CheckCircle weight="fill" className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && <div className={`h-0.5 w-12 mx-2 transition-all ${s < step ? 'bg-accent' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          
          <div className="h-1 bg-muted rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Buildings className="w-6 h-6 text-primary" weight="duotone" />
                <h2 className="text-2xl font-semibold">Company Information</h2>
              </div>
              <p className="text-muted-foreground">Let's start with your company details</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="Enter your company name"
                  className={`mt-1.5 ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={company.country} onValueChange={(value) => setCompany({ ...company, country: value })}>
                  <SelectTrigger id="country" className={`mt-1.5 ${errors.country ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} size="lg" className="px-8">
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-primary" weight="duotone" />
                <h2 className="text-2xl font-semibold">Add Your First Location</h2>
              </div>
              <p className="text-muted-foreground">Tell us about your primary energy consumption site</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="location-name">Location Name *</Label>
                <Input
                  id="location-name"
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                  placeholder="e.g., Headquarters, Main Office"
                  className={`mt-1.5 ${errors.locationName ? 'border-destructive' : ''}`}
                />
                {errors.locationName && <p className="text-sm text-destructive mt-1">{errors.locationName}</p>}
              </div>

              <div>
                <Label htmlFor="location-type">Location Type *</Label>
                <Select value={location.type} onValueChange={(value) => setLocation({ ...location, type: value })}>
                  <SelectTrigger id="location-type" className={`mt-1.5 ${errors.locationType ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationType && <p className="text-sm text-destructive mt-1">{errors.locationType}</p>}
              </div>

              <div>
                <Label htmlFor="area">Area (sqm)</Label>
                <Input
                  id="area"
                  value={location.area}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setLocation({ ...location, area: value })
                  }}
                  placeholder="Optional"
                  className="mt-1.5"
                />
                <p className="text-sm text-muted-foreground mt-1">This helps us provide better insights</p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline" size="lg">
                Back
              </Button>
              <Button onClick={handleNext} size="lg" className="px-8">
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Lightning className="w-6 h-6 text-primary" weight="duotone" />
                <h2 className="text-2xl font-semibold">Add Energy Data</h2>
              </div>
              <p className="text-muted-foreground">Enter your monthly energy consumption to get started</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="monthly-kwh">Monthly kWh Consumption *</Label>
                <Input
                  id="monthly-kwh"
                  value={energy.monthlyKwh}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setEnergy({ ...energy, monthlyKwh: formatNumber(value) })
                  }}
                  placeholder="e.g., 15,000"
                  className={`mt-1.5 ${errors.monthlyKwh ? 'border-destructive' : ''}`}
                />
                {errors.monthlyKwh && <p className="text-sm text-destructive mt-1">{errors.monthlyKwh}</p>}
                <p className="text-sm text-muted-foreground mt-1">Your average monthly electricity usage in kilowatt-hours</p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline" size="lg">
                Back
              </Button>
              <Button onClick={handleComplete} size="lg" className="px-8">
                Complete Setup
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  )
}
