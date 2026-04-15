import { Button } from '@/components/ui/button';

const PRODUCT_APP_URL = 'http://localhost:3000';

export function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Optimize Your Equipment?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
          Join leading companies who are saving millions with intelligent equipment optimization.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => window.location.href = PRODUCT_APP_URL}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
