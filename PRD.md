# Planning Guide

A clean, Nordic-inspired SaaS dashboard for Nordly that displays energy consumption data, CO2 emissions, cost savings, and AI-powered insights to help businesses optimize their energy usage and environmental impact.


This dashboard displays multiple data visualizations and interactive elements (charts, AI insights, report generation) with
## Essential Features
**Energy Consumption Display**

- Progression: Data loads → Card renders with animated count-up → Comparison


- Trigger: Calculated

**Savings Estimation**
- Purpose: Demonstrates financial value of optimization recommendations
- Progression: Baseline establishes → Optimization potential calculates → 

- Functionality: Compares user's metrics against similar businesses by location type
- Trigger: Location type from onboarding matched to comparison dataset

**AI Insights Generator**
- Purpose: Provides personalized, intelligent suggestions for energy optimization
- Progression: User data sent to LLM → Insights parse → List renders with 

- Functionality: Button that generates downloadable ESG compliance report
- Trigger: User clicks "Generate ESG Report" button

**Premium Feature Lock
- Purpose: Demonstrates additional value and encourages plan upgrade
- Progression: Card displays → User reads benefits → Lock icon and CTA 


- **AI insight generation failure**: Show fallback generic tips based on business type

- **Report generation er
## Design Direction
The design should evoke Nordic minimalism - calm, spacious, and purposefu
## Color Selection
A Nordic palette emphasizing icy blues, slate grays, and natural whites with subtle green accents for 
- **Primary Color**: Cool Blue `oklch(0.58 0.12 230)` - Evokes Nordic skies and ice,

- **Accent Color**: Nordi
  - Primary (Cool Blue oklch(0.58 0.12 230)): White text (oklch(1 0 0)) - R
  - Accent (Nordic Green oklch(0.65 0.14 155)): White text (oklch(1 0 0)) - Ratio




- **Typographic Hierarchy
  - H2 (Section Headers): Space Grotesk SemiBold/20px/normal spacing
  - Body Text: Space Grotesk Regular/16px/1.6 line height
  - Muted Text: Space Grotesk Regular/14px/1.5 line
## Animations
Animations should be subtle and purposeful - enhancing the calm Nordic aesthetic rather than cr

- Count-up animation: Nu
- Hover states: Subtle 150ms scale (1.02x) on cards and buttons
- Modal entries: Soft spring animation (framer-motion) for ESG repor
## Component Selection
- **Components**:
  - Button - For "Generate ESG Report" and premium unlock CTA

  - Dialog - ESG repo

- **Customizations**:
  - ChartCard component: Card wrapper with integrated minimal chart (using recharts Ar
  - LockedFeatureCard component: Card with lock overlay and upgrade prompt
- **States**:
  - Cards: Default white with subtle shadow, hover lifts with increased shadow
  

  - TrendUp/TrendDo

  - CheckCircle (completed optimizations)

## Color Selection

  

  - Card padding: p-6 → p-4 on mobile
  - Sticky header with c



























































- **Icon Selection**:








- **Spacing**:






- **Mobile**:





