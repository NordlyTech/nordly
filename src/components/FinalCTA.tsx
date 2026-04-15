import { Button } from '@/components/ui/button'
const PRODUCT_APP_URL = 'http://localhost:3000'

    <section className="py-24 relative overflow

        <div className="inli
          
        
          Start saving on equipment costs today
      
          Join leading companies using Nordly to maximize their equipmen
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




