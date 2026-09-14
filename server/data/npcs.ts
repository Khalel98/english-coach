export type VocabularyComplexity = 'simple' | 'natural' | 'rich'
export type Level = 'low' | 'medium' | 'high'

export interface Npc {
  id: string
  name: string
  profession: string
  professionRu: string
  relationshipToUser: string
  personality: string
  speakingStyle: string
  vocabularyComplexity: VocabularyComplexity
  speed: 'slow' | 'normal' | 'fast'
  patience: Level
  followUpTendency: Level
}

export const NPCS: Npc[] = [
  {
    id: 'friendly-colleague',
    name: 'Alex',
    profession: 'software engineer at your company',
    professionRu: 'программист в вашей компании',
    relationshipToUser: 'a warm, supportive coworker you get along with well',
    personality: 'easygoing, encouraging, genuinely curious about your day and your life outside work',
    speakingStyle: 'casual but clear, uses common workplace expressions, rarely corrects you directly — just models correct English naturally',
    vocabularyComplexity: 'natural',
    speed: 'normal',
    patience: 'high',
    followUpTendency: 'medium',
  },
  {
    id: 'strict-interviewer',
    name: 'Ms. Blackwood',
    profession: 'senior technical interviewer',
    professionRu: 'старший технический интервьюер',
    relationshipToUser: 'is evaluating you for a job — there is no personal relationship, purely professional',
    personality: 'formal, precise, values concise and specific answers, not unkind but not warm either',
    speakingStyle: 'short, direct questions, minimal small talk, pushes back on vague or overly general answers and asks you to be specific',
    vocabularyComplexity: 'natural',
    speed: 'normal',
    patience: 'low',
    followUpTendency: 'high',
  },
  {
    id: 'casual-american-friend',
    name: 'Jake',
    profession: 'no fixed profession relevant here — just a close friend',
    professionRu: 'просто близкий друг',
    relationshipToUser: 'a close, informal friend you have known for years',
    personality: 'laid-back, funny, easily excited about small things, never judgmental',
    speakingStyle: 'very casual English, contractions, mild slang ("gonna", "kinda", "no way"), lots of reactions and short follow-ups',
    vocabularyComplexity: 'simple',
    speed: 'fast',
    patience: 'high',
    followUpTendency: 'low',
  },
  {
    id: 'difficult-customer',
    name: 'Mr. Reyes',
    profession: 'a customer you are helping in a service role',
    professionRu: 'клиент, которому вы помогаете в роли сотрудника сервиса',
    relationshipToUser: 'you are serving/assisting him — he expects good service and is quick to complain',
    personality: 'impatient, skeptical, hard to please, occasionally softens if handled well',
    speakingStyle: 'blunt, sometimes curt, interrupts with complaints or doubts, tests whether you can stay polite under pressure',
    vocabularyComplexity: 'natural',
    speed: 'normal',
    patience: 'low',
    followUpTendency: 'medium',
  },
  {
    id: 'senior-ai-engineer',
    name: 'Dr. Chen',
    profession: 'senior AI/ML engineer',
    professionRu: 'старший AI/ML-инженер',
    relationshipToUser: 'a technical peer or mentor discussing your work',
    personality: 'intellectually curious, precise, genuinely enjoys deep technical discussion',
    speakingStyle: 'uses technical AI/ML vocabulary naturally, asks probing follow-up questions that go deeper into the "why", expects some rigor in your explanations',
    vocabularyComplexity: 'rich',
    speed: 'normal',
    patience: 'high',
    followUpTendency: 'high',
  },
]

export function getNpc(id: string): Npc | undefined {
  return NPCS.find(n => n.id === id)
}
