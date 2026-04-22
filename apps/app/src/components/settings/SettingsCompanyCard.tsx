"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCompanyAction } from "@/lib/actions/settings"

type Props = {
  companyId: string
  name: string
  industry: string | null
}

export function SettingsCompanyCard({ companyId, name, industry }: Props) {
  const [state, formAction, isPending] = useActionState(updateCompanyAction, null)

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/95 py-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Company</CardTitle>
        <p className="text-sm text-muted-foreground">Update company details for your workspace.</p>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="company_id" value={companyId} />

          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              name="name"
              type="text"
              defaultValue={name}
              required
              placeholder="Your company"
              className="h-10 border-border/80 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              type="text"
              defaultValue={industry ?? ""}
              placeholder="e.g. Retail, hospitality, manufacturing"
              className="h-10 border-border/80 bg-white"
            />
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
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
