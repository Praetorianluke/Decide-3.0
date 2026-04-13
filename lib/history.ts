import { HistoryEntry, DecisionResult } from '@/types'

const KEY = 'dfk_history'
const MAX = 20

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {}
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist a completed decision.
 * Called only after a successful AI result — never on errors or loading states.
 * Returns the saved entry so callers can reference it.
 */
export function saveDecision(
  prompt: string,
  result: DecisionResult,
  category = 'General',
  label = 'General',
): HistoryEntry {
  const entry: HistoryEntry = {
    id: Date.now(),
    prompt,
    result,
    category,
    label,
  }
  const existing = loadHistory()
  // Newest first, capped at MAX
  const next = [entry, ...existing].slice(0, MAX)
  writeHistory(next)
  return entry
}

/** Clear all history (used in settings / logout if desired) */
export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/** Human-readable relative time: "just now", "5m ago", "2h ago", "3d ago" */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
