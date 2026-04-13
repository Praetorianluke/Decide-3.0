export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

export function clear(...keys: string[]): void {
  if (typeof window === 'undefined') return
  keys.forEach(k => {
    try { localStorage.removeItem(k) } catch {}
  })
}
