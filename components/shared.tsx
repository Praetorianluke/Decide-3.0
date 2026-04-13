'use client'

interface TopBarProps {
  onBack?: () => void
  right?: React.ReactNode
}

export function Dots() {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '8px 0' }}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  )
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
