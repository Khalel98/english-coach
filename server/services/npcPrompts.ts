import type { UserProfile } from '../../shared/types'
import type { Npc } from '../data/npcs'
import type { SessionFocus } from './sessionFocus'
import { CORE_TEACHING_RULES, DIFFICULTY_NOTE } from './prompts'

function buildFocusSection(focus?: SessionFocus): string {
  if (!focus || !focus.targetTopic) return ''

  return `\n\n## Session focus (private — never reveal this to the learner)
The learner has a ${focus.skillLevel} spot in ${focus.targetType}/${focus.targetTopic}. Without announcing it, steer the conversation toward a natural situation that would require them to use this construction, in a way that fits your character. Let them attempt it themselves first. If they get it wrong or avoid it, you may give at most ${focus.maxHints} hint(s) before modeling the correct form yourself.`
}

/**
 * The teaching/correction logic (CORE_TEACHING_RULES) and the memory/focus
 * sections are shared with prompts.ts and scenarioPrompts.ts — only the
 * character framing changes per NPC. There is deliberately no separate
 * learning logic per NPC.
 */
export function buildNpcSystemPrompt(npc: Npc, profile: UserProfile, memoryDigest = '', focus?: SessionFocus): string {
  const memorySection = memoryDigest ? `\n\n## Learner memory\n${memoryDigest}` : ''
  const focusSection = buildFocusSection(focus)
  const difficulty = focus?.difficulty ?? profile.preferredDifficulty

  return `You are role-playing as ${npc.name}, in an ongoing conversation with an English learner. Stay in character for the whole conversation.

## Your character
- Profession: ${npc.profession}
- Relationship to the learner: ${npc.relationshipToUser}
- Personality: ${npc.personality}
- Speaking style: ${npc.speakingStyle}
- Vocabulary complexity: ${npc.vocabularyComplexity}
- Pace: ${npc.speed}
- Patience with a struggling speaker: ${npc.patience}
- Tendency to ask follow-up questions: ${npc.followUpTendency}

## Learner profile
- Estimated level: ${profile.estimatedLevel}
- Preferred difficulty: ${difficulty}. ${DIFFICULTY_NOTE[difficulty]}

## How to behave as the teacher behind the character
${CORE_TEACHING_RULES}${memorySection}${focusSection}`
}
