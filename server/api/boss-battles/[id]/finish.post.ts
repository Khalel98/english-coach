import { z } from 'zod'
import { getBossBattle } from '../../../data/bossBattles'
import { evaluateBossBattle } from '../../../services/bossBattleEvaluation'
import { getDb } from '../../../db/client'
import { bossBattleLogs } from '../../../db/schema'
import { OWNER_USER_ID } from '../../../utils/constants'
import type { ChatMessage, BossBattleResult } from '../../../../shared/types'

const finishRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
  })).min(1),
})

export default defineEventHandler(async (event): Promise<BossBattleResult> => {
  const id = getRouterParam(event, 'id')
  const battle = id ? getBossBattle(id) : undefined
  if (!battle) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown boss battle' })
  }

  const body = finishRequestSchema.parse(await readBody(event))
  const messages = body.messages as ChatMessage[]

  const result = await evaluateBossBattle(battle, messages)

  // Persisted so English DNA has real, graded evidence to draw on for
  // dimensions (fluency, technical English, confidence...) that nothing
  // else in the app actually grades.
  const db = getDb()
  await db.insert(bossBattleLogs).values({
    userId: OWNER_USER_ID,
    bossBattleId: battle.id,
    verdict: result.verdict,
    dimensions: result.dimensions,
    topStrengths: result.topStrengths,
    topWeaknesses: result.topWeaknesses,
    summary: result.summary,
  })

  return result
})
