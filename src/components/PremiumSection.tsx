import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sparkle, Fan, Lightbulb, Snowflake, CookingPot } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function PremiumSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-secondary/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden p-8 md:p-10 border-2 border-primary/20 bg-white shadow-lg">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Badge className="mb-5 bg-primary text-primary-foreground">Premium</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Unlock deeper savings with equipment
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed mb-7">
                Add HVAC, lighting, refrigeration, kitchen, or other equipment to unlock more accurate insights and deeper savings visibility.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Fan size={18} className="text-primary" weight="bold" /> HVAC
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Lightbulb size={18} className="text-primary" weight="bold" /> Lighting
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Snowflake size={18} className="text-primary" weight="bold" /> Refrigeration
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CookingPot size={18} className="text-primary" weight="bold" /> Kitchen
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium">
                <Sparkle size={16} weight="fill" /> More equipment context improves savings precision.
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
