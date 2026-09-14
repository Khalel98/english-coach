import { z } from 'zod'
import { pickDrillTopic, generateGrammarDrill } from '../../services/grammarDrillService'

const requestSchema = z.object({
  topic: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = requestSchema.parse(await readBody(event).catch(() => ({})))
  const topic = body.topic ?? await pickDrillTopic()
  return generateGrammarDrill(topic)
})
