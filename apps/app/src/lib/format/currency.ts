export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Potential savings available"
  }

  const rounded = Math.round(value)
  return `€${new Intl.NumberFormat("en-GB").format(rounded)}/month`
}
