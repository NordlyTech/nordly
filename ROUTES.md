# Nordly Route Structure

This application uses React Router for client-side routing. Below is the exact route structure:

## Routes

### `/` - Home Page
**Component:** `HomePage`  
**Location:** `/src/pages/HomePage.tsx`

**Sections Included:**
- Header (with navigation)
- Hero section
- Value Propositions
- How It Works
- Pricing overview
- Final CTA
- Footer

**Navigation:** Accessible via the Nordly logo in the header or "Home" link in navigation

---

### `/pricing` - Pricing Page
**Component:** `PricingPageRoute`  
**Location:** `/src/pages/PricingPageRoute.tsx`

**Sections Included:**
- Header (with navigation)
- Detailed pricing comparison
  - Free Plan (€0/month)
  - Premium Plan (€99/month)
- ROI and savings statistics
- Footer

**Navigation:** Accessible via "Pricing" link in header navigation

---

### `/onboarding` - Onboarding/Dashboard Page
**Component:** `OnboardingPageRoute`  
**Location:** `/src/pages/OnboardingPageRoute.tsx`

**Behavior:**
- Shows `OnboardingWizard` if user hasn't completed onboarding
- Shows `Dashboard` if user has completed onboarding
- Uses `useKV` for persistent data storage

**Sections Included:**
- Onboarding Wizard (3 steps):
  1. Company Information
  2. Location Details
  3. Energy Data
- Or Dashboard (post-onboarding):
  - Header (with navigation)
  - Metrics cards
  - AI insights
  - ESG report generation
  - Comparison charts

**Navigation:** Accessible via "Dashboard" link in header navigation or "Get started" button

---

## Navigation Component

**Header Component:** `/src/components/Header.tsx`

The header appears on all pages and includes:
- Nordly logo (links to `/`)
- Navigation links:
  - Home → `/`
  - Pricing → `/pricing`
  - Dashboard → `/onboarding`
- Action buttons:
  - Sign in
  - Get started (links to `/onboarding`)

**Active Route Highlighting:** The current route is highlighted in the navigation with primary color.

---

## Implementation Details

**Router:** React Router DOM v6
**Main App File:** `/src/App.tsx`
**State Management:** useKV hook for persistent data (onboarding data, etc.)

All routes are wrapped in `<BrowserRouter>` and use `<Routes>` with `<Route>` components for declarative routing.
