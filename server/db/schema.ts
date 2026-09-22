import { pgTable, serial, text, integer, timestamp, unique, jsonb, boolean } from 'drizzle-orm/pg-core'

export const mistakes = pgTable('mistakes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  mistakeType: text('mistake_type').notNull(), // 'grammar' | 'vocabulary'
  topic: text('topic').notNull(), // normalized, e.g. 'present_perfect'
  incorrectExample: text('incorrect_example').notNull(),
  correctExample: text('correct_example').notNull(),
  explanation: text('explanation').notNull(),
  occurrences: integer('occurrences').notNull().default(1),
  confidence: text('confidence').notNull(), // 'low' | 'medium' | 'high'
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
}, table => ({
  userTopicUnique: unique().on(table.userId, table.mistakeType, table.topic),
}))

export type MistakeRow = typeof mistakes.$inferSelect
export type NewMistakeRow = typeof mistakes.$inferInsert

export const missionLogs = pgTable('mission_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  missionId: text('mission_id').notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  reflectionText: text('reflection_text'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  engagement: text('engagement'), // 'low' | 'medium' | 'high', set on completion
  evaluationSummary: text('evaluation_summary'),
  skipped: boolean('skipped').notNull().default(false), // learner declined this mission — doesn't count as a genuine attempt
})

export type MissionLogRow = typeof missionLogs.$inferSelect
export type NewMissionLogRow = typeof missionLogs.$inferInsert

export const bossBattleLogs = pgTable('boss_battle_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  bossBattleId: text('boss_battle_id').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  verdict: text('verdict').notNull(), // 'defeated' | 'not_defeated'
  dimensions: jsonb('dimensions').notNull(), // Record<string, 'weak'|'developing'|'strong'>
  topStrengths: jsonb('top_strengths').notNull(),
  topWeaknesses: jsonb('top_weaknesses').notNull(),
  summary: text('summary').notNull(),
})

export type BossBattleLogRow = typeof bossBattleLogs.$inferSelect
export type NewBossBattleLogRow = typeof bossBattleLogs.$inferInsert

export const userProfile = pgTable('user_profile', {
  userId: text('user_id').primaryKey(),
  estimatedLevel: text('estimated_level').notNull(),
  learningGoal: text('learning_goal').notNull(),
  preferredDifficulty: text('preferred_difficulty').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type UserProfileRow = typeof userProfile.$inferSelect
export type NewUserProfileRow = typeof userProfile.$inferInsert

export const placementTestResults = pgTable('placement_test_results', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  takenAt: timestamp('taken_at', { withTimezone: true }).notNull().defaultNow(),
  cefrLevel: text('cefr_level').notNull(), // 'A1'..'C2'
  estimatedLevel: text('estimated_level').notNull(), // mapped to our EnglishLevel scale
  grammarBreakdown: jsonb('grammar_breakdown').notNull(), // { topic, cefrLevel, correct }[]
  vocabularyBreakdown: jsonb('vocabulary_breakdown').notNull(), // { topic, cefrLevel, correct }[]
  fluencyNotes: text('fluency_notes').notNull(),
  rawScore: jsonb('raw_score').notNull(), // { grammarCorrect, grammarTotal, vocabularyCorrect, vocabularyTotal }
})

export type PlacementTestResultRow = typeof placementTestResults.$inferSelect
export type NewPlacementTestResultRow = typeof placementTestResults.$inferInsert

export const vocabularyWords = pgTable('vocabulary_words', {
  id: serial('id').primaryKey(),
  word: text('word').notNull().unique(),
  cefrLevel: text('cefr_level').notNull(),
  translationRu: text('translation_ru').notNull(),
  exampleSentence: text('example_sentence').notNull(),
})

export type VocabularyWordRow = typeof vocabularyWords.$inferSelect
export type NewVocabularyWordRow = typeof vocabularyWords.$inferInsert

export const vocabularyProgress = pgTable('vocabulary_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  wordId: integer('word_id').notNull(),
  timesReviewed: integer('times_reviewed').notNull().default(0),
  correctStreak: integer('correct_streak').notNull().default(0),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  nextReviewAt: timestamp('next_review_at', { withTimezone: true }).notNull().defaultNow(),
}, table => ({
  userWordUnique: unique().on(table.userId, table.wordId),
}))

export type VocabularyProgressRow = typeof vocabularyProgress.$inferSelect
export type NewVocabularyProgressRow = typeof vocabularyProgress.$inferInsert

export const grammarDrillLogs = pgTable('grammar_drill_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  topic: text('topic').notNull(),
  correct: integer('correct').notNull(),
  total: integer('total').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GrammarDrillLogRow = typeof grammarDrillLogs.$inferSelect
export type NewGrammarDrillLogRow = typeof grammarDrillLogs.$inferInsert

export const grammarTopicExplanations = pgTable('grammar_topic_explanations', {
  topic: text('topic').primaryKey(),
  explanationRu: text('explanation_ru').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GrammarTopicExplanationRow = typeof grammarTopicExplanations.$inferSelect
