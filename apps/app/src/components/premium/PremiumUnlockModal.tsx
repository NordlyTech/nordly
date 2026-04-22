"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { CheckCircle } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format/currency"
import { UPGRADE_ROUTE } from "@/lib/routes"
import { getPremiumModalContent, type PremiumModalContext } from "@/lib/premium/getPremiumModalContent"

type PremiumUnlockModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: PremiumModalContext
  savingsValue?: number | null
}

export function PremiumUnlockModal({ open, onOpenChange, context, savingsValue = null }: PremiumUnlockModalProps) {
  const content = getPremiumModalContent(context)
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open) {
      // TODO: Track event premium_modal_opened with context
      window.setTimeout(() => {
        primaryButtonRef.current?.focus()
      }, 0)
    }
  }, [open, context])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground/90">{content.contextMessage}</p>

          {typeof savingsValue === "number" && Number.isFinite(savingsValue) ? (
            <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-foreground">Unlock {formatCurrency(savingsValue)} in savings</p>
            </div>
          ) : null}

          <ul className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-foreground/90">
                <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="gap-2">
          <Button
            ref={primaryButtonRef}
            asChild
            onClick={() => {
              // TODO: Track event premium_modal_upgrade_clicked with context
            }}
          >
            <Link href={UPGRADE_ROUTE}>{content.primaryCta}</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // TODO: Track event premium_modal_dismissed with context
              onOpenChange(false)
            }}
          >
            {content.secondaryCta}
          </Button>
          <Button variant="ghost" asChild className="px-2">
            <Link href={UPGRADE_ROUTE}>{content.tertiaryCta}</Link>
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground">{content.microcopy}</p>
      </DialogContent>
    </Dialog>
  )
}
