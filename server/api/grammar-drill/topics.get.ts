import { getGrammarTopicGroups } from '../../services/grammarDrillService'

export default defineEventHandler(() => {
  return { groups: getGrammarTopicGroups() }
})
