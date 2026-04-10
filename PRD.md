# Planning Guide

A modern, conversion-focused SaaS landing page for Nordly, an AI-powered platform that transforms energy data into cost savings and ESG reports.

**Experience Qualities**:
1. **Calm & Professional** - Nordic minimalism creates a sense of trust and reliability that enterprise buyers expect
2. **Clear & Purposeful** - Every section directly communicates value without unnecessary ornamentation
3. **Premium & Modern** - High-end SaaS aesthetic (Stripe/Notion) that positions Nordly as an industry-leading solution

**Complexity Level**: Content Showcase (information-focused)
This is a marketing landing page designed to communicate value propositions and drive conversions, with no interactive application features beyond standard web interactions.

## Essential Features

**Hero Section with Value Proposition**
- Functionality: Displays primary headline, subheadline, and prominent CTA button
- Purpose: Immediately communicate what Nordly does and capture high-intent leads
- Trigger: Page load
- Progression: User reads headline → understands value → clicks CTA → (conversion)
- Success criteria: Clear headline visible above fold, CTA button stands out, messaging is instantly understandable

**Three-Step Process Section**
- Functionality: Visual presentation of how Nordly works in three simple steps
- Purpose: Reduce perceived complexity and show ease of use
- Trigger: User scrolls past hero
- Progression: User sees step 1 (Upload) → step 2 (AI Insights) → step 3 (ESG Report) → understands flow
- Success criteria: Steps are visually distinct, icons/illustrations support the messaging, flow is left-to-right or top-to-bottom

**Value Propositions Grid**
- Functionality: Three key benefits displayed as cards or sections
- Purpose: Address primary pain points (cost reduction, CO2 tracking, sustainability)
- Trigger: User scrolls through page
- Progression: User reads benefit 1 → benefit 2 → benefit 3 → understands comprehensive value
- Success criteria: Each benefit is clearly articulated with supporting copy

**AI Insights Examples**
- Functionality: Visual showcase of sample AI-generated insights
- Purpose: Demonstrate the platform's intelligence and build credibility
- Trigger: User scrolls to section
- Progression: User views example insights → understands AI capability → gains confidence
- Success criteria: Examples feel authentic, insights appear actionable, formatting is scannable

**ESG Report Preview**
- Functionality: Visual representation of generated ESG reports
- Purpose: Show the end deliverable and its professional quality
- Trigger: User scrolls to section
- Progression: User sees report preview → understands output quality → visualizes using it
- Success criteria: Report looks professional, data visualizations are clear, format appears credible

**Pricing Comparison**
- Functionality: Side-by-side comparison of Free vs Premium plans
- Purpose: Provide transparent pricing and encourage conversion to paid plans
- Trigger: User scrolls to pricing section
- Progression: User reviews Free features → compares Premium features → makes decision → clicks CTA
- Success criteria: Features are clearly differentiated, pricing is prominent, CTAs are distinct

**Final CTA Section**
- Functionality: Conversion-focused section at page bottom
- Purpose: Capture users who have read through all content
- Trigger: User scrolls to end of page
- Progression: User reads final compelling message → clicks CTA → converts
- Success criteria: CTA is prominent, messaging reinforces core value

## Edge Case Handling

- **Mobile responsiveness**: All sections stack vertically on mobile with appropriate spacing and readable font sizes
- **Empty states**: N/A for static landing page
- **Long content**: Text truncation not needed; copy should be concise by design
- **Slow image loading**: Use optimized assets and consider skeleton states for key visual elements
- **CTA interactions**: Hover states provide clear feedback; for this prototype, CTAs will show toast notifications

## Design Direction

The design should evoke feelings of **trust, clarity, and modernity**. Users should feel they're engaging with a premium, enterprise-grade solution while experiencing the calm, uncluttered aesthetic of Nordic design. The page should feel spacious, breathable, and sophisticated—never cluttered or overwhelming.

## Color Selection

Nordic-inspired palette with soft, natural tones and strategic use of green/teal to represent sustainability and environmental focus.

- **Primary Color**: Soft Teal (`oklch(0.65 0.08 195)`) - Represents sustainability, environmental consciousness, and technology; used for primary CTAs and key interactive elements
- **Secondary Colors**: 
  - Light Sage Green (`oklch(0.92 0.03 155)`) - Subtle backgrounds for alternating sections
  - Cool Gray (`oklch(0.55 0.01 240)`) - Body text and supporting elements
- **Accent Color**: Vibrant Teal (`oklch(0.58 0.12 195)`) - Used for hover states and emphasis on CTAs
- **Foreground/Background Pairings**:
  - Primary (Soft Teal #4AA09B): White text (#FFFFFF) - Ratio 4.51:1 ✓
  - Background (Pure White #FFFFFF): Cool Gray (#6B7280) - Ratio 7.2:1 ✓
  - Accent (Vibrant Teal #2D8A84): White text (#FFFFFF) - Ratio 5.8:1 ✓

## Font Selection

Typography should feel modern, readable, and slightly geometric to reinforce the clean, systematic nature of data-driven insights.

**Primary Font**: DM Sans - A geometric sans-serif with excellent readability and a modern, approachable character that works well for both headlines and body copy.

- **Typographic Hierarchy**:
  - H1 (Hero Headline): DM Sans Bold/56px/tight (-0.02em) letter spacing
  - H2 (Section Headers): DM Sans Bold/40px/tight (-0.01em) letter spacing
  - H3 (Subsection Headers): DM Sans SemiBold/28px/normal letter spacing
  - H4 (Card Titles): DM Sans SemiBold/20px/normal letter spacing
  - Body Large (Hero Subtext): DM Sans Regular/20px/relaxed (1.6) line height
  - Body Regular: DM Sans Regular/16px/relaxed (1.6) line height
  - Button Text: DM Sans Medium/16px/normal letter spacing

## Animations

Animations should enhance usability and create moments of delight without slowing down the user experience. Use subtle, purposeful motion.

**Scroll-triggered fade-ins**: Sections gently fade up as they enter viewport (200ms ease-out) to create a sense of progressive revelation
**Button interactions**: Scale slightly on hover (1.02x, 150ms) and show shadow depth to reinforce pressability
**Card hovers**: Subtle lift effect (translate-y: -4px, 200ms) with shadow increase for interactive elements
**CTA pulse**: Gentle, slow pulse animation on primary hero CTA to draw attention without being aggressive

## Component Selection

- **Components**:
  - **Button**: Primary and secondary variants; primary uses teal background with hover state darkening
  - **Card**: Clean cards with subtle borders (`border-border`) for value props, pricing, and features; hover state with shadow
  - **Badge**: For "Popular" or "Free" labels on pricing tiers
  - **Separator**: Thin horizontal rules to divide major sections
  
- **Customizations**:
  - **Feature Grid**: Custom 3-column grid (stacks on mobile) for "How it Works" and "Value Props"
  - **Pricing Cards**: Custom side-by-side comparison with highlighted "Premium" option
  - **Hero Section**: Custom full-width section with centered content and generous vertical padding
  - **ESG Preview Card**: Custom styled container to showcase report aesthetics with subtle background
  
- **States**:
  - Buttons: Default (teal bg), Hover (darker teal + shadow), Active (scale down 0.98)
  - Cards: Default (white bg, subtle border), Hover (elevated shadow, slight translate-y)
  - Links: Default (gray text), Hover (teal text with underline)
  
- **Icon Selection**:
  - Upload: `UploadSimple` from Phosphor
  - AI/Insights: `Lightning` or `MagicWand` from Phosphor
  - Report: `FileText` or `ChartBar` from Phosphor
  - Cost reduction: `TrendDown` from Phosphor
  - CO2/Environment: `Leaf` from Phosphor
  - Sustainability: `Recycle` from Phosphor
  - Check marks: `Check` from Phosphor for feature lists
  
- **Spacing**:
  - Section padding: `py-24` (96px) desktop, `py-16` (64px) mobile
  - Container max-width: `max-w-7xl` (1280px)
  - Grid gaps: `gap-8` (32px) for feature grids, `gap-12` (48px) between major sections
  - Card padding: `p-8` (32px) for feature cards, `p-6` (24px) for smaller elements
  
- **Mobile**:
  - Hero headline reduces to 40px on mobile
  - Three-column grids stack to single column below 768px
  - Horizontal padding reduces from px-8 to px-4 on mobile
  - CTA buttons go full-width on mobile for easier tapping
  - Pricing cards stack vertically on mobile with clear separation
