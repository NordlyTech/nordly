import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PREMIUM_CONTACT_EMAIL } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

type CompanyRow = {
  id: string
  subscription_tier: string | null
}

const VALUE_CARDS = [
  {
    title: "Add your equipment. Get smarter recommendations.",
    description:
      "Understand how HVAC, lighting, and other systems impact your energy usage and unlock tailored optimization opportunities.",
  },
  {
    title: "From generic estimates to real potential.",
    description:
      "Premium uses deeper context to generate more precise savings estimates you can trust and act on.",
  },
  {
    title: "Go beyond basic recommendations.",
    description:
      "Access deeper, more specific insights based on your locations, operations, and equipment.",
  },
  {
    title: "See what actions are worth it.",
    description:
      "Track expected savings and prioritize the initiatives with the highest business impact.",
  },
  {
    title: "Prepare for ESG and performance reporting.",
    description:
      "Structure your data and actions so you are ready for internal reviews and external reporting later.",
  },
]

const FREE_FEATURES = [
  "Add locations",
  "Basic AI-generated insights",
  "Limited mission tracking",
  "High-level savings estimates",
  "Basic dashboard",
]

const PREMIUM_FEATURES = [
  "Equipment-based insights",
  "More accurate savings estimation",
  "Advanced AI recommendations",
  "Full mission tracking and prioritization",
  "ROI visibility and action impact",
  "Premium analytics (coming next)",
  "Reporting readiness",
]

function normalizeTier(value: string | null): "free" | "premium" | "enterprise" {
  if (value === "premium") return "premium"
  if (value === "enterprise") return "enterprise"
  return "free"
}

function tierLabel(tier: "free" | "premium" | "enterprise") {
  if (tier === "free") return "Free"
  if (tier === "enterprise") return "Enterprise"
  return "Premium"
}

export default async function UpgradePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: memberships } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .limit(1)

  const companyId = memberships?.[0]?.company_id ?? null
  let company: CompanyRow | null = null

  if (companyId) {
    const { data } = await supabase
      .from("companies")
      .select("id, subscription_tier")
      .eq("id", companyId)
      .single()

    company = (data as CompanyRow | null) ?? null
  }

  const currentTier = normalizeTier(company?.subscription_tier ?? null)
  const primaryCtaText = "Request Premium Access"

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-white to-accent/10">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl font-semibold">Upgrade to Premium</CardTitle>
            <Badge variant={currentTier === "free" ? "secondary" : "default"} className="px-3 py-1 text-xs uppercase tracking-wide">
              Current plan: {tierLabel(currentTier)}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            Unlock deeper energy intelligence, more accurate savings estimates, and actionable insights tailored to your operations.
          </p>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Start identifying high-impact opportunities across your locations and turn them into measurable results.
          </p>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Why upgrade to Premium</h2>
        </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VALUE_CARDS.map((card) => (
          <Card key={card.title} className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Free vs Premium</h2>
        </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Free</CardTitle>
            <p className="text-sm text-muted-foreground">Best for getting started</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-slate-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkle size={18} weight="fill" className="text-primary" />
                Premium
              </CardTitle>
              <Badge variant="outline" className="border-primary/35 bg-primary/10 text-primary">
                Recommended
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">For companies serious about optimization</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      </section>

      <Card className="border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Get started</CardTitle>
          <p className="text-sm text-muted-foreground">
            Billing integration is being finalized. Request access now and we will enable your workspace.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={`mailto:${PREMIUM_CONTACT_EMAIL}?subject=Nordly%20Premium%20Access%20Request`}>
              {primaryCtaText}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`mailto:${PREMIUM_CONTACT_EMAIL}?subject=Nordly%20Sales%20Inquiry`}>Talk to Sales</Link>
          </Button>
        </CardContent>
        <CardContent className="space-y-1 pt-0 text-sm text-muted-foreground">
          <p>No commitment. Upgrade anytime.</p>
          <p>Most customers identify savings opportunities within minutes.</p>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-foreground">Why does adding equipment matter?</p>
            <p className="mt-1 text-muted-foreground">
              Because energy usage depends heavily on systems like HVAC, lighting, and machinery. Premium uses this data to generate more precise and relevant insights.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">How accurate are the savings estimates?</p>
            <p className="mt-1 text-muted-foreground">
              Estimates are based on your location type, inputs, and available data. Premium improves accuracy by incorporating deeper operational context.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Can I upgrade later?</p>
            <p className="mt-1 text-muted-foreground">
              Yes. You can upgrade anytime as your needs grow.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
