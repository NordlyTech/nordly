import { redirect } from "next/navigation"

export default async function SettingsRedirectPage() {
  redirect("/app/settings")
}
