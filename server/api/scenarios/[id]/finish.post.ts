import { z } from 'zod'
import { getScenario } from '../../../data/scenarios'
import { evaluateScenario } from '../../../services/scenarioEvaluation'
import type { ChatMessage, ScenarioResult } from '../../../../shared/types'

const finishRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
  })).min(1),
})

export default defineEventHandler(async (event): Promise<ScenarioResult> => {
  const id = getRouterParam(event, 'id')
  const scenario = id ? getScenario(id) : undefined
  if (!scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown scenario' })
  }

  const body = finishRequestSchema.parse(await readBody(event))
  const messages = body.messages as ChatMessage[]

  return evaluateScenario(scenario, messages)
})
