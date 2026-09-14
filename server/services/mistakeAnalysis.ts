import { z } from 'zod'
import type { DetectedMistake } from './memory'
import { generateWithGemini } from './geminiClient'

const analysisSchema = z.object({
  hasMistake: z.boolean(),
  mistakeType: z.enum(['grammar', 'vocabulary']).optional(),
  topic: z.string().optional(),
  incorrect: z.string().optional(),
  correction: z.string().optional(),
  explanation: z.string().optional(),
})

const ANALYSIS_PROMPT = `You are a strict English error-detection assistant. You will be given one message written by an English learner. Decide whether it contains a meaningful grammar or vocabulary mistake worth remembering.

Rules:
- Ignore trivial typos, missing punctuation, capitalization, and minor slips that don't reflect a real gap in the learner's English.
- Only flag something if it reflects a real, learnable pattern (wrong tense, wrong word choice, wrong structure) that a teacher would actually want to track and revisit.
- If there is no meaningful mistake, return hasMistake: false and omit the other fields.
- If there is a meaningful mistake, return hasMistake: true, mistakeType ("grammar" or "vocabulary"), a short topic slug (e.g. "present_perfect", "articles", "word_choice_technology"), the incorrect fragment, the corrected fragment, and a one-sentence explanation.

Respond with JSON only, matching this shape:
{"hasMistake": boolean, "mistakeType"?: "grammar"|"vocabulary", "topic"?: string, "incorrect"?: string, "correction"?: string, "explanation"?: string}`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    hasMistake: { type: 'BOOLEAN' },
    mistakeType: { type: 'STRING', enum: ['grammar', 'vocabulary'] },
    topic: { type: 'STRING' },
    incorrect: { type: 'STRING' },
    correction: { type: 'STRING' },
    explanation: { type: 'STRING' },
  },
  required: ['hasMistake'],
}

export async function analyzeMessageForMistake(learnerMessage: string): Promise<DetectedMistake | null> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) return null

  let raw: string
  try {
    raw = await generateWithGemini({
      apiKey,
      systemPrompt: ANALYSIS_PROMPT,
      contents: [{ role: 'user', parts: [{ text: learnerMessage }] }],
      responseSchema: RESPONSE_SCHEMA,
      callerLabel: 'mistakeAnalysis',
    })
  } catch (err) {
    // Mistake detection is a best-effort side channel — never let it break
    // the main conversation if Gemini stays flaky or rate-limited.
    return null
  }

  const parsed = analysisSchema.safeParse(JSON.parse(raw))
  if (!parsed.success || !parsed.data.hasMistake) return null

  const { mistakeType, topic, incorrect, correction, explanation } = parsed.data
  if (!mistakeType || !topic || !incorrect || !correction || !explanation) return null

  return { mistakeType, topic, incorrect, correction, explanation }
}
