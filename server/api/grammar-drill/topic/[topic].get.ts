import { getTopicExplanation, getTopicHistory, findTopicMeta } from '../../../services/grammarDrillService'

export default defineEventHandler(async (event) => {
  const topic = getRouterParam(event, 'topic')!
  const meta = findTopicMeta(topic)

  const [explanation, history] = await Promise.all([
    getTopicExplanation(topic),
    getTopicHistory(topic),
  ])

  return {
    topic,
    labelRu: meta.labelRu,
    category: meta.category,
    categoryRu: meta.categoryRu,
    explanationRu: explanation.explanationRu,
    history,
  }
})
