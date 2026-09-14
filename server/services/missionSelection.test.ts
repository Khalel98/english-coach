import { describe, it, expect } from 'vitest'
import { pickMission } from './missionSelection'
import { MISSIONS } from '../data/missions'

describe('pickMission', () => {
  it('picks a speaking/writing mission when the learner has a grammar weak spot', () => {
    const mission = pickMission(MISSIONS, 'grammar')
    expect(['speaking', 'writing']).toContain(mission.skillFocus)
  })

  it('picks a vocabulary/listening/writing mission when the learner has a vocabulary weak spot', () => {
    const mission = pickMission(MISSIONS, 'vocabulary')
    expect(['vocabulary', 'listening', 'writing']).toContain(mission.skillFocus)
  })

  it('picks a confidence-building mission for a brand new user with no data yet', () => {
    const mission = pickMission(MISSIONS, null)
    expect(mission.skillFocus).toBe('confidence')
  })

  it('avoids re-assigning a recently completed mission when an alternative in the same category exists', () => {
    const first = pickMission(MISSIONS, 'grammar')
    const second = pickMission(MISSIONS, 'grammar', [first.id])
    expect(second.id).not.toBe(first.id)
    expect(['speaking', 'writing']).toContain(second.skillFocus)
  })

  it('falls back to any non-recent mission if the preferred categories are exhausted', () => {
    const speakingWriting = MISSIONS.filter(m => m.skillFocus === 'speaking' || m.skillFocus === 'writing').map(m => m.id)
    const mission = pickMission(MISSIONS, 'grammar', speakingWriting)
    expect(speakingWriting).not.toContain(mission.id)
  })

  it('cycles back to the first mission if literally everything has been recently assigned', () => {
    const allIds = MISSIONS.map(m => m.id)
    const mission = pickMission(MISSIONS, 'grammar', allIds)
    expect(mission).toBe(MISSIONS[0])
  })
})
