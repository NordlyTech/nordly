import { redirect } from "next/navigation"

export default async function MissionsRedirectPage() {
  redirect("/app/missions")
}
