import { desc, eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { bossBattleLogs, missionLogs } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { getAllMistakes } from './memory'
import { getUserProfile } from '../utils/userProfile'
import { buildEnglishDna } from './englishDna'
import type { EnglishDnaProfile } from '../../shared/types'

export async function getEnglishDnaProfile(): Promise<EnglishDnaProfile> {
  const db = getDb()

  const [mistakes, missions, battles, profile] = await Promise.all([
    getAllMistakes(),
    db.select().from(missionLogs).where(eq(missionLogs.userId, OWNER_USER_ID)),
    db.select().from(bossBattleLogs).where(eq(bossBattleLogs.userId, OWNER_USER_ID)).orderBy(desc(bossBattleLogs.completedAt)),
    getUserProfile(),
  ])

  return buildEnglishDna({
    mistakes,
    missionLogs: missions,
    bossBattleLogs: battles,
    profile,
    now: new Date(),
  })
}
