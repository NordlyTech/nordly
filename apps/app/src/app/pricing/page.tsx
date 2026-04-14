import { redirect } from "next/navigation"

// Pricing lives on the public marketing site at http://localhost:5173/pricing
export default function PricingRedirectPage() {
  redirect("http://localhost:5173/pricing")
}
