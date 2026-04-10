import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, TrendUp, CurrencyEur, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface PricingFeature {
  name: string
  free: boolean
  premium: boolean
}

const features: PricingFeature[] = [
  { name: 'Basic Insights', free: true, premium: true },
  { name: 'CO2 Calculation', free: true, premium: true },
  { name: 'ESG Report', free: true, premium: true },
  { name: 'Equipment Insights', free: false, premium: true },
  { name: 'Detailed Savings Analysis', free: false, premium: true },
  { name: 'Advanced ESG Reports', free: false, premium: true },
  { name: 'ROI Calculator', free: false, premium: true },
  { name: 'Priority Support', free: false, premium: true },
]

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your sustainability journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative h-full border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-3xl">Free</CardTitle>
                <CardDescription className="text-lg">Get started with the basics</CardDescription>
                <div className="pt-4">
                  <div className="text-5xl font-bold">€0</div>
                  <div className="text-muted-foreground">forever</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                      <Check className="text-accent" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">Basic Insights</div>
                      <div className="text-sm text-muted-foreground">Core energy metrics</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                      <Check className="text-accent" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">CO2 Calculation</div>
                      <div className="text-sm text-muted-foreground">Track your emissions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-accent/10 p-1 mt-0.5">
                      <Check className="text-accent" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">ESG Report</div>
                      <div className="text-sm text-muted-foreground">Basic compliance reporting</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="lg" className="w-full">
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
            <Card className="relative h-full border-2 border-primary shadow-xl hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5">
                  <Sparkle size={16} weight="fill" />
                  Most Popular
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-3xl">Premium</CardTitle>
                <CardDescription className="text-lg">Unlock full optimization power</CardDescription>
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <div className="text-5xl font-bold">€99</div>
                    <div className="text-muted-foreground">/month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check className="text-primary" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">Everything in Free</div>
                      <div className="text-sm text-muted-foreground">All basic features included</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check className="text-primary" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">Equipment Insights</div>
                      <div className="text-sm text-muted-foreground">AI-powered recommendations</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check className="text-primary" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">Detailed Savings Analysis</div>
                      <div className="text-sm text-muted-foreground">Maximize cost reduction</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Check className="text-primary" size={16} weight="bold" />
                    </div>
                    <div>
                      <div className="font-medium">Advanced ESG Reports</div>
                      <div className="text-sm text-muted-foreground">Comprehensive compliance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full">
                  Start Premium Trial
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
              <CardTitle className="text-2xl">Feature Comparison</CardTitle>
              <CardDescription>See what's included in each plan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-4 px-6 font-semibold">Features</th>
                      <th className="text-center py-4 px-6 font-semibold">Free</th>
                      <th className="text-center py-4 px-6 font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr key={feature.name} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                        <td className="py-4 px-6 font-medium">{feature.name}</td>
                        <td className="py-4 px-6 text-center">
                          {feature.free ? (
                            <div className="inline-flex rounded-full bg-accent/10 p-1">
                              <Check className="text-accent" size={20} weight="bold" />
                            </div>
                          ) : (
                            <div className="inline-flex rounded-full bg-muted p-1">
                              <X className="text-muted-foreground" size={20} weight="bold" />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {feature.premium ? (
                            <div className="inline-flex rounded-full bg-primary/10 p-1">
                              <Check className="text-primary" size={20} weight="bold" />
                            </div>
                          ) : (
                            <div className="inline-flex rounded-full bg-muted p-1">
                              <X className="text-muted-foreground" size={20} weight="bold" />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-background">
            <CardHeader>
              <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center mb-2">
                <TrendUp className="text-accent" size={24} weight="bold" />
              </div>
              <CardTitle>Average Savings Potential</CardTitle>
              <CardDescription>What our premium customers achieve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent mb-2">23%</div>
              <p className="text-muted-foreground">
                Average energy cost reduction in the first 6 months with Premium plan insights
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-2">
                <CurrencyEur className="text-primary" size={24} weight="bold" />
              </div>
              <CardTitle>Return on Investment</CardTitle>
              <CardDescription>Premium plan pays for itself</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">3.2x</div>
              <p className="text-muted-foreground">
                Average ROI within 12 months through optimized energy usage and cost savings
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
