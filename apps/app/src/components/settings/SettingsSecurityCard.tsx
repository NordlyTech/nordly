"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePasswordAction } from "@/lib/actions/settings"

export function SettingsSecurityCard() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null)

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/95 py-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Security</CardTitle>
        <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Min. 8 characters"
              className="h-10 border-border/80 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Confirm your new password"
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
              {isPending ? "Saving…" : "Save password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
