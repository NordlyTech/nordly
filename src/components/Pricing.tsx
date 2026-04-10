import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { toast } from 'sonner'

const plans = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Upload up to 12 months of data',
      'Basic AI insights',
      '1 ESG report per month',
      'Email support',
      'CO2 tracking',
    ],
    cta: 'Start free',
    popular: false,
  },
  {
    name: 'Premium',
    price: '€99',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      'Unlimited data uploads',
      'Advanced AI insights & predictions',
      'Unlimited ESG reports',
      'Priority support & consulting',
      'Custom branding on reports',
      'API access',
      'Team collaboration (up to 10 users)',
      'Historical data analysis (5 years)',
    ],
    cta: 'Start 14-day trial',
    popular: true,
  },
]

export function Pricing() {
  const handleCTA = (plan: string) => {
    toast.success(`${plan} plan selected! Redirecting to signup...`)
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Start free and scale as you grow
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card 
                className={`p-8 h-full flex flex-col relative ${
                  plan.popular 
                    ? 'border-primary border-2 shadow-xl' 
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      / {plan.period}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleCTA(plan.name)}
                  className={`w-full mb-8 h-12 ${
                    plan.popular 
                      ? 'bg-primary hover:bg-accent text-primary-foreground shadow-lg hover:shadow-xl' 
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {plan.cta}
                </Button>
                <div className="space-y-4 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Need a custom enterprise plan?{' '}
          <button className="text-primary hover:underline font-medium">
            Contact sales
          </button>
        </motion.p>
      </div>
    </section>
  )
}
