import { getBossBattle } from '../../../data/bossBattles'
import { getUserProfile } from '../../../utils/userProfile'
import { buildBossBattleSystemPrompt } from '../../../services/bossBattlePrompts'
import { generateReply } from '../../../services/ai'
import type { ChatResponseBody } from '../../../../shared/types'

export default defineEventHandler(async (event): Promise<ChatResponseBody> => {
  const id = getRouterParam(event, 'id')
  const battle = id ? getBossBattle(id) : undefined
  if (!battle) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown boss battle' })
  }

  const profile = await getUserProfile()
  const systemPrompt = buildBossBattleSystemPrompt(profile, battle)

  const kickoff = [{
    role: 'user' as const,
    content: '(The candidate has just joined the call. Greet them professionally and begin the interview — do not explain that this is an exercise.)',
  }]

  const replyText = await generateReply(systemPrompt, kickoff)

  return {
    message: { role: 'assistant', content: replyText },
  }
})
