'use client'

import { HistoryEntry } from '@/types'
import { TopBar } from './shared'

interface Props {
  history: HistoryEntry[]
  onBack: () => void
}

export default function HistoryScreen({ history, onBack }: Props) {
  if (!history.length) return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page-center stack s12">
        <div style={{ fontSize: 36 }}>📋</div>
        <h3>No decisions yet</h3>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Your history will appear here.</div>
      </div>
    </div>
  )

  return (
    <div className="root">
      <TopBar onBack={onBack} />
      <div className="page">
        <div className="row between" style={{ marginTop: 8, marginBottom: 20 }}>
          <h2>History</h2>
          <div className="mono">{history.length} decision{history.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stack s8">
          {history.map(d => (
            <div key={d.id} className="hist-card up">
              <div className="row between" style={{ marginBottom: 10 }}>
                <span className="hist-badge">{d.label || d.category}</span>
                <span className="mono">{new Date(d.id).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: 17, fontFamily: 'Instrument Serif, serif', marginBottom: 5 }}>
                {d.result?.bestChoice}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {d.prompt?.slice(0, 70)}{(d.prompt?.length ?? 0) > 70 ? '…' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
