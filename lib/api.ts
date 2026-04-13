import { DecisionRequest, DecisionResult, Profile } from '@/types'

export async function getDecision(req: DecisionRequest): Promise<DecisionResult> {
  const res = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error('api_error')
  return res.json()
}

export async function getClarifiers(category: string, prompt: string): Promise<string[]> {
  const res = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, prompt, clarifyOnly: true }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data.questions) ? data.questions.slice(0, 2) : []
}
