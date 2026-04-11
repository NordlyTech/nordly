import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { ValuePropositions } from '@/components/ValuePropositions'
import { HowItWorks } from '@/components/HowItWorks'
import { Pricing } from '@/components/Pricing'
import { FinalCTA } from '@/components/FinalCTA'
import { Footer } from '@/components/Footer'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ValuePropositions />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
