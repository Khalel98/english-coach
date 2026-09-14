import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '../../../db/client'
import { missionLogs } from '../../../db/schema'
import { getMission } from '../../../data/missions'
import { evaluateMissionReflection } from '../../../services/missionEvaluation'
import { analyzeMessageForMistake } from '../../../services/mistakeAnalysis'
import { recordMistake } from '../../../services/memory'

const reflectRequestSchema = z.object({
  reflectionText: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const logId = Number(getRouterParam(event, 'logId'))
  if (!Number.isInteger(logId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mission log id' })
  }

  const body = reflectRequestSchema.parse(await readBody(event))

  const db = getDb()
  const [log] = await db.select().from(missionLogs).where(eq(missionLogs.id, logId)).limit(1)
  if (!log) {
    throw createError({ statusCode: 404, statusMessage: 'Mission not found' })
  }
  if (log.completedAt) {
    throw createError({ statusCode: 400, statusMessage: 'This mission is already completed' })
  }

  const mission = getMission(log.missionId)!
  const evaluation = await evaluateMissionReflection(mission, body.reflectionText)

  const [updated] = await db
    .update(missionLogs)
    .set({
      reflectionText: body.reflectionText,
      completedAt: new Date(),
      engagement: evaluation.engagement,
      evaluationSummary: evaluation.summary,
    })
    .where(eq(missionLogs.id, logId))
    .returning()

  // The reflection is real English the learner wrote — route it through the
  // same mistake-tracking pipeline as any chat message, in the background.
  analyzeMessageForMistake(body.reflectionText)
    .then(recordMistake)
    .catch(err => console.error('[missions] failed to record mistake from reflection:', err))

  return {
    engagement: updated.engagement,
    summary: updated.evaluationSummary,
  }
})
