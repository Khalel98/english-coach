export interface BossBattleBeat {
  id: string
  instruction: string
}

export interface BossBattle {
  id: string
  title: string
  titleRu: string
  description: string
  descriptionRu: string
  npc: { name: string; role: string; personality: string }
  beats: BossBattleBeat[]
}

export const BOSS_BATTLES: BossBattle[] = [
  {
    id: 'ai-engineer-interview',
    title: 'AI Engineer Job Interview',
    titleRu: 'Собеседование на AI Engineer',
    description: 'A full interview loop for an AI/ML Engineer role — introduction, experience, a technical question, explaining a concept, an unexpected curveball, and your own question back.',
    descriptionRu: 'Полноценное собеседование на роль AI/ML Engineer — знакомство, опыт, технический вопрос, объяснение концепции, неожиданная ситуация и твой вопрос интервьюеру.',
    npc: {
      name: 'Dr. Sarah Kim',
      role: 'Engineering Manager conducting a combined HR + technical interview',
      personality: 'professional, attentive, moderately demanding — friendly but evaluative, presses for specifics when answers are vague',
    },
    beats: [
      { id: 'introduction', instruction: 'Ask the candidate to introduce themselves.' },
      { id: 'experience', instruction: "Ask about the candidate's relevant experience — what they've worked on." },
      { id: 'technical_question', instruction: 'Ask one concrete technical question relevant to AI/ML engineering (e.g. about model evaluation, overfitting, data pipelines, or system design) and press for a real answer, not just a definition.' },
      { id: 'explain_concept', instruction: 'Ask the candidate to explain an ML concept of their choice in plain terms, as if to a non-technical stakeholder.' },
      { id: 'unexpected_situation', instruction: 'Introduce a realistic curveball — e.g. a project failed, a disagreement with a teammate, an ambiguous requirement — and ask how they would handle it.' },
      { id: 'question_back', instruction: 'Once the above is covered, ask the candidate if they have any questions for you, and answer naturally in character.' },
    ],
  },
  {
    id: 'general-job-interview',
    title: 'General Job Interview',
    titleRu: 'Обычное собеседование на работу',
    description: 'A standard job interview for any professional role — introduction, experience, strengths and weaknesses, a behavioral question, an unexpected curveball, and your own question back.',
    descriptionRu: 'Стандартное собеседование на любую профессиональную роль — знакомство, опыт, сильные и слабые стороны, поведенческий вопрос, неожиданная ситуация и твой вопрос интервьюеру.',
    npc: {
      name: 'Mr. James Carter',
      role: 'Hiring Manager conducting a general, non-technical interview',
      personality: 'friendly but professional, evaluative, listens carefully and asks natural follow-up questions',
    },
    beats: [
      { id: 'introduction', instruction: 'Ask the candidate to introduce themselves.' },
      { id: 'experience', instruction: 'Ask about their relevant work experience and a key achievement.' },
      { id: 'strengths_weaknesses', instruction: "Ask about a key strength and a weakness they're working on." },
      { id: 'behavioral_question', instruction: 'Ask a behavioral question — e.g. about handling conflict with a colleague or a tight deadline — and press for a real example, not a generic answer.' },
      { id: 'unexpected_situation', instruction: 'Introduce a realistic curveball — e.g. a scheduling conflict, or an unexpected question about a gap in their résumé — and see how they respond.' },
      { id: 'question_back', instruction: 'Once the above is covered, ask if they have questions for you, and answer naturally in character.' },
    ],
  },
  {
    id: 'customer-escalation',
    title: 'Customer Service Escalation',
    titleRu: 'Эскалация в поддержке клиентов',
    description: 'You are a customer service representative handling an increasingly frustrated customer on a call — de-escalate, solve the problem, and keep them as a customer.',
    descriptionRu: 'Ты сотрудник поддержки и разговариваешь со всё более раздражённым клиентом — нужно снизить напряжение, решить проблему и сохранить клиента.',
    npc: {
      name: 'Diane Foster',
      role: 'an upset customer calling about a serious service failure',
      personality: 'starts frustrated and impatient, tests whether you stay calm and professional, softens if handled well but escalates further if dismissed',
    },
    beats: [
      { id: 'opening_complaint', instruction: 'Open the call already upset about a real, specific problem (e.g. a double charge, a canceled order, a missed delivery).' },
      { id: 'explain_issue', instruction: 'Make the candidate work to get the full details of the issue and demonstrate they actually understood it.' },
      { id: 'pushback', instruction: 'Push back on the first proposed solution as insufficient — ask for more.' },
      { id: 'resolution', instruction: 'Once a fair resolution is offered, gradually calm down and accept it.' },
      { id: 'unexpected_situation', instruction: 'Bring up a second, unrelated complaint out of frustration, to test whether the candidate can handle scope creep calmly.' },
      { id: 'closing', instruction: 'Wrap up the call — have the candidate confirm next steps, then close the interaction naturally in character.' },
    ],
  },
  {
    id: 'travel-emergency',
    title: 'Travel Emergency',
    titleRu: 'Внештатная ситуация в поездке',
    description: 'You are traveling abroad and something has gone seriously wrong — handle the situation in real time, in English, with airport staff.',
    descriptionRu: 'Ты путешествуешь за границей, и что-то пошло серьёзно не так — разберись с ситуацией в реальном времени на английском с сотрудником аэропорта.',
    npc: {
      name: 'Officer Reyes',
      role: 'airport / airline staff member helping with a travel emergency',
      personality: 'professional, busy, wants clear and concise information, moderately sympathetic but has limited time',
    },
    beats: [
      { id: 'explain_situation', instruction: 'Ask the traveler to explain what happened (e.g. a missed connecting flight, a lost passport, a canceled flight).' },
      { id: 'gather_details', instruction: 'Ask clarifying questions to pin down the exact situation (booking reference, timing, documents) — press for specifics.' },
      { id: 'propose_options', instruction: 'Offer a couple of limited, realistic options and make the traveler decide clearly between them.' },
      { id: 'unexpected_complication', instruction: 'Introduce a complication — e.g. the suggested flight is also full, or a required document is missing — and see how they react.' },
      { id: 'negotiate', instruction: 'See whether the traveler can negotiate or ask for alternatives assertively but politely, without becoming rude.' },
      { id: 'wrap_up', instruction: 'Conclude with next steps and confirm the traveler understood them, in character.' },
    ],
  },
]

export function getBossBattle(id: string): BossBattle | undefined {
  return BOSS_BATTLES.find(b => b.id === id)
}
