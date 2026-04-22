// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isUserOnboarded(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("onboarding check error", error)
    return false
  }

  return !!data
}
