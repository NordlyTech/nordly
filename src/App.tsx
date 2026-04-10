import { OnboardingWizard } from '@/components/OnboardingWizard'
import { Dashboard } from '@/components/Dashboard'
import { Toaster } from '@/components/ui/sonner'
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

function App() {
  const [onboardingData, setOnboardingData, deleteOnboardingData] = useKV<OnboardingData | null>('nordly-onboarding', null)

  const handleComplete = (data: OnboardingData) => {
    setOnboardingData(data)
  }

  const handleReset = () => {
    deleteOnboardingData()
  }

  if (!onboardingData) {
    return (
      <>
        <OnboardingWizard onComplete={handleComplete} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Dashboard data={onboardingData} onReset={handleReset} />
      <Toaster />
    </>
  )
}

export default App