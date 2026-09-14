import { z } from 'zod'
import { finishPlacementTest } from '../../services/placementTestService'
import type { PlacementTestResultView } from '../../../shared/types'

const requestSchema = z.object({
  history: z.array(z.object({
    questionId: z.string(),
    selectedIndex: z.number().int().min(0),
  })),
  openAnswers: z.array(z.string().min(1)).min(1),
})

export default defineEventHandler(async (event): Promise<PlacementTestResultView> => {
  const body = requestSchema.parse(await readBody(event))
  return finishPlacementTest(body.history, body.openAnswers)
})
