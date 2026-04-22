import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner"
import { decodeImpersonationState, IMPERSONATION_COOKIE_NAME } from "@/lib/auth/impersonation"

export default async function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null

  const cookieStore = await cookies()
  const impersonationState = decodeImpersonationState(cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value)

  return (
    <>
      {impersonationState ? <ImpersonationBanner companyName={impersonationState.companyName} /> : null}

      <AppLayout userName={fullName} userEmail={user.email ?? null}>
        {children}
      </AppLayout>
    </>
  )
}
