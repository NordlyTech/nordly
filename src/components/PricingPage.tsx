import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, TrendUp, CurrencyEuro, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

  free: boolean
}
const features:
  { name: 'CO2 Cal
 

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

          className="text-cente
          
          </h1>
            Choose the plan that fits your sustainability journey
        </motion.di
        <div className="grid md:grid-cols
            initial={{ opacity: 0, x: -2
            transition={{ duration: 0.5,
            <Card className="relative h
         
                <div className="pt-4">
                  <div className="text-
              <
                <div className="space-y-3">
                    <div className="rounded-full bg-accent/10 p-1
              
                     

                  <div className="flex items-start gap-3">
                     
                    <div>
                      <div className="text
                  </div>
           
                    </div>
                      <div
                    </div>
                </div>
              <CardFooter>
                  Get Started
              </CardFooter>
          </motion.div
          <motion.div
            animate={{ opacity: 1, x: 0 }}
          >
              <div className="absolute -top-4 left-1/2 -tr
                  <Sparkle size={16} weight="fill" />
                </div>
              <CardHeader>
                <CardDesc
                  <div className="flex items-baseline gap-1">
                    <div className="text-muted-foreground">/month</div>
                </div>
              <CardConte
                  <div className="flex items-start gap-3">
                      <Check className="text-primary" size={16} weight="bo
                    <div>
                      <div
                  </div>
                    <div className="rounded-full bg-primary/10 p-1 mt-0.
                    </div>
                      <div
                    </di
                  <div className="flex items-start gap-3">
                      <Check className="text-primary" size={16} weight="bo
                    <div>
                      <div
                  </div>
                    <div className="rounded-full bg-primary/10 p-1 
                    </div>
                      <div
                    </di
                </div>
              <CardFooter>
                  Start Pr
              </CardFooter>
          </motion.div>

          initial={{ opacit
          transitio
        >

              <CardDe
            <CardContent className="p-0">
                <table className="w-full">
                    <tr className="border-b bg-muted/3
           
                    </tr>
                  <tbody>
                      <tr key={feature.name} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                        <td className="py-4 px-6 text
                            <d
                      
                    
                          
                        </td>
                          {feature.premium ? (
                              <Check c
                          ) : (
                              <X className="text-muted-foreground
                          )}
                      </
                  </tb
              </div>
          </Card>

          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
            <CardHeader>
                <TrendUp 
              <CardTitle>Average Savings Potential</CardTitle>
            </CardHeader>
              <div classNa
                Average 
            </CardContent>

            <CardHeader>
                <CurrencyE
              <CardTitle>
            </CardHeader>
              <div className="text-4xl font-bold text-primary mb-2">3.2x</div>
                Average RO
            </CardConten
        </motion.div>
    </div>
}




























































































































