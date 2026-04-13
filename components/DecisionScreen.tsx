'use client'

import { useState, useEffect, useCallback } from 'react'
import { Action, DecisionResult, HistoryEntry, Profile } from '@/types'
import { PLACEHOLDERS } from '@/lib/constants'
import { getDecision, getClarifiers } from '@/lib/api'
import { TopBar, Dots } from './shared'

interface Props {
  action: Action
  initPrompt?: string
  profile: Profile | null
  onBack: () => void
  onSave: (entry: Omit<HistoryEntry, 'id'>) => void
}

export default function DecisionScreen({ action, initPrompt, profile, onBack, onSave }: Props) {
  const [phase, setPhase]     = useState<'input' | 'loading' | 'clarify' | 'result'>(
    initPrompt ? 'loading' : 'input'
  )
  const [prompt, setPrompt]   = useState(initPrompt || '')
  const [questions, setQs]    = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult]   = useState<DecisionResult | null>(null)
  const [fb, setFb]           = useState<boolean | null>(null)
  const [err, setErr]         = useState('')

  const run = useCallback(async (p: string, ans: Record<string, string> = {}) => {
    setPhase('loading')
    setErr('')
    try {
      const r = await getDecision({ category: action.label, prompt: p, profile, clarifyingAnswers: ans })
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
    setPhase('loading')
    try {
      const qs = await getClarifiers(action.label, prompt)
      if (qs.length > 0) { setQs(qs); setPhase('clarify') }
      else await run(prompt)
    } catch {
      await run(prompt)
    }
  }

  useEffect(() => {
    if (initPrompt) run(initPrompt)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page-center stack s16">
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Thinking for you…</div>
        <Dots />
      </div>
    </div>
  )

  // ── Result ───────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) return (
    <div className="root">
      <TopBar
        onBack={onBack}
        right={<span className="mono">{action.emoji} {action.label}</span>}
      />
      <div className="page stack s16">
        <div className="result-hero up">
          <div className="result-label">Best choice</div>
          <div className="result-choice">{result.bestChoice}</div>
          <div className="result-reason">{result.reason}</div>
        </div>

        {result.backups?.length > 0 && (
          <div className="stack s6 up2">
            <div className="mono" style={{ marginBottom: 4 }}>Alternatives</div>
            {result.backups.map((b, i) => (
              <div key={i} className="backup-row">
                <span className="backup-n">{i + 1}</span>
                <span style={{ fontSize: 14, color: 'var(--cream2)' }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        {result.followUp && (
          <div className="up3" style={{
            padding: '13px 16px', background: 'var(--amber-dim)',
            border: '1px solid var(--amber)', borderRadius: 'var(--r-sm)',
            fontSize: 13, color: 'var(--amber)', lineHeight: 1.5,
          }}>
            {result.followUp}
          </div>
        )}

        <div className="flex1" />

        <div className="up4 stack s10">
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
          <button className="btn btn-ghost" onClick={onBack}>← Try something else</button>
        </div>
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
      <TopBar onBack={onBack} right={<span style={{ fontSize: 22 }}>{action.emoji}</span>} />
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
