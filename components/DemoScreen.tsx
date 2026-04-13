'use client'

import { useState, useCallback } from 'react'
import { DecisionResult } from '@/types'
import { TopBar, Dots } from './shared'

interface Props {
  onSignUp: () => void
  onBack: () => void
}

// Uses the real API but with demo:true flag — no auth needed
async function getDemoDecision(prompt: string): Promise<DecisionResult> {
  const res = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      demo: true,
      category: 'General',
      prompt,
      profile: null,
    }),
  })
  if (!res.ok) throw new Error('api_error')
  return res.json()
}

export default function DemoScreen({ onSignUp, onBack }: Props) {
  const [phase, setPhase]   = useState<'input' | 'loading' | 'result'>('input')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<DecisionResult | null>(null)
  const [err, setErr]       = useState('')

  const run = useCallback(async () => {
    if (!prompt.trim()) return
    setPhase('loading')
    setErr('')
    try {
      const r = await getDemoDecision(prompt)
      setResult(r)
      setPhase('result')
    } catch {
      setErr('Something went wrong. Try again.')
      setPhase('input')
    }
  }, [prompt])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page-center stack s16">
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Thinking for you…</div>
        <Dots />
      </div>
    </div>
  )

  // ── Result + sign-up prompt ────────────────────────────────────────────────
  if (phase === 'result' && result) return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page stack s16">

        {/* Demo badge */}
        <div className="up" style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 100,
          border: '1px solid var(--border2)',
          fontSize: 11, color: 'var(--muted)',
          fontFamily: 'Geist Mono, monospace',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          ◎ Demo result
        </div>

        {/* Result hero */}
        <div className="result-hero up2">
          <div className="result-label">Best choice</div>
          <div className="result-choice">{result.bestChoice}</div>
          <div className="result-reason">{result.reason}</div>
        </div>

        {result.backups?.length > 0 && (
          <div className="stack s6 up3">
            <div className="mono" style={{ marginBottom: 4 }}>Alternatives</div>
            {result.backups.map((b, i) => (
              <div key={i} className="backup-row">
                <span className="backup-n">{i + 1}</span>
                <span style={{ fontSize: 14, color: 'var(--cream2)' }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex1" />

        {/* Sign-up CTA — the only upsell moment */}
        <div className="up4" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--r)',
          padding: '20px',
        }}>
          <div style={{
            fontSize: 16,
            fontFamily: 'Instrument Serif, serif',
            marginBottom: 6,
          }}>
            Want decisions like this every day?
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Save history, set preferences, and get better answers over time.
          </div>
          <div className="stack s8">
            <button className="btn btn-primary" onClick={onSignUp}>
              Create a free account →
            </button>
            <button className="btn btn-ghost" onClick={onBack}
              style={{ fontSize: 13 }}>
              Back to sign in
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  // ── Input ──────────────────────────────────────────────────────────────────
  return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page">
        <div className="up" style={{ marginTop: 8, marginBottom: 24 }}>
          <h2>Try it now</h2>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            No account needed. One free decision.
          </div>
        </div>

        <div className="up2" style={{ marginBottom: 8 }}>
          <textarea
            className="input"
            rows={5}
            placeholder="Describe your situation — what do you need to decide? e.g. Low energy, 90 mins free, should I go to the gym or work on my project?"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run() }}
            autoFocus
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, textAlign: 'right' }}>
            ⌘↵ to submit
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}

        <div className="flex1" />

        <div className="stack s8 up3">
          <button className="btn btn-primary" onClick={run} disabled={!prompt.trim()}>
            Decide for me →
          </button>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        </div>
      </div>
    </div>
  )
}
