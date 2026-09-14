import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { getDb } from '../db/client'
import { bossBattleLogs, missionLogs, placementTestResults } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { getUserProfile } from '../utils/userProfile'
import { getAllMistakes } from '../services/memory'
import { getOrAssignCurrentMission, missionLogToView } from '../services/missionCurrent'
import { getEnglishDnaProfile } from '../services/dnaProfile'
import { SCENARIOS } from '../data/scenarios'
import type { DashboardView } from '../../shared/types'

export default defineEventHandler(async (): Promise<DashboardView> => {
  const db = getDb()

  const [profile, mistakes, currentMission, dna, recentBattleRows, recentMissionRows, placementRows] = await Promise.all([
    getUserProfile(),
    getAllMistakes(),
    getOrAssignCurrentMission(),
    getEnglishDnaProfile(),
    db.select().from(bossBattleLogs).where(eq(bossBattleLogs.userId, OWNER_USER_ID)).orderBy(desc(bossBattleLogs.completedAt)).limit(3),
    db.select().from(missionLogs).where(and(eq(missionLogs.userId, OWNER_USER_ID), isNotNull(missionLogs.completedAt), eq(missionLogs.skipped, false))).orderBy(desc(missionLogs.completedAt)).limit(3),
    db.select({ id: placementTestResults.id }).from(placementTestResults).where(eq(placementTestResults.userId, OWNER_USER_ID)).limit(1),
  ])

  const lastMistake = [...mistakes].sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())[0]

  return {
    profile: { estimatedLevel: profile.estimatedLevel, learningGoal: profile.learningGoal },
    placementTestTaken: placementRows.length > 0,
    currentMission,
    lastMistake: lastMistake
      ? {
          mistakeType: lastMistake.mistakeType,
          topic: lastMistake.topic,
          incorrectExample: lastMistake.incorrectExample,
          correctExample: lastMistake.correctExample,
          explanation: lastMistake.explanation,
          occurrences: lastMistake.occurrences,
          confidence: lastMistake.confidence as 'low' | 'medium' | 'high',
          firstSeenAt: lastMistake.firstSeenAt.toISOString(),
          lastSeenAt: lastMistake.lastSeenAt.toISOString(),
        }
      : null,
    dna: {
      overallLevel: dna.overallLevel.stated,
      dataConfidence: dna.dataConfidence,
      strongestSkills: dna.strongestSkills,
      weakestSkills: dna.weakestSkills,
    },
    scenarioCount: SCENARIOS.length,
    recentBossBattles: recentBattleRows.map(b => ({
      bossBattleId: b.bossBattleId,
      verdict: b.verdict,
      completedAt: b.completedAt.toISOString(),
    })),
    recentMissions: recentMissionRows.map(missionLogToView),
  }
})
