export const PRODUCT_APP_URL = 'http://localhost:3000'

export const PRICING_MICROCOPY = 'Most companies discover €500–€5,000/month savings potential'

export type PricingPlan = {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
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
    cta: 'See your savings',
    popular: false,
  },
  {
    name: 'Premium',
    price: '€99',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      'Unlimited data uploads',
      'Advanced AI insights and predictions',
      'Unlimited ESG reports',
      'Priority support and consulting',
      'Custom branding on reports',
      'API access',
      'Team collaboration (up to 10 users)',
      'Historical data analysis (5 years)',
    ],
    cta: 'See your savings',
    popular: true,
  },
]
