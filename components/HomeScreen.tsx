'use client'

import { useState } from 'react'
import { Action, HistoryEntry, Profile } from '@/types'
import { ACTIONS, PLACEHOLDERS } from '@/lib/constants'
import { TopBar } from './shared'

interface Props {
  profile: Profile
  history: HistoryEntry[]
  onPick: (action: Action, prompt?: string) => void
  onHistory: () => void
  onSettings: () => void
}

export default function HomeScreen({ profile, history, onPick, onHistory, onSettings }: Props) {
  const [custom, setCustom] = useState('')

  const name = profile.name?.split(' ')[0] || ''
  const h = new Date().getHours()
  const greet = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'

  return (
    <div className="root">
      <TopBar
        right={
          <div className="row" style={{ gap: 16 }}>
            <button className="back-btn" onClick={onHistory}>History</button>
            <button className="back-btn" onClick={onSettings} style={{ fontSize: 16 }}>⚙</button>
          </div>
        }
      />
      <div className="page">
        <div className="up" style={{ marginTop: 16, marginBottom: 24 }}>
          <h1>
            {greet}{name ? `, ${name}` : ''}
            <span style={{ color: 'var(--muted)' }}>.</span>
          </h1>
          <div style={{ color: 'var(--muted)', fontSize: 15, marginTop: 6 }}>
            What do you need to decide?
          </div>
        </div>

        <div className="stack s8 up2" style={{ marginBottom: 24 }}>
          {ACTIONS.map(a => (
            <button key={a.id} className="action-row" onClick={() => onPick(a)}>
              <span style={{ fontSize: 19, width: 28, textAlign: 'center', flexShrink: 0 }}>{a.emoji}</span>
              <span style={{ fontSize: 14, color: 'var(--cream2)' }}>{a.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--border2)', fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>

        <div className="up3">
          <div className="mono" style={{ marginBottom: 10 }}>Or describe it</div>
          <textarea
            className="input"
            rows={3}
            placeholder={PLACEHOLDERS.custom}
            value={custom}
            onChange={e => setCustom(e.target.value)}
          />
          <button
            className="btn btn-amber"
            disabled={!custom.trim()}
            onClick={() => {
              onPick({ id: 'custom', emoji: '💬', label: 'Custom' }, custom)
              setCustom('')
            }}
            style={{ marginTop: 8 }}
          >
            Decide →
          </button>
        </div>
      </div>
    </div>
  )
}
