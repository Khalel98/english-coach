import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { getDb } from '../db/client'
import { grammarDrillLogs, grammarTopicExplanations, type GrammarDrillLogRow } from '../db/schema'
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

/**
 * Curated, pedagogically-ordered grouping of grammar topics — the
 * placement-test topic list is ordered by CEFR level only, which mixes
 * unrelated topics together (e.g. articles right next to present simple)
 * and gives learners no sense of how topics relate to each other.
 */
const GRAMMAR_TOPIC_GROUPS: { category: string; categoryRu: string; topics: string[] }[] = [
  { category: 'basics', categoryRu: 'Основы', topics: ['be_verb', 'articles', 'countable_uncountable', 'comparatives'] },
  { category: 'tenses', categoryRu: 'Времена', topics: ['present_simple', 'past_simple', 'present_perfect', 'past_perfect'] },
  { category: 'modals', categoryRu: 'Модальные глаголы', topics: ['modal_verbs', 'nuanced_modality'] },
  { category: 'conditionals', categoryRu: 'Условные предложения', topics: ['first_conditional', 'second_conditional', 'third_conditional'] },
  { category: 'structures', categoryRu: 'Конструкции предложения', topics: ['passive_voice', 'inversion', 'advanced_inversion', 'cleft_sentences', 'subjunctive'] },
]

const GRAMMAR_TOPIC_LABEL_RU: Record<string, string> = {
  be_verb: 'Глагол to be',
  articles: 'Артикли (a / an / the)',
  countable_uncountable: 'Исчисляемые и неисчисляемые существительные',
  comparatives: 'Сравнительная степень',
  present_simple: 'Present Simple',
  past_simple: 'Past Simple',
  present_perfect: 'Present Perfect',
  past_perfect: 'Past Perfect',
  modal_verbs: 'Модальные глаголы (can, must, should…)',
  nuanced_modality: 'Тонкости модальности',
  first_conditional: 'Первое условное (First Conditional)',
  second_conditional: 'Второе условное (Second Conditional)',
  third_conditional: 'Третье условное (Third Conditional)',
  passive_voice: 'Страдательный залог (Passive Voice)',
  inversion: 'Инверсия',
  advanced_inversion: 'Продвинутая инверсия',
  cleft_sentences: 'Расщеплённые предложения (Cleft Sentences)',
  subjunctive: 'Сослагательное наклонение (Subjunctive)',
}

export interface GrammarTopicGroup {
  category: string
  categoryRu: string
  topics: { topic: string; labelRu: string }[]
}

export interface GrammarTopicSummary {
  topic: string
  labelRu: string
  attempts: number
  lastScore: { correct: number; total: number } | null
  lastAttemptAt: string | null
}

export interface GrammarTopicGroupWithStats {
  category: string
  categoryRu: string
  topics: GrammarTopicSummary[]
}

export interface GrammarTopicMeta {
  labelRu: string
  category: string
  categoryRu: string
}

export function getAvailableTopics(): string[] {
  return FALLBACK_TOPICS
}

/** Looks up which category a topic belongs to and its Russian label. */
export function findTopicMeta(topic: string): GrammarTopicMeta {
  const group = GRAMMAR_TOPIC_GROUPS.find(g => g.topics.includes(topic))
  return {
    labelRu: GRAMMAR_TOPIC_LABEL_RU[topic] ?? topic.replace(/_/g, ' '),
    category: group?.category ?? 'other',
    categoryRu: group?.categoryRu ?? 'Другое',
  }
}

/** Grammar topics grouped by category, in a learning-friendly order, for the module browser. */
export function getGrammarTopicGroups(): GrammarTopicGroup[] {
  const known = new Set(FALLBACK_TOPICS)
  const grouped = new Set<string>()

  const groups = GRAMMAR_TOPIC_GROUPS.map(g => ({
    category: g.category,
    categoryRu: g.categoryRu,
    topics: g.topics.filter(t => known.has(t)).map((t) => {
      grouped.add(t)
      return { topic: t, labelRu: GRAMMAR_TOPIC_LABEL_RU[t] ?? t.replace(/_/g, ' ') }
    }),
  })).filter(g => g.topics.length > 0)

  // Any topic that shows up in the data but wasn't placed in a curated
  // group (e.g. a newly-added placement-test topic) still needs to be
  // reachable — surface it under a catch-all group instead of dropping it.
  const leftover = FALLBACK_TOPICS.filter(t => !grouped.has(t))
  if (leftover.length > 0) {
    groups.push({
      category: 'other',
      categoryRu: 'Другое',
      topics: leftover.map(t => ({ topic: t, labelRu: GRAMMAR_TOPIC_LABEL_RU[t] ?? t.replace(/_/g, ' ') })),
    })
  }

  return groups
}

/** Same grouping as getGrammarTopicGroups, annotated with this learner's attempt history for each topic. */
export async function getGrammarTopicGroupsWithStats(): Promise<GrammarTopicGroupWithStats[]> {
  const db = getDb()
  const logs = await db.select().from(grammarDrillLogs).where(eq(grammarDrillLogs.userId, OWNER_USER_ID))

  const byTopic = new Map<string, GrammarDrillLogRow[]>()
  for (const log of logs) {
    if (!byTopic.has(log.topic)) byTopic.set(log.topic, [])
    byTopic.get(log.topic)!.push(log)
  }

  return getGrammarTopicGroups().map(g => ({
    category: g.category,
    categoryRu: g.categoryRu,
    topics: g.topics.map((t) => {
      const attempts = byTopic.get(t.topic) ?? []
      const last = attempts.reduce<GrammarDrillLogRow | null>(
        (latest, cur) => (!latest || cur.completedAt > latest.completedAt ? cur : latest),
        null,
      )
      return {
        topic: t.topic,
        labelRu: t.labelRu,
        attempts: attempts.length,
        lastScore: last ? { correct: last.correct, total: last.total } : null,
        lastAttemptAt: last ? last.completedAt.toISOString() : null,
      }
    }),
  }))
}

/** This learner's past attempts for one topic, most recent first. */
export async function getTopicHistory(topic: string): Promise<{ correct: number; total: number; completedAt: string }[]> {
  const db = getDb()
  const rows = await db.select().from(grammarDrillLogs)
    .where(and(eq(grammarDrillLogs.userId, OWNER_USER_ID), eq(grammarDrillLogs.topic, topic)))
    .orderBy(desc(grammarDrillLogs.completedAt))
  return rows.map(r => ({ correct: r.correct, total: r.total, completedAt: r.completedAt.toISOString() }))
}

/** This learner's full grammar-drill history across all topics, most recent first. */
export async function getAllHistory(): Promise<{ topic: string; labelRu: string; correct: number; total: number; completedAt: string }[]> {
  const db = getDb()
  const rows = await db.select().from(grammarDrillLogs)
    .where(eq(grammarDrillLogs.userId, OWNER_USER_ID))
    .orderBy(desc(grammarDrillLogs.completedAt))
  return rows.map(r => ({
    topic: r.topic,
    labelRu: findTopicMeta(r.topic).labelRu,
    correct: r.correct,
    total: r.total,
    completedAt: r.completedAt.toISOString(),
  }))
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

const explanationSchema = z.object({ explanationRu: z.string() })

const EXPLANATION_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    explanationRu: { type: 'STRING' },
  },
  required: ['explanationRu'],
}

/**
 * The lesson explanation for a topic — generated once and cached, since
 * it's the same reference material regardless of which quiz attempt the
 * learner is on. Quiz questions (generateGrammarDrill) are generated fresh
 * every attempt instead.
 */
export async function getTopicExplanation(topic: string): Promise<{ topic: string; explanationRu: string }> {
  const db = getDb()
  const [existing] = await db.select().from(grammarTopicExplanations).where(eq(grammarTopicExplanations.topic, topic))
  if (existing) {
    return { topic, explanationRu: existing.explanationRu }
  }

  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const readableTopic = topic.replace(/_/g, ' ')
  const systemPrompt = `Write a thorough English-grammar lesson explanation IN RUSSIAN for the grammar point "${readableTopic}", aimed at a Russian-speaking English learner.

Structure it as several short paragraphs (separated by "\\n\\n"):
1. What the rule is and when it's used.
2. How it's formed (the structure/pattern), with 2-3 English example sentences showing correct usage.
3. A common mistake Russian-speaking learners make with this rule, and how to avoid it.

Keep it clear and concrete, not overly academic — aim for genuinely useful teaching, not a one-line dictionary definition.

Respond with JSON only: { "explanationRu": "..." }`

  const raw = await generateWithGemini({
    apiKey,
    systemPrompt,
    contents: [{ role: 'user', parts: [{ text: `Grammar topic: ${readableTopic}` }] }],
    responseSchema: EXPLANATION_RESPONSE_SCHEMA,
    callerLabel: 'grammarExplanation',
  })

  const parsed = explanationSchema.parse(JSON.parse(raw))
  await db.insert(grammarTopicExplanations).values({ topic, explanationRu: parsed.explanationRu }).onConflictDoNothing()
  return { topic, explanationRu: parsed.explanationRu }
}

const drillSchema = z.object({
  questions: z.array(z.object({
    prompt: z.string(),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().int().min(0).max(3),
  })).length(5),
})

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
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
  required: ['questions'],
}

export async function generateGrammarDrill(topic: string): Promise<GrammarDrillView> {
  const apiKey = useRuntimeConfig().geminiApiKey
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GEMINI_API_KEY is not configured' })
  }

  const profile = await getUserProfile()
  const readableTopic = topic.replace(/_/g, ' ')

  const systemPrompt = `Create exactly 5 multiple-choice practice questions (4 options each, one correct) in English for an English learner (level: ${profile.estimatedLevel}), targeting the grammar point "${readableTopic}". Vary the sentences and contexts. Difficulty should match a ${profile.estimatedLevel} learner.

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
