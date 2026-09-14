import { and, desc, eq, isNull } from 'drizzle-orm'
import { getDb } from '../db/client'
import { missionLogs, type MissionLogRow } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { MISSIONS, getMission } from '../data/missions'
import { pickMission } from './missionSelection'
import { getAllMistakes } from './memory'
import { buildLearnerModel } from './learnerModel'
import { selectSessionFocus } from './sessionFocus'
import { getUserProfile } from '../utils/userProfile'
import type { MissionLogView } from '../../shared/types'

export function missionLogToView(log: MissionLogRow): MissionLogView {
  const mission = getMission(log.missionId)!
  return {
    logId: log.id,
    mission: {
      id: mission.id,
      title: mission.title,
      titleRu: mission.titleRu,
      instruction: mission.instruction,
      instructionRu: mission.instructionRu,
      skillFocus: mission.skillFocus,
      estimatedMinutes: mission.estimatedMinutes,
    },
    assignedAt: log.assignedAt.toISOString(),
    reflectionText: log.reflectionText,
    completedAt: log.completedAt?.toISOString() ?? null,
    engagement: log.engagement as MissionLogView['engagement'],
    evaluationSummary: log.evaluationSummary,
    skipped: log.skipped,
  }
}

/** Returns the learner's current, not-yet-completed mission — assigning a new one (rule-based, see missionSelection.ts) if none is pending. */
export async function getOrAssignCurrentMission(): Promise<MissionLogView> {
  const db = getDb()

  const [existing] = await db
    .select()
    .from(missionLogs)
    .where(and(eq(missionLogs.userId, OWNER_USER_ID), isNull(missionLogs.completedAt)))
    .orderBy(desc(missionLogs.assignedAt))
    .limit(1)

  if (existing) return missionLogToView(existing)

  const mistakeRows = await getAllMistakes()
  const profile = await getUserProfile()
  const focus = selectSessionFocus(buildLearnerModel(mistakeRows), profile.preferredDifficulty)

  const recentLogs = await db
    .select()
    .from(missionLogs)
    .where(eq(missionLogs.userId, OWNER_USER_ID))
    .orderBy(desc(missionLogs.assignedAt))
    .limit(3)

  const mission = pickMission(MISSIONS, focus.targetType, recentLogs.map(l => l.missionId))

  const [created] = await db
    .insert(missionLogs)
    .values({ userId: OWNER_USER_ID, missionId: mission.id })
    .returning()

  return missionLogToView(created!)
}

/** Marks the mission as declined (not a genuine attempt) and frees it up so the next GET assigns a different one. */
export async function skipMission(logId: number): Promise<void> {
  const db = getDb()
  await db
    .update(missionLogs)
    .set({ completedAt: new Date(), skipped: true })
    .where(and(eq(missionLogs.id, logId), eq(missionLogs.userId, OWNER_USER_ID), isNull(missionLogs.completedAt)))
}
