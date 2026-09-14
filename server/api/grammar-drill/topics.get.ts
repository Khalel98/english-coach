import { getAvailableTopics } from '../../services/grammarDrillService'

export default defineEventHandler(() => {
  return { topics: getAvailableTopics() }
})
