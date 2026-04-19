import { redirect } from "next/navigation"

export default async function ReportsRedirectPage() {
  redirect("/app/reports")
}