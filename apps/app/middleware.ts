import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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
    pathname.startsWith("/app/")
  )
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
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  if (!user) {
    if (!protectedPath) {
      return response
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

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

  if ((pathname === "/app" || pathname.startsWith("/app/")) && !isOnboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if ((pathname === "/onboarding" || pathname.startsWith("/onboarding/")) && isOnboarded) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(isOnboarded ? "/app" : "/onboarding", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)"],
}
