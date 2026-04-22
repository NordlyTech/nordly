"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

type ActionState = { ok: true; message: string } | { ok: false; error: string }

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function updateProfileAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const fullName = getString(formData, "full_name")

  if (!fullName) {
    return { ok: false, error: "Full name is required." }
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/app/settings")
  return { ok: true, message: "Changes saved." }
}

export async function updatePasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const newPassword = getString(formData, "new_password")
  const confirmPassword = getString(formData, "confirm_password")

  if (!newPassword) {
    return { ok: false, error: "New password is required." }
  }

  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "Passwords do not match." }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, message: "Password saved." }
}

export async function updateCompanyAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const companyId = getString(formData, "company_id")
  const name = getString(formData, "name")
  const industry = getString(formData, "industry")
  const country = getString(formData, "country")

  if (!companyId) {
    return { ok: false, error: "Company not found." }
  }

  if (!name) {
    return { ok: false, error: "Company name is required." }
  }

  // Verify the user is a member of this company before updating
  const { data: membership } = await supabase
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .limit(1)

  if (!membership || membership.length === 0) {
    return { ok: false, error: "You do not have permission to update this company." }
  }

  const { error } = await supabase
    .from("companies")
    .update({ name, industry: industry || null, country: country || null })
    .eq("id", companyId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/app/settings")
  return { ok: true, message: "Changes saved." }
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
