'use client'

import { useState, useEffect } from 'react'
import { DAILY_LIMIT } from '@/lib/usage'

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  onBack?: () => void
  right?: React.ReactNode
}

export function TopBar({ onBack, right }: TopBarProps) {
  return (
    <div className="topbar">
      {onBack ? (
        <button className="back-btn" onClick={onBack}>← Back</button>
      ) : (
        <span className="logo">DFK</span>
      )}
      {right ?? null}
    </div>
  )
}

// ─── Dots (kept so nothing breaks) ───────────────────────────────────────────

export function Dots() {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '8px 0' }}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  )
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
// Shared between DemoScreen and DecisionScreen — identical loading quality.

const LOADING_LINES = [
  'Thinking for you…',
  'Weighing your options…',
  'Making the best call…',
  'Almost there…',
]

interface LoadingSpinnerProps {
  prompt?: string
}

export function LoadingSpinner({ prompt }: LoadingSpinnerProps) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % LOADING_LINES.length), 1600)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 34, height: 34,
        margin: '0 auto 32px',
        borderRadius: '50%',
        border: '1.5px solid var(--border)',
        borderTopColor: 'var(--amber)',
        animation: 'spin 0.75s linear infinite',
      }} />
      <div
        key={idx}
        style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: 21,
          color: 'var(--cream)',
          marginBottom: 10,
          letterSpacing: '-0.01em',
          animation: 'fadeSwap 0.35s ease-out both',
        }}
      >
        {LOADING_LINES[idx]}
      </div>
      {prompt && (
        <div style={{
          fontSize: 13,
          color: 'var(--muted)',
          maxWidth: 260,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          {prompt.length > 55 ? `${prompt.slice(0, 55)}…` : prompt}
        </div>
      )}
    </div>
  )
}

// ─── UpgradeWall ──────────────────────────────────────────────────────────────
// Shared paywall — works for both demo and signed-in free users.

const PRO_BENEFITS = [
  { icon: '∞', label: 'Unlimited decisions' },
  { icon: '◈', label: 'Saved decision history' },
  { icon: '◎', label: 'Personalized recommendations' },
  { icon: '⚡', label: 'Faster clarity, anytime' },
]

interface UpgradeWallProps {
  onSignUp?: () => void
  onBack: () => void
  isSignedIn?: boolean
}

export function UpgradeWall({ onSignUp, onBack, isSignedIn = false }: UpgradeWallProps) {
  const [modal, setModal] = useState(false)

  return (
    <>
      {modal && (
        <div
          onClick={() => setModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeSwap 0.2s ease-out both',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--r)',
              padding: '32px 28px',
              maxWidth: 340, width: '100%',
              textAlign: 'center',
              animation: 'up 0.25s ease-out both',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔜</div>
            <div style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 22, marginBottom: 10,
            }}>
              Payments coming soon
            </div>
            <div style={{
              fontSize: 14, color: 'var(--muted)',
              lineHeight: 1.6, marginBottom: 24,
            }}>
              We&apos;re putting the finishing touches on Pro.
              You&apos;ll be the first to know when it&apos;s live.
            </div>
            <button className="btn btn-primary" onClick={() => setModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="root">
        <div className="topbar">
          <span className="logo">DFK</span>
          {!isSignedIn && (
            <button className="back-btn" onClick={onBack}>Sign in</button>
          )}
        </div>

        <div
          className="page stack s20"
          style={{ paddingTop: 28, animation: 'up 0.3s ease-out both' }}
        >
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--amber-dim)',
              border: '1px solid var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 20,
            }}>
              ◑
            </div>
            <h2 style={{ marginBottom: 10, fontSize: 24 }}>
              You&apos;ve used your free<br />decisions for today
            </h2>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
              Free users get {DAILY_LIMIT} decisions per day.<br />
              Upgrade for unlimited access.
            </div>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            padding: '20px',
          }}>
            <div style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 9, letterSpacing: '0.13em',
              textTransform: 'uppercase' as const,
              color: 'var(--muted)', marginBottom: 14,
            }}>
              What you get with Pro
            </div>
            <div className="stack s12">
              {PRO_BENEFITS.map(b => (
                <div key={b.label} className="row" style={{ gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'var(--amber-dim)',
                    border: '1px solid var(--amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: 'var(--amber)', flexShrink: 0,
                  }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--cream2)' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex1" style={{ minHeight: 8 }} />

          <div className="stack s10">
            <button
              className="btn btn-amber"
              onClick={() => setModal(true)}
              style={{ fontSize: 15, padding: '16px' }}
            >
              Upgrade to Pro →
            </button>
            {!isSignedIn && onSignUp && (
              <button className="btn btn-ghost" onClick={onSignUp} style={{ fontSize: 13 }}>
                Create free account to save progress
              </button>
            )}
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Geist, sans-serif', fontSize: 13,
                color: 'var(--muted)', padding: '8px', textAlign: 'center',
              }}
            >
              Come back tomorrow
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
