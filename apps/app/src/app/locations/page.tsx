import { redirect } from "next/navigation"

export default async function LocationsRedirectPage() {
  redirect("/app/locations")
}
