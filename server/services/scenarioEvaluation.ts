import { z } from 'zod'
import type { ChatMessage, ScenarioResult } from '../../shared/types'
import type { Scenario } from '../data/scenarios'
import { generateWithGemini } from './geminiClient'

const evaluationSchema = z.object({
  completed: z.boolean(),
  metConditions: z.array(z.string()),
  summary: z.string(),
})

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    completed: { type: 'BOOLEAN' },
    metConditions: { type: 'ARRAY', items: { type: 'STRING' } },
    summary: { type: 'STRING' },
  },
  required: ['completed', 'metConditions', 'summary'],
}

function transcriptText(messages: ChatMessage[]): string {
  return messages.map(m => `${m.role === 'user' ? 'Learner' : 'NPC'}: ${m.content}`).join('\n')
}

/**
 * This only judges whether the scenario's own objective/success conditions
 * were met — it does not re-do grammar/vocabulary mistake tracking, since
 * that already happens continuously via mistakeAnalysis during the chat.
 */
export async function evaluateScenario(scenario: Scenario, messages: ChatMessage[]): Promise<ScenarioResult> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const systemPrompt = `You are evaluating whether a language learner accomplished the objective of a role-play scenario. Judge only task completion — whether they communicated what they needed to, not grammar perfection.

Scenario objective: ${scenario.objective}
Success conditions to check:
${scenario.successConditions.map(c => `- ${c}`).join('\n')}

Be encouraging but honest. "completed" should be true if the learner accomplished the core objective, even if imperfectly. In "metConditions", describe in Russian, in your own words, which specific conditions were met (do not just copy the English condition text). "summary" must be written in Russian: 2-3 warm, specific sentences about what they did well and what to work on next time — speak directly to the learner ("ты").`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: transcriptText(messages) }] }],
    responseSchema: RESPONSE_SCHEMA,
    callerLabel: 'scenarioEvaluation',
  })

  return evaluationSchema.parse(JSON.parse(raw))
}
