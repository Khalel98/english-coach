import { z } from 'zod'
import { submitVocabularyReview } from '../../services/vocabularyService'

const requestSchema = z.object({
  wordId: z.number().int(),
  knewIt: z.boolean(),
})

export default defineEventHandler(async (event) => {
  const body = requestSchema.parse(await readBody(event))
  await submitVocabularyReview(body.wordId, body.knewIt)
  return { ok: true }
})
