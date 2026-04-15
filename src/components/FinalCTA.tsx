import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl font-bold mb-6">Ready to Optimize?</h2>
      <div className="flex gap-4 justify-center">
        <Button variant="default">Get Started</Button>
        <Button variant="secondary">Learn More</Button>
      </div>
    </section>
  );
}