import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  adminLabel?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, adminLabel = "Admin", actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <Badge className="border border-primary/25 bg-primary/10 text-primary">{adminLabel}</Badge>
        </div>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string | number
  helper?: string
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

type SectionCardProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <Card className="rounded-2xl border-border/80 py-0 shadow-sm hover:shadow-sm">
      <CardHeader className="border-b border-border/80 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

type StatusTone = "active" | "premium" | "pending" | "failed" | "completed" | "neutral"

const STATUS_STYLES: Record<StatusTone, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  premium: "border-sky-200 bg-sky-50 text-sky-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  completed: "border-indigo-200 bg-indigo-50 text-indigo-700",
  neutral: "border-border bg-muted text-muted-foreground",
}

export function StatusBadge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return <Badge className={cn("rounded-full", STATUS_STYLES[tone])}>{children}</Badge>
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-white px-3 py-2 shadow-sm">
      {children}
    </div>
  )
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function DataTableTable({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full divide-y divide-border text-sm">{children}</table>
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/60">{children}</thead>
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/70 bg-white">{children}</tbody>
}

export function DataHeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground", className)}>{children}</th>
}

export function DataCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-sm text-muted-foreground", className)}>{children}</td>
}

export function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-foreground hover:text-primary hover:underline">
      {children}
    </Link>
  )
}
