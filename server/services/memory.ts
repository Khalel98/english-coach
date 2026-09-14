import { and, eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { mistakes, type MistakeRow } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'

export type Confidence = 'low' | 'medium' | 'high'
export type MistakeType = 'grammar' | 'vocabulary'

export interface DetectedMistake {
  mistakeType: MistakeType
  topic: string
  incorrect: string
  correction: string
  explanation: string
}

/**
 * Normalizes free-text topics from the LLM ("Present Perfect", "present perfect tense")
 * into a stable slug, so repeated occurrences of the same issue actually accumulate
 * on the same row instead of fragmenting into near-duplicate topics.
 */
export function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * 1 occurrence: could be a random slip.
 * 3+ similar occurrences: likely a real problem.
 * 5+ occurrences: a persistent problem worth actively practicing.
 */
export function computeConfidence(occurrences: number): Confidence {
  if (occurrences >= 5) return 'high'
  if (occurrences >= 3) return 'medium'
  return 'low'
}

interface MergedMistake {
  userId: string
  mistakeType: string
  topic: string
  incorrectExample: string
  correctExample: string
  explanation: string
  occurrences: number
  confidence: Confidence
  firstSeenAt: Date
  lastSeenAt: Date
}

export function mergeMistakeOccurrence(
  existing: MistakeRow | undefined,
  detected: DetectedMistake,
  now: Date,
  incrementBy = 1,
): MergedMistake {
  const topic = normalizeTopic(detected.topic)
  const occurrences = (existing?.occurrences ?? 0) + incrementBy

  return {
    userId: OWNER_USER_ID,
    mistakeType: detected.mistakeType,
    topic,
    incorrectExample: detected.incorrect,
    correctExample: detected.correction,
    explanation: detected.explanation,
    occurrences,
    confidence: computeConfidence(occurrences),
    firstSeenAt: existing?.firstSeenAt ?? now,
    lastSeenAt: now,
  }
}

/**
 * incrementBy lets a single, stronger piece of evidence (e.g. a missed
 * placement test question) count for more than one incidental chat slip
 * would — see server/services/placementTestService.ts.
 */
export async function recordMistake(detected: DetectedMistake | null, incrementBy = 1): Promise<void> {
  if (!detected) return

  const db = getDb()
  const topic = normalizeTopic(detected.topic)

  const [existing] = await db
    .select()
    .from(mistakes)
    .where(and(
      eq(mistakes.userId, OWNER_USER_ID),
      eq(mistakes.mistakeType, detected.mistakeType),
      eq(mistakes.topic, topic),
    ))
    .limit(1)

  const merged = mergeMistakeOccurrence(existing, detected, new Date(), incrementBy)

  if (existing) {
    await db.update(mistakes).set(merged).where(eq(mistakes.id, existing.id))
    console.log(`[memory] updated mistake ${merged.mistakeType}/${merged.topic} -> occurrences=${merged.occurrences} confidence=${merged.confidence}`)
  } else {
    await db.insert(mistakes).values(merged)
    console.log(`[memory] recorded new mistake ${merged.mistakeType}/${merged.topic}`)
  }
}

/**
 * Only mistakes with medium/high confidence are surfaced — a single slip
 * shouldn't yet steer the conversation, that's the point of the confidence bands.
 */
export function formatDigest(rows: MistakeRow[]): string {
  if (rows.length === 0) return ''

  const lines = rows.map((row) => {
    const strength = row.confidence === 'high' ? 'a persistent difficulty' : 'a recurring difficulty'
    return `- ${row.mistakeType} / ${row.topic}: ${strength} (seen ${row.occurrences} times). Example of the learner's mistake: "${row.incorrectExample}" -> should be "${row.correctExample}".`
  })

  return `The learner has these known weak spots from previous conversations. Do not mention the mistake counts or say things like "you made this mistake before" — instead, naturally steer the conversation toward situations where the learner has to use these constructions again, so they get organic practice:\n${lines.join('\n')}`
}

export async function getAllMistakes(): Promise<MistakeRow[]> {
  const db = getDb()
  return db
    .select()
    .from(mistakes)
    .where(eq(mistakes.userId, OWNER_USER_ID))
}

export async function getMemoryDigest(): Promise<string> {
  const rows = await getAllMistakes()

  const relevant = rows
    .filter(r => r.confidence !== 'low')
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5)

  return formatDigest(relevant)
}
