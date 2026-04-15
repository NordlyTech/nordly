import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Optimize Your Equipment?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start making data-driven decisions about your equipment today.
        </p>
        <Button variant="secondary" size="lg">Learn More</Button>
      </div>
    </section>
  );
}
