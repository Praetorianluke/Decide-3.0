# Decision Fatigue Killer

Stop overthinking. Get one clear answer.

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/decision-fatigue-killer.git
cd decision-fatigue-killer
npm install
```

### 2. Add your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel (recommended)

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add `ANTHROPIC_API_KEY`.

### Option B — GitHub + Vercel dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

That's it. Vercel auto-deploys on every `git push`.

---

## Iterating

All UI lives in `components/`. Each screen is its own file:

| File | What it controls |
|------|-----------------|
| `components/AuthScreen.tsx` | Sign in / create account |
| `components/OnboardingScreen.tsx` | 4-step onboarding flow |
| `components/HomeScreen.tsx` | Dashboard + quick actions |
| `components/DecisionScreen.tsx` | Input → clarify → result flow |
| `components/HistoryScreen.tsx` | Past decisions |
| `components/SettingsScreen.tsx` | Profile + preferences |
| `components/App.tsx` | Root state, screen routing |

All styles are in `app/globals.css` using CSS variables — easy to retheme.

The AI prompt and model are in `app/api/decision/route.ts`.

Constants (categories, placeholders, onboarding steps) are in `lib/constants.ts`.

---

## Project structure

```
├── app/
│   ├── api/decision/route.ts   ← API route (API key lives here, server-side)
│   ├── globals.css             ← All styles
│   ├── layout.tsx              ← Root layout + metadata
│   └── page.tsx                ← Entry point
├── components/
│   ├── App.tsx                 ← Root client component + state
│   ├── AuthScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── DecisionScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── SettingsScreen.tsx
│   └── shared.tsx              ← TopBar, Dots loader
├── lib/
│   ├── api.ts                  ← Client-side fetch helpers
│   ├── constants.ts            ← Categories, options, onboarding steps
│   └── storage.ts              ← localStorage helpers
├── types/
│   └── index.ts                ← Shared TypeScript types
├── .env.example
└── README.md
```

---

## Common tweaks

**Change the accent color** — find `--amber: #E8A83E` in `globals.css` and replace with any hex.

**Add a new decision category** — add an entry to `ACTIONS` in `lib/constants.ts` and a placeholder in `PLACEHOLDERS`.

**Change the AI model** — update `model: 'claude-sonnet-4-5'` in `app/api/decision/route.ts`.

**Change the AI tone** — edit the system prompt in `app/api/decision/route.ts`.
