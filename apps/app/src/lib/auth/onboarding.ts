import { createClient } from "@/lib/supabase/server"

export type OnboardingStatus = {
  isAuthenticated: boolean
  hasCompany: boolean
  hasMembership: boolean
  hasLocation: boolean
  hasRequiredLocationType: boolean
  isComplete: boolean
  companyId?: string
  userId?: string
}

/**
 * Get comprehensive onboarding status from database
 * Onboarding is complete if ALL are true:
 * 1. User is authenticated
 * 2. User belongs to a company (via company_members)
 * 3. Company exists
 * 4. Company has at least one location
 * 5. That location has a non-empty location_type
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // User not authenticated
  if (!user) {
    return {
      isAuthenticated: false,
      hasCompany: false,
      hasMembership: false,
      hasLocation: false,
      hasRequiredLocationType: false,
      isComplete: false,
    }
  }

  // Check for company membership
  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  const membership = memberships?.[0]
  const hasMembership = !!membership

  if (!hasMembership || membershipError) {
    return {
      isAuthenticated: true,
      hasCompany: false,
      hasMembership: false,
      hasLocation: false,
      hasRequiredLocationType: false,
      isComplete: false,
      userId: user.id,
    }
  }

  const companyId = membership.company_id

  // Check if company exists
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .limit(1)

  const hasCompany = !!company?.[0] && !companyError

  if (!hasCompany) {
    return {
      isAuthenticated: true,
      hasCompany: false,
      hasMembership: true,
      hasLocation: false,
      hasRequiredLocationType: false,
      isComplete: false,
      companyId,
      userId: user.id,
    }
  }

  // Check if company has at least one location with location_type
  const { data: locations } = await supabase
    .from("locations")
    .select("id, location_type")
    .eq("company_id", companyId)
    .not("location_type", "is", null)
    .limit(1)

  const hasLocation = (locations?.length ?? 0) > 0
  const hasRequiredLocationType = hasLocation && !!locations?.[0]?.location_type

  return {
    isAuthenticated: true,
    hasCompany: true,
    hasMembership: true,
    hasLocation,
    hasRequiredLocationType,
    isComplete: hasLocation && hasRequiredLocationType,
    companyId,
    userId: user.id,
  }
}
