import { z } from 'zod'
import { submitGrammarDrillResult } from '../../services/grammarDrillService'

const requestSchema = z.object({
  topic: z.string(),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
})

export default defineEventHandler(async (event) => {
  const body = requestSchema.parse(await readBody(event))
  await submitGrammarDrillResult(body.topic, body.correct, body.total)
  return { ok: true }
})
