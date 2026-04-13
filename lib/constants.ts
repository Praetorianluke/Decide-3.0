import { Action } from '@/types'

export const ACTIONS: Action[] = [
  { id: 'food',  emoji: '🍽️', label: 'What should I eat?' },
  { id: 'now',   emoji: '⚡',  label: 'What should I do right now?' },
  { id: 'tasks', emoji: '📋', label: 'Prioritize my tasks' },
  { id: 'plan',  emoji: '🕐', label: 'Plan my next few hours' },
  { id: 'pick',  emoji: '🎯', label: 'Pick between options' },
]

export const PLACEHOLDERS: Record<string, string> = {
  food:   'e.g. Low energy, want something quick, under $15, had pasta last night',
  now:    'e.g. 90 minutes free, moderate energy, homework + want to exercise',
  tasks:  'e.g. Write report (due tmrw), reply emails, grocery run, call dentist',
  plan:   'e.g. 3 free hours this afternoon, low energy, want to feel accomplished',
  pick:   'e.g. Option A: accept offer. Option B: stay and negotiate. Need stability.',
  custom: 'Describe your situation and what you need to decide…',
}

export const FOOD_OPTS   = ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free']
export const BUDGET_OPTS = ['Budget-conscious', 'Moderate', 'Not a concern']
export const TONE_OPTS   = [
  { v: 'direct', label: 'Just tell me',  sub: 'One answer, zero fluff' },
  { v: 'brief',  label: 'Brief context', sub: 'Answer + short reason' },
]

export const OB_STEPS = [
  {
    title: 'What do you want help with?',
    field: 'categories' as const,
    multi: true,
    options: ACTIONS.map(a => ({ v: a.id, icon: a.emoji, label: a.label })),
  },
  {
    title: 'Food preferences?',
    sub: 'For meal decisions',
    field: 'foodPrefs' as const,
    multi: true,
    options: FOOD_OPTS.map(f => ({ v: f, label: f })),
  },
  {
    title: 'How do you want answers?',
    field: 'tone' as const,
    multi: false,
    options: TONE_OPTS.map(t => ({ v: t.v, label: t.label, sub: t.sub })),
  },
  {
    title: 'Budget sensitivity?',
    field: 'budget' as const,
    multi: false,
    options: BUDGET_OPTS.map(b => ({ v: b, label: b })),
  },
]
