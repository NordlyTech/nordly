import { useState } from 'react'
import { useNavigate } from 'react-router'
import { OnboardingWizard } from '@/components/OnboardingWizard'
import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'
import { useKV } from '@github/spark/hooks'

type OnboardingData = {
  company: {
    name: string
    country: string
  }
  location: {
    name: string
    type: string
    area: string
  }
  energy: {
    monthlyKwh: string
  }
}

export function OnboardingPageRoute() {
  const [onboardingData, setOnboardingData, deleteOnboardingData] = useKV<OnboardingData | null>('onboarding-data', null)
  const navigate = useNavigate()

  const handleComplete = (data: OnboardingData) => {
    setOnboardingData(data)
  }

  const handleReset = () => {
    deleteOnboardingData()
  }

  if (onboardingData) {
    return (
      <div className="min-h-screen">
        <Header />
        <Dashboard data={onboardingData} onReset={handleReset} />
      </div>
    )
  }

  return <OnboardingWizard onComplete={handleComplete} />
}
