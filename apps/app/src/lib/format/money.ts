type MoneyFormatOptions = {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

function normalizeCurrencyCode(currencyCode: string | null | undefined) {
  if (!currencyCode) {
    return null
  }

  const normalized = currencyCode.trim().toUpperCase()
  return normalized.length > 0 ? normalized : null
}

export function formatMoney(
  amount: number | null | undefined,
  currencyCode: string | null | undefined,
  options: MoneyFormatOptions = {}
): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "-"
  }

  const normalizedCurrency = normalizeCurrencyCode(currencyCode)
  const locale = options.locale ?? "en-GB"
  const minimumFractionDigits = options.minimumFractionDigits ?? 0
  const maximumFractionDigits = options.maximumFractionDigits ?? 0

  if (normalizedCurrency) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: normalizedCurrency,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    } catch {
      // Fall through to a plain fallback if Intl cannot format this currency.
    }
  }

  const plain = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)

  return normalizedCurrency ? `${normalizedCurrency} ${plain}` : plain
}

export function formatMonthlyMoney(
  amount: number | null | undefined,
  currencyCode: string | null | undefined,
  options: MoneyFormatOptions = {}
): string {
  const formatted = formatMoney(amount, currencyCode, options)
  if (formatted === "-") {
    return "Potential savings available"
  }

  return `${formatted}/month`
}
