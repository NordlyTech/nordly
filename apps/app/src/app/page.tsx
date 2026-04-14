import { redirect } from "next/navigation"

// The public marketing website lives at http://localhost:5173 (Vite).
// This Next.js app is only the authenticated product. Send visitors to login.
export default function RootPage() {
  redirect("/login")
}
