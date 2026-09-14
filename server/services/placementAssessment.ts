import { z } from 'zod'
import { generateWithGemini } from './geminiClient'
import { CEFR_LEVELS, type CefrLevel } from '../data/placementQuestions'

const assessmentSchema = z.object({
  cefrLevel: z.enum(CEFR_LEVELS as [CefrLevel, ...CefrLevel[]]),
  notes: z.string(),
})

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cefrLevel: { type: 'STRING', enum: CEFR_LEVELS },
    notes: { type: 'STRING' },
  },
  required: ['cefrLevel', 'notes'],
}

export interface FluencyAssessment {
  cefrLevel: CefrLevel
  notes: string
}

/** Judges free-written English against the CEFR scale — used for the open-dialogue phase of the placement test, which the multiple-choice quiz can't measure (real production, not recognition). */
export async function assessFluency(answers: string[]): Promise<FluencyAssessment> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const systemPrompt = `You are a CEFR-certified English examiner. You will be given a learner's free-written answers to two open questions. Judge their CEFR level (A1-C2) based on range and accuracy of grammar, vocabulary range, sentence complexity, and coherence — not just correctness.

Respond with "cefrLevel" (one of A1, A2, B1, B2, C1, C2) and "notes" written in Russian: 2-3 sentences explaining what specifically in their writing supports that level (mention concrete structures or vocabulary they used), speaking about the learner in third person for an internal report.`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: answers.map((a, i) => `Answer ${i + 1}: ${a}`).join('\n\n') }] }],
    responseSchema: RESPONSE_SCHEMA,
    callerLabel: 'placementAssessment',
  })

  return assessmentSchema.parse(JSON.parse(raw))
}
