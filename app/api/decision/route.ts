import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Decision endpoint ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Clarifying questions mode
    if (body.clarifyOnly) {
      const { category, prompt } = body
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        system: `Decide if this request needs 1–2 clarifying questions before recommending.
Return ONLY valid JSON: {"questions":[]}
Rules: 0 questions if the request is clear enough. Max 2 questions, each under 10 words.`,
        messages: [{ role: 'user', content: `Category: ${category}\nRequest: ${prompt}` }],
      })
      const text = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('')
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      return NextResponse.json(parsed)
    }

    // Full decision mode
    const { category, prompt, profile, clarifyingAnswers } = body

    const ctx = [
      profile?.foodPrefs?.filter((f: string) => f !== 'No restrictions').join(', ') || '',
      profile?.budget ? `Budget: ${profile.budget}` : '',
      profile?.tone === 'direct' ? 'User wants a direct answer, no preamble.' : '',
    ]
      .filter(Boolean)
      .join('\n')

    const system = `You are a decisive personal decision assistant. Eliminate overthinking with one clear answer.

Return ONLY valid JSON — no markdown, no prose.
Schema: {"bestChoice":"","reason":"","backups":[],"followUp":null}

Rules:
- bestChoice: short noun phrase or action (max ~8 words)
- reason: 1 sentence max, genuinely useful, zero filler
- backups: 0–2 short alternatives (often 1 is enough; 0 is fine)
- followUp: null unless a genuinely useful next question (rare)
- Tone: calm, confident, decisive. Never hedge. Never say "it depends."${ctx ? `\n\nUser context:\n${ctx}` : ''}`

    const clarifyCtx =
      clarifyingAnswers && Object.keys(clarifyingAnswers).length > 0
        ? '\n\nAdditional context:\n' +
          Object.entries(clarifyingAnswers)
            .map(([q, a]) => `- ${q}: ${a}`)
            .join('\n')
        : ''

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system,
      messages: [
        {
          role: 'user',
          content: `Category: ${category}\nSituation: ${prompt}${clarifyCtx}`,
        },
      ],
    })

    const text = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('')
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/decision]', err)
    return NextResponse.json({ error: 'Failed to get decision' }, { status: 500 })
  }
}
