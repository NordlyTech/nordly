"use server"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/admin"
import {
  decodeImpersonationState,
  encodeImpersonationState,
  IMPERSONATION_COOKIE_NAME,
} from "@/lib/auth/impersonation"
import { createClient } from "@/lib/supabase/server"

function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY")
  }

  return { url, serviceRoleKey }
}

async function resolveAppOrigin() {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL
  if (envOrigin && envOrigin.trim().length > 0) {
    return envOrigin.replace(/\/$/, "")
  }

  const headerStore = await headers()
  const origin = headerStore.get("origin")

  if (!origin) {
    throw new Error("Could not resolve app origin for impersonation redirects.")
  }

  return origin.replace(/\/$/, "")
}

export async function impersonateUserAction(targetUserId: string, companyName: string): Promise<string> {
  const normalizedTargetUserId = targetUserId.trim()

  if (!normalizedTargetUserId) {
    throw new Error("Target user is required.")
  }

  const { user } = await requireAdminContext()

  const { url, serviceRoleKey } = getSupabaseAdminEnv()
  const adminSupabase = createAdminClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: targetUserResult, error: targetUserError } = await adminSupabase.auth.admin.getUserById(normalizedTargetUserId)

  if (targetUserError || !targetUserResult.user) {
    throw new Error(targetUserError?.message ?? "Target user was not found.")
  }

  const targetUserEmail = targetUserResult.user.email

  if (!targetUserEmail) {
    throw new Error("Target user does not have an email address.")
  }

  const origin = await resolveAppOrigin()

  const { data: targetLinkData, error: targetLinkError } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: targetUserEmail,
    options: {
      redirectTo: `${origin}/app`,
    },
  })

  if (targetLinkError) {
    throw new Error(targetLinkError.message)
  }

  const targetActionLink = targetLinkData.properties?.action_link
  if (!targetActionLink) {
    throw new Error("Failed to generate impersonation link.")
  }

  const adminEmail = user.email
  if (!adminEmail) {
    throw new Error("Admin account does not have an email address.")
  }

  const { data: adminLinkData, error: adminLinkError } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail,
    options: {
      redirectTo: `${origin}/admin`,
    },
  })

  if (adminLinkError) {
    throw new Error(adminLinkError.message)
  }

  const adminResumeLink = adminLinkData.properties?.action_link
  if (!adminResumeLink) {
    throw new Error("Failed to generate admin resume link.")
  }

  const cookieStore = await cookies()
  cookieStore.set(
    IMPERSONATION_COOKIE_NAME,
    encodeImpersonationState({
      companyName: companyName.trim() || "selected company",
      adminEmail,
      adminUserId: user.id,
      resumeLink: adminResumeLink,
      startedAtIso: new Date().toISOString(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4,
    }
  )

  return targetActionLink
}

export async function exitImpersonationAction() {
  const cookieStore = await cookies()
  const currentState = decodeImpersonationState(cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value)

  cookieStore.delete(IMPERSONATION_COOKIE_NAME)

  const supabase = await createClient()
  await supabase.auth.signOut()

  if (currentState?.resumeLink) {
    redirect(currentState.resumeLink)
  }

  redirect("/admin")
}
