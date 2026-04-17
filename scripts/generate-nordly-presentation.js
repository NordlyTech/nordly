import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import PptxGenJS from 'pptxgenjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BRAND = {
  bg: 'F4F8FB',
  white: 'FFFFFF',
  primary: '0E8DB8',
  primaryDark: '0A6F92',
  primarySoft: 'D9F0F7',
  text: '1F2A37',
  mutedText: '64748B',
  surface: 'FFFFFF',
  border: 'DCE6EE',
  success: '35B36B',
  successSoft: 'E8F7EE',
  ctaDark: '0F172A',
}

const TYPO = {
  fontFace: 'Segoe UI',
  h1: 38,
  h2: 30,
  h3: 20,
  body: 14,
  small: 11,
  micro: 9,
  number: 52,
}

const LAYOUT = {
  width: 13.333,
  height: 7.5,
  marginX: 0.7,
  marginY: 0.45,
  contentWidth: 11.933,
}

const RADIUS = {
  card: 0.1,
  badge: 0.18,
  button: 0.12,
}

const LOGOS = {
  icon: path.resolve(__dirname, 'assets', 'nordly-icon.svg'),
  full: path.resolve(__dirname, 'assets', 'nordly-logo-full.svg'),
}

const PRICING = {
  headline: 'Simple, transparent pricing',
  subheadline: 'Most companies discover €500-€5,000/month savings potential',
  free: {
    title: 'Free',
    subtitle: 'Perfect for getting started',
    price: '€0',
    period: '/ forever',
    cta: 'See your savings',
    microcopy: 'Most companies discover €500-€5,000/month savings potential',
    features: [
      'Upload up to 12 months of data',
      'Basic AI insights',
      '1 ESG report per month',
      'Email support',
      'CO2 tracking',
    ],
  },
  premium: {
    badge: 'Most Popular',
    title: 'Premium',
    subtitle: 'For growing businesses',
    price: '€99',
    period: '/ per month',
    cta: 'See your savings',
    microcopy: 'Most companies discover €500-€5,000/month savings potential',
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
  },
}

function addBackground(slide, color = BRAND.bg) {
  slide.background = { color }
}

function addNordlyLogo(slide, { variant = 'full', x, y, w, h }) {
  const logoPath = variant === 'icon' ? LOGOS.icon : LOGOS.full
  if (existsSync(logoPath)) {
    slide.addImage({
      path: logoPath,
      x,
      y,
      w,
      h,
    })
    return
  }

  if (variant === 'icon') {
    slide.addShape('ellipse', {
      x,
      y,
      w,
      h,
      line: { color: BRAND.primary, pt: 0 },
      fill: { color: BRAND.primary },
    })
    slide.addText('N', {
      x,
      y: y + h * 0.22,
      w,
      h: h * 0.6,
      fontFace: TYPO.fontFace,
      fontSize: 14,
      bold: true,
      color: BRAND.white,
      align: 'center',
    })
    return
  }

  slide.addText('Nordly', {
    x,
    y,
    w,
    h,
    fontFace: TYPO.fontFace,
    fontSize: 36,
    bold: true,
    color: BRAND.text,
    align: 'center',
    valign: 'mid',
  })
}

function addTitle(slide, text, x, y, w, opts = {}) {
  slide.addText(text, {
    x,
    y,
    w,
    h: opts.h ?? 0.7,
    fontFace: TYPO.fontFace,
    fontSize: opts.fontSize ?? TYPO.h2,
    bold: opts.bold ?? true,
    color: opts.color ?? BRAND.text,
    align: opts.align ?? 'left',
    valign: opts.valign ?? 'mid',
    breakLine: opts.breakLine ?? false,
  })
}

function addSubtitle(slide, text, x, y, w, opts = {}) {
  slide.addText(text, {
    x,
    y,
    w,
    h: opts.h ?? 0.5,
    fontFace: TYPO.fontFace,
    fontSize: opts.fontSize ?? TYPO.body,
    color: opts.color ?? BRAND.mutedText,
    align: opts.align ?? 'left',
    valign: opts.valign ?? 'top',
    breakLine: opts.breakLine ?? false,
  })
}

function addCard(slide, card) {
  slide.addShape('roundRect', {
    x: card.x,
    y: card.y,
    w: card.w,
    h: card.h,
    rectRadius: card.radius ?? RADIUS.card,
    line: {
      color: card.border ?? BRAND.border,
      pt: card.borderPt ?? 1,
    },
    fill: {
      color: card.fill ?? BRAND.surface,
      transparency: card.fillTransparency ?? 0,
    },
    shadow: {
      type: 'outer',
      color: 'B6C8D6',
      blur: 1,
      angle: 45,
      distance: 1,
      opacity: 0.06,
    },
  })
}

function addBadge(slide, text, x, y, w, opts = {}) {
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h: opts.h ?? 0.35,
    rectRadius: opts.radius ?? RADIUS.badge,
    line: { color: opts.border ?? BRAND.primary, pt: 1 },
    fill: { color: opts.fill ?? 'E6FFFB' },
  })
  slide.addText(text, {
    x,
    y: y + 0.03,
    w,
    h: 0.27,
    fontFace: TYPO.fontFace,
    fontSize: opts.fontSize ?? TYPO.small,
    bold: true,
    color: opts.textColor ?? BRAND.primary,
    align: 'center',
    valign: 'mid',
  })
}

function addButton(slide, text, x, y, w, opts = {}) {
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h: opts.h ?? 0.54,
    rectRadius: opts.radius ?? RADIUS.button,
    line: { color: opts.border ?? BRAND.primary, pt: 1 },
    fill: { color: opts.fill ?? BRAND.primary },
  })
  slide.addText(text, {
    x,
    y: y + 0.05,
    w,
    h: 0.4,
    fontFace: TYPO.fontFace,
    fontSize: opts.fontSize ?? TYPO.body,
    bold: true,
    color: opts.textColor ?? 'FFFFFF',
    align: 'center',
    valign: 'mid',
  })
}

function addFeatureList(slide, features, x, y, w, opts = {}) {
  const step = opts.step ?? 0.34
  features.forEach((feature, idx) => {
    const rowY = y + idx * step
    slide.addShape('ellipse', {
      x,
      y: rowY + 0.08,
      w: 0.14,
      h: 0.14,
      line: { color: BRAND.primary, pt: 0.5 },
      fill: { color: 'D1FAF5' },
    })
    slide.addText('✓', {
      x: x + 0.036,
      y: rowY + 0.058,
      w: 0.08,
      h: 0.1,
      fontFace: TYPO.fontFace,
      fontSize: 8,
      bold: true,
      color: BRAND.primary,
      align: 'center',
    })
    slide.addText(feature, {
      x: x + 0.22,
      y: rowY,
      w: w - 0.22,
      h: 0.26,
      fontFace: TYPO.fontFace,
      fontSize: TYPO.small,
      color: BRAND.text,
      breakLine: false,
    })
  })
}

function addPricingCard(slide, plan, layout, opts = {}) {
  addCard(slide, {
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    fill: 'FFFFFF',
    border: opts.highlight ? BRAND.primary : BRAND.border,
    borderPt: opts.highlight ? 1.8 : 1,
  })

  if (plan.badge) {
    addBadge(slide, plan.badge, layout.x + layout.w / 2 - 0.65, layout.y - 0.15, 1.3, {
      fill: BRAND.primary,
      border: BRAND.primary,
      textColor: 'FFFFFF',
    })
  }

  addTitle(slide, plan.title, layout.x + 0.35, layout.y + 0.32, layout.w - 0.7, {
    fontSize: TYPO.h3,
    h: 0.4,
  })
  addSubtitle(slide, plan.subtitle, layout.x + 0.35, layout.y + 0.74, layout.w - 0.7, {
    fontSize: TYPO.small,
  })

  slide.addText(plan.price, {
    x: layout.x + 0.35,
    y: layout.y + 1.15,
    w: 1.45,
    h: 0.6,
    fontFace: TYPO.fontFace,
    fontSize: 34,
    bold: true,
    color: BRAND.text,
  })
  addSubtitle(slide, plan.period, layout.x + 1.75, layout.y + 1.43, layout.w - 2.1, {
    fontSize: TYPO.small,
    color: BRAND.mutedText,
  })

  addButton(slide, plan.cta, layout.x + 0.35, layout.y + 1.92, layout.w - 0.7, {
    fill: opts.highlight ? BRAND.primary : 'ECFEFF',
    border: opts.highlight ? BRAND.primary : '99F6E4',
    textColor: opts.highlight ? 'FFFFFF' : BRAND.primary,
    h: 0.5,
    fontSize: TYPO.small,
  })

  addSubtitle(slide, plan.microcopy, layout.x + 0.35, layout.y + 2.5, layout.w - 0.7, {
    fontSize: TYPO.micro,
    color: BRAND.mutedText,
  })

  addFeatureList(slide, plan.features, layout.x + 0.35, layout.y + 2.88, layout.w - 0.7, {
    step: 0.28,
  })
}

function slideCover(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.white)

  slide.addShape('roundRect', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 5.85,
    rectRadius: 0.22,
    line: { color: BRAND.border, pt: 1 },
    fill: { color: BRAND.white },
  })

  addNordlyLogo(slide, {
    variant: 'full',
    x: 3.45,
    y: 1.5,
    w: 6.4,
    h: 2.05,
  })

  addSubtitle(slide, 'Turn energy waste into measurable savings', 0, 4.1, LAYOUT.width, {
    align: 'center',
    fontSize: 22,
    color: BRAND.text,
    h: 0.5,
  })
  addSubtitle(slide, 'AI-powered energy intelligence platform', 0, 4.66, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.body,
    color: BRAND.mutedText,
  })
}

function slideProblem(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.white)

  addCard(slide, {
    x: 7.55,
    y: 1.2,
    w: 4.95,
    h: 5.1,
    fill: BRAND.surface,
    border: BRAND.border,
  })

  addTitle(slide, 'Most companies are losing money on energy — without knowing it', 0.8, 1.0, 6.4, {
    fontSize: 35,
    h: 1.6,
    breakLine: true,
  })

  const points = [
    'Rising energy costs',
    'Low visibility into waste',
    'Multi-location complexity',
    'ESG reporting takes time',
  ]

  points.forEach((point, i) => {
    const y = 3 + i * 0.68
    slide.addShape('roundRect', {
      x: 0.85,
      y,
      w: 0.28,
      h: 0.28,
      rectRadius: 0.08,
      line: { color: BRAND.primarySoft, pt: 0 },
      fill: { color: BRAND.primarySoft },
    })
    addSubtitle(slide, point, 1.25, y + 0.02, 5.7, {
      fontSize: 16,
      color: BRAND.text,
    })
  })

  slide.addShape('line', {
    x: 7.95,
    y: 2,
    w: 4.1,
    h: 0,
    line: { color: BRAND.border, pt: 1 },
  })
  slide.addShape('line', {
    x: 7.95,
    y: 3.4,
    w: 4.1,
    h: 0,
    line: { color: BRAND.border, pt: 1 },
  })
  slide.addShape('line', {
    x: 7.95,
    y: 4.8,
    w: 4.1,
    h: 0,
    line: { color: BRAND.border, pt: 1 },
  })

  addSubtitle(slide, 'Too many teams react late because energy data sits in siloed reports.', 7.95, 1.48, 3.9, {
    fontSize: 12,
  })
  addSubtitle(slide, 'Operational issues stay hidden until costs spike month over month.', 7.95, 2.88, 3.9, {
    fontSize: 12,
  })
  addSubtitle(slide, 'Compliance work grows while meaningful optimization gets delayed.', 7.95, 4.28, 3.9, {
    fontSize: 12,
  })
}

function slideSolution(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.bg)

  addTitle(slide, 'Nordly turns energy data into savings', 0.8, 0.78, 9, {
    fontSize: 36,
    h: 0.62,
  })
  addSubtitle(slide, 'No consultants. No complexity. Just results.', 0.8, 1.45, 7.2, {
    fontSize: 16,
    color: BRAND.mutedText,
  })

  const tiles = [
    {
      title: 'Identify energy waste',
      body: 'AI scans historical patterns to detect anomalies and hidden usage peaks.',
      x: 0.8,
      y: 2.2,
      accent: BRAND.primarySoft,
    },
    {
      title: 'Turn insights into action',
      body: 'One-click missions guide teams from issue detection to execution.',
      x: 6.95,
      y: 2.2,
      accent: 'E6F4FA',
    },
    {
      title: 'Track measurable savings',
      body: 'Live dashboards show month-over-month impact in euros and efficiency.',
      x: 0.8,
      y: 4.35,
      accent: BRAND.successSoft,
    },
    {
      title: 'Generate ESG reports automatically',
      body: 'Build clear reporting packets without extra manual workflows.',
      x: 6.95,
      y: 4.35,
      accent: 'F5F3FF',
    },
  ]

  tiles.forEach((tile) => {
    addCard(slide, { x: tile.x, y: tile.y, w: 5.55, h: 1.7, fill: 'FFFFFF' })
    slide.addShape('roundRect', {
      x: tile.x + 0.28,
      y: tile.y + 0.28,
      w: 0.54,
      h: 0.54,
      rectRadius: 0.14,
      line: { color: tile.accent, pt: 0 },
      fill: { color: tile.accent },
    })
    addTitle(slide, tile.title, tile.x + 0.95, tile.y + 0.28, 4.4, {
      fontSize: 16,
      h: 0.34,
    })
    addSubtitle(slide, tile.body, tile.x + 0.95, tile.y + 0.76, 4.35, {
      fontSize: 11,
    })
  })
}

function slideHowItWorks(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.bg)

  addTitle(slide, 'How Nordly works', 0.8, 0.75, 6, {
    fontSize: 34,
    h: 0.6,
  })

  const steps = [
    {
      number: '1',
      title: 'Add locations',
      desc: 'Choose location type such as office, hotel, retail, or warehouse',
    },
    { number: '2', title: 'Get AI insights', desc: 'Nordly highlights waste patterns and optimization opportunities' },
    { number: '3', title: 'Turn insights into missions', desc: 'Assign practical actions with clear ownership and timelines' },
    { number: '4', title: 'Track savings', desc: 'Measure results and verify ROI across every active location' },
  ]

  const cardW = 5.7
  const cardH = 2.25

  steps.forEach((step, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const x = 0.8 + col * 6.0
    const y = 1.65 + row * 2.55

    addCard(slide, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: 'FFFFFF',
      border: BRAND.border,
    })

    slide.addShape('roundRect', {
      x: x + 0.3,
      y: y + 0.3,
      w: 0.4,
      h: 0.4,
      rectRadius: 0.1,
      line: { color: BRAND.primary, pt: 0 },
      fill: { color: BRAND.primary },
    })
    slide.addText(step.number, {
      x: x + 0.3,
      y: y + 0.335,
      w: 0.4,
      h: 0.2,
      fontFace: TYPO.fontFace,
      fontSize: 12,
      color: 'FFFFFF',
      align: 'center',
      bold: true,
    })

    addTitle(slide, step.title, x + 0.82, y + 0.28, cardW - 1.1, {
      fontSize: 18,
      h: 0.35,
    })
    addSubtitle(slide, step.desc, x + 0.32, y + 0.82, cardW - 0.65, {
      fontSize: 11,
      breakLine: true,
      h: 1.2,
    })
  })
}

function metricWidget(slide, cfg) {
  addCard(slide, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    fill: cfg.fill ?? 'FFFFFF',
    border: cfg.border ?? BRAND.border,
  })
  addSubtitle(slide, cfg.label, cfg.x + 0.25, cfg.y + 0.22, cfg.w - 0.5, {
    fontSize: 10,
    color: BRAND.mutedText,
  })
  addTitle(slide, cfg.value, cfg.x + 0.25, cfg.y + 0.58, cfg.w - 0.5, {
    fontSize: cfg.valueSize ?? 25,
    h: 0.6,
    color: cfg.valueColor ?? BRAND.text,
  })
  if (cfg.note) {
    addSubtitle(slide, cfg.note, cfg.x + 0.25, cfg.y + 1.25, cfg.w - 0.5, {
      fontSize: 9,
      color: BRAND.mutedText,
    })
  }
}

function slideDashboard(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.bg)

  addNordlyLogo(slide, {
    variant: 'icon',
    x: 11.95,
    y: 0.66,
    w: 0.62,
    h: 0.62,
  })

  addTitle(slide, 'See your savings instantly', 0.8, 0.72, 7.2, {
    fontSize: 34,
    h: 0.7,
  })

  addCard(slide, {
    x: 0.8,
    y: 1.55,
    w: 11.7,
    h: 5.35,
    fill: BRAND.surface,
    border: BRAND.border,
  })

  metricWidget(slide, {
    x: 1.15,
    y: 1.95,
    w: 2.55,
    h: 1.7,
    label: 'Estimated monthly savings',
    value: '€1,320',
    valueColor: BRAND.primary,
    note: '+14% vs last month',
  })
  metricWidget(slide, {
    x: 3.95,
    y: 1.95,
    w: 2.55,
    h: 1.7,
    label: 'Estimated yearly savings',
    value: '€15,840',
    valueColor: BRAND.primary,
    note: 'Projected annualized value',
  })
  metricWidget(slide, {
    x: 6.75,
    y: 1.95,
    w: 2.55,
    h: 1.7,
    label: 'Active insights',
    value: '27',
    note: '9 high-priority opportunities',
  })
  metricWidget(slide, {
    x: 9.55,
    y: 1.95,
    w: 2.55,
    h: 1.7,
    label: 'Open missions',
    value: '11',
    note: '4 due this week',
  })

  addCard(slide, {
    x: 1.15,
    y: 3.95,
    w: 7.4,
    h: 2.55,
    fill: 'FFFFFF',
  })
  addSubtitle(slide, 'Locations tracked', 1.4, 4.15, 2.3, {
    fontSize: 10,
  })
  addTitle(slide, '48', 1.4, 4.44, 1.5, {
    fontSize: 30,
    h: 0.6,
  })

  const bars = [0.85, 1.45, 1.1, 1.95, 1.55, 2.2, 1.8]
  bars.forEach((v, i) => {
    slide.addShape('roundRect', {
      x: 3 + i * 0.7,
      y: 6.1 - v,
      w: 0.42,
      h: v,
      rectRadius: 0.08,
      line: { color: BRAND.primarySoft, pt: 0 },
      fill: { color: i > 4 ? BRAND.primary : BRAND.primarySoft },
    })
  })

  addCard(slide, {
    x: 8.9,
    y: 3.95,
    w: 3.2,
    h: 2.55,
    fill: 'FFFFFF',
  })
  addSubtitle(slide, 'Top location opportunity', 9.15, 4.15, 2.7, {
    fontSize: 10,
  })
  addTitle(slide, 'Hotel A', 9.15, 4.43, 2.5, {
    fontSize: 20,
    h: 0.45,
  })
  addSubtitle(slide, 'HVAC runtime optimization', 9.15, 4.95, 2.7, {
    fontSize: 10,
  })
  addTitle(slide, '€420/mo', 9.15, 5.34, 2.7, {
    fontSize: 24,
    h: 0.5,
    color: BRAND.primary,
  })
}

function insightCard(slide, card) {
  addCard(slide, {
    x: card.x,
    y: card.y,
    w: card.w,
    h: card.h,
    fill: 'FFFFFF',
  })
  addBadge(slide, card.category, card.x + 0.25, card.y + 0.22, 1.05, {
    h: 0.28,
    radius: 0.1,
    fontSize: 8,
  })
  addTitle(slide, card.title, card.x + 0.25, card.y + 0.6, card.w - 0.5, {
    fontSize: 15,
    h: 0.35,
  })
  addSubtitle(slide, card.summary, card.x + 0.25, card.y + 0.98, card.w - 0.5, {
    fontSize: 10,
    breakLine: true,
    h: 0.65,
  })
  addSubtitle(slide, `Estimated savings: ${card.savings}`, card.x + 0.25, card.y + 1.72, card.w - 0.5, {
    fontSize: 10,
    color: BRAND.text,
  })
  addSubtitle(slide, `Confidence: ${card.confidence}`, card.x + 0.25, card.y + 2.0, card.w - 0.5, {
    fontSize: 9,
    color: BRAND.mutedText,
  })
}

function slideInsights(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.bg)

  addTitle(slide, 'AI finds what to improve', 0.8, 0.75, 7.2, {
    fontSize: 34,
    h: 0.65,
  })

  const cards = [
    {
      category: 'HVAC',
      title: 'Overnight runtime exceeds target',
      summary: 'System remains active after occupancy, increasing baseline consumption.',
      savings: '€280/month',
      confidence: '92%',
      x: 0.8,
      y: 1.8,
      w: 4.1,
      h: 2.6,
    },
    {
      category: 'Lighting',
      title: 'Retail floor lighting over-illumination',
      summary: 'Lighting intensity can be reduced during low-footfall windows.',
      savings: '€190/month',
      confidence: '88%',
      x: 4.95,
      y: 1.8,
      w: 4.1,
      h: 2.6,
    },
    {
      category: 'Operations',
      title: 'Peak load overlap in shared zones',
      summary: 'Staggering equipment schedules lowers concurrent demand spikes.',
      savings: '€340/month',
      confidence: '90%',
      x: 9.1,
      y: 1.8,
      w: 3.45,
      h: 2.6,
    },
  ]

  cards.forEach((card) => insightCard(slide, card))

  addCard(slide, {
    x: 0.8,
    y: 4.7,
    w: 11.75,
    h: 1.95,
    fill: BRAND.primarySoft,
    border: '9ED4E6',
  })
  addTitle(slide, 'Insights are prioritized by impact and effort', 1.1, 5.05, 7.3, {
    fontSize: 19,
    h: 0.44,
  })
  addSubtitle(slide, 'Teams focus on the highest return actions first and validate results in one workflow.', 1.1, 5.5, 7.8, {
    fontSize: 12,
  })
  addBadge(slide, 'AI Prioritized', 9.35, 5.2, 2.2, {
    fill: BRAND.primary,
    border: BRAND.primary,
    textColor: 'FFFFFF',
    h: 0.46,
  })
}

function missionColumn(slide, cfg) {
  addCard(slide, {
    x: cfg.x,
    y: cfg.y,
    w: cfg.w,
    h: cfg.h,
    fill: cfg.fill,
    border: cfg.border,
  })

  addTitle(slide, cfg.title, cfg.x + 0.25, cfg.y + 0.18, cfg.w - 0.5, {
    fontSize: 14,
    h: 0.32,
  })

  cfg.items.forEach((item, idx) => {
    const y = cfg.y + 0.6 + idx * 1.25
    addCard(slide, {
      x: cfg.x + 0.2,
      y,
      w: cfg.w - 0.4,
      h: 1.05,
      fill: 'FFFFFF',
      border: BRAND.border,
    })
    addSubtitle(slide, item.title, cfg.x + 0.34, y + 0.16, cfg.w - 0.68, {
      fontSize: 10,
      color: BRAND.text,
    })
    addSubtitle(slide, item.meta, cfg.x + 0.34, y + 0.52, cfg.w - 0.68, {
      fontSize: 9,
      color: BRAND.mutedText,
    })
  })
}

function slideMissions(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.bg)

  addTitle(slide, 'Turn insights into actions', 0.8, 0.75, 8, {
    fontSize: 34,
    h: 0.65,
  })

  missionColumn(slide, {
    x: 0.85,
    y: 1.7,
    w: 3.95,
    h: 4.95,
    title: 'Open',
    fill: BRAND.white,
    border: BRAND.border,
    items: [
      { title: 'Adjust HVAC night schedule', meta: 'Hotel A • Est. €180/mo' },
      { title: 'Reduce corridor lighting baseline', meta: 'Office West • Est. €90/mo' },
      { title: 'Review standby equipment draw', meta: 'Warehouse 3 • Est. €70/mo' },
    ],
  })

  missionColumn(slide, {
    x: 4.92,
    y: 1.7,
    w: 3.95,
    h: 4.95,
    title: 'In Progress',
    fill: BRAND.primarySoft,
    border: '9ED4E6',
    items: [
      { title: 'Optimize chiller cycling window', meta: 'Retail Hub • Owner: Ops Lead' },
      { title: 'Calibrate occupancy sensors', meta: 'Office North • Due Friday' },
      { title: 'Shift non-critical load profile', meta: 'Plant B • 63% complete' },
    ],
  })

  missionColumn(slide, {
    x: 8.99,
    y: 1.7,
    w: 3.95,
    h: 4.95,
    title: 'Completed',
    fill: 'F0FDF4',
    border: 'BBF7D0',
    items: [
      { title: 'HVAC lockout schedule deployed', meta: 'Hotel B • Saved €210/mo' },
      { title: 'Lighting profile right-sized', meta: 'Retail East • Saved €130/mo' },
      { title: 'Boiler start-up sequence tuned', meta: 'Warehouse 1 • Saved €85/mo' },
    ],
  })
}

function slideSavings(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.white)

  slide.addShape('roundRect', {
    x: 3.8,
    y: 0.65,
    w: 5.75,
    h: 6.1,
    rectRadius: 0.22,
    line: { color: BRAND.primarySoft, pt: 1 },
    fill: { color: 'EEF7FB' },
  })

  addTitle(slide, 'Typical savings potential', 0, 1.2, LAYOUT.width, {
    align: 'center',
    fontSize: 34,
    h: 0.62,
  })
  addTitle(slide, '€500-€5,000', 0, 2.55, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.number,
    h: 0.92,
    color: BRAND.primary,
  })
  addSubtitle(slide, 'Typical monthly savings potential discovered by companies', 0, 3.72, LAYOUT.width, {
    align: 'center',
    fontSize: 14,
    color: BRAND.text,
  })
  addSubtitle(slide, 'Up to 30% reduction in energy-related operational waste', 0, 4.22, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.small,
    color: BRAND.mutedText,
  })
}

function slidePricing(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.white)

  addNordlyLogo(slide, {
    variant: 'icon',
    x: 0.92,
    y: 0.56,
    w: 0.5,
    h: 0.5,
  })

  addTitle(slide, PRICING.headline, 0, 0.56, LAYOUT.width, {
    align: 'center',
    fontSize: 32,
    h: 0.6,
  })
  addSubtitle(slide, PRICING.subheadline, 0, 1.18, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.body,
    color: BRAND.mutedText,
  })

  addPricingCard(slide, PRICING.free, {
    x: 0.9,
    y: 1.65,
    w: 5.8,
    h: 5.25,
  })

  addPricingCard(slide, PRICING.premium, {
    x: 6.65,
    y: 1.65,
    w: 5.8,
    h: 5.25,
  }, { highlight: true })

  addSubtitle(slide, 'Need a custom enterprise plan? Contact sales', 0, 7.03, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.small,
    color: BRAND.mutedText,
  })
}

function slideCta(pptx) {
  const slide = pptx.addSlide()
  addBackground(slide, BRAND.white)

  addNordlyLogo(slide, {
    variant: 'full',
    x: 4.42,
    y: 0.95,
    w: 4.5,
    h: 1.45,
  })

  addTitle(slide, 'See how much you can save', 0, 2.8, LAYOUT.width, {
    align: 'center',
    fontSize: 42,
    h: 0.75,
  })
  addSubtitle(slide, 'Get your savings estimate in 2 minutes', 0, 3.65, LAYOUT.width, {
    align: 'center',
    fontSize: 18,
    color: BRAND.text,
  })
  addButton(slide, 'Get started', LAYOUT.width / 2 - 1.25, 4.42, 2.5, {
    h: 0.62,
    fontSize: 15,
    fill: BRAND.primary,
    border: BRAND.primaryDark,
  })
  addSubtitle(slide, 'AI-powered insights. Fast setup. Clear ROI.', 0, 5.28, LAYOUT.width, {
    align: 'center',
    fontSize: TYPO.small,
    color: BRAND.mutedText,
  })
}

function buildPresentation() {
  const pptx = new PptxGenJS()
  pptx.author = 'Nordly'
  pptx.company = 'Nordly'
  pptx.subject = 'Nordly Product Overview'
  pptx.title = 'Nordly Presentation'
  pptx.layout = 'LAYOUT_WIDE'
  pptx.theme = {
    bodyFontFace: TYPO.fontFace,
    headFontFace: TYPO.fontFace,
    lang: 'en-US',
  }

  slideCover(pptx)
  slideProblem(pptx)
  slideSolution(pptx)
  slideHowItWorks(pptx)
  slideDashboard(pptx)
  slideInsights(pptx)
  slideMissions(pptx)
  slideSavings(pptx)
  slidePricing(pptx)
  slideCta(pptx)

  return pptx
}

async function run() {
  const pptx = buildPresentation()
  const outPath = path.resolve(__dirname, '..', 'Nordly_Presentation.pptx')
  await pptx.writeFile({ fileName: outPath })
  console.log(`Presentation generated: ${outPath}`)
}

run().catch((error) => {
  console.error('Failed to generate presentation:', error)
  process.exitCode = 1
})
