import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Optimize Your Equipment?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Start making data-driven decisions about your equipment today.
        </p>
        <Button variant="secondary" size="lg">Learn More</Button>
      </div>
    </section>
  )
}