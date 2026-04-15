import { Button } from '@/components/ui/button';

const PRODUCT_APP_URL = 'http://localhost:3000';

export function FinalCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Optimize Your Equipment?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join leading companies who are saving millions with intelligent equipment optimization.
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
  );
}