# Planning Guide

**Experience Qualities**:


This is a multi-step wizard with form validation and state management that guides user
## Essential Features
**Step 1: Company Information**

- Progression: User sees welcome message → enters company name → selects cou


- Trigger: User compl

**Step 3: Energy Data Entry**
- Purpose: Gather baseline energy data for AI ana
- Progression: User enters monthly kWh value → clicks Complete →

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
## Color Selection
- Purpose: Provide immediate value and validate the onboarding investment

- Progression: Loading animation (1-2s) → Dashboard appears with personalized insights → User explores recommendations
- Success criteria: Insights feel personalized and actionable, dashboard is visually engaging

- **Foreground/Backgr

- **Empty Fields**: Form validation prevents progression with clear inline error messages
- **Invalid Data**: Numeric fields reject non-numeric input and provide formatting guidance
- **Browser Back**: Progress is preserved if user navigates back through steps
- **Refresh During Onboarding**: Data persists and user returns to current step
- **Completed Onboarding**: Returning users see dashboard directly, not wizard

  - H1 (Wizard Titl

The design should evoke **simplicity, confidence, and forward momentum**. Users should feel the process is quick and worthwhile, with each step feeling like progress toward valuable insights. The wizard should feel spacious and uncluttered, using Nordic-inspired minimalism with clear visual hierarchy.

  - **Insight Card

  - Inputs: Default (border), Focus (ring + border color change), Error (red border + message), Fille

  - Building/Company: `Buildings` from Phosphor
  - Energy: `Lightning` 
  - Arrow Next: `ArrowRight` from Phosphor

  - Wizard card padding: `p-8` (32px) desktop, `p-6` (24px) mobile
  - Button spacing: `mt-8` (32px) fro
  - Section spacing: `mb-8` (32px) between major sections
- **Mobile**:
  - Form inputs are full-width for easy tapping
















































- **Icon Selection**:







- **Spacing**:






- **Mobile**:





