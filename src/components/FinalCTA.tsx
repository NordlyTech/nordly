import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-24 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Optimize Your Equipment?</h2>
        <p className="text-xl mb-8 opacity-90">Start making data-driven decisions today</p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => window.location.href = '/'}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
