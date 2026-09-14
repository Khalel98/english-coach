import { z } from 'zod'
import { getDb } from '../db/client'
import { grammarDrillLogs } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { getAllMistakes, recordMistake } from './memory'
import { buildLearnerModel, listCandidates } from './learnerModel'
import { rankCandidates } from './sessionFocus'
import { getUserProfile } from '../utils/userProfile'
import { PLACEMENT_QUESTIONS, CEFR_LEVELS } from '../data/placementQuestions'
import { generateWithGemini } from './geminiClient'
import type { GrammarDrillView, EnglishLevel } from '../../shared/types'

const GRAMMAR_QUESTIONS = PLACEMENT_QUESTIONS.filter(q => q.skill === 'grammar')
const FALLBACK_TOPICS = [...new Set(GRAMMAR_QUESTIONS.map(q => q.topic))]

const ENGLISH_LEVEL_TO_CEFR_INDEX: Record<EnglishLevel, number> = {
  beginner: 0,
  elementary: 1,
  intermediate: 2,
  upper_intermediate: 3,
  advanced: 4,
}

export function getAvailableTopics(): string[] {
  return FALLBACK_TOPICS
}

/** Picks the learner's weakest confirmed grammar topic, or — if nothing is confirmed weak yet — a topic near their current level (not a random one from the whole A1-C2 range). */
export async function pickDrillTopic(): Promise<string> {
  const mistakes = await getAllMistakes()
  const model = buildLearnerModel(mistakes)
  const grammarCandidates = listCandidates(model).filter(c => c.mistakeType === 'grammar')

  if (grammarCandidates.length > 0) {
    return rankCandidates(grammarCandidates)[0]!.topic
  }

  const profile = await getUserProfile()
  const centerIndex = ENGLISH_LEVEL_TO_CEFR_INDEX[profile.estimatedLevel] ?? 2
  const nearbyLevels = new Set([CEFR_LEVELS[centerIndex], CEFR_LEVELS[centerIndex + 1]].filter(Boolean))
  const nearbyTopics = [...new Set(GRAMMAR_QUESTIONS.filter(q => nearbyLevels.has(q.cefrLevel)).map(q => q.topic))]

  const pool = nearbyTopics.length > 0 ? nearbyTopics : FALLBACK_TOPICS
  return pool[Math.floor(Math.random() * pool.length)]!
}

const drillSchema = z.object({
  explanationRu: z.string(),
  questions: z.array(z.object({
    prompt: z.string(),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().int().min(0).max(3),
  })).length(5),
})

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    explanationRu: { type: 'STRING' },
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          prompt: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          correctIndex: { type: 'INTEGER' },
        },
        required: ['prompt', 'options', 'correctIndex'],
      },
    },
  },
  required: ['explanationRu', 'questions'],
}

export async function generateGrammarDrill(topic: string): Promise<GrammarDrillView> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const profile = await getUserProfile()
  const readableTopic = topic.replace(/_/g, ' ')

  const systemPrompt = `Create a short grammar practice drill for an English learner (level: ${profile.estimatedLevel}), targeting the grammar point "${readableTopic}".

Write:
- "explanationRu": a brief, clear explanation IN RUSSIAN of this grammar rule (2-4 sentences), including one example sentence in English showing correct usage.
- "questions": exactly 5 multiple-choice questions (4 options each, one correct) in English that practice this specific grammar point. Vary the sentences and contexts — don't reuse the same example from the explanation. Difficulty should match a ${profile.estimatedLevel} learner.

Respond with JSON only.`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: `Grammar topic: ${readableTopic}` }] }],
    responseSchema: RESPONSE_SCHEMA,
    callerLabel: 'grammarDrill',
  })

  const parsed = drillSchema.parse(JSON.parse(raw))
  return { topic, ...parsed }
}

const WEAK_SCORE_THRESHOLD = 0.6

export async function submitGrammarDrillResult(topic: string, correct: number, total: number): Promise<void> {
  const db = getDb()
  await db.insert(grammarDrillLogs).values({ userId: OWNER_USER_ID, topic, correct, total })

  // A poor drill result is real, fresh evidence — reinforce it in the
  // mistakes table so the conversation/session-focus machinery keeps
  // steering toward it, same as a placement test gap.
  if (total > 0 && correct / total < WEAK_SCORE_THRESHOLD) {
    await recordMistake({
      mistakeType: 'grammar',
      topic,
      incorrect: '(see grammar drill)',
      correction: '(see grammar drill)',
      explanation: `Scored ${correct}/${total} on a grammar drill for this topic.`,
    }, 2)
  }
}
