# Planning Guide

**Experience Qualities**:

**Experience Qualities**:
This is a marketing landing page designed to communicate value propositions and drive conversions, with no interactiv
## Essential Features
**Hero Section with Value Proposition**

- Progression: User reads headline → understands value → cli


## Essential Features

**Hero Section with Value Proposition**
- Purpose: Address primary pain points (cost reduction, CO2 tracking, sustainabil
- Progression: User reads benefit 1 → benefit 2 → benefit 3 → understands compreh

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




- **Secondary Colors**: 

- **Foreground/Backgro
  - Background (Pure White #FFFFFF): Cool Gray (#6B7280) - Rati





  - H3 (Subsection Hea
  - Body Large (Hero Subtext): DM Sans Regular/20px/relaxed (1.6)
  - Button Text: DM Sans Medium/16px/normal letter spacing
## Animations
Animations should enhance usability and create moments of delight without slowing down the user exp
**Scroll-triggered fade-ins**: Sections gently fade up as they enter viewport (200ms ease-out) t



  - **Button**: Primary and secondary variants; primary us
  - **Badge**: For "Popular" or "Free"
  
  - **Feature Grid**: Custom 3-column grid (stacks on mobile) for "Ho

  

  - Links: Default (gray text), Hover (teal text with underline)
- **Icon Selection**:
  - AI/Insights: `Lightning` or `MagicWand` from Phosphor
  - Cost reduction: `TrendDown` from Phosphor
  - Sustainability: `Recycle` from Phosphor

  - Section padding

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
