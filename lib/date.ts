export type CalendarDay = {
  date: string
  inMonth: boolean
}

const JST_TIME_ZONE = 'Asia/Tokyo'

export function formatDateJst(value: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: JST_TIME_ZONE }).format(value)
}

export function getTodayInJst(): string {
  return formatDateJst(new Date())
}

export function isValidMonth(value?: string): value is `${number}-${number}` {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value))
}

export function isValidDate(value?: string): value is `${number}-${number}-${number}` {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function parseMonth(value?: string): { year: number; month: number } {
  if (!isValidMonth(value)) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  }

  const [year, month] = value.split('-').map(Number)
  return { year, month }
}

export function getMonthString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getAdjacentMonth(year: number, month: number, offset: number): string {
  const value = new Date(year, month - 1 + offset, 1)
  return getMonthString(value.getFullYear(), value.getMonth() + 1)
}

export function makeMonthMeta(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const start = new Date(year, month - 1, 1 - first.getDay())
  const days: CalendarDay[] = []

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(start)
    current.setDate(start.getDate() + index)

    days.push({
      date: formatDateJst(current),
      inMonth: current.getMonth() === month - 1,
    })
  }

  return {
    monthStart: formatDateJst(first),
    monthEnd: formatDateJst(last),
    days,
  }
}
