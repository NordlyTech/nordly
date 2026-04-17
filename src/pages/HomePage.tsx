import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { ValueLoop } from '@/components/ValueLoop'
import { ValuePropositions } from '@/components/ValuePropositions'
import { HowItWorks } from '@/components/HowItWorks'
import { PremiumSection } from '@/components/PremiumSection'
import { Pricing } from '@/components/Pricing'
import { FinalCTA } from '@/components/FinalCTA'
import { Footer } from '@/components/Footer'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ValueLoop />
      <ValuePropositions />
      <HowItWorks />
      <PremiumSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
