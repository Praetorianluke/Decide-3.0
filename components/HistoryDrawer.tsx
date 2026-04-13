'use client'

import { useState, useEffect } from 'react'
import { HistoryEntry, DecisionResult } from '@/types'
import { loadHistory, relativeTime } from '@/lib/history'

// ─── Shared result styles (mirrors DecisionScreen/DemoScreen) ─────────────────

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

// ─── ResultView — reusable result card, no logic ──────────────────────────────

function ResultView({ result, prompt }: { result: DecisionResult; prompt: string }) {
  return (
    <div className="stack s16">
      {/* Prompt echo */}
      <div style={{
        fontSize: 13, color: 'var(--muted)', lineHeight: 1.5,
        fontStyle: 'italic',
        padding: '12px 14px',
        background: 'var(--surface2)',
        borderRadius: 'var(--r-sm)',
        borderLeft: '2px solid var(--border2)',
      }}>
        {prompt}
      </div>

      {/* Hero result card */}
      <div className="result-hero" style={{ padding: '24px 20px 22px' }}>
        <div style={S.sectionLabel}>Best move</div>
        <div className="result-choice" style={{ fontSize: 26, lineHeight: 1.2, marginBottom: 0 }}>
          {result.bestChoice}
        </div>
        <div style={S.divider} />
        <div style={S.sectionLabel}>Why this is the right choice</div>
        <div className="result-reason" style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 14 }}>
          {result.reason}
        </div>
        {/* Confidence signal */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--amber)', opacity: 0.85, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 9,
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
                <span style={{ fontSize: 13, color: 'var(--cream2)', lineHeight: 1.45 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HistoryItem — single row in the list ────────────────────────────────────

function HistoryItem({
  entry,
  onClick,
}: {
  entry: HistoryEntry
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border2)'
        el.style.background = 'var(--surface2)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border)'
        el.style.background = 'var(--surface)'
      }}
    >
      {/* Timestamp + label */}
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 9,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--muted)',
        }}>
          {entry.label || entry.category}
        </span>
        <span style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 9,
          letterSpacing: '0.06em', color: 'var(--muted)',
        }}>
          {relativeTime(entry.id)}
        </span>
      </div>

      {/* Best choice — the headline */}
      <div style={{
        fontFamily: 'Instrument Serif, serif',
        fontSize: 17, lineHeight: 1.25,
        color: 'var(--cream)', marginBottom: 6,
      }}>
        {entry.result.bestChoice}
      </div>

      {/* Prompt snippet */}
      <div style={{
        fontSize: 12, color: 'var(--muted)', lineHeight: 1.4,
      }}>
        {entry.prompt.length > 80 ? `${entry.prompt.slice(0, 80)}…` : entry.prompt}
      </div>
    </button>
  )
}

// ─── HistoryDrawer ────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export default function HistoryDrawer({ onClose }: Props) {
  const [entries, setEntries]     = useState<HistoryEntry[]>([])
  const [selected, setSelected]   = useState<HistoryEntry | null>(null)
  const [visible, setVisible]     = useState(false)

  useEffect(() => {
    setEntries(loadHistory())
    // Animate in
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  const back = () => setSelected(null)

  return (
    /* Backdrop */
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(0,0,0,0.55)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Drawer panel — slides up from bottom */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0, left: '50%',
          transform: visible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(32px)',
          transition: 'transform 0.22s ease-out',
          width: '100%', maxWidth: 420,
          background: 'var(--bg)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          maxHeight: '88dvh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--border2)',
          margin: '12px auto 0',
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px',
          flexShrink: 0,
          borderBottom: '1px solid var(--border)',
        }}>
          {selected ? (
            <button
              onClick={back}
              className="back-btn"
              style={{ fontSize: 13 }}
            >
              ← Back
            </button>
          ) : (
            <div style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 18, color: 'var(--cream)',
            }}>
              Decision history
            </div>
          )}
          <button
            onClick={close}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Geist Mono, monospace', fontSize: 11,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--muted)', padding: '4px',
            }}
          >
            Close
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 20px 32px',
        }}>

          {/* ── Detail view ─────────────────────────────────────────────── */}
          {selected && (
            <div style={{ animation: 'up 0.2s ease-out both' }}>
              <div style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 9,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--muted)', marginBottom: 16,
              }}>
                {relativeTime(selected.id)} · {selected.label || selected.category}
              </div>
              <ResultView result={selected.result} prompt={selected.prompt} />
            </div>
          )}

          {/* ── List view ───────────────────────────────────────────────── */}
          {!selected && (
            <>
              {entries.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: 'var(--muted)', fontSize: 14,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                  No decisions yet.<br />Make your first one.
                </div>
              ) : (
                <div className="stack s8">
                  <div style={{
                    fontFamily: 'Geist Mono, monospace', fontSize: 9,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--muted)', marginBottom: 4,
                  }}>
                    {entries.length} saved · last {entries.length === 20 ? 20 : entries.length}
                  </div>
                  {entries.map(e => (
                    <HistoryItem key={e.id} entry={e} onClick={() => setSelected(e)} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
