import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface SlideOption {
  id: string
  title: string
  description: string
  enabled: boolean
}

export function PresentationPage() {
  const [slides, setSlides] = useState<SlideOption[]>([
    {
      id: 'title',
      title: 'Title Slide',
      description: 'Nordly - Energy Optimization & ESG Reporting',
      enabled: true,
    },
    {
      id: 'problem',
      title: 'The Problem',
      description: 'Energy waste and ESG compliance challenges',
      enabled: true,
    },
    {
      id: 'solution',
      title: 'Our Solution',
      description: 'AI-powered energy intelligence platform',
      enabled: true,
    },
    {
      id: 'value-props',
      title: 'Value Propositions',
      description: 'Reduce costs, track CO2, improve sustainability',
      enabled: true,
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      description: 'Three simple steps from data to insights',
      enabled: true,
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'Real-world examples of optimization opportunities',
      enabled: true,
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Free and Premium plans comparison',
      enabled: true,
    },
    {
      id: 'roi',
      title: 'ROI & Results',
      description: 'Expected savings and environmental impact',
      enabled: true,
    },
    {
      id: 'cta',
      title: 'Call to Action',
      description: 'Get your free ESG report',
      enabled: true,
    },
  ])

  const [isGenerating, setIsGenerating] = useState(false)

  const toggleSlide = (id: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, enabled: !slide.enabled } : slide
    ))
  }

  const selectAll = () => {
    setSlides(slides.map(slide => ({ ...slide, enabled: true })))
  }

  const deselectAll = () => {
    setSlides(slides.map(slide => ({ ...slide, enabled: false })))
  }

  const generatePresentation = async () => {
    const enabledSlides = slides.filter(s => s.enabled)
    
    if (enabledSlides.length === 0) {
      toast.error('Please select at least one slide')
      return
    }

    setIsGenerating(true)

    try {
      const slideTitles = enabledSlides.map(s => s.title).join(', ')
      const promptText = `Generate a PowerPoint presentation outline for Nordly, an AI-powered energy optimization and ESG reporting platform.

Include the following slides: ${slideTitles}

For each slide, provide:
1. Slide title
2. Key points (3-5 bullet points)
3. Visual suggestion (what image/chart/graphic would work)

Context about Nordly:
- Helps businesses reduce energy costs by up to 30%
- Provides AI-powered insights for energy optimization
- Generates comprehensive ESG reports automatically
- Free plan: basic insights, CO2 calculation, 1 ESG report/month
- Premium plan (€99/month): advanced insights, unlimited reports, API access, team collaboration

Key features:
1. Upload energy data (CSV, API, manual)
2. Get AI insights (patterns, inefficiencies, opportunities)
3. Generate ESG reports (CO2 metrics, compliance data)

Value propositions:
- Reduce costs (30% average reduction)
- Understand CO2 footprint (100% accurate tracking)
- Improve sustainability (24/7 monitoring)

AI insights examples:
- Peak load optimization (shift operations to save €2,400/month)
- Energy efficiency improvements (12% improvement tracking)
- Anomaly detection (HVAC issues preventing €800/month loss)

Return the result as a JSON object with a single property called "slides" that contains an array of slide objects.
Each slide object should have: title, keyPoints (array of strings), visualSuggestion (string)`

      const result = await window.spark.llm(promptText, 'gpt-4o', true)
      const presentation = JSON.parse(result)

      const blob = new Blob([JSON.stringify(presentation, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'nordly-presentation-outline.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Presentation outline generated and downloaded!')
    } catch (error) {
      toast.error('Failed to generate presentation. Please try again.')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToMarkdown = () => {
    const enabledSlides = slides.filter(s => s.enabled)
    
    if (enabledSlides.length === 0) {
      toast.error('Please select at least one slide')
      return
    }

    let markdown = `# Nordly Presentation\n\n`
    markdown += `*AI-Powered Energy Optimization & ESG Reporting*\n\n---\n\n`

    enabledSlides.forEach((slide, index) => {
      markdown += `## Slide ${index + 1}: ${slide.title}\n\n`
      markdown += `${slide.description}\n\n`

      if (slide.id === 'title') {
        markdown += `- **Tagline**: Turn your energy data into savings and ESG reports in minutes\n`
        markdown += `- **Visual**: Nordic-inspired design with energy visualization\n\n`
      } else if (slide.id === 'problem') {
        markdown += `- Businesses waste 20-30% on inefficient energy usage\n`
        markdown += `- ESG reporting is complex and time-consuming\n`
        markdown += `- Lack of visibility into energy consumption patterns\n`
        markdown += `- Missing cost-saving opportunities\n\n`
      } else if (slide.id === 'solution') {
        markdown += `- AI analyzes energy consumption patterns\n`
        markdown += `- Identifies cost-saving opportunities automatically\n`
        markdown += `- Generates comprehensive ESG reports in minutes\n`
        markdown += `- Real-time monitoring and alerts\n\n`
      } else if (slide.id === 'value-props') {
        markdown += `- **Reduce Costs**: Up to 30% average cost reduction\n`
        markdown += `- **Track CO2**: 100% accurate carbon footprint tracking\n`
        markdown += `- **Sustainability**: 24/7 continuous monitoring\n`
        markdown += `- **Visual**: Three cards with icons and statistics\n\n`
      } else if (slide.id === 'how-it-works') {
        markdown += `1. **Upload Energy Data**: CSV, API, or manual entry (2 minutes)\n`
        markdown += `2. **Get AI Insights**: Real-time analysis and recommendations\n`
        markdown += `3. **Generate ESG Report**: Comprehensive reports with CO2 metrics\n\n`
      } else if (slide.id === 'ai-insights') {
        markdown += `- **Peak Load Optimization**: Save €2,400/month by shifting operations\n`
        markdown += `- **Efficiency Tracking**: 12% improvement with LED upgrades, 18-month ROI\n`
        markdown += `- **Anomaly Detection**: HVAC issues caught early, prevent €800/month loss\n\n`
      } else if (slide.id === 'pricing') {
        markdown += `**Free Plan**:\n`
        markdown += `- Basic insights\n`
        markdown += `- CO2 calculation\n`
        markdown += `- 1 ESG report/month\n\n`
        markdown += `**Premium (€99/month)**:\n`
        markdown += `- Advanced AI insights\n`
        markdown += `- Unlimited ESG reports\n`
        markdown += `- API access\n`
        markdown += `- Team collaboration\n\n`
      } else if (slide.id === 'roi') {
        markdown += `- **30%** average energy cost reduction\n`
        markdown += `- **ROI** achieved in 18 months on average\n`
        markdown += `- **€2,400/month** potential savings from optimization\n`
        markdown += `- **100%** accurate CO2 tracking for ESG compliance\n\n`
      } else if (slide.id === 'cta') {
        markdown += `- Get your free ESG report today\n`
        markdown += `- No credit card required\n`
        markdown += `- Setup in 2 minutes\n`
        markdown += `- **Contact**: [Website URL]\n\n`
      }

      markdown += `---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nordly-presentation.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Presentation exported as Markdown!')
  }

  const enabledCount = slides.filter(s => s.enabled).length

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary mb-6">
              <FileText size={16} weight="bold" />
              Presentation Generator
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Create your Nordly presentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the slides you want to include and generate a customized presentation outline
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Select Slides ({enabledCount}/{slides.length})
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAll}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {slides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <label
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          slide.enabled
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          id={slide.id}
                          checked={slide.enabled}
                          onCheckedChange={() => toggleSlide(slide.id)}
                          className="mt-1"
                        />
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-muted-foreground">
                              SLIDE {index + 1}
                            </span>
                            {slide.enabled && (
                              <Check size={14} weight="bold" className="text-primary" />
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {slide.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {slide.description}
                          </p>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Export Options
                </h2>

                <div className="space-y-4">
                  <Button
                    onClick={generatePresentation}
                    disabled={isGenerating || enabledCount === 0}
                    className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={20} weight="bold" className="mr-2" />
                        Generate AI Outline (JSON)
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={exportToMarkdown}
                    disabled={enabledCount === 0}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 hover:border-primary hover:bg-primary/5"
                  >
                    <FileText size={20} weight="bold" className="mr-2" />
                    Export Markdown
                  </Button>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-muted/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    What you'll get:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span>AI-generated slide outlines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Key points for each slide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Visual suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Ready to use in PowerPoint</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-accent/10 border-2 border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong>Pro tip:</strong> Use the JSON outline to build your presentation in PowerPoint, Google Slides, or any presentation software.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
