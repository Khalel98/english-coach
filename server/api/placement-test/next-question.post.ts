import { z } from 'zod'
import { getNextPlacementQuestion } from '../../services/placementTestService'

const requestSchema = z.object({
  history: z.array(z.object({
    questionId: z.string(),
    selectedIndex: z.number().int().min(0),
  })),
})

export default defineEventHandler(async (event) => {
  const body = requestSchema.parse(await readBody(event))
  return { question: getNextPlacementQuestion(body.history) }
})
