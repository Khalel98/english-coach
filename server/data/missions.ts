export type MissionSkillFocus = 'speaking' | 'writing' | 'vocabulary' | 'listening' | 'confidence'

export interface Mission {
  id: string
  title: string
  titleRu: string
  instruction: string
  instructionRu: string
  skillFocus: MissionSkillFocus
  estimatedMinutes: number
}

export const MISSIONS: Mission[] = [
  {
    id: 'ask-directions',
    title: 'Ask for Directions',
    titleRu: 'Спроси дорогу',
    instruction: 'Ask someone in English where the nearest coffee shop (or any place) is — a coworker, a language-exchange app like Tandem/HelloTalk, or even a voice assistant like Siri/Google.',
    instructionRu: 'Спроси на английском, где находится ближайшая кофейня (или любое другое место) — у коллеги, в приложении для языкового обмена (Tandem, HelloTalk), или даже у голосового ассистента (Siri, Google).',
    skillFocus: 'speaking',
    estimatedMinutes: 5,
  },
  {
    id: 'watch-video-summary',
    title: 'Watch and Summarize',
    titleRu: 'Посмотри и перескажи',
    instruction: 'Watch a 5-minute English video and come back to explain what you understood.',
    instructionRu: 'Посмотри 5-минутное видео на английском и вернись, чтобы рассказать, что ты понял.',
    skillFocus: 'listening',
    estimatedMinutes: 10,
  },
  {
    id: 'write-message-colleague',
    title: 'Write a Message',
    titleRu: 'Напиши сообщение',
    instruction: 'Write a short English message to a colleague or friend — about anything real.',
    instructionRu: 'Напиши короткое сообщение на английском коллеге или другу — о чём-то реальном.',
    skillFocus: 'writing',
    estimatedMinutes: 5,
  },
  {
    id: 'order-in-english',
    title: 'Order in English',
    titleRu: 'Закажи на английском',
    instruction: 'Order something in English — food, coffee, a product. Switch a delivery app to English and order that way if there is no one to talk to in person.',
    instructionRu: 'Закажи что-нибудь на английском — еду, кофе, товар. Если не с кем поговорить вживую, переключи приложение доставки на английский и закажи через него.',
    skillFocus: 'speaking',
    estimatedMinutes: 5,
  },
  {
    id: 'record-workday',
    title: 'Narrate Your Day',
    titleRu: 'Расскажи о своём дне',
    instruction: 'Record yourself (voice memo is fine) explaining what you worked on today.',
    instructionRu: 'Запиши себя (голосовое сообщение подойдёт) рассказывающим, над чем ты сегодня работал.',
    skillFocus: 'speaking',
    estimatedMinutes: 5,
  },
  {
    id: 'small-talk-stranger',
    title: 'Small Talk',
    titleRu: 'Лёгкий разговор',
    instruction: "Start a short small-talk conversation in English. No one around who speaks English? Use a language-exchange app (Tandem, HelloTalk, Speaky), post in an English-learning Discord/Reddit community, or just have a real small-talk exchange with this app's Chat instead.",
    instructionRu: 'Заведи короткий непринуждённый разговор на английском. Не с кем поговорить вживую? Используй приложение для языкового обмена (Tandem, HelloTalk, Speaky), напиши в Discord/Reddit-сообществе для изучающих английский, или просто используй раздел «Чат» в этом приложении.',
    skillFocus: 'confidence',
    estimatedMinutes: 5,
  },
  {
    id: 'read-article-summary',
    title: 'Read and Summarize',
    titleRu: 'Прочитай и перескажи',
    instruction: 'Read a short English news article and summarize it in 3 sentences.',
    instructionRu: 'Прочитай короткую новостную статью на английском и перескажи её в 3 предложениях.',
    skillFocus: 'vocabulary',
    estimatedMinutes: 10,
  },
  {
    id: 'leave-review',
    title: 'Write a Review',
    titleRu: 'Напиши отзыв',
    instruction: 'Write an English review for a product, app, or place you used recently.',
    instructionRu: 'Напиши отзыв на английском о продукте, приложении или месте, которым недавно пользовался.',
    skillFocus: 'writing',
    estimatedMinutes: 5,
  },
  {
    id: 'explain-hobby',
    title: 'Explain a Hobby',
    titleRu: 'Расскажи о хобби',
    instruction: 'Explain one of your hobbies in English to someone, or record yourself doing so.',
    instructionRu: 'Расскажи кому-нибудь на английском о своём хобби или запиши себя рассказывающим об этом.',
    skillFocus: 'speaking',
    estimatedMinutes: 5,
  },
  {
    id: 'english-only-hour',
    title: 'English-Only Hour',
    titleRu: 'Час только на английском',
    instruction: 'Spend one hour with your devices/apps set to English, and narrate your thoughts in English while doing a task.',
    instructionRu: 'Проведи час с устройствами/приложениями на английском и проговаривай свои мысли на английском, выполняя задачу.',
    skillFocus: 'confidence',
    estimatedMinutes: 60,
  },
]

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find(m => m.id === id)
}
