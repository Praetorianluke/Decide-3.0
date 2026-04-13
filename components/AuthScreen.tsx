'use client'

import { useState, useRef } from 'react'
import { User } from '@/types'
import { save } from '@/lib/storage'

interface Props {
  onAuth: (user: User) => void
  onDemo: (prompt?: string) => void
}

const EXAMPLES = [
  'What should I eat tonight?',
  'Plan my next 2 hours',
  'Pick between gym or studying',
  'What task should I do first?',
]

export default function AuthScreen({ onAuth, onDemo }: Props) {
  const [mode, setMode]     = useState<'in' | 'up'>('in')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [err, setErr]       = useState('')
  const [demoPrompt, setDemoPrompt] = useState('')
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    if (!email.includes('@') || pass.length < 6) {
      setErr('Valid email + password (min 6 chars).')
      return
    }
    const user: User = { email, name: email.split('@')[0] }
    save('dfk_user', user)
    onAuth(user)
  }

  return (
    <div className="root" style={{ maxWidth: 420 }}>
      <div className="page" style={{ paddingTop: 40, gap: 0 }}>

        {/* Logo */}
        <div style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: 17,
          color: 'var(--cream2)',
          marginBottom: 32,
        }}>
          DFK
        </div>

        {/* ── Hero: input-first demo entry ──────────────────────────────── */}
        <div className="up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 10, lineHeight: 1.15 }}>
            Stop overthinking.<br />Get one answer.
          </h1>
          <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 24 }}>
            Type your situation. We decide.
          </div>

          {/* The demo input IS the hero CTA */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <textarea
              ref={textareaRef}
              className="input"
              rows={3}
              placeholder="What do you need to decide right now?"
              value={demoPrompt}
              onChange={e => setDemoPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) onDemo(demoPrompt || undefined)
              }}
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                padding: '14px 14px 46px',
              }}
            />
            <button
              onClick={() => onDemo(demoPrompt || undefined)}
              style={{
                position: 'absolute',
                bottom: 10, right: 10,
                background: 'var(--amber)',
                color: '#150E00',
                border: 'none', borderRadius: 7,
                padding: '8px 16px',
                fontFamily: 'Geist, sans-serif',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              Decide for me →
            </button>
          </div>

          {/* Tappable examples */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setDemoPrompt(ex)
                  textareaRef.current?.focus()
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 100,
                  border: '1px solid var(--border2)',
                  background: demoPrompt === ex ? 'var(--amber-dim)' : 'transparent',
                  color: demoPrompt === ex ? 'var(--amber)' : 'var(--muted)',
                  borderColor: demoPrompt === ex ? 'var(--amber)' : 'var(--border2)',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: 12,
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

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 24,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em' }}>
            OR SIGN IN
          </div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* ── Auth form ─────────────────────────────────────────────────── */}
        <div className="card up2 stack s12" style={{ marginBottom: 12 }}>
          <div className="row" style={{ background: 'var(--surface2)', borderRadius: 7, padding: 3, gap: 3 }}>
            {(['in', 'up'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '8px', border: 'none', borderRadius: 5,
                  fontFamily: 'Geist, sans-serif', fontSize: 13, cursor: 'pointer',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--cream)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'in' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />

          {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

          <button className="btn btn-primary" onClick={submit}>
            {mode === 'in' ? 'Sign in →' : 'Get started →'}
          </button>
        </div>

        <div className="mono" style={{ textAlign: 'center' }}>Your decisions stay private</div>

      </div>
    </div>
  )
}
