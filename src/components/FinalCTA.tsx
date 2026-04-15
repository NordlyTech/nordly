import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'

const PRODUCT_APP_URL = 'http://localhost:3000'

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-8">
            <Sparkle size={20} weight="fill" />
            <span>Join 500+ companies already saving with Nordly</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Ready to transform your energy management?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Get your first ESG report for free. No credit card required. 
            See your savings potential in minutes.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = `${PRODUCT_APP_URL}/signup`}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = `${PRODUCT_APP_URL}/demo`}
            >
              Schedule a demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
