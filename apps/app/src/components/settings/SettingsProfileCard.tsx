"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfileAction } from "@/lib/actions/settings"

type Props = {
  fullName: string
  email: string
}

export function SettingsProfileCard({ fullName, email }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)

  return (
    <Card className="rounded-2xl border border-border/80 bg-white/95 py-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Profile</CardTitle>
        <p className="text-sm text-muted-foreground">Update your personal details.</p>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={fullName}
              required
              placeholder="Your name"
              className="h-10 border-border/80 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="h-10 cursor-not-allowed border-border/80 bg-muted/50 opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              Need to change your email? Contact support.
            </p>
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
