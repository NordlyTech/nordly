import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { ensureDemoUserLinked } from "@/lib/server/ensureDemoUserLinked"

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { url, anonKey }
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/") ||
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  )
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const { url, anonKey } = getSupabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protectedPath = isProtectedPath(pathname)
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/")
  const isOnboardingPath = pathname === "/onboarding" || pathname.startsWith("/onboarding/")
  const isAppPath = pathname === "/app" || pathname.startsWith("/app/")
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  if (!user) {
    if (!protectedPath) {
      return response
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

  let isAdmin = false

  if (isAdminPath || isAuthRoute || isOnboardingPath || isAppPath) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()

    const profileAdmin = !profileError && profileData ? profileData.is_admin === true : false
    isAdmin = profileAdmin || isAdminFromMetadata(user) || isAdminFromEmailAllowlist(user.email)
  }

  if (isAdminPath) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/app", request.url))
    }

    return response
  }

  // Auto-link demo users who may be missing a company_members row due to partial seeding.
  await ensureDemoUserLinked(supabase, user)

  const { data: memberships, error: membershipError } = await supabase
    .from("company_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)

  // Do not force onboarding redirects when membership lookup fails.
  // Let route-level logic handle the request to avoid redirect loops.
  if (membershipError) {
    return response
  }

  const isOnboarded = (memberships?.length ?? 0) > 0

  if (isAppPath && !isOnboarded && !isAdmin) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if (isOnboardingPath && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (isOnboardingPath && isOnboarded) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : isOnboarded ? "/app" : "/onboarding", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)"],
}
