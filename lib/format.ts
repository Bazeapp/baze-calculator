export function formatCurrency(value: number, decimals = 0) {
  const sign = value < 0 ? "-" : ""
  const absolute = Math.abs(value)
  const fixed = absolute.toFixed(decimals)
  const [integer, fraction] = fixed.split(".")
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const decimalPart = fraction ? `,${fraction}` : ""
  return `${sign}${withThousands}${decimalPart} €`
}

export function formatNumber(value: number, decimals = 0) {
  return value.toFixed(decimals).replace(".", ",")
}
