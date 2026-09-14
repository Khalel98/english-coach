import type { MistakeRow, MissionLogRow, BossBattleLogRow } from '../db/schema'
import type { UserProfile, EnglishDnaProfile, DnaDimension, DnaRating } from '../../shared/types'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const DORMANT_DAYS = 7

interface BuildParams {
  mistakes: MistakeRow[]
  missionLogs: MissionLogRow[]
  bossBattleLogs: BossBattleLogRow[]
  profile: UserProfile
  now: Date
}

// Used only to build the Russian narrative sentences below — the dimension
// keys themselves (returned in strongestSkills/weakestSkills) stay
// language-neutral so the UI decides how to label them.
const DIMENSION_LABEL_RU: Record<string, string> = {
  grammar: 'грамматика',
  vocabulary: 'словарный запас',
  fluency: 'беглость речи',
  technicalEnglish: 'технический английский',
  everydayEnglish: 'бытовой английский',
  listening: 'восприятие на слух',
  confidence: 'уверенность',
}

function mistakeBasedDimension(entries: MistakeRow[], labelRu: string): DnaDimension {
  if (entries.length === 0) {
    return {
      rating: 'insufficient_data',
      confidence: 'low',
      basis: `Пока не найдено повторяющихся проблем с категорией «${labelRu}» в разговорах — данных недостаточно ни в ту, ни в другую сторону.`,
    }
  }
  const hasHighConfidence = entries.some(e => e.confidence === 'high')
  return {
    rating: hasHighConfidence ? 'weak' : 'developing',
    confidence: 'low', // passive mistake tallies alone are weaker evidence than a graded assessment
    basis: `На основе ${entries.length} повторяющихся паттернов («${labelRu}»), замеченных в разговорах (например, «${entries[0]!.topic}»).`,
  }
}

function bossBattleDimension(
  bossBattleLogs: BossBattleLogRow[],
  key: string,
  labelRu: string,
): DnaDimension {
  if (bossBattleLogs.length === 0) {
    return {
      rating: 'insufficient_data',
      confidence: 'low',
      basis: `Пока не пройдено ни одного Boss Battle — «${labelRu}» ещё не оценивалась напрямую.`,
    }
  }
  const latest = bossBattleLogs[0]! // caller passes them pre-sorted, most recent first
  const dims = latest.dimensions as Record<string, DnaRating>
  return {
    rating: dims[key] ?? 'insufficient_data',
    confidence: bossBattleLogs.length >= 2 ? 'high' : 'medium',
    basis: `На основе последнего Boss Battle (всего пройдено: ${bossBattleLogs.length}).`,
  }
}

function grammarOrVocabDimension(
  entries: MistakeRow[],
  bossBattleLogs: BossBattleLogRow[],
  key: 'grammar' | 'vocabulary',
): DnaDimension {
  // A graded Boss Battle is stronger evidence than a passive mistake tally,
  // so it takes precedence when available.
  if (bossBattleLogs.length > 0) return bossBattleDimension(bossBattleLogs, key, DIMENSION_LABEL_RU[key]!)
  return mistakeBasedDimension(entries, DIMENSION_LABEL_RU[key]!)
}

function weekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() // 0 = Sunday
  const diffToMonday = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diffToMonday)
  return d
}

function buildActivityTrend(missionLogs: MissionLogRow[], now: Date, weeks = 4) {
  const buckets: { weekStart: string; missionsCompleted: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = weekStart(new Date(now.getTime() - i * 7 * MS_PER_DAY))
    const end = new Date(start.getTime() + 7 * MS_PER_DAY)
    const count = missionLogs.filter(m => m.completedAt && m.completedAt >= start && m.completedAt < end).length
    buckets.push({ weekStart: start.toISOString().slice(0, 10), missionsCompleted: count })
  }
  return buckets
}

export function buildEnglishDna({ mistakes, missionLogs, bossBattleLogs, profile, now }: BuildParams): EnglishDnaProfile {
  const sortedBattles = [...bossBattleLogs].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
  const latestBattle = sortedBattles[0]

  const grammarEntries = mistakes.filter(m => m.mistakeType === 'grammar' && m.confidence !== 'low')
  const vocabEntries = mistakes.filter(m => m.mistakeType === 'vocabulary' && m.confidence !== 'low')

  const dimensions = {
    grammar: grammarOrVocabDimension(grammarEntries, sortedBattles, 'grammar'),
    vocabulary: grammarOrVocabDimension(vocabEntries, sortedBattles, 'vocabulary'),
    fluency: bossBattleDimension(sortedBattles, 'fluency', DIMENSION_LABEL_RU.fluency!),
    technicalEnglish: bossBattleDimension(sortedBattles, 'technicalEnglish', DIMENSION_LABEL_RU.technicalEnglish!),
    confidence: bossBattleDimension(sortedBattles, 'confidence', DIMENSION_LABEL_RU.confidence!),
    // Honest gaps — nothing in the app currently assesses these directly.
    everydayEnglish: {
      rating: 'insufficient_data' as DnaRating,
      confidence: 'low' as const,
      basis: 'Пока не было формальной оценки бытовых ситуаций — единственный Boss Battle сейчас это техническое собеседование.',
    },
    listening: {
      rating: 'insufficient_data' as DnaRating,
      confidence: 'low' as const,
      basis: 'Восприятие на слух пока не оценивается — в приложении нет аудио/голосовой функции.',
    },
  }

  const recurringMistakes = mistakes
    .filter(m => m.confidence !== 'low')
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 5)
    .map(m => ({ mistakeType: m.mistakeType, topic: m.topic, occurrences: m.occurrences }))

  const mistakesYouStoppedMaking = mistakes
    .filter(m => m.occurrences >= 3 && (now.getTime() - m.lastSeenAt.getTime()) / MS_PER_DAY > DORMANT_DAYS)
    .map(m => ({ mistakeType: m.mistakeType, topic: m.topic }))

  // Dimension identity stays language-neutral — the UI maps these keys to
  // localized labels. Only the narrative sentences below are Russian prose.
  const strongestSkills = (Object.keys(dimensions) as (keyof typeof dimensions)[])
    .filter(k => dimensions[k].rating === 'strong')

  const weakestSkills = (Object.keys(dimensions) as (keyof typeof dimensions)[])
    .filter(k => dimensions[k].rating === 'weak')

  const completedMissions = missionLogs.filter(m => m.completedAt)
  const activityTrend = buildActivityTrend(missionLogs, now)

  const dataPoints = mistakes.length + completedMissions.length + bossBattleLogs.length * 3
  const dataConfidence = dataPoints === 0 ? 'low' : bossBattleLogs.length > 0 && dataPoints >= 6 ? 'high' : 'medium'

  const overallLevelNote = latestBattle
    ? latestBattle.verdict === 'defeated'
      ? 'Результат последнего Boss Battle подтверждает этот самооценённый уровень.'
      : 'Последний Boss Battle показывает разрыв между самооценкой уровня и реальной результативностью без подсказок — это нормально и стоит над этим поработать.'
    : 'Это твоя собственная самооценка — пройди Boss Battle для объективной проверки.'

  const strongestSkillsRu = strongestSkills.map(k => DIMENSION_LABEL_RU[k]!)
  const weakestSkillsRu = weakestSkills.map(k => DIMENSION_LABEL_RU[k]!)

  const narrative = {
    whyThisLevel: `Ты оценил свой уровень как «${profile.estimatedLevel}». ${overallLevelNote}`,
    whatYoureDoingWell: strongestSkillsRu.length > 0
      ? `Сейчас сильнее всего у тебя: ${strongestSkillsRu.join(', ')}.`
      : 'Пока недостаточно объективных данных, чтобы уверенно назвать сильную сторону — пройди Boss Battle или несколько сценариев, чтобы накопить реальную картину.',
    whatsHoldingYouBack: weakestSkillsRu.length > 0 || recurringMistakes.length > 0
      ? [
          weakestSkillsRu.length > 0 ? `Самые слабые оценённые области: ${weakestSkillsRu.join(', ')}.` : '',
          recurringMistakes.length > 0 ? `Самый частый паттерн: ${recurringMistakes[0]!.mistakeType}/${recurringMistakes[0]!.topic} (встречался ${recurringMistakes[0]!.occurrences} раз).` : '',
        ].filter(Boolean).join(' ')
      : 'Явных блокеров пока не выявлено — продолжай практиковаться, чтобы накопить данные.',
    whatToStudyNext: recurringMistakes.length > 0
      ? `Сосредоточься на ситуациях, где естественно требуется «${recurringMistakes[0]!.topic.replace(/_/g, ' ')}» — реальные разговоры, а не зубрёжка, быстрее всего это исправят.`
      : 'Продолжай разнообразные разговоры и попробуй пару сценариев — это покажет, на чём сфокусироваться дальше.',
  }

  return {
    overallLevel: { stated: profile.estimatedLevel, note: overallLevelNote },
    dataConfidence,
    dimensions,
    recurringMistakes,
    mistakesYouStoppedMaking,
    strongestSkills,
    weakestSkills,
    activityTrend,
    narrative,
  }
}
