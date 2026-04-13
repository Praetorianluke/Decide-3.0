'use client'

import { useState } from 'react'
import { Profile, User } from '@/types'
import { OB_STEPS } from '@/lib/constants'
import { save } from '@/lib/storage'
import { TopBar } from './shared'

interface Props {
  user: User
  onDone: (profile: Profile) => void
}

type FormState = {
  categories: string[]
  foodPrefs: string[]
  tone: 'direct' | 'brief'
  budget: string
}

export default function OnboardingScreen({ user, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>({
    categories: [],
    foodPrefs: [],
    tone: 'brief',
    budget: 'Moderate',
  })

  const s = OB_STEPS[step]
  const val = form[s.field as keyof FormState]
  const isOn = (v: string) =>
    s.multi ? (val as string[]).includes(v) : val === v

  const toggle = (v: string) => {
    if (s.multi) {
      setForm(f => ({
        ...f,
        [s.field]: isOn(v)
          ? (f[s.field as keyof FormState] as string[]).filter((x: string) => x !== v)
          : [...(f[s.field as keyof FormState] as string[]), v],
      }))
    } else {
      setForm(f => ({ ...f, [s.field]: v }))
    }
  }

  const canNext = s.multi ? (val as string[]).length > 0 : !!val

  const proceed = () => {
    if (step < OB_STEPS.length - 1) {
      setStep(x => x + 1)
    } else {
      const profile: Profile = { ...form, name: user.name, onboarded: true }
      save('dfk_profile', profile)
      onDone(profile)
    }
  }

  return (
    <div className="root">
      <TopBar />
      <div className="page">
        <div style={{ marginTop: 8 }} />
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((step + 1) / OB_STEPS.length) * 100}%` }} />
        </div>

        <div key={step} className="stack s20 up flex1">
          <div>
            <h2>{s.title}</h2>
            {'sub' in s && s.sub && (
              <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>{s.sub}</div>
            )}
          </div>

          <div className="stack s8">
            {s.options.map(o => (
              <button key={o.v} className={`ob-option ${isOn(o.v) ? 'on' : ''}`} onClick={() => toggle(o.v)}>
                {'icon' in o && o.icon && (
                  <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{o.icon}</span>
                )}
                <div>
                  <div style={{ fontSize: 14, color: isOn(o.v) ? 'var(--amber)' : 'var(--cream2)' }}>
                    {o.label}
                  </div>
                  {'sub' in o && o.sub && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{o.sub}</div>
                  )}
                </div>
                {isOn(o.v) && <span className="ob-check">✓</span>}
              </button>
            ))}
          </div>

          <div className="flex1" />

          <div className="stack s8">
            <button className="btn btn-primary" onClick={proceed} disabled={!canNext}>
              {step < OB_STEPS.length - 1 ? 'Continue →' : 'Start →'}
            </button>
            <button
              onClick={proceed}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 13, padding: '8px',
                fontFamily: 'Geist, sans-serif',
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
