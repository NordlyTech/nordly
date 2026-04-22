import { formatMonthlyMoney } from "@/lib/format/money"

export function formatCurrency(
  value: number | null | undefined,
  currencyCode: string | null | undefined = "EUR"
): string {
  return formatMonthlyMoney(value, currencyCode, { locale: "en-GB", maximumFractionDigits: 0 })
}
