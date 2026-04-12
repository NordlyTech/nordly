import { BrowserRouter } from 'react-router'
import { Routes, Route } from 'react-router'
import { HomePage } from '@/pages/HomePage'
import { PricingPageRoute } from '@/pages/PricingPageRoute'
import { OnboardingPageRoute } from '@/pages/OnboardingPageRoute'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPageRoute />} />
        <Route path="/onboarding" element={<OnboardingPageRoute />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App