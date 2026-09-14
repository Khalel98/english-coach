import { getDb } from '../db/client'
import { placementTestResults } from '../db/schema'
import { OWNER_USER_ID } from '../utils/constants'
import { updateUserProfile } from '../utils/userProfile'
import { recordMistake } from './memory'
import { assessFluency } from './placementAssessment'
import { CEFR_LEVELS } from '../data/placementQuestions'
import {
  gradeHistory,
  pickNextQuestion,
  computeSkillLevelIndex,
  cefrToEnglishLevel,
  combineFinalCefrLevel,
  type AnsweredHistoryItem,
} from './placementTest'
import type { PlacementQuestionView, PlacementTestResultView } from '../../shared/types'

function toPublicQuestion(q: { id: string; skill: string; cefrLevel: string; prompt: string; options: string[] }): PlacementQuestionView {
  return { id: q.id, skill: q.skill as 'grammar' | 'vocabulary', cefrLevel: q.cefrLevel as never, prompt: q.prompt, options: q.options }
}

/** Returns the next question to ask, or null once both skills have reached their quota (signals: move to the open-dialogue phase). */
export function getNextPlacementQuestion(history: AnsweredHistoryItem[]): PlacementQuestionView | null {
  const graded = gradeHistory(history)
  const question = pickNextQuestion('grammar', graded) ?? pickNextQuestion('vocabulary', graded)
  return question ? toPublicQuestion(question) : null
}

const GAP_INCREMENT = 3 // a missed test question is stronger evidence than one incidental chat slip, so it seeds medium confidence immediately

export async function finishPlacementTest(history: AnsweredHistoryItem[], openAnswers: string[]): Promise<PlacementTestResultView> {
  const graded = gradeHistory(history)

  const grammarIndex = computeSkillLevelIndex(graded, 'grammar')
  const vocabularyIndex = computeSkillLevelIndex(graded, 'vocabulary')

  const fluency = await assessFluency(openAnswers)
  const fluencyIndex = CEFR_LEVELS.indexOf(fluency.cefrLevel)

  const finalCefr = combineFinalCefrLevel(grammarIndex, vocabularyIndex, fluencyIndex)
  const finalEnglishLevel = cefrToEnglishLevel(finalCefr)

  await updateUserProfile({ estimatedLevel: finalEnglishLevel })

  // Seed real gaps directly into the mistakes table so the existing Learner
  // Model / session-focus machinery picks them up immediately — no need for
  // a parallel "test gaps" data path.
  const gaps = graded.filter(g => !g.correct)
  await Promise.all(gaps.map(g => recordMistake({
    mistakeType: g.skill,
    topic: g.topic,
    incorrect: g.promptText.replace('___', `[${g.selectedOptionText}]`),
    correction: g.promptText.replace('___', g.correctOptionText),
    explanation: `Missed on the placement test (${g.cefrLevel} level).`,
  }, GAP_INCREMENT)))

  const db = getDb()
  const [row] = await db.insert(placementTestResults).values({
    userId: OWNER_USER_ID,
    cefrLevel: finalCefr,
    estimatedLevel: finalEnglishLevel,
    grammarBreakdown: graded.filter(g => g.skill === 'grammar').map(g => ({ topic: g.topic, cefrLevel: g.cefrLevel, correct: g.correct })),
    vocabularyBreakdown: graded.filter(g => g.skill === 'vocabulary').map(g => ({ topic: g.topic, cefrLevel: g.cefrLevel, correct: g.correct })),
    fluencyNotes: fluency.notes,
    rawScore: {
      grammarCorrect: graded.filter(g => g.skill === 'grammar' && g.correct).length,
      grammarTotal: graded.filter(g => g.skill === 'grammar').length,
      vocabularyCorrect: graded.filter(g => g.skill === 'vocabulary' && g.correct).length,
      vocabularyTotal: graded.filter(g => g.skill === 'vocabulary').length,
    },
  }).returning()

  return {
    id: row!.id,
    takenAt: row!.takenAt.toISOString(),
    cefrLevel: finalCefr,
    estimatedLevel: finalEnglishLevel,
    grammarScore: { correct: graded.filter(g => g.skill === 'grammar' && g.correct).length, total: graded.filter(g => g.skill === 'grammar').length },
    vocabularyScore: { correct: graded.filter(g => g.skill === 'vocabulary' && g.correct).length, total: graded.filter(g => g.skill === 'vocabulary').length },
    fluencyCefrLevel: fluency.cefrLevel,
    fluencyNotes: fluency.notes,
    gaps: gaps.map(g => ({ skill: g.skill, topic: g.topic, cefrLevel: g.cefrLevel })),
  }
}
