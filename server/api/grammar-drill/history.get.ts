import { getAllHistory } from '../../services/grammarDrillService'

export default defineEventHandler(async () => {
  return { history: await getAllHistory() }
})
