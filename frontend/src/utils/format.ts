// The API speaks UTC; the UI shows Kyiv time (SAD §8).
const dateTime = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'Europe/Kyiv',
  dateStyle: 'short',
  timeStyle: 'short',
})

const percent = new Intl.NumberFormat('uk-UA', { style: 'percent', maximumFractionDigits: 1 })

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : '—'
}

export function formatPercent(ratio: number): string {
  return percent.format(ratio)
}
