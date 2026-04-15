import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, FileText, Check, Presentation } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import pptxgen from 'pptxgenjs'
import { useKV } from '@github/spark/hooks'

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
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false)
  const [downloadLogs, setDownloadLogs] = useState<string[]>([])

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

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDownloadLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const clearLogs = () => {
    setDownloadLogs([])
  }

  const generatePowerPoint = async () => {
    const enabledSlides = slides.filter(s => s.enabled)
    
    if (enabledSlides.length === 0) {
      toast.error('Please select at least one slide')
      return
    }

    setIsGeneratingPptx(true)
    clearLogs()
    addLog('=== PowerPoint Generation Started ===')
    addLog(`Enabled slides: ${enabledSlides.map(s => s.title).join(', ')}`)

    try {
      const pptx = new pptxgen()
      
      pptx.layout = 'LAYOUT_16x9'
      pptx.author = 'Nordly'
      pptx.company = 'Nordly'
      pptx.title = 'Nordly - Energy Optimization & ESG Reporting'
      pptx.subject = 'Energy Intelligence Platform Presentation'

      const nordlyBlue = '4A6FA5'
      const nordlyGreen = '52B788'
      const darkGray = '2D3748'
      const lightGray = 'F7FAFC'

      enabledSlides.forEach((slide) => {
        const newSlide = pptx.addSlide()
        
        if (slide.id === 'title') {
          newSlide.background = { color: nordlyBlue }
          newSlide.addText('Nordly', {
            x: 0.5,
            y: 2.0,
            w: 9,
            h: 1.5,
            fontSize: 60,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Energy Optimization & ESG Reporting', {
            x: 0.5,
            y: 3.5,
            w: 9,
            h: 0.8,
            fontSize: 24,
            color: 'E2E8F0',
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Turn your energy data into savings and ESG reports in minutes', {
            x: 0.5,
            y: 4.5,
            w: 9,
            h: 0.5,
            fontSize: 16,
            color: 'CBD5E0',
            align: 'center',
            italic: true,
            fontFace: 'Space Grotesk'
          })
        } else if (slide.id === 'problem') {
          newSlide.addText('The Problem', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          const problems = [
            'Businesses waste 20-30% on inefficient energy usage',
            'ESG reporting is complex and time-consuming',
            'Lack of visibility into energy consumption patterns',
            'Missing cost-saving opportunities'
          ]
          problems.forEach((problem, i) => {
            newSlide.addText(`• ${problem}`, {
              x: 1.0,
              y: 2.0 + (i * 0.8),
              w: 8,
              h: 0.6,
              fontSize: 20,
              color: darkGray,
              fontFace: 'Space Grotesk'
            })
          })
        } else if (slide.id === 'solution') {
          newSlide.addText('Our Solution', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          const solutions = [
            'AI analyzes energy consumption patterns',
            'Identifies cost-saving opportunities automatically',
            'Generates comprehensive ESG reports in minutes',
            'Real-time monitoring and alerts'
          ]
          solutions.forEach((solution, i) => {
            newSlide.addText(`• ${solution}`, {
              x: 1.0,
              y: 2.0 + (i * 0.8),
              w: 8,
              h: 0.6,
              fontSize: 20,
              color: darkGray,
              fontFace: 'Space Grotesk'
            })
          })
        } else if (slide.id === 'value-props') {
          newSlide.addText('Value Propositions', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Reduce Costs', {
            x: 0.8,
            y: 2.0,
            w: 2.5,
            h: 0.5,
            fontSize: 22,
            bold: true,
            color: nordlyBlue,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Up to 30% average\ncost reduction', {
            x: 0.8,
            y: 2.6,
            w: 2.5,
            h: 0.8,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Track CO2', {
            x: 3.75,
            y: 2.0,
            w: 2.5,
            h: 0.5,
            fontSize: 22,
            bold: true,
            color: nordlyGreen,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('100% accurate carbon\nfootprint tracking', {
            x: 3.75,
            y: 2.6,
            w: 2.5,
            h: 0.8,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Sustainability', {
            x: 6.7,
            y: 2.0,
            w: 2.5,
            h: 0.5,
            fontSize: 22,
            bold: true,
            color: nordlyBlue,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('24/7 continuous\nmonitoring', {
            x: 6.7,
            y: 2.6,
            w: 2.5,
            h: 0.8,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
        } else if (slide.id === 'how-it-works') {
          newSlide.addText('How It Works', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addShape(pptx.ShapeType.ellipse, {
            x: 1.0,
            y: 2.0,
            w: 0.6,
            h: 0.6,
            fill: { color: nordlyBlue }
          })
          newSlide.addText('1', {
            x: 1.0,
            y: 2.0,
            w: 0.6,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle'
          })
          newSlide.addText('Upload Energy Data', {
            x: 2.0,
            y: 2.0,
            w: 7,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('CSV, API, or manual entry (2 minutes)', {
            x: 2.0,
            y: 2.45,
            w: 7,
            h: 0.3,
            fontSize: 16,
            color: '718096',
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addShape(pptx.ShapeType.ellipse, {
            x: 1.0,
            y: 3.2,
            w: 0.6,
            h: 0.6,
            fill: { color: nordlyGreen }
          })
          newSlide.addText('2', {
            x: 1.0,
            y: 3.2,
            w: 0.6,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle'
          })
          newSlide.addText('Get AI Insights', {
            x: 2.0,
            y: 3.2,
            w: 7,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Real-time analysis and recommendations', {
            x: 2.0,
            y: 3.65,
            w: 7,
            h: 0.3,
            fontSize: 16,
            color: '718096',
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addShape(pptx.ShapeType.ellipse, {
            x: 1.0,
            y: 4.4,
            w: 0.6,
            h: 0.6,
            fill: { color: nordlyBlue }
          })
          newSlide.addText('3', {
            x: 1.0,
            y: 4.4,
            w: 0.6,
            h: 0.6,
            fontSize: 32,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle'
          })
          newSlide.addText('Generate ESG Report', {
            x: 2.0,
            y: 4.4,
            w: 7,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Comprehensive reports with CO2 metrics', {
            x: 2.0,
            y: 4.85,
            w: 7,
            h: 0.3,
            fontSize: 16,
            color: '718096',
            fontFace: 'Space Grotesk'
          })
        } else if (slide.id === 'ai-insights') {
          newSlide.addText('AI Insights', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Peak Load Optimization', {
            x: 0.8,
            y: 1.8,
            w: 8.5,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: nordlyBlue,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Save €2,400/month by shifting operations to off-peak hours', {
            x: 0.8,
            y: 2.2,
            w: 8.5,
            h: 0.4,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Efficiency Tracking', {
            x: 0.8,
            y: 3.0,
            w: 8.5,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: nordlyGreen,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('12% improvement with LED upgrades, 18-month ROI', {
            x: 0.8,
            y: 3.4,
            w: 8.5,
            h: 0.4,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('Anomaly Detection', {
            x: 0.8,
            y: 4.2,
            w: 8.5,
            h: 0.4,
            fontSize: 20,
            bold: true,
            color: nordlyBlue,
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('HVAC issues caught early, prevent €800/month loss', {
            x: 0.8,
            y: 4.6,
            w: 8.5,
            h: 0.4,
            fontSize: 16,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
        } else if (slide.id === 'pricing') {
          newSlide.addText('Pricing', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: 1.8,
            w: 4,
            h: 3.5,
            fill: { color: lightGray },
            line: { color: nordlyBlue, width: 2 }
          })
          newSlide.addText('Free', {
            x: 0.8,
            y: 2.0,
            w: 4,
            h: 0.6,
            fontSize: 28,
            bold: true,
            color: nordlyBlue,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          const freeFeatures = ['Basic insights', 'CO2 calculation', '1 ESG report/month']
          freeFeatures.forEach((feature, i) => {
            newSlide.addText(`• ${feature}`, {
              x: 1.2,
              y: 2.8 + (i * 0.5),
              w: 3.2,
              h: 0.4,
              fontSize: 16,
              color: darkGray,
              fontFace: 'Space Grotesk'
            })
          })
          
          newSlide.addShape(pptx.ShapeType.rect, {
            x: 5.2,
            y: 1.8,
            w: 4,
            h: 3.5,
            fill: { color: nordlyBlue },
            line: { color: nordlyBlue, width: 2 }
          })
          newSlide.addText('Premium', {
            x: 5.2,
            y: 2.0,
            w: 4,
            h: 0.6,
            fontSize: 28,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('€99/month', {
            x: 5.2,
            y: 2.6,
            w: 4,
            h: 0.4,
            fontSize: 18,
            color: 'CBD5E0',
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          const premiumFeatures = ['Advanced AI insights', 'Unlimited ESG reports', 'API access', 'Team collaboration']
          premiumFeatures.forEach((feature, i) => {
            newSlide.addText(`• ${feature}`, {
              x: 5.6,
              y: 3.2 + (i * 0.45),
              w: 3.2,
              h: 0.35,
              fontSize: 14,
              color: 'FFFFFF',
              fontFace: 'Space Grotesk'
            })
          })
        } else if (slide.id === 'roi') {
          newSlide.addText('ROI & Results', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 40,
            bold: true,
            color: darkGray,
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('30%', {
            x: 1.0,
            y: 2.0,
            w: 3.5,
            h: 0.8,
            fontSize: 60,
            bold: true,
            color: nordlyBlue,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Average energy\ncost reduction', {
            x: 1.0,
            y: 2.9,
            w: 3.5,
            h: 0.6,
            fontSize: 16,
            color: darkGray,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('18 mo', {
            x: 5.5,
            y: 2.0,
            w: 3.5,
            h: 0.8,
            fontSize: 60,
            bold: true,
            color: nordlyGreen,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('Average ROI\nachievement', {
            x: 5.5,
            y: 2.9,
            w: 3.5,
            h: 0.6,
            fontSize: 16,
            color: darkGray,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          
          newSlide.addText('€2,400/month potential savings from optimization', {
            x: 1.0,
            y: 4.2,
            w: 8,
            h: 0.5,
            fontSize: 18,
            color: darkGray,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('100% accurate CO2 tracking for ESG compliance', {
            x: 1.0,
            y: 4.8,
            w: 8,
            h: 0.5,
            fontSize: 18,
            color: darkGray,
            align: 'center',
            fontFace: 'Space Grotesk'
          })
        } else if (slide.id === 'cta') {
          newSlide.background = { color: nordlyBlue }
          newSlide.addText('Get your free ESG report today', {
            x: 0.5,
            y: 2.0,
            w: 9,
            h: 1.0,
            fontSize: 40,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            fontFace: 'Space Grotesk'
          })
          newSlide.addText('✓ No credit card required\n✓ Setup in 2 minutes\n✓ Start saving immediately', {
            x: 2.5,
            y: 3.2,
            w: 5,
            h: 1.5,
            fontSize: 20,
            color: 'E2E8F0',
            align: 'center',
            lineSpacing: 40,
            fontFace: 'Space Grotesk'
          })
        }
      })

      addLog('Starting PowerPoint write process...')
      const pptxData = await pptx.write({ outputType: 'base64' })
      addLog(`PowerPoint write completed as base64, length: ${(pptxData as string).length}`)
      
      const byteCharacters = atob(pptxData as string)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      
      const blob = new Blob([byteArray], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      })
      
      addLog(`Blob created, size: ${blob.size} bytes, type: ${blob.type}`)
      
      if (blob.size === 0) {
        throw new Error('Generated PowerPoint file is empty - no slides were created')
      }
      
      const fileName = `Nordly-Presentation-${new Date().getTime()}.pptx`
      const url = URL.createObjectURL(blob)
      addLog(`Blob URL created: ${url}`)
      
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      a.setAttribute('target', '_blank')
      
      document.body.appendChild(a)
      addLog('Download link created and appended to body')
      addLog(`File name: ${fileName}`)
      addLog(`Element href: ${a.href}`)
      addLog(`Element download attribute: ${a.download}`)
      
      addLog('Triggering download via click()...')
      a.click()
      addLog('Click event triggered')
      
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a)
          addLog('Download link removed from DOM')
        }
        URL.revokeObjectURL(url)
        addLog('Blob URL revoked')
      }, 100)
      
      toast.success(`PowerPoint "${fileName}" download started! Check your Downloads folder.`, {
        duration: 5000,
      })
      addLog('✓ Download initiated successfully!')
      addLog(`Check your browser's Downloads folder for: ${fileName}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog(`❌ ERROR: ${errorMessage}`)
      toast.error(`Failed to generate PowerPoint: ${errorMessage}`)
      console.error('PowerPoint generation error:', error)
    } finally {
      setIsGeneratingPptx(false)
      addLog('=== Generation process completed ===')
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
                    onClick={generatePowerPoint}
                    disabled={isGeneratingPptx || enabledCount === 0}
                    className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isGeneratingPptx ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Presentation size={20} weight="bold" className="mr-2" />
                        Generate PowerPoint
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={generatePresentation}
                    disabled={isGenerating || enabledCount === 0}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-2 hover:border-primary hover:bg-primary/5"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-2" />
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
                    Export Markdown
                  </Button>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-muted/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    Export formats:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>PowerPoint (.pptx)</strong>: Fully formatted presentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>JSON</strong>: AI-generated slide outlines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Markdown</strong>: Text-based content export</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-accent/10 border-2 border-accent/20">
                  <p className="text-sm text-foreground">
                    <strong>Pro tip:</strong> The PowerPoint export creates a ready-to-use presentation with Nordly branding and professional formatting.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {downloadLogs.length > 0 && (
            <Card className="mt-8 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Download Debug Log
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearLogs}
                >
                  Clear
                </Button>
              </div>
              <div className="bg-secondary/20 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm">
                {downloadLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`py-1 ${
                      log.includes('ERROR') ? 'text-destructive' : 
                      log.includes('✓') ? 'text-accent' : 
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/10 text-sm">
                <p className="font-semibold text-primary mb-1">Troubleshooting:</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• If the file size shows &gt;0 bytes but no download appears, check your browser's download settings</li>
                  <li>• Some browsers block automatic downloads - look for a popup blocker notification</li>
                  <li>• Check your browser's Downloads folder (usually Ctrl/Cmd + J to view)</li>
                  <li>• Try a different browser if the issue persists</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
