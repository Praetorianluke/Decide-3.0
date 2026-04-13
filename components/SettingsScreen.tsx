'use client'

import { useState } from 'react'
import { Profile, User } from '@/types'
import { FOOD_OPTS, BUDGET_OPTS, TONE_OPTS } from '@/lib/constants'
import { TopBar } from './shared'

interface Props {
  profile: Profile
  user: User
  onBack: () => void
  onSave: (profile: Profile) => void
  onLogout: () => void
}

export default function SettingsScreen({ profile, user, onBack, onSave, onLogout }: Props) {
  const [f, setF] = useState<Profile>({ ...profile })
  const [ok, setOk] = useState(false)

  const toggle = (field: 'foodPrefs', v: string) =>
    setF(p => ({
      ...p,
      [field]: (p[field] || []).includes(v)
        ? (p[field] || []).filter((x: string) => x !== v)
        : [...(p[field] || []), v],
    }))

  const handleSave = () => {
    onSave({ ...profile, ...f })
    setOk(true)
    setTimeout(() => setOk(false), 1800)
  }

  return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page stack s20">
        <h2 className="up" style={{ marginTop: 8 }}>Settings</h2>

        <div className="card up2 stack s12">
          <div className="mono">Name</div>
          <input
            className="input"
            value={f.name || ''}
            onChange={e => setF(p => ({ ...p, name: e.target.value }))}
          />
          <div className="mono" style={{ marginTop: 4 }}>Email</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>{user?.email}</div>
        </div>

        <div className="card up2 stack s10">
          <div className="mono">Food preferences</div>
          <div className="wrap">
            {FOOD_OPTS.map(o => (
              <span
                key={o}
                className={`chip ${(f.foodPrefs || []).includes(o) ? 'on' : ''}`}
                onClick={() => toggle('foodPrefs', o)}
              >
                {o}
              </span>
            ))}
          </div>
        </div>

        <div className="card up3 stack s8">
          <div className="mono" style={{ marginBottom: 4 }}>Response style</div>
          {TONE_OPTS.map(t => (
            <button
              key={t.v}
              className={`ob-option ${f.tone === t.v ? 'on' : ''}`}
              onClick={() => setF(p => ({ ...p, tone: t.v as 'direct' | 'brief' }))}
            >
              <div>
                <div style={{ fontSize: 14, color: f.tone === t.v ? 'var(--amber)' : 'var(--cream2)' }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.sub}</div>
              </div>
              {f.tone === t.v && <span className="ob-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="card up3 stack s10">
          <div className="mono">Budget</div>
          <div className="wrap">
            {BUDGET_OPTS.map(b => (
              <span
                key={b}
                className={`chip ${f.budget === b ? 'on' : ''}`}
                onClick={() => setF(p => ({ ...p, budget: b }))}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="flex1" />

        <div className="stack s8 up4">
          <button className="btn btn-primary" onClick={handleSave}>
            {ok ? '✓ Saved' : 'Save changes'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onLogout}
            style={{ color: 'var(--red)', borderColor: 'var(--red-dim)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
