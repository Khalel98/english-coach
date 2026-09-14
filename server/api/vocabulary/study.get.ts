import { getStudyBatch } from '../../services/vocabularyService'

export default defineEventHandler(async () => {
  const cards = await getStudyBatch()
  return { cards }
})
