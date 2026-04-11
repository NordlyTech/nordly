import { Header } from '@/components/Header'
import { PricingPage } from '@/components/PricingPage'
import { Footer } from '@/components/Footer'

export function PricingPageRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PricingPage />
      <Footer />
    </div>
  )
}
