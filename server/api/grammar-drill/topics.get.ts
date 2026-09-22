import { getGrammarTopicGroupsWithStats } from '../../services/grammarDrillService'

export default defineEventHandler(async () => {
  return { groups: await getGrammarTopicGroupsWithStats() }
})
