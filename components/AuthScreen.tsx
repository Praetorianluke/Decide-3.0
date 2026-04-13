'use client'

import { useState } from 'react'
import { User } from '@/types'
import { save } from '@/lib/storage'

interface Props {
  onAuth: (user: User) => void
}

export default function AuthScreen({ onAuth }: Props) {
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
        </div>
      </div>
    </div>
  )
}
