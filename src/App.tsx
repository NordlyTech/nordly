import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { ValuePropositions } from '@/components/ValuePropositions'
import { AIInsights } from '@/components/AIInsights'
import { ESGReportPreview } from '@/components/ESGReportPreview'
import { Pricing } from '@/components/Pricing'
import { FinalCTA } from '@/components/FinalCTA'
import { Footer } from '@/components/Footer'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ValuePropositions />
        <AIInsights />
        <ESGReportPreview />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

export default App