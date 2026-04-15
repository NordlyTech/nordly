import { Button } from '@/components/ui/button'
import { Sparkle } from '@phosphor-icons/react'

const PRODUCT_APP_URL = 'http://localhost:3000'

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkle className="text-accent" />
          <span className="text-sm font-medium text-accent">Ready to optimize?</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Start saving on equipment costs today
        </h2>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join leading companies using Nordly to maximize their equipment ROI
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = `${PRODUCT_APP_URL}/signup`}
          >
            Start Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = `${PRODUCT_APP_URL}/demo`}
          >
            Schedule a demo
          </Button>
        </div>
      </div>
    </section>
  )
}
