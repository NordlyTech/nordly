import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PRICING_MICROCOPY, PRICING_PLANS, PRODUCT_APP_URL } from '@/data/pricing'
import { Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function PricingPage() {
  const handleCTA = () => {
    window.location.href = `${PRODUCT_APP_URL}/register`
  }

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">{PRICING_MICROCOPY}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative flex flex-col p-8 h-full ${
                  plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/ {plan.period}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCTA}
                  className={`w-full mb-3 h-12 ${
                    plan.popular
                      ? 'bg-primary hover:bg-accent text-primary-foreground shadow-lg hover:shadow-xl'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {plan.cta}
                </Button>
                <p className="text-xs text-muted-foreground mb-8 text-center">
                  No credit card required
                </p>
                <div className="space-y-4 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} weight="bold" className="text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Need a custom enterprise plan?{' '}
          <button className="text-primary hover:underline font-medium">Contact sales</button>
        </motion.p>
      </div>
    </div>
  )
}
