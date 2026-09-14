import { getScenario } from '../../../data/scenarios'
import { getUserProfile } from '../../../utils/userProfile'
import { getMemoryDigest } from '../../../services/memory'
import { buildScenarioSystemPrompt } from '../../../services/scenarioPrompts'
import { generateReply } from '../../../services/ai'
import type { ChatResponseBody } from '../../../../shared/types'

export default defineEventHandler(async (event): Promise<ChatResponseBody> => {
  const id = getRouterParam(event, 'id')
  const scenario = id ? getScenario(id) : undefined
  if (!scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown scenario' })
  }

  const profile = await getUserProfile()
  const memoryDigest = await getMemoryDigest()
  const systemPrompt = buildScenarioSystemPrompt(profile, memoryDigest, scenario)

  // A hidden kickoff turn used once to get the NPC's opening line in character.
  // It is never shown to the learner or stored — the client seeds its own
  // conversation history with just the reply below.
  const kickoff = [{
    role: 'user' as const,
    content: '(The learner has just entered the scene. Greet them in character and naturally start the situation — do not explain the scenario or break character.)',
  }]

  const replyText = await generateReply(systemPrompt, kickoff)

  return {
    message: { role: 'assistant', content: replyText },
  }
})
