import { z } from 'zod'
import type { Mission } from '../data/missions'
import { generateWithGemini } from './geminiClient'

const evaluationSchema = z.object({
  engagement: z.enum(['low', 'medium', 'high']),
  summary: z.string(),
})

export interface MissionEvaluation {
  engagement: 'low' | 'medium' | 'high'
  summary: string
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    engagement: { type: 'STRING', enum: ['low', 'medium', 'high'] },
    summary: { type: 'STRING' },
  },
  required: ['engagement', 'summary'],
}

/**
 * The system works on trust — no proof of completion is required. This
 * evaluates how genuinely the learner engaged with the mission based on
 * their own reflection, not whether they "prove" it happened.
 */
export async function evaluateMissionReflection(mission: Mission, reflectionText: string): Promise<MissionEvaluation> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const systemPrompt = `A language learner was given this real-life mission: "${mission.instruction}"

They are now reporting back what happened, in their own words. Trust their account — do not ask for proof. Judge only how genuinely they seem to have engaged with the mission based on the specificity and content of their reflection (a detailed, specific account suggests high engagement; a vague one-line answer suggests low engagement — but never accuse them of not doing it).

Respond with "engagement" ("low", "medium", or "high") and a warm, specific "summary" written in Russian (1-2 sentences) reacting to what they actually said, encouraging them, speaking directly to them as "ты". The reflection itself may be in English — react to its content, but always write your own summary in Russian.`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: reflectionText }] }],
    responseSchema: RESPONSE_SCHEMA,
    callerLabel: 'missionEvaluation',
  })

  return evaluationSchema.parse(JSON.parse(raw))
}
