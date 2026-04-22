"use client"

import { startTransition, useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Buildings, MapPin, Lightning, CheckCircle } from '@phosphor-icons/react'
import { NordlyMark } from '@/components/brand/NordlyMark'
import { motion } from 'framer-motion'
import { submitOnboarding } from '@/app/onboarding/actions'

type CompanyData = {
  name: string
  country: string
}

type LocationData = {
  name: string
  type: string
  country: string
  city: string
  address: string
  occupancyNotes: string
  operatingHoursNotes: string
  area: string
  monthlyEnergyKwh: string
  monthlyEnergyCost: string
}

const COUNTRIES = [
  'Norway', 'Sweden', 'Denmark', 'Finland', 'United States', 'United Kingdom', 
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria',
  'Switzerland', 'Poland', 'Canada', 'Australia', 'Japan', 'Singapore'
]

const LOCATION_TYPES = [
  { label: 'Office', value: 'office' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Retail', value: 'retail' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'School', value: 'school' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Industrial (Light Use)', value: 'industrial_light_use' },
  { label: 'Other', value: 'other' },
]

type OnboardingState = {
  error: string | null
  success: boolean
}

const initialOnboardingState: OnboardingState = {
  error: null,
  success: false,
}

const STEP_LABELS = ['Company details', 'First location', 'Additional context', 'Review and submit']

function NordlyOnboardingBrand() {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
      <div className="nordly-logo-entrance">
        <NordlyMark />
      </div>
      <div>
        <p className="text-xl font-bold tracking-tight text-foreground">Nordly</p>
        <p className="text-xs text-muted-foreground">Onboarding</p>
      </div>
    </div>
  )
}

export function OnboardingWizard() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitOnboarding, initialOnboardingState)
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState<CompanyData>({ name: '', country: '' })
  const [location, setLocation] = useState<LocationData>({
    name: '',
    type: '',
    country: '',
    city: '',
    address: '',
    occupancyNotes: '',
    operatingHoursNotes: '',
    area: '',
    monthlyEnergyKwh: '',
    monthlyEnergyCost: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Navigate to dashboard on successful onboarding
  useEffect(() => {
    if (state.success && !isPending) {
      router.replace('/app')
    }
  }, [state.success, isPending, router])

  const locationTypeLabel = useMemo(
    () => LOCATION_TYPES.find((entry) => entry.value === location.type)?.label ?? '-',
    [location.type]
  )

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
    if (!location.type) newErrors.locationType = 'Location type is required'
    if (!location.country) newErrors.locationCountry = 'Please select a country'
    if (!location.city.trim()) newErrors.locationCity = 'City is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    setErrors({})
    return true
  }

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {}
    if (!company.name.trim() || !company.country) {
      newErrors.review = 'Please complete company details.'
    }
    if (!location.name.trim() || !location.type || !location.country || !location.city.trim()) {
      newErrors.review = 'Please complete required location details, including location type.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    if (step === 1) isValid = validateStep1()
    if (step === 2) isValid = validateStep2()
    if (step === 3) isValid = validateStep3()
    
    if (isValid) {
      setStep(step + 1)
    }
  }

  const handleComplete = () => {
    if (!validateStep4()) {
      return
    }

    const formData = new FormData()
    formData.set('company_name', company.name)
    formData.set('company_industry', 'General')
    formData.set('company_country', company.country)

    formData.set('location_name', location.name)
    formData.set('location_type', location.type)
    formData.set('location_country', location.country)
    formData.set('location_city', location.city)
    formData.set('location_address', location.address)
    formData.set('occupancy_notes', location.occupancyNotes)
    formData.set('operating_hours_notes', location.operatingHoursNotes)

    if (location.area) {
      formData.set('floor_area_sqm', location.area)
    }

    if (location.monthlyEnergyKwh) {
      formData.set('monthly_energy_kwh', location.monthlyEnergyKwh)
    }

    if (location.monthlyEnergyCost) {
      formData.set('monthly_energy_cost', location.monthlyEnergyCost)
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const formatPositiveNumber = (value: string) => {
    const num = value.replace(/,/g, '')
    if (num && !isNaN(Number(num))) {
      return Number(num).toLocaleString()
    }
    return num
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#d9f0f7_0%,#f4f8fb_45%,#ffffff_100%)] p-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      <Card className="relative z-10 w-full max-w-2xl border border-primary/10 bg-white/95 p-6 shadow-xl backdrop-blur-sm md:p-10">
        <div className="mb-8 flex flex-col gap-5">
          <NordlyOnboardingBrand />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Build your first energy workspace
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Complete setup in a few quick steps. We use these details to personalize insights and recommendations.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    s < step
                      ? 'bg-primary text-white'
                      : s === step
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {s < step ? <CheckCircle weight="fill" className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`mx-2 h-1 w-8 rounded-full transition-all md:w-12 ${s < step ? 'bg-primary' : 'bg-muted'}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground md:text-sm">
              Step {step} of 4
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{STEP_LABELS[step - 1]}</p>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Buildings className="w-6 h-6 text-primary" weight="duotone" />
                </div>
                <h2 className="text-2xl font-semibold">Company Information</h2>
              </div>
              <p className="text-muted-foreground">Tell us about your company details.</p>
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
                <Label htmlFor="company-country">Country *</Label>
                <Select value={company.country} onValueChange={(value) => setCompany({ ...company, country: value })}>
                  <SelectTrigger id="company-country" className={`mt-1.5 ${errors.country ? 'border-destructive' : ''}`}>
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
              <Button onClick={handleNext} size="lg" className="nordly-gradient-button px-8">
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" weight="duotone" />
                </div>
                <h2 className="text-2xl font-semibold">Add Your First Location</h2>
              </div>
              <p className="text-muted-foreground">
                Location type is required and improves recommendation quality.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="location-name">Location Name *</Label>
                <Input
                  id="location-name"
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                  placeholder="e.g., Oslo HQ"
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
                    {LOCATION_TYPES.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationType && <p className="text-sm text-destructive mt-1">{errors.locationType}</p>}
              </div>

              <div>
                <Label htmlFor="location-country">Country *</Label>
                <Select value={location.country} onValueChange={(value) => setLocation({ ...location, country: value })}>
                  <SelectTrigger id="location-country" className={`mt-1.5 ${errors.locationCountry ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select location country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationCountry && <p className="text-sm text-destructive mt-1">{errors.locationCountry}</p>}
              </div>

              <div>
                <Label htmlFor="location-city">City *</Label>
                <Input
                  id="location-city"
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  placeholder="e.g., Oslo"
                  className={`mt-1.5 ${errors.locationCity ? 'border-destructive' : ''}`}
                />
                {errors.locationCity && <p className="text-sm text-destructive mt-1">{errors.locationCity}</p>}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline" size="lg">
                Back
              </Button>
              <Button onClick={handleNext} size="lg" className="nordly-gradient-button px-8">
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightning className="w-6 h-6 text-primary" weight="duotone" />
                </div>
                <h2 className="text-2xl font-semibold">Additional Context</h2>
              </div>
              <p className="text-muted-foreground">
                Add optional details to improve workspace recommendations.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="location-address">Address</Label>
                <Input
                  id="location-address"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="location-area">Area (sqm)</Label>
                <Input
                  id="location-area"
                  value={location.area}
                  onChange={(e) => setLocation({ ...location, area: formatPositiveNumber(e.target.value) })}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="occupancy-notes">Occupancy Notes</Label>
                <Input
                  id="occupancy-notes"
                  value={location.occupancyNotes}
                  onChange={(e) => setLocation({ ...location, occupancyNotes: e.target.value })}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="operating-hours-notes">Operating Hours Notes</Label>
                <Input
                  id="operating-hours-notes"
                  value={location.operatingHoursNotes}
                  onChange={(e) => setLocation({ ...location, operatingHoursNotes: e.target.value })}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="monthly-energy-kwh">Monthly Energy Consumption (kWh)</Label>
                  <Input
                    id="monthly-energy-kwh"
                    type="number"
                    min="0"
                    step="any"
                    value={location.monthlyEnergyKwh}
                    onChange={(e) => setLocation({ ...location, monthlyEnergyKwh: e.target.value })}
                    placeholder="Optional"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. If known, helps Nordly estimate savings more accurately.
                  </p>
                </div>

                <div>
                  <Label htmlFor="monthly-energy-cost">Monthly Energy Cost</Label>
                  <Input
                    id="monthly-energy-cost"
                    type="number"
                    min="0"
                    step="any"
                    value={location.monthlyEnergyCost}
                    onChange={(e) => setLocation({ ...location, monthlyEnergyCost: e.target.value })}
                    placeholder="Optional"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. If known, helps Nordly estimate business impact more accurately.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline" size="lg">
                Back
              </Button>
              <Button onClick={handleNext} size="lg" className="nordly-gradient-button px-8">
                Review
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightning className="w-6 h-6 text-primary" weight="duotone" />
                </div>
                <h2 className="text-2xl font-semibold">Review and Submit</h2>
              </div>
              <p className="text-muted-foreground">Confirm your details before creating your workspace.</p>
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Company</p>
                <p className="text-sm font-medium text-slate-800">{company.name || '-'}</p>
                <p className="text-sm text-slate-600">{company.country || '-'}</p>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">First Location</p>
                <p className="text-sm font-medium text-slate-800">{location.name || '-'}</p>
                <p className="text-sm text-slate-600">Type: {locationTypeLabel}</p>
                <p className="text-sm text-slate-600">{location.city || '-'}, {location.country || '-'}</p>
                {location.monthlyEnergyKwh && (
                  <p className="text-sm text-slate-600">Monthly energy: {location.monthlyEnergyKwh} kWh</p>
                )}
                {location.monthlyEnergyCost && (
                  <p className="text-sm text-slate-600">Monthly energy cost: {location.monthlyEnergyCost}</p>
                )}
              </div>
            </div>

            {errors.review && <p className="text-sm text-destructive mt-3">{errors.review}</p>}
            {state.error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mt-3">
                {state.error}
              </p>
            )}

            <div className="flex justify-between mt-8">
              <Button onClick={handleBack} variant="outline" size="lg" disabled={isPending}>
                Back
              </Button>
              <Button
                onClick={handleComplete}
                size="lg"
                className="nordly-gradient-button px-8"
                disabled={isPending}
              >
                {isPending ? 'Creating workspace...' : 'Complete Setup'}
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  )
}
