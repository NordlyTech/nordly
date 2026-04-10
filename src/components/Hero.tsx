import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function Hero() {
  const handleCTA = () => {
    toast.success('Free ESG report request received! We\'ll be in touch soon.')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-secondary/30 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 text-sm font-medium text-foreground mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Energy Intelligence
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
            Turn your energy data into{' '}
            <span className="text-primary">savings</span> and{' '}
            <span className="text-primary">ESG reports</span> in minutes
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Nordly uses AI to analyze your energy consumption, identify cost-saving opportunities, and generate comprehensive ESG reports automatically.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={handleCTA}
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground font-medium text-lg px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
            >
              Get your free ESG report
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" weight="bold" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-medium text-lg px-8 py-6 h-auto rounded-xl border-2 hover:border-primary hover:text-primary transition-all"
            >
              Watch demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-sm text-muted-foreground mt-6"
          >
            No credit card required · Free forever · Setup in 2 minutes
          </motion.p>
        </motion.div>
      </div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
