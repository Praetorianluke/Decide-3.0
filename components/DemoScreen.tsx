'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { DecisionResult } from '@/types'

// ─── API ──────────────────────────────────────────────────────────────────────

async function getDemoDecision(prompt: string): Promise<DecisionResult> {
  const res = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demo: true, category: 'General', prompt, profile: null }),
  })
  if (!res.ok) throw new Error('api_error')
  return res.json()
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAMPLES = [
  'What should I eat tonight?',
  'Plan my next 2 hours',
  'Pick between gym or studying',
  'Should I nap or push through?',
  'What task should I do first?',
]

const LOADING_LINES = [
  'Thinking for you…',
  'Weighing your options…',
  'Making the best call…',
  'Almost there…',
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onSignUp: () => void
  onBack: () => void
  initialPrompt?: string
}

// ─── Inline styles shared across phases ───────────────────────────────────────

const S = {
  sectionLabel: {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 9,
    letterSpacing: '0.13em',
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    marginBottom: 8,
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '20px 0',
    opacity: 0.5,
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoScreen({ onSignUp, onBack, initialPrompt }: Props) {
  const [phase, setPhase]         = useState<'input' | 'loading' | 'result'>('input')
  const [prompt, setPrompt]       = useState(initialPrompt || '')
  const [result, setResult]       = useState<DecisionResult | null>(null)
  const [err, setErr]             = useState('')
  const [loadingLine, setLoading] = useState(0)
  const [exampleIdx, setExample]  = useState(0)
  const [resultVisible, setResultVisible] = useState(false)
  const textareaRef               = useRef<HTMLTextAreaElement>(null)

  // Rotate example placeholder
  useEffect(() => {
    if (phase !== 'input') return
    const t = setInterval(() => setExample(i => (i + 1) % EXAMPLES.length), 2800)
    return () => clearInterval(t)
  }, [phase])

  // Cycle loading copy
  useEffect(() => {
    if (phase !== 'loading') return
    const t = setInterval(() => setLoading(i => (i + 1) % LOADING_LINES.length), 1600)
    return () => clearInterval(t)
  }, [phase])

  // Trigger result entrance animation one frame after mount
  useEffect(() => {
    if (phase !== 'result') return
    const t = requestAnimationFrame(() => setResultVisible(true))
    return () => cancelAnimationFrame(t)
  }, [phase])

  // Auto-run if launched with a pre-filled prompt
  useEffect(() => {
    if (initialPrompt?.trim()) run(initialPrompt)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = useCallback(async (p?: string) => {
    const text = (p ?? prompt).trim()
    if (!text) { textareaRef.current?.focus(); return }
    setPhase('loading')
    setLoading(0)
    setResultVisible(false)
    setErr('')
    try {
      const r = await getDemoDecision(text)
      setResult(r)
      setPhase('result')
    } catch {
      setErr('Something went wrong. Try again.')
      setPhase('input')
    }
  }, [prompt])

  const reset = () => {
    setResultVisible(false)
    // Small delay lets the outgoing state clear before input mounts
    setTimeout(() => {
      setPhase('input')
      setResult(null)
      setErr('')
      setTimeout(() => textareaRef.current?.focus(), 60)
    }, 80)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (phase === 'loading') return (
    <div className="root">
      <div className="topbar">
        <span className="logo">DFK</span>
      </div>
      <div className="page-center">
        <div style={{ textAlign: 'center' }}>
          {/* Slim amber arc spinner */}
          <div style={{
            width: 34, height: 34,
            margin: '0 auto 32px',
            borderRadius: '50%',
            border: '1.5px solid var(--border)',
            borderTopColor: 'var(--amber)',
            animation: 'spin 0.75s linear infinite',
          }} />

          {/* Cycling message — key remounts element to retrigger animation */}
          <div
            key={loadingLine}
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 21,
              color: 'var(--cream)',
              marginBottom: 10,
              letterSpacing: '-0.01em',
              animation: 'fadeSwap 0.35s ease-out both',
            }}
          >
            {LOADING_LINES[loadingLine]}
          </div>

          {/* Echo the prompt so users feel seen */}
          <div style={{
            fontSize: 13,
            color: 'var(--muted)',
            maxWidth: 260,
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            {prompt.length > 55 ? `${prompt.slice(0, 55)}…` : prompt}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Result ───────────────────────────────────────────────────────────────────

  if (phase === 'result' && result) return (
    <div className="root">
      <div className="topbar">
        <span className="logo">DFK</span>
        <button className="back-btn" onClick={reset}>Try another</button>
      </div>

      {/* Outer wrapper animates in as a unit: fade + scale */}
      <div
        className="page stack s20"
        style={{
          paddingTop: 24,
          opacity: resultVisible ? 1 : 0,
          transform: resultVisible ? 'scale(1)' : 'scale(0.98)',
          transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
        }}
      >

        {/* ── Hero result card ───────────────────────────────────────────── */}
        <div className="result-hero" style={{ padding: '28px 24px 26px' }}>

          {/* Eyebrow label — upgraded copy */}
          <div style={S.sectionLabel}>Your best move right now</div>

          {/* The decision — dominant, large */}
          <div
            className="result-choice"
            style={{ fontSize: 30, lineHeight: 1.15, marginBottom: 0 }}
          >
            {result.bestChoice}
          </div>

          <div style={S.divider} />

          {/* Rationale label — upgraded copy */}
          <div style={S.sectionLabel}>Why this is the right choice</div>

          <div
            className="result-reason"
            style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 16 }}
          >
            {result.reason}
          </div>

          {/* Confidence signal — subtle, trust-building */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {/* Small amber dot */}
            <div style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'var(--amber)',
              opacity: 0.85,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}>
              Confidence: High
            </span>
          </div>
        </div>

        {/* ── Backups — clearly secondary ────────────────────────────────── */}
        {result.backups?.length > 0 && (
          <div>
            <div style={{ ...S.sectionLabel, marginBottom: 10 }}>
              If not, consider
            </div>
            <div className="stack s6">
              {result.backups.map((b, i) => (
                <div key={i} className="backup-row">
                  <span className="backup-n">{i + 1}</span>
                  <span style={{
                    fontSize: 14,
                    color: 'var(--cream2)',
                    lineHeight: 1.45,
                  }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex1" style={{ minHeight: 8 }} />

        {/* ── Conversion CTA ─────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--r)',
          padding: '22px 20px',
        }}>
          <div style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 19,
            lineHeight: 1.25,
            marginBottom: 7,
          }}>
            Want unlimited decisions?
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.55,
            marginBottom: 18,
          }}>
            Save history, refine preferences, and get sharper answers every time.
          </div>
          <div className="stack s8">
            <button className="btn btn-primary" onClick={onSignUp}>
              Create free account →
            </button>
            <button
              className="btn btn-ghost"
              onClick={reset}
              style={{ fontSize: 13 }}
            >
              Try another first
            </button>
          </div>
        </div>

      </div>
    </div>
  )

  // ── Input ────────────────────────────────────────────────────────────────────

  return (
    <div className="root">
      <div className="topbar">
        <span className="logo">DFK</span>
        <button className="back-btn" onClick={onBack}>Sign in</button>
      </div>
      <div className="page" style={{ paddingTop: 28 }}>

        {/* Headline */}
        <div className="up" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, marginBottom: 10 }}>
            What should you<br />do right now?
          </h1>
          <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.5 }}>
            Type anything. Get one clear answer.
          </div>
        </div>

        {/* Input block */}
        <div className="up2" style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              className="input"
              rows={4}
              placeholder={EXAMPLES[exampleIdx]}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run() }}
              autoFocus
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                padding: '16px 16px 48px',
                borderColor: prompt.trim() ? 'var(--border2)' : 'var(--border)',
                transition: 'border-color 0.2s',
              }}
            />
            {/* Inline submit button — overlaid inside the textarea */}
            <button
              onClick={() => run()}
              disabled={!prompt.trim()}
              style={{
                position: 'absolute',
                bottom: 12, right: 12,
                background: prompt.trim() ? 'var(--amber)' : 'var(--surface2)',
                color: prompt.trim() ? '#150E00' : 'var(--muted)',
                border: 'none',
                borderRadius: 7,
                padding: '8px 16px',
                fontFamily: 'Geist, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              Decide →
            </button>
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--muted)',
            marginTop: 6,
            textAlign: 'right',
          }}>
            ⌘↵ to submit
          </div>
        </div>

        {err && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{err}</div>
        )}

        {/* Example chips — tap to fill */}
        <div className="up3">
          <div className="mono" style={{ marginBottom: 10 }}>Try an example</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(ex)
                  textareaRef.current?.focus()
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 100,
                  border: '1px solid',
                  borderColor: prompt === ex ? 'var(--amber)' : 'var(--border2)',
                  background: prompt === ex ? 'var(--amber-dim)' : 'var(--surface)',
                  color: prompt === ex ? 'var(--amber)' : 'var(--cream2)',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex1" />

        {/* Soft sign-in nudge */}
        <div className="up4" style={{ textAlign: 'center', paddingTop: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            Already have an account?{' '}
          </span>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Geist, sans-serif', fontSize: 13,
              color: 'var(--cream2)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--border2)',
              textUnderlineOffset: 3,
            }}
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  )
}
