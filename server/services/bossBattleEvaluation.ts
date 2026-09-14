import { z } from 'zod'
import type { ChatMessage, BossBattleResult } from '../../shared/types'
import type { BossBattle } from '../data/bossBattles'
import { generateWithGemini } from './geminiClient'

const ratingSchema = z.enum(['weak', 'developing', 'strong'])

const evaluationSchema = z.object({
  verdict: z.enum(['defeated', 'not_defeated']),
  dimensions: z.object({
    grammar: ratingSchema,
    vocabulary: ratingSchema,
    fluency: ratingSchema,
    taskCompletion: ratingSchema,
    technicalEnglish: ratingSchema,
    abilityToReact: ratingSchema,
    confidence: ratingSchema,
  }),
  topStrengths: z.array(z.string()),
  topWeaknesses: z.array(z.string()),
  mostRepeatedMistakes: z.array(z.string()),
  recommendedPractice: z.string(),
  summary: z.string(),
})

const RATING_ENUM = ['weak', 'developing', 'strong']

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: { type: 'STRING', enum: ['defeated', 'not_defeated'] },
    dimensions: {
      type: 'OBJECT',
      properties: {
        grammar: { type: 'STRING', enum: RATING_ENUM },
        vocabulary: { type: 'STRING', enum: RATING_ENUM },
        fluency: { type: 'STRING', enum: RATING_ENUM },
        taskCompletion: { type: 'STRING', enum: RATING_ENUM },
        technicalEnglish: { type: 'STRING', enum: RATING_ENUM },
        abilityToReact: { type: 'STRING', enum: RATING_ENUM },
        confidence: { type: 'STRING', enum: RATING_ENUM },
      },
      required: ['grammar', 'vocabulary', 'fluency', 'taskCompletion', 'technicalEnglish', 'abilityToReact', 'confidence'],
    },
    topStrengths: { type: 'ARRAY', items: { type: 'STRING' } },
    topWeaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    mostRepeatedMistakes: { type: 'ARRAY', items: { type: 'STRING' } },
    recommendedPractice: { type: 'STRING' },
    summary: { type: 'STRING' },
  },
  required: ['verdict', 'dimensions', 'topStrengths', 'topWeaknesses', 'mostRepeatedMistakes', 'recommendedPractice', 'summary'],
}

function transcriptText(messages: ChatMessage[]): string {
  return messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')
}

export async function evaluateBossBattle(battle: BossBattle, messages: ChatMessage[]): Promise<BossBattleResult> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const systemPrompt = `You are grading a candidate's performance in a Boss Battle assessment: "${battle.title}". This is a comprehensive periodic check, not everyday feedback — be honest and specific, not just encouraging.

Rate each dimension as "weak", "developing", or "strong", based only on evidence actually visible in the transcript:
- grammar, vocabulary, fluency (natural, unhesitant flow of language)
- taskCompletion (did they actually answer what was asked, across the whole interview)
- technicalEnglish (precision and clarity when discussing technical content)
- abilityToReact (how well they handled the unexpected/curveball moment)
- confidence (tone and assertiveness, not correctness)

verdict: "defeated" means the candidate would plausibly pass a real interview like this one — not perfect English, but clear, complete, and reasonably confident. "not_defeated" means significant gaps got in the way of communication or completeness.

Write all free-text fields (topStrengths, topWeaknesses, mostRepeatedMistakes, recommendedPractice, summary) in Russian, speaking directly to the candidate as "ты".

topStrengths and topWeaknesses: up to 3 each, specific and grounded in the transcript, not generic.
mostRepeatedMistakes: specific patterns that occurred more than once in this transcript, if any (empty array if none stood out).
recommendedPractice: 1-2 concrete, actionable sentences for what to focus on this week.
summary: 2-3 sentences, direct and honest.`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: transcriptText(messages) }] }],
    responseSchema: RESPONSE_SCHEMA,
    callerLabel: 'bossBattleEvaluation',
  })

  return evaluationSchema.parse(JSON.parse(raw))
}
