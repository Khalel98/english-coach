import type { Mission, MissionSkillFocus } from '../data/missions'

type TargetType = 'grammar' | 'vocabulary' | null

/**
 * Missions live in the physical world, outside the grammar/vocabulary
 * mistake tracking we do inside conversations — so instead of targeting a
 * specific topic, a mission targets the kind of skill (speaking, writing,
 * listening...) most likely to give organic practice for the learner's
 * current weak spot.
 */
function preferredSkillOrder(targetType: TargetType): MissionSkillFocus[] {
  if (targetType === 'grammar') return ['speaking', 'writing']
  if (targetType === 'vocabulary') return ['vocabulary', 'listening', 'writing']
  // No confirmed weak spot yet — start with something low-stakes and confidence-building.
  return ['confidence', 'speaking', 'writing', 'vocabulary', 'listening']
}

export function pickMission(missions: Mission[], targetType: TargetType, recentMissionIds: string[] = []): Mission {
  for (const skill of preferredSkillOrder(targetType)) {
    const candidate = missions.find(m => m.skillFocus === skill && !recentMissionIds.includes(m.id))
    if (candidate) return candidate
  }

  const anyNotRecent = missions.find(m => !recentMissionIds.includes(m.id))
  if (anyNotRecent) return anyNotRecent

  // Every mission has been assigned recently — just cycle back to the first.
  return missions[0]
}
