import { redirect } from "next/navigation"

export default async function NewReportRedirectPage() {
  redirect("/app/reports/new")
}