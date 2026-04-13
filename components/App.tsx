'use client'

import { useState, useEffect } from 'react'
import { User, Profile, HistoryEntry, Action } from '@/types'
import { load, save, clear } from '@/lib/storage'

import AuthScreen       from './AuthScreen'
import OnboardingScreen from './OnboardingScreen'
import HomeScreen       from './HomeScreen'
import DecisionScreen   from './DecisionScreen'
import HistoryScreen    from './HistoryScreen'
import SettingsScreen   from './SettingsScreen'
import DemoScreen       from './DemoScreen'

type Screen = 'home' | 'history' | 'settings'

interface Deciding {
  action: Action
  prompt?: string
}

export default function App() {
  const [user,     setUser]     = useState<User | null>(null)
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [history,  setHistory]  = useState<HistoryEntry[]>([])
  const [screen,   setScreen]   = useState<Screen>('home')
  const [deciding, setDeciding] = useState<Deciding | null>(null)
  const [demo,     setDemo]     = useState(false)
  const [ready,    setReady]    = useState(false)

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setUser(load<User | null>('dfk_user', null))
    setProfile(load<Profile | null>('dfk_profile', null))
    setHistory(load<HistoryEntry[]>('dfk_history', []))
    setReady(true)
  }, [])

  const updateProfile = (p: Profile) => {
    setProfile(p)
    save('dfk_profile', p)
  }

  const addToHistory = (entry: Omit<HistoryEntry, 'id'>) => {
    setHistory(prev => {
      const next: HistoryEntry[] = [{ ...entry, id: Date.now() }, ...prev].slice(0, 60)
      save('dfk_history', next)
      return next
    })
  }

  const logout = () => {
    clear('dfk_user', 'dfk_profile', 'dfk_history')
    setUser(null)
    setProfile(null)
    setHistory([])
    setDeciding(null)
    setScreen('home')
  }

  // Avoid hydration flash
  if (!ready) return null

  // Demo mode — unauthenticated, single use
  if (demo) {
    return (
      <DemoScreen
        onSignUp={() => { setDemo(false) }}
        onBack={() => setDemo(false)}
      />
    )
  }

  // Auth gate
  if (!user) {
    return (
      <AuthScreen
        onAuth={u => {
          save('dfk_user', u)
          setUser(u)
        }}
        onDemo={() => setDemo(true)}
      />
    )
  }

  // Onboarding gate
  if (!profile?.onboarded) {
    return <OnboardingScreen user={user} onDone={updateProfile} />
  }

  // Decision flow — full screen, no nav chrome
  if (deciding) {
    return (
      <DecisionScreen
        action={deciding.action}
        initPrompt={deciding.prompt}
        profile={profile}
        onBack={() => setDeciding(null)}
        onSave={addToHistory}
      />
    )
  }

  // Main screens
  if (screen === 'history') {
    return <HistoryScreen history={history} onBack={() => setScreen('home')} />
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        profile={profile}
        user={user}
        onBack={() => setScreen('home')}
        onSave={updateProfile}
        onLogout={logout}
      />
    )
  }

  return (
    <HomeScreen
      profile={profile}
      history={history}
      onPick={(action, prompt) => setDeciding({ action, prompt })}
      onHistory={() => setScreen('history')}
      onSettings={() => setScreen('settings')}
    />
  )
}
