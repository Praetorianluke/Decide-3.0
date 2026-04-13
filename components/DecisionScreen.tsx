'use client'

import { useState, useEffect, useCallback } from 'react'
import { Action, DecisionResult, HistoryEntry, Profile } from '@/types'
import { PLACEHOLDERS } from '@/lib/constants'
import { getDecision, getClarifiers } from '@/lib/api'
import { isLimitReached, incrementUsage, getRemainingCount, DAILY_LIMIT } from '@/lib/usage'
import { TopBar, LoadingSpinner, UpgradeWall } from './shared'

// ─── Shared result styles ─────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  action: Action
  initPrompt?: string
  profile: Profile | null
  onBack: () => void
  onSave: (entry: Omit<HistoryEntry, 'id'>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DecisionScreen({ action, initPrompt, profile, onBack, onSave }: Props) {
  const [phase, setPhase]     = useState<'input' | 'loading' | 'clarify' | 'result' | 'limit'>(
    'input'
  )
  const [prompt, setPrompt]   = useState(initPrompt || '')
  const [questions, setQs]    = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult]   = useState<DecisionResult | null>(null)
  const [fb, setFb]           = useState<boolean | null>(null)
  const [err, setErr]         = useState('')
  const [remaining, setRemaining] = useState(DAILY_LIMIT)
  const [resultVisible, setResultVisible] = useState(false)

  // Hydrate remaining count and check limit on mount
  useEffect(() => {
    if (isLimitReached()) {
      setPhase('limit')
    } else {
      setRemaining(getRemainingCount())
      // Auto-run if launched from a quick-action with pre-filled prompt
      if (initPrompt) run(initPrompt)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger result entrance animation
  useEffect(() => {
    if (phase !== 'result') return
    const t = requestAnimationFrame(() => setResultVisible(true))
    return () => cancelAnimationFrame(t)
  }, [phase])

  const run = useCallback(async (p: string, ans: Record<string, string> = {}) => {
    if (isLimitReached()) { setPhase('limit'); return }

    setPhase('loading')
    setResultVisible(false)
    setErr('')

    try {
      const r = await getDecision({ category: action.label, prompt: p, profile, clarifyingAnswers: ans })
      // Increment only on successful result
      incrementUsage()
      setRemaining(getRemainingCount())
      setResult(r)
      setPhase('result')
      onSave({ result: r, prompt: p, category: action.id, label: action.label })
    } catch {
      setErr('Something went wrong. Try again.')
      setPhase('input')
    }
  }, [action, profile, onSave])

  const handleInput = async () => {
    if (!prompt.trim()) return
    if (isLimitReached()) { setPhase('limit'); return }
    setPhase('loading')
    try {
      const qs = await getClarifiers(action.label, prompt)
      if (qs.length > 0) { setQs(qs); setPhase('clarify') }
      else await run(prompt)
    } catch {
      await run(prompt)
    }
  }

  const tryAnother = () => {
    if (isLimitReached()) { setPhase('limit'); return }
    setResultVisible(false)
    setTimeout(() => {
      setPhase('input')
      setResult(null)
      setFb(null)
      setErr('')
    }, 80)
  }

  // ── Limit wall ───────────────────────────────────────────────────────────────

  if (phase === 'limit') return (
    <UpgradeWall
      onBack={onBack}
      isSignedIn={true}   // hides the "Create free account" CTA — they're already signed in
    />
  )

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (phase === 'loading') return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page-center">
        <LoadingSpinner prompt={prompt} />
      </div>
    </div>
  )

  // ── Result ───────────────────────────────────────────────────────────────────

  if (phase === 'result' && result) return (
    <div className="root">
      <TopBar
        onBack={onBack}
        right={
          remaining > 0 ? (
            <button className="back-btn" onClick={tryAnother}>Try another</button>
          ) : (
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--amber)',
            }}>
              Last free decision
            </span>
          )
        }
      />

      <div
        className="page stack s20"
        style={{
          paddingTop: 24,
          opacity: resultVisible ? 1 : 0,
          transform: resultVisible ? 'scale(1)' : 'scale(0.98)',
          transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
        }}
      >
        {/* Hero result card */}
        <div className="result-hero" style={{ padding: '28px 24px 26px' }}>
          <div style={S.sectionLabel}>Your best move right now</div>
          <div className="result-choice" style={{ fontSize: 30, lineHeight: 1.15, marginBottom: 0 }}>
            {result.bestChoice}
          </div>
          <div style={S.divider} />
          <div style={S.sectionLabel}>Why this is the right choice</div>
          <div className="result-reason" style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 16 }}>
            {result.reason}
          </div>
          {/* Confidence signal */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--amber)', opacity: 0.85, flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)',
            }}>
              Confidence: High
            </span>
          </div>
        </div>

        {/* Backups */}
        {result.backups?.length > 0 && (
          <div>
            <div style={{ ...S.sectionLabel, marginBottom: 10 }}>If not, consider</div>
            <div className="stack s6">
              {result.backups.map((b, i) => (
                <div key={i} className="backup-row">
                  <span className="backup-n">{i + 1}</span>
                  <span style={{ fontSize: 14, color: 'var(--cream2)', lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up question (signed-in flow has this, demo doesn't) */}
        {result.followUp && (
          <div style={{
            padding: '13px 16px', background: 'var(--amber-dim)',
            border: '1px solid var(--amber)', borderRadius: 'var(--r-sm)',
            fontSize: 13, color: 'var(--amber)', lineHeight: 1.5,
          }}>
            {result.followUp}
          </div>
        )}

        <div className="flex1" style={{ minHeight: 8 }} />

        {/* Bottom action — adapts based on remaining count */}
        {remaining > 0 ? (
          <div className="stack s10 up4">
            <div className="mono" style={{ textAlign: 'center' }}>Helpful?</div>
            <div className="fb-row">
              <button
                className={`fb-btn fb-yes ${fb === true ? 'active' : ''}`}
                onClick={() => setFb(true)}
              >
                ✓ Yes
              </button>
              <button
                className={`fb-btn fb-no ${fb === false ? 'active' : ''}`}
                onClick={() => setFb(false)}
              >
                ↻ Not quite
              </button>
            </div>
            <button className="btn btn-ghost" onClick={tryAnother}>
              {remaining === 1 ? 'Use my last free decision' : `← Try something else (${remaining} left)`}
            </button>
          </div>
        ) : (
          /* Used last decision — soft upgrade nudge */
          <div style={{
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber)',
            borderRadius: 'var(--r)',
            padding: '22px 20px',
          }}>
            <div style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 18, lineHeight: 1.3, marginBottom: 7, color: 'var(--cream)',
            }}>
              That was your last free decision today
            </div>
            <div style={{ fontSize: 13, color: 'var(--cream2)', lineHeight: 1.55, marginBottom: 18 }}>
              Upgrade for unlimited access and smarter personalization.
            </div>
            <button
              className="btn btn-amber"
              onClick={() => setPhase('limit')}
            >
              See upgrade options →
            </button>
          </div>
        )}
      </div>
    </div>
  )

  // ── Clarify ──────────────────────────────────────────────────────────────────

  if (phase === 'clarify' && questions.length > 0) return (
    <div className="root">
      <TopBar onBack={() => setPhase('input')} />
      <div className="page stack s20">
        <div className="up" style={{ marginTop: 8 }}>
          <h2>One quick thing</h2>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            {questions.length === 1 ? 'Just one question' : 'Two quick questions'} to sharpen the answer.
          </div>
        </div>

        <div className="stack s12 up2">
          {questions.map((q, i) => (
            <div key={i}>
              <div className="mono" style={{ marginBottom: 8 }}>{q}</div>
              <input
                className="input"
                placeholder="Your answer…"
                value={answers[q] || ''}
                onChange={e => setAnswers(a => ({ ...a, [q]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}
        <div className="flex1" />

        <div className="stack s8 up3">
          <button
            className="btn btn-primary"
            onClick={() => run(prompt, answers)}
            disabled={questions.some(q => !answers[q]?.trim())}
          >
            Get my answer →
          </button>
          <button className="btn btn-ghost" onClick={() => run(prompt, {})}>
            Skip, just decide
          </button>
        </div>
      </div>
    </div>
  )

  // ── Input ────────────────────────────────────────────────────────────────────

  return (
    <div className="root">
      <TopBar
        onBack={onBack}
        right={
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 10, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: remaining <= 1 ? 'var(--amber)' : 'var(--muted)',
            }}>
              {remaining} {remaining === 1 ? 'decision' : 'decisions'} left
            </span>
            <span style={{ fontSize: 22 }}>{action.emoji}</span>
          </div>
        }
      />
      <div className="page">
        <div className="up" style={{ marginTop: 8, marginBottom: 24 }}>
          <h2>{action.label}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            Give me the context. I&apos;ll give you one answer.
          </div>
        </div>

        <div className="up2" style={{ marginBottom: 8 }}>
          <textarea
            className="input"
            rows={5}
            placeholder={PLACEHOLDERS[action.id] || PLACEHOLDERS.custom}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleInput() }}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, textAlign: 'right' }}>
            ⌘↵ to submit
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{err}</div>}

        <div className="flex1" />

        <div className="stack s8 up3">
          <button className="btn btn-primary" onClick={handleInput} disabled={!prompt.trim()}>
            Decide for me →
          </button>
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
