"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { updateCompanyRegionalAction } from "@/lib/actions/settings"

type RegionalCountry = {
  code: string
  name: string
}

type RegionalCurrency = {
  code: string
  name: string
}

type Props = {
  companyId: string
  countryCode: string | null
  currencyCode: string | null
  countries: RegionalCountry[]
  currencies: RegionalCurrency[]
}

export function SettingsRegionalCard({
  companyId,
  countryCode,
  currencyCode,
  countries,
  currencies,
}: Props) {
  const [state, formAction, isPending] = useActionState(updateCompanyRegionalAction, null)

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/95 py-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Regional settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your company country and default currency used across savings values.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="company_id" value={companyId} />

          <div className="space-y-2">
            <Label htmlFor="regional_country_code">Company country</Label>
            <select
              id="regional_country_code"
              name="country_code"
              defaultValue={countryCode ?? ""}
              className="flex h-10 w-full rounded-lg border border-border/80 bg-white px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select country...</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regional_currency_code">Default currency</Label>
            <select
              id="regional_currency_code"
              name="currency_code"
              defaultValue={currencyCode ?? ""}
              className="flex h-10 w-full rounded-lg border border-border/80 bg-white px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Select currency...</option>
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {state && (
            <p
              className={
                state.ok
                  ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  : "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-destructive"
              }
            >
              {state.ok ? state.message : state.error}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save regional settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
