'use client'

import { useState } from 'react'
import { User } from '@/types'
import { save } from '@/lib/storage'

interface Props {
  onAuth: (user: User) => void
  onDemo: () => void
}

export default function AuthScreen({ onAuth, onDemo }: Props) {
  const [mode, setMode]   = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')

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
    <div className="root">
      <div className="page-center">
        <div className="stack s24" style={{ width: '100%', maxWidth: 340 }}>

          <div className="up">
            <h1 style={{ marginBottom: 10 }}>Stop deciding.<br />Let us.</h1>
            <div style={{ fontSize: 15, color: 'var(--muted)' }}>One clear answer, every time.</div>
          </div>

          <div className="card up2 stack s12">
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

            <input className="input" type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />

            {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>{err}</div>}

            <button className="btn btn-primary" onClick={submit}>
              {mode === 'in' ? 'Sign in →' : 'Get started →'}
            </button>
          </div>

          <div className="mono up3" style={{ textAlign: 'center' }}>Your decisions stay private</div>

          {/* Demo entry point — visually secondary, never competes with sign-in */}
          <div className="up4" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              Not ready to sign up?
            </div>
            <button
              onClick={onDemo}
              style={{
                background: 'none', border: '1px solid var(--border2)',
                borderRadius: 'var(--r-sm)', padding: '11px 20px',
                fontFamily: 'Geist, sans-serif', fontSize: 13,
                color: 'var(--cream2)', cursor: 'pointer', width: '100%',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--muted)'
                ;(e.target as HTMLButtonElement).style.color = 'var(--cream)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--border2)'
                ;(e.target as HTMLButtonElement).style.color = 'var(--cream2)'
              }}
            >
              Try it instantly →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
