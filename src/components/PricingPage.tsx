import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Check, X, Sparkle, TrendUp, CurrencyEur } from '@phosphor-icons/react'

const features = [
  { name: 'Basic Equipment Tracking', free: true, premium: true },
  { name: 'ESG Reporting', free: true, premium: true },
  { name: 'Detailed Analytics', free: false, premium: true },
  { name: 'AI-Powered Insights', free: false, premium: true },
  { name: 'Priority Support', free: false, premium: true },
]

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your sustainability journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative h-full">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">€0</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3">
                      <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                        {feature.free ? (
                          <Check className="text-accent" size={16} weight="bold" />
                        ) : (
                          <X className="text-muted-foreground" size={16} />
                        )}
                      </div>
                      <div className="text-sm">{feature.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative h-full border-primary shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Sparkle size={16} weight="fill" />
                Most Popular
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Full access to all features</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">€29</div>
                  <div className="text-muted-foreground">/month</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3">
                      <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                        {feature.premium ? (
                          <Check className="text-accent" size={16} weight="bold" />
                        ) : (
                          <X className="text-muted-foreground" size={16} />
                        )}
                      </div>
                      <div className="text-sm">{feature.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Start Free Trial
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <TrendUp className="text-accent" size={24} weight="bold" />
                </div>
                <CardTitle>Average Savings Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent mb-2">28%</div>
                <div className="text-muted-foreground">
                  Average reduction in operational costs
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <CurrencyEur className="text-primary" size={24} weight="bold" />
                </div>
                <CardTitle>Return on Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">3.2x</div>
                <div className="text-muted-foreground">
                  Average ROI within the first year
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
