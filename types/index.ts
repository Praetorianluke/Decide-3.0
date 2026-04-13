export interface User {
  email: string
  name: string
}

export interface Profile {
  name: string
  onboarded: boolean
  categories: string[]
  foodPrefs: string[]
  tone: 'direct' | 'brief'
  budget: string
}

export interface DecisionResult {
  bestChoice: string
  reason: string
  backups: string[]
  followUp: string | null
}

export interface HistoryEntry {
  id: number
  result: DecisionResult
  prompt: string
  category: string
  label: string
}

export interface Action {
  id: string
  emoji: string
  label: string
}

export interface DecisionRequest {
  category: string
  prompt: string
  profile: Profile | null
  clarifyingAnswers?: Record<string, string>
}
