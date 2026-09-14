import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { getDb } from '../../db/client'
import { missionLogs } from '../../db/schema'
import { OWNER_USER_ID } from '../../utils/constants'
import { missionLogToView } from '../../services/missionCurrent'
import type { MissionLogView } from '../../../shared/types'

export default defineEventHandler(async (): Promise<MissionLogView[]> => {
  const db = getDb()

  const rows = await db
    .select()
    .from(missionLogs)
    .where(and(eq(missionLogs.userId, OWNER_USER_ID), isNotNull(missionLogs.completedAt)))
    .orderBy(desc(missionLogs.completedAt))
    .limit(20)

  return rows.map(missionLogToView)
})
