import { desc, eq } from 'drizzle-orm'
import { getDb } from '../../db/client'
import { placementTestResults } from '../../db/schema'
import { OWNER_USER_ID } from '../../utils/constants'
import type { PlacementTestResultView, CefrLevel } from '../../../shared/types'

export default defineEventHandler(async (): Promise<PlacementTestResultView[]> => {
  const db = getDb()
  const rows = await db
    .select()
    .from(placementTestResults)
    .where(eq(placementTestResults.userId, OWNER_USER_ID))
    .orderBy(desc(placementTestResults.takenAt))

  return rows.map((row) => {
    const rawScore = row.rawScore as { grammarCorrect: number; grammarTotal: number; vocabularyCorrect: number; vocabularyTotal: number }
    const grammarBreakdown = row.grammarBreakdown as { topic: string; cefrLevel: CefrLevel; correct: boolean }[]
    const vocabularyBreakdown = row.vocabularyBreakdown as { topic: string; cefrLevel: CefrLevel; correct: boolean }[]

    return {
      id: row.id,
      takenAt: row.takenAt.toISOString(),
      cefrLevel: row.cefrLevel as CefrLevel,
      estimatedLevel: row.estimatedLevel as PlacementTestResultView['estimatedLevel'],
      grammarScore: { correct: rawScore.grammarCorrect, total: rawScore.grammarTotal },
      vocabularyScore: { correct: rawScore.vocabularyCorrect, total: rawScore.vocabularyTotal },
      fluencyCefrLevel: row.cefrLevel as CefrLevel, // the stored overall cefrLevel already blends fluency in
      fluencyNotes: row.fluencyNotes,
      gaps: [...grammarBreakdown, ...vocabularyBreakdown]
        .filter(g => !g.correct)
        .map(g => ({ skill: grammarBreakdown.includes(g) ? 'grammar' as const : 'vocabulary' as const, topic: g.topic, cefrLevel: g.cefrLevel })),
    }
  })
})
