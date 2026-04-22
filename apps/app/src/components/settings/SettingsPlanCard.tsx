"use client"

import Link from "next/link"
import { CheckCircle, Sparkle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UPGRADE_ROUTE } from "@/lib/routes"

type Props = {
  subscriptionTier: string | null
}

const PREMIUM_FEATURES = [
  "Equipment-level insights and fault detection",
  "Advanced analytics and trend reporting",
  "Deeper savings visibility across all locations",
  "Priority support and dedicated onboarding",
]

function isPremium(tier: string | null): boolean {
  return tier === "premium" || tier === "enterprise"
}

export function SettingsPlanCard({ subscriptionTier }: Props) {
  const premium = isPremium(subscriptionTier)
  const tierLabel = premium
    ? subscriptionTier!.charAt(0).toUpperCase() + subscriptionTier!.slice(1)
    : "Free"

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/95 py-1 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Plan &amp; Billing</CardTitle>
          <Badge
            variant={premium ? "default" : "secondary"}
            className={premium ? "bg-primary text-primary-foreground" : ""}
          >
            {tierLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Your current subscription plan.</p>
      </CardHeader>
      <CardContent className="pt-0">
        {premium ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            You are on the <span className="font-medium text-foreground">{tierLabel}</span> plan.
            You have full access to Nordly features.
          </p>
        ) : (
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkle size={18} weight="fill" className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Upgrade to Premium</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Unlock deeper energy intelligence across your locations.
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-5 w-full" asChild>
              <Link href={UPGRADE_ROUTE}>
                <Sparkle size={16} weight="fill" />
                View Premium options
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
