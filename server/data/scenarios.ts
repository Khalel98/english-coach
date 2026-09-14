import type { Difficulty } from '../../shared/types'

export type ScenarioCategory = 'everyday' | 'travel' | 'work' | 'social' | 'ai_technology' | 'job_interview'

export interface ScenarioNpc {
  name: string
  role: string
  personality: string
}

export interface Scenario {
  id: string
  category: ScenarioCategory
  title: string
  titleRu: string
  objective: string
  objectiveRu: string
  difficulty: Difficulty
  context: string
  contextRu: string
  npc: ScenarioNpc
  targetSkills: string[]
  possibleSituations: string[]
  successConditions: string[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'restaurant-order',
    category: 'everyday',
    title: 'Ordering at a Restaurant',
    titleRu: 'Заказ в ресторане',
    objective: 'Order a meal and drink, and handle any follow-up questions from the waiter naturally.',
    objectiveRu: 'Закажи еду и напиток и естественно отвечай на уточняющие вопросы официанта.',
    difficulty: 'easy',
    context: 'You are seated at a small neighborhood restaurant. A waiter has just approached your table.',
    contextRu: 'Ты сидишь в небольшом районном ресторане. К твоему столику только что подошёл официант.',
    npc: { name: 'Marco', role: 'waiter', personality: 'friendly, a bit chatty, occasionally recommends dishes' },
    targetSkills: ['polite requests', 'asking about menu items', 'would like / present simple'],
    possibleSituations: ['the dish you want is sold out', 'waiter asks about allergies', 'waiter suggests a substitution'],
    successConditions: ['learner successfully places a complete order', 'learner responds appropriately to at least one follow-up question'],
  },
  {
    id: 'supermarket-checkout',
    category: 'everyday',
    title: 'Finding an Item and Checking Out',
    titleRu: 'Поиск товара и оплата на кассе',
    objective: 'Ask a store employee where to find an item, then complete checkout with the cashier.',
    objectiveRu: 'Спроси у сотрудника магазина, где найти товар, а затем оплати покупку на кассе.',
    difficulty: 'easy',
    context: 'You are in a supermarket looking for a specific item you cannot find.',
    contextRu: 'Ты в супермаркете ищешь конкретный товар, который никак не можешь найти.',
    npc: { name: 'Jamie', role: 'store employee / cashier', personality: 'helpful but busy, gives quick directions' },
    targetSkills: ['asking where something is', 'prepositions of place', 'checkout small talk'],
    possibleSituations: ['the item is out of stock', 'employee asks if you need a bag', 'a small payment issue comes up'],
    successConditions: ['learner successfully asks for and receives directions', 'learner completes a natural checkout exchange'],
  },
  {
    id: 'directions',
    category: 'everyday',
    title: 'Asking for Directions',
    titleRu: 'Как спросить дорогу',
    objective: 'Ask a stranger for directions to a nearby place and understand their instructions.',
    objectiveRu: 'Спроси у незнакомца, как пройти к ближайшему месту, и пойми его объяснения.',
    difficulty: 'easy',
    context: 'You are lost on a street corner in an unfamiliar city and need to find your way.',
    contextRu: 'Ты заблудился на углу улицы в незнакомом городе и пытаешься сориентироваться.',
    npc: { name: 'a passerby', role: 'local resident', personality: 'polite, gives directions with landmarks' },
    targetSkills: ['asking for directions', 'prepositions of movement', 'understanding sequential instructions'],
    possibleSituations: ['the passerby is not sure and suggests asking someone else', 'directions involve multiple turns', 'passerby asks where you are headed and why'],
    successConditions: ['learner asks a clear question', 'learner confirms understanding of the directions given'],
  },
  {
    id: 'airport-checkin',
    category: 'travel',
    title: 'Airport Check-in',
    titleRu: 'Регистрация в аэропорту',
    objective: 'Check in for a flight, answer standard questions, and handle a minor complication.',
    objectiveRu: 'Пройди регистрацию на рейс, ответь на стандартные вопросы и справься с небольшой проблемой.',
    difficulty: 'normal',
    context: 'You are at the airline check-in counter for an international flight.',
    contextRu: 'Ты на стойке регистрации авиакомпании перед международным рейсом.',
    npc: { name: 'Alex', role: 'check-in agent', personality: 'professional, efficient, follows a routine but adapts' },
    targetSkills: ['answering yes/no travel questions', 'describing luggage', 'polite clarification questions'],
    possibleSituations: ['your luggage is overweight', 'a seat preference question', 'a document issue'],
    successConditions: ['learner completes check-in', 'learner handles at least one complication in English'],
  },
  {
    id: 'hotel-checkin',
    category: 'travel',
    title: 'Hotel Check-in with a Problem',
    titleRu: 'Заселение в отель с проблемой',
    objective: 'Check into a hotel and report a problem with your room.',
    objectiveRu: 'Заселись в отель и сообщи о проблеме с номером.',
    difficulty: 'normal',
    context: 'You have just arrived at your hotel after a long trip and go to the front desk.',
    contextRu: 'Ты только что добрался до отеля после долгой поездки и подходишь к стойке ресепшена.',
    npc: { name: 'Priya', role: 'hotel receptionist', personality: 'warm, apologetic when things go wrong, solution-oriented' },
    targetSkills: ['describing a problem', 'polite complaints', 'requesting a solution'],
    possibleSituations: ['the reservation is not found at first', 'the room has an issue (noise, AC not working)', 'receptionist offers alternatives'],
    successConditions: ['learner completes check-in', 'learner clearly describes a problem and asks for a resolution'],
  },
  {
    id: 'work-meeting',
    category: 'work',
    title: 'Explaining a Problem in a Meeting',
    titleRu: 'Объяснение проблемы на встрече',
    objective: 'Explain a work problem to a colleague and discuss possible next steps.',
    objectiveRu: 'Объясни рабочую проблему коллеге и обсуди возможные следующие шаги.',
    difficulty: 'normal',
    context: 'You are in a short meeting with a colleague to discuss an issue that came up in a project.',
    contextRu: 'У тебя короткая встреча с коллегой, чтобы обсудить проблему, возникшую в проекте.',
    npc: { name: 'Sam', role: 'colleague / project lead', personality: 'direct, asks clarifying questions, wants concrete next steps' },
    targetSkills: ['explaining cause and effect', 'proposing solutions', 'professional register'],
    possibleSituations: ['colleague asks for more detail', 'colleague disagrees with your proposed cause', 'colleague asks for a timeline'],
    successConditions: ['learner clearly explains the problem', 'learner proposes at least one next step'],
  },
  {
    id: 'work-disagreement',
    category: 'work',
    title: 'Disagreeing with a Colleague',
    titleRu: 'Несогласие с коллегой',
    objective: "Politely disagree with a colleague's approach and suggest an alternative.",
    objectiveRu: 'Вежливо не согласись с подходом коллеги и предложи альтернативу.',
    difficulty: 'hard',
    context: 'A colleague has just proposed an approach you think has a flaw, in a casual discussion.',
    contextRu: 'Коллега только что предложил подход, в котором, как тебе кажется, есть изъян — разговор неформальный.',
    npc: { name: 'Taylor', role: 'colleague', personality: 'confident, mildly defensive if challenged bluntly, responds well to diplomatic pushback' },
    targetSkills: ['polite disagreement phrases', 'hedging language', 'justifying an opinion'],
    possibleSituations: ['colleague pushes back on your first attempt', 'colleague asks you to justify your concern', 'colleague eventually concedes a point'],
    successConditions: ['learner disagrees without being either silent or rude', 'learner gives at least one reason for their position'],
  },
  {
    id: 'meeting-new-person',
    category: 'social',
    title: 'Meeting Someone New',
    titleRu: 'Знакомство с новым человеком',
    objective: 'Introduce yourself to a new person and keep a natural small-talk conversation going.',
    objectiveRu: 'Представься новому человеку и поддержи естественную непринуждённую беседу.',
    difficulty: 'easy',
    context: 'You are at a casual social gathering and strike up a conversation with someone you have not met.',
    contextRu: 'Ты на неформальной встрече и заводишь разговор с человеком, с которым ещё не знаком.',
    npc: { name: 'Jordan', role: 'fellow guest', personality: 'friendly, curious, asks a lot of light follow-up questions' },
    targetSkills: ['self-introduction', 'small talk questions', 'active listening responses'],
    possibleSituations: ['they ask what you do for work', 'a shared interest comes up', 'the conversation naturally winds down'],
    successConditions: ['learner introduces themselves', 'learner asks at least one question back'],
  },
  {
    id: 'explain-ml-concept',
    category: 'ai_technology',
    title: 'Explaining an ML Concept',
    titleRu: 'Объяснение концепции ML',
    objective: 'Explain a machine learning concept of your choice to a curious but non-expert colleague.',
    objectiveRu: 'Объясни концепцию машинного обучения на свой выбор любопытному, но не техническому коллеге.',
    difficulty: 'hard',
    context: 'A colleague from a different team is curious about your work and asks you to explain something you are working on.',
    contextRu: 'Коллеге из другой команды интересна твоя работа, и он просит объяснить, над чем ты трудишься.',
    npc: { name: 'Riley', role: 'colleague from another team', personality: 'genuinely curious, non-technical, asks simplifying follow-up questions' },
    targetSkills: ['technical explanation in plain language', 'analogies', 'handling "why" follow-up questions'],
    possibleSituations: ['colleague asks for an analogy', 'colleague misunderstands and you must clarify', 'colleague asks a "so what" business-impact question'],
    successConditions: ['learner explains the concept without excessive jargon', 'learner successfully clarifies at least one misunderstanding'],
  },
  {
    id: 'job-interview-hr',
    category: 'job_interview',
    title: 'HR Interview',
    titleRu: 'Собеседование с HR',
    objective: 'Answer standard HR interview questions about yourself and your experience.',
    objectiveRu: 'Ответь на стандартные вопросы HR-собеседования о себе и своём опыте.',
    difficulty: 'hard',
    context: 'You are in an HR screening interview for a job you applied to.',
    contextRu: 'Ты на отборочном HR-собеседовании на позицию, на которую откликнулся.',
    npc: { name: 'Morgan', role: 'HR recruiter', personality: 'professional, warm but evaluative, asks standard behavioral questions' },
    targetSkills: ['self-presentation', 'narrating past experience', 'answering "why" questions'],
    possibleSituations: ['asked to describe a challenge you overcame', 'asked about salary expectations', 'asked if you have questions for them'],
    successConditions: ['learner gives a complete self-introduction', 'learner answers at least one behavioral question with a concrete example'],
  },
]

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id)
}
