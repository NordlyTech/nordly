# Planning Guide

A clean, Nordic-inspired SaaS dashboard for Nordly that displays energy consumption data, CO2 emissions, cost savings, and AI-powered insights to help businesses optimize their energy usage and environmental impact.

**Experience Qualities**:
1. **Clarity** - Information is presented in digestible, well-organized cards with clear metrics that guide decision-making
2. **Trust** - Professional, data-driven design with credible comparisons and transparent savings calculations builds user confidence
3. **Calm** - Nordic minimalism creates a focused, uncluttered experience that reduces cognitive load

**Complexity Level**: Light Application (multiple features with basic state)
This dashboard displays multiple data visualizations and interactive elements (charts, AI insights, report generation) with persistent state for onboarding data, but maintains a focused single-view experience without complex multi-page navigation.

## Essential Features

**Energy Consumption Display**
- Functionality: Shows total kWh consumed in a clear metric card with visual trend indicator
- Purpose: Primary metric that grounds all other calculations and insights
- Trigger: Automatically displayed on dashboard load based on onboarding data
- Progression: Data loads → Card renders with animated count-up → Comparison badge appears
- Success criteria: Total kWh matches onboarding input, displays with proper formatting and units

**CO2 Emissions Tracking**
- Functionality: Calculates and displays carbon footprint in kg CO2 based on energy consumption
- Purpose: Connects energy usage to environmental impact for ESG reporting
- Trigger: Calculated from energy consumption data on load
- Progression: Energy data processes → CO2 conversion applies → Metric displays with context
- Success criteria: Accurate conversion rate applied, shows meaningful environmental context

**Savings Estimation**
- Functionality: Shows potential cost savings in € and percentage based on AI analysis
- Purpose: Demonstrates financial value of optimization recommendations
- Trigger: AI analysis of consumption patterns against benchmarks
- Progression: Baseline establishes → Optimization potential calculates → Savings display in dual format (€ and %)
- Success criteria: Both currency and percentage shown, calculations seem realistic for business type

**Benchmark Comparison**
- Functionality: Compares user's metrics against similar businesses by location type
- Purpose: Provides social proof and identifies improvement opportunities
- Trigger: Location type from onboarding matched to comparison dataset
- Progression: User data loads → Similar business average retrieved → Comparison visualization renders
- Success criteria: Clear "above/below average" indicator with percentage difference

**AI Insights Generator**
- Functionality: Displays 3-5 actionable recommendations using LLM analysis
- Purpose: Provides personalized, intelligent suggestions for energy optimization
- Trigger: Dashboard loads, insights generate based on user profile
- Progression: User data sent to LLM → Insights parse → List renders with icons
- Success criteria: 3-5 unique, relevant insights appear; each is specific to user's business context

**ESG Report Generation**
- Functionality: Button that generates downloadable ESG compliance report
- Purpose: Supports sustainability reporting requirements
- Trigger: User clicks "Generate ESG Report" button
- Progression: Click → Loading state → Report preview modal → Download option
- Success criteria: Button clearly visible, loading feedback shown, report contains key metrics

**Premium Feature Lock**
- Functionality: Teaser card for "Detailed Equipment Savings" with upgrade prompt
- Purpose: Demonstrates additional value and encourages plan upgrade
- Trigger: Always visible on dashboard for non-premium users
- Progression: Card displays → User reads benefits → Lock icon and CTA shown
- Success criteria: Clear visual distinction from unlocked features, compelling value proposition

## Edge Case Handling

- **No onboarding data**: Redirect to onboarding wizard (already implemented in App.tsx)
- **AI insight generation failure**: Show fallback generic tips based on business type
- **Extreme consumption values**: Scale chart axes dynamically, format large numbers with abbreviations (k, M)
- **Missing location type**: Default to "office" for benchmark comparisons
- **Slow LLM response**: Show skeleton loading state, timeout after 10s with cached insights
- **Report generation error**: Toast notification with retry option

## Design Direction

The design should evoke Nordic minimalism - calm, spacious, and purposeful. Think of a winter morning in Scandinavia: crisp, clear, with muted natural colors. The interface should feel like a breath of fresh air, reducing anxiety around energy costs while inspiring confidence in data-driven decisions.

## Color Selection

A Nordic palette emphasizing icy blues, slate grays, and natural whites with subtle green accents for positive environmental metrics.

- **Primary Color**: Cool Blue `oklch(0.58 0.12 230)` - Evokes Nordic skies and ice, communicates trust and intelligence. Used for primary actions and data visualizations.
- **Secondary Colors**: 
  - Slate Gray `oklch(0.45 0.02 240)` - Anchoring neutral for text and borders
  - Ice White `oklch(0.98 0.005 240)` - Card backgrounds with subtle cool tone
- **Accent Color**: Nordic Green `oklch(0.65 0.14 155)` - Positive environmental action, savings indicators, success states
- **Foreground/Background Pairings**: 
  - Primary (Cool Blue oklch(0.58 0.12 230)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Background (Ice White oklch(0.98 0.005 240)): Slate text (oklch(0.28 0.02 240)) - Ratio 11.8:1 ✓
  - Accent (Nordic Green oklch(0.65 0.14 155)): White text (oklch(1 0 0)) - Ratio 5.5:1 ✓
  - Card (Pure White oklch(1 0 0)): Foreground text (oklch(0.28 0.02 240)) - Ratio 13.1:1 ✓

## Font Selection

Typography should convey Nordic clarity and modern professionalism with excellent readability for data-heavy content.

**Primary Font**: Space Grotesk - Geometric sans-serif with a technical, modern feel that complements the data-centric interface
**Metrics Font**: JetBrains Mono - For numerical data to enhance scannability and precision

- **Typographic Hierarchy**: 
  - H1 (Page Title): Space Grotesk Bold/32px/tight (-0.02em) letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold/20px/normal spacing
  - Metric Values: JetBrains Mono Bold/36px/tabular numbers
  - Body Text: Space Grotesk Regular/16px/1.6 line height
  - Small Labels: Space Grotesk Medium/14px/0.01em letter spacing
  - Muted Text: Space Grotesk Regular/14px/1.5 line height

## Animations

Animations should be subtle and purposeful - enhancing the calm Nordic aesthetic rather than creating distraction. Focus on micro-interactions that provide feedback and gentle data reveals that build trust.

Key animation moments:
- Metric cards: Staggered fade-up on load (100ms delay between each)
- Count-up animation: Numbers animate from 0 to target value over 800ms with easing
- Chart rendering: Smooth 600ms line draws and bar fills
- Hover states: Subtle 150ms scale (1.02x) on cards and buttons
- Loading states: Gentle pulse on skeleton elements
- Modal entries: Soft spring animation (framer-motion) for ESG report preview

## Component Selection

- **Components**:
  - Card, CardHeader, CardTitle, CardContent - Primary container for all dashboard metrics
  - Button - For "Generate ESG Report" and premium unlock CTA
  - Badge - For comparison indicators (above/below average)
  - Progress - For savings percentage visualization
  - Skeleton - Loading states for AI insights
  - Dialog - ESG report preview modal
  - Separator - Between dashboard sections
  - Tooltip - Contextual information on hover for metrics
  
- **Customizations**:
  - MetricCard component: Custom card with large number display, label, and optional trend indicator
  - ChartCard component: Card wrapper with integrated minimal chart (using recharts AreaChart/BarChart)
  - InsightItem component: Icon + text layout for AI recommendations
  - LockedFeatureCard component: Card with lock overlay and upgrade prompt
  
- **States**:
  - Buttons: Default cool blue, hover slightly lighter with subtle lift, active pressed state, disabled muted gray
  - Cards: Default white with subtle shadow, hover lifts with increased shadow
  - Loading: Skeleton pulse for insights, spinner for report generation
  
- **Icon Selection**:
  - Lightning (energy consumption)
  - Leaf (CO2 emissions)
  - TrendUp/TrendDown (comparisons)
  - Sparkle (AI insights)
  - FileText (ESG report)
  - Lock (premium features)
  - CheckCircle (completed optimizations)
  
- **Spacing**:
  - Container padding: p-6 (24px)
  - Card gap: gap-6 (24px)
  - Internal card spacing: space-y-4 (16px)
  - Section margins: mb-8 (32px)
  - Metric label to value: gap-2 (8px)
  
- **Mobile**:
  - Grid layout: 3 columns desktop → 1 column mobile
  - Font sizes: Reduce metric values from 36px → 28px on mobile
  - Card padding: p-6 → p-4 on mobile
  - Stack chart and insights vertically on mobile
  - Sticky header with company name on mobile scroll
