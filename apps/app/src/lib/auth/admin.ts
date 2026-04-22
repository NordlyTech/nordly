import { createClient } from "@/lib/supabase/server"

type RecordValue = Record<string, unknown>

function asBoolean(value: unknown) {
  return value === true
}

function isAdminFromMetadata(user: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) {
  const userMetadataAdmin = user.user_metadata?.is_admin === true
  const appMetadataAdmin = user.app_metadata?.is_admin === true

  return userMetadataAdmin || appMetadataAdmin
}

function isAdminFromEmailAllowlist(email: string | null | undefined) {
  if (!email) {
    return false
  }

  const normalizedEmail = email.trim().toLowerCase()
  const builtInAdminEmails = ["demo-admin@nordly.app"]

  if (builtInAdminEmails.includes(normalizedEmail)) {
    return true
  }

  const raw = process.env.ADMIN_EMAILS
  if (!raw) {
    return false
  }

  const allowedEmails = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)

  return allowedEmails.includes(normalizedEmail)
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return false
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) {
    return isAdminFromMetadata(user) || isAdminFromEmailAllowlist(user.email)
  }

  const profileAdmin = asBoolean((data as RecordValue).is_admin)
  return profileAdmin || isAdminFromMetadata(user) || isAdminFromEmailAllowlist(user.email)
}

export async function requireAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("You must be logged in.")
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  const profileAdmin = !error && data ? asBoolean((data as RecordValue).is_admin) : false
  const isAdmin = profileAdmin || isAdminFromMetadata(user) || isAdminFromEmailAllowlist(user.email)

  if (!isAdmin) {
    throw new Error("Admin access required.")
  }

  return {
    userId: user.id,
    user,
  }
}
