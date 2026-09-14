import { z } from 'zod'
import { generateReply } from '../services/ai'
import { buildSystemPrompt } from '../services/prompts'
import { buildScenarioSystemPrompt } from '../services/scenarioPrompts'
import { buildNpcSystemPrompt } from '../services/npcPrompts'
import { buildBossBattleSystemPrompt } from '../services/bossBattlePrompts'
import { getUserProfile } from '../utils/userProfile'
import { getAllMistakes, formatDigest, recordMistake } from '../services/memory'
import { analyzeMessageForMistake } from '../services/mistakeAnalysis'
import { buildLearnerModel } from '../services/learnerModel'
import { selectSessionFocus } from '../services/sessionFocus'
import { getScenario } from '../data/scenarios'
import { getNpc } from '../data/npcs'
import { getBossBattle } from '../data/bossBattles'
import type { ChatMessage, ChatResponseBody } from '../../shared/types'

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
  })).min(1),
  scenarioId: z.string().optional(),
  npcId: z.string().optional(),
  bossBattleId: z.string().optional(),
})

export default defineEventHandler(async (event): Promise<ChatResponseBody> => {
  const body = chatRequestSchema.parse(await readBody(event))
  const messages = body.messages as ChatMessage[]

  const profile = await getUserProfile()

  const bossBattle = body.bossBattleId ? getBossBattle(body.bossBattleId) : undefined
  if (body.bossBattleId && !bossBattle) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown boss battle' })
  }

  const scenario = !bossBattle && body.scenarioId ? getScenario(body.scenarioId) : undefined
  if (!bossBattle && body.scenarioId && !scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown scenario' })
  }

  const npc = !bossBattle && !scenario && body.npcId ? getNpc(body.npcId) : undefined
  if (!bossBattle && !scenario && body.npcId && !npc) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown NPC' })
  }

  // Priority: boss battle > scenario > chosen NPC > default teacher persona.
  // A boss battle uses its own strict rule set (no corrections, no hints —
  // see bossBattlePrompts.ts) and skips memory/focus entirely, since this is
  // an unaided assessment, not a guided practice session.
  let systemPrompt: string

  if (bossBattle) {
    systemPrompt = buildBossBattleSystemPrompt(profile, bossBattle)
  } else {
    const mistakeRows = await getAllMistakes()
    const memoryDigest = formatDigest(
      mistakeRows.filter(r => r.confidence !== 'low').sort((a, b) => b.occurrences - a.occurrences).slice(0, 5),
    )
    const focus = selectSessionFocus(buildLearnerModel(mistakeRows), profile.preferredDifficulty)

    // Inside a scenario, the scenario's own objective/target skills already
    // give the conversation a concrete goal — the generic weak-spot targeting
    // used in free conversation would just compete with it, so it's skipped.
    systemPrompt = scenario
      ? buildScenarioSystemPrompt(profile, memoryDigest, scenario)
      : npc
        ? buildNpcSystemPrompt(npc, profile, memoryDigest, focus)
        : buildSystemPrompt(profile, memoryDigest, focus)
  }

  const replyText = await generateReply(systemPrompt, messages)

  // Analyze the learner's latest message in the background — the user should
  // never wait for this on top of the reply they're already waiting for.
  // Its own errors are swallowed inside analyzeMessageForMistake, so this
  // can't break anything the user sees.
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  if (lastUserMessage) {
    analyzeMessageForMistake(lastUserMessage.content)
      .then(recordMistake)
      .catch(err => console.error('[chat] failed to record mistake:', err))
  }

  return {
    message: { role: 'assistant', content: replyText },
  }
})
