import { getAllMistakes } from '../services/memory'

export default defineEventHandler(async () => {
  const rows = await getAllMistakes()

  return rows
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())
    .map(r => ({
      mistakeType: r.mistakeType,
      topic: r.topic,
      incorrectExample: r.incorrectExample,
      correctExample: r.correctExample,
      explanation: r.explanation,
      occurrences: r.occurrences,
      confidence: r.confidence,
      firstSeenAt: r.firstSeenAt.toISOString(),
      lastSeenAt: r.lastSeenAt.toISOString(),
    }))
})
