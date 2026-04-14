import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'

const PRODUCT_APP_URL = 'http://localhost:3000'

export function FinalCTA() {
  const handleCTA = () => {
    window.location.href = `${PRODUCT_APP_URL}/register`
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(0.65_0.08_195/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,oklch(0.58_0.12_195/0.1),transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-medium text-lg px-10 py-7 h-auto rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 group"
            >
              Get your free ESG report
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" weight="bold" size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-medium text-lg px-10 py-7 h-auto rounded-xl border-2 hover:border-primary hover:text-primary bg-white/80 backdrop-blur transition-all"
            >
              Schedule a demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>2 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>No credit card</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
