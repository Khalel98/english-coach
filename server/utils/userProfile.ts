import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { userProfile } from '../db/schema'
import { OWNER_USER_ID } from './constants'
import type { UserProfile, EnglishLevel, Difficulty } from '../../shared/types'

const DEFAULT_PROFILE: UserProfile = {
  estimatedLevel: 'intermediate',
  learningGoal: 'Speak confidently in everyday and work conversations',
  preferredDifficulty: 'normal',
}

function toProfile(row: { estimatedLevel: string; learningGoal: string; preferredDifficulty: string }): UserProfile {
  return {
    estimatedLevel: row.estimatedLevel as EnglishLevel,
    learningGoal: row.learningGoal,
    preferredDifficulty: row.preferredDifficulty as Difficulty,
  }
}

/**
 * Seeds a default row on first-ever call — the profile used to be a static
 * JSON file; now it's DB-backed so the placement test (and future edits) can
 * actually update it. Uses ON CONFLICT DO NOTHING because this can be called
 * several times concurrently (e.g. the dashboard fetches profile, current
 * mission, and DNA in parallel, each independently seeding on a cold start).
 */
export async function getUserProfile(): Promise<UserProfile> {
  const db = getDb()

  const [existing] = await db.select().from(userProfile).where(eq(userProfile.userId, OWNER_USER_ID)).limit(1)
  if (existing) return toProfile(existing)

  await db.insert(userProfile).values({ userId: OWNER_USER_ID, ...DEFAULT_PROFILE }).onConflictDoNothing()

  const [row] = await db.select().from(userProfile).where(eq(userProfile.userId, OWNER_USER_ID)).limit(1)
  return toProfile(row!)
}

export async function updateUserProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  const db = getDb()
  // Ensure a row exists first (also seeds defaults for fields not in the patch).
  const current = await getUserProfile()
  const merged = { ...current, ...patch }

  const [updated] = await db
    .update(userProfile)
    .set({ ...merged, updatedAt: new Date() })
    .where(eq(userProfile.userId, OWNER_USER_ID))
    .returning()

  return toProfile(updated!)
}
