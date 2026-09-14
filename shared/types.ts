export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type EnglishLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced'

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface UserProfile {
  estimatedLevel: EnglishLevel
  learningGoal: string
  preferredDifficulty: Difficulty
}

export interface ChatRequestBody {
  messages: ChatMessage[]
}

export interface ChatResponseBody {
  message: ChatMessage
}

export interface ScenarioResult {
  completed: boolean
  metConditions: string[]
  summary: string
}

export type BossBattleRating = 'weak' | 'developing' | 'strong'

export interface BossBattleResult {
  verdict: 'defeated' | 'not_defeated'
  dimensions: {
    grammar: BossBattleRating
    vocabulary: BossBattleRating
    fluency: BossBattleRating
    taskCompletion: BossBattleRating
    technicalEnglish: BossBattleRating
    abilityToReact: BossBattleRating
    confidence: BossBattleRating
  }
  topStrengths: string[]
  topWeaknesses: string[]
  mostRepeatedMistakes: string[]
  recommendedPractice: string
  summary: string
}

export interface MissionView {
  id: string
  title: string
  titleRu: string
  instruction: string
  instructionRu: string
  skillFocus: string
  estimatedMinutes: number
}

export interface MissionLogView {
  logId: number
  mission: MissionView
  assignedAt: string
  reflectionText: string | null
  completedAt: string | null
  engagement: 'low' | 'medium' | 'high' | null
  evaluationSummary: string | null
  skipped: boolean
}

export type DnaRating = 'weak' | 'developing' | 'strong' | 'insufficient_data'
export type DnaConfidence = 'low' | 'medium' | 'high'

export interface DnaDimension {
  rating: DnaRating
  confidence: DnaConfidence
  basis: string
}

export interface EnglishDnaProfile {
  overallLevel: { stated: EnglishLevel; note: string }
  dataConfidence: DnaConfidence
  dimensions: {
    grammar: DnaDimension
    vocabulary: DnaDimension
    fluency: DnaDimension
    technicalEnglish: DnaDimension
    everydayEnglish: DnaDimension
    listening: DnaDimension
    confidence: DnaDimension
  }
  recurringMistakes: { mistakeType: string; topic: string; occurrences: number }[]
  mistakesYouStoppedMaking: { mistakeType: string; topic: string }[]
  strongestSkills: string[]
  weakestSkills: string[]
  activityTrend: { weekStart: string; missionsCompleted: number }[]
  narrative: {
    whyThisLevel: string
    whatYoureDoingWell: string
    whatsHoldingYouBack: string
    whatToStudyNext: string
  }
}

export interface MistakeView {
  mistakeType: string
  topic: string
  incorrectExample: string
  correctExample: string
  explanation: string
  occurrences: number
  confidence: 'low' | 'medium' | 'high'
  firstSeenAt: string
  lastSeenAt: string
}

export interface DashboardView {
  profile: { estimatedLevel: EnglishLevel; learningGoal: string }
  placementTestTaken: boolean
  currentMission: MissionLogView | null
  lastMistake: MistakeView | null
  dna: {
    overallLevel: string
    dataConfidence: DnaConfidence
    strongestSkills: string[]
    weakestSkills: string[]
  }
  scenarioCount: number
  recentBossBattles: { bossBattleId: string; verdict: string; completedAt: string }[]
  recentMissions: MissionLogView[]
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface PlacementQuestionView {
  id: string
  skill: 'grammar' | 'vocabulary'
  cefrLevel: CefrLevel
  prompt: string
  options: string[]
}

export interface PlacementTestResultView {
  id: number
  takenAt: string
  cefrLevel: CefrLevel
  estimatedLevel: EnglishLevel
  grammarScore: { correct: number; total: number }
  vocabularyScore: { correct: number; total: number }
  fluencyCefrLevel: CefrLevel
  fluencyNotes: string
  gaps: { skill: 'grammar' | 'vocabulary'; topic: string; cefrLevel: CefrLevel }[]
}

export interface VocabularyCardView {
  id: number
  word: string
  cefrLevel: CefrLevel
  translationRu: string
  exampleSentence: string
}

export interface GrammarDrillQuestion {
  prompt: string
  options: string[]
  correctIndex: number
}

export interface GrammarDrillView {
  topic: string
  explanationRu: string
  questions: GrammarDrillQuestion[]
}

export interface SessionFocusView {
  targetType: 'grammar' | 'vocabulary' | null
  targetTopic: string | null
  skillLevel: 'weak' | 'developing' | null
  difficulty: Difficulty
  maxHints: number
  reason: string
}
