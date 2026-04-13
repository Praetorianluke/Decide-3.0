const KEY = 'dfk_demo_usage'
const DAILY_LIMIT = 3

interface UsageRecord {
  date: string   // YYYY-MM-DD
  count: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function read(): UsageRecord {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { date: today(), count: 0 }
    const record: UsageRecord = JSON.parse(raw)
    // Stale date → treat as fresh day
    if (record.date !== today()) return { date: today(), count: 0 }
    return record
  } catch {
    return { date: today(), count: 0 }
  }
}

function write(record: UsageRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record))
  } catch {}
}

/** How many free decisions the user has used today */
export function getUsedCount(): number {
  return read().count
}

/** How many free decisions remain today */
export function getRemainingCount(): number {
  return Math.max(0, DAILY_LIMIT - read().count)
}

/** Whether the user has hit today's limit */
export function isLimitReached(): boolean {
  return read().count >= DAILY_LIMIT
}

/** Increment usage by 1. Call only after a successful decision result. */
export function incrementUsage(): void {
  const record = read()
  write({ date: today(), count: record.count + 1 })
}

export { DAILY_LIMIT }
