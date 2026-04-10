# Planning Guide

A streamlined onboarding wizard for Nordly that collects essential company and energy data to deliver immediate AI-powered insights.

**Experience Qualities**:
1. **Effortless** - Users complete onboarding in under 2 minutes with minimal friction
2. **Progressive** - Information is collected step-by-step without overwhelming the user
3. **Motivating** - Clear progress indication and the promise of immediate insights keep users engaged

**Complexity Level**: Light Application (multiple features with basic state)
This is a multi-step wizard with form validation and state management that guides users through data collection before presenting a dashboard with insights. It's more than a micro tool but simpler than a full-featured application.

## Essential Features

**Step 1: Company Information**
- Functionality: Collect company name and country
- Purpose: Establish user context and personalize the experience
- Trigger: User lands on the application
- Progression: User sees welcome message → enters company name → selects country from dropdown → clicks Next
- Success criteria: Form validates required fields, smooth transition to next step

**Step 2: Location Setup**
- Functionality: Add first location with name, type, and optional area
- Purpose: Capture the primary energy consumption site
- Trigger: User completes Step 1
- Progression: User enters location name → selects location type from dropdown → optionally enters area in sqm → clicks Next
- Success criteria: Location types are clear and comprehensive, area field accepts numeric input with proper formatting

**Step 3: Energy Data Entry**
- Functionality: Collect monthly kWh consumption
- Purpose: Gather baseline energy data for AI analysis
- Trigger: User completes Step 2
- Progression: User enters monthly kWh value → clicks Complete → sees loading state → dashboard appears
- Success criteria: Input accepts numeric values with thousands separator, shows appropriate field help text

**Dashboard with Insights**
- Functionality: Display AI-generated energy insights based on collected data
- Purpose: Provide immediate value and validate the onboarding investment
- Trigger: User completes Step 3
- Progression: Loading animation (1-2s) → Dashboard appears with personalized insights → User explores recommendations
- Success criteria: Insights feel personalized and actionable, dashboard is visually engaging

## Edge Case Handling

- **Empty Fields**: Form validation prevents progression with clear inline error messages
- **Invalid Data**: Numeric fields reject non-numeric input and provide formatting guidance
- **Browser Back**: Progress is preserved if user navigates back through steps
- **Refresh During Onboarding**: Data persists and user returns to current step
- **Completed Onboarding**: Returning users see dashboard directly, not wizard

## Design Direction

The design should evoke **simplicity, confidence, and forward momentum**. Users should feel the process is quick and worthwhile, with each step feeling like progress toward valuable insights. The wizard should feel spacious and uncluttered, using Nordic-inspired minimalism with clear visual hierarchy.

## Color Selection

Clean, modern palette that reinforces trust and progress while maintaining the Nordly brand identity.

- **Primary Color**: Soft Teal (`oklch(0.65 0.08 195)`) - Represents environmental consciousness and forward progress; used for primary buttons and progress indicators
- **Secondary Colors**: 
  - Light Sage Background (`oklch(0.98 0.01 155)`) - Subtle card backgrounds
  - Cool Gray (`oklch(0.55 0.01 240)`) - Body text and labels
- **Accent Color**: Vibrant Teal (`oklch(0.58 0.12 195)`) - Step completion indicators and success states
- **Foreground/Background Pairings**:
  - Primary Button (Soft Teal): White text (#FFFFFF) - Ratio 4.51:1 ✓
  - Background (Pure White): Cool Gray text - Ratio 7.2:1 ✓
  - Card Background (Light Sage): Dark Gray text - Ratio 12.8:1 ✓

## Font Selection

Typography should feel modern, confident, and highly readable for form labels and inputs.

**Primary Font**: DM Sans - Clean geometric sans-serif that maintains excellent readability at all sizes

- **Typographic Hierarchy**:
  - H1 (Wizard Title): DM Sans Bold/32px/tight letter spacing
  - H2 (Step Title): DM Sans SemiBold/24px/normal letter spacing
  - Label (Form Labels): DM Sans Medium/14px/normal letter spacing
  - Body (Instructions): DM Sans Regular/16px/relaxed (1.5) line height
  - Input Text: DM Sans Regular/16px/normal letter spacing
  - Button Text: DM Sans Medium/16px/normal letter spacing

## Animations

Animations should reinforce progress and provide satisfying feedback without delaying the user.

**Step Transitions**: Smooth slide animation (300ms ease-in-out) when moving between steps with subtle fade
**Progress Bar**: Animated fill (200ms ease-out) when step is completed
**Button Interactions**: Slight scale (1.02x, 150ms) on hover with shadow increase
**Form Validation**: Shake animation (400ms) for errors, smooth appearance of error messages
**Loading State**: Subtle pulse animation while generating insights
**Dashboard Entry**: Fade-in with staggered animation of insight cards (100ms delay between each)

## Component Selection

- **Components**:
  - **Card**: Main container for wizard steps with subtle shadow
  - **Button**: Primary variant for "Next" and "Complete", secondary for "Back"
  - **Input**: Text inputs for name fields with clear focus states
  - **Select**: Dropdown for country and location type selection
  - **Label**: Form labels with required field indicators
  - **Progress**: Custom step indicator showing 1/3, 2/3, 3/3
  - **Badge**: Step numbers and completion indicators

- **Customizations**:
  - **Step Progress Bar**: Custom linear progress indicator with three segments
  - **Wizard Container**: Centered card with max-width constraint (600px)
  - **Dashboard Layout**: Custom grid layout for insight cards with responsive columns
  - **Insight Cards**: Custom styled containers with icons and metrics

- **States**:
  - Buttons: Default (teal bg), Hover (darker teal + shadow + scale), Disabled (muted gray)
  - Inputs: Default (border), Focus (ring + border color change), Error (red border + message), Filled (subtle background)
  - Steps: Active (bold + colored), Completed (check icon), Upcoming (muted)

- **Icon Selection**:
  - Building/Company: `Buildings` from Phosphor
  - Location: `MapPin` from Phosphor
  - Energy: `Lightning` from Phosphor
  - Check/Complete: `CheckCircle` from Phosphor
  - Arrow Next: `ArrowRight` from Phosphor
  - Insights: `ChartLine`, `TrendUp`, `Leaf` from Phosphor

- **Spacing**:
  - Wizard card padding: `p-8` (32px) desktop, `p-6` (24px) mobile
  - Form field spacing: `gap-6` (24px) between fields
  - Button spacing: `mt-8` (32px) from last input
  - Dashboard card gaps: `gap-6` (24px) in grid
  - Section spacing: `mb-8` (32px) between major sections

- **Mobile**:
  - Wizard card takes full width with minimal side padding (16px)
  - Form inputs are full-width for easy tapping
  - Buttons are full-width on mobile
  - Dashboard cards stack to single column below 768px
  - Font sizes remain consistent (already optimized for mobile reading)
