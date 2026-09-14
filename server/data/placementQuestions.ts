export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type PlacementSkill = 'grammar' | 'vocabulary'

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export interface PlacementQuestion {
  id: string
  skill: PlacementSkill
  cefrLevel: CefrLevel
  topic: string
  prompt: string
  options: string[]
  correctIndex: number
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1
  { id: 'g-a1-1', skill: 'grammar', cefrLevel: 'A1', topic: 'be_verb', prompt: 'She ___ a teacher.', options: ['is', 'are', 'am', 'be'], correctIndex: 0 },
  { id: 'g-a1-2', skill: 'grammar', cefrLevel: 'A1', topic: 'present_simple', prompt: 'I ___ coffee every morning.', options: ['drink', 'drinks', 'drinking', 'to drink'], correctIndex: 0 },
  { id: 'g-a1-3', skill: 'grammar', cefrLevel: 'A1', topic: 'articles', prompt: 'This is ___ apple.', options: ['a', 'an', 'the', '-'], correctIndex: 1 },
  { id: 'v-a1-1', skill: 'vocabulary', cefrLevel: 'A1', topic: 'everyday_nouns', prompt: 'Which word means a place where you sleep?', options: ['kitchen', 'bedroom', 'office', 'garden'], correctIndex: 1 },
  { id: 'v-a1-2', skill: 'vocabulary', cefrLevel: 'A1', topic: 'colors', prompt: 'What color is the sky on a clear day?', options: ['green', 'blue', 'black', 'red'], correctIndex: 1 },
  { id: 'v-a1-3', skill: 'vocabulary', cefrLevel: 'A1', topic: 'numbers', prompt: 'How many days are there in a week?', options: ['five', 'six', 'seven', 'eight'], correctIndex: 2 },

  // A2
  { id: 'g-a2-1', skill: 'grammar', cefrLevel: 'A2', topic: 'past_simple', prompt: 'Yesterday, we ___ to the cinema.', options: ['go', 'goes', 'went', 'going'], correctIndex: 2 },
  { id: 'g-a2-2', skill: 'grammar', cefrLevel: 'A2', topic: 'comparatives', prompt: 'This book is ___ than that one.', options: ['interesting', 'more interesting', 'most interesting', 'interestinger'], correctIndex: 1 },
  { id: 'g-a2-3', skill: 'grammar', cefrLevel: 'A2', topic: 'countable_uncountable', prompt: 'There ___ some milk in the fridge.', options: ['is', 'are', 'be', 'were'], correctIndex: 0 },
  { id: 'v-a2-1', skill: 'vocabulary', cefrLevel: 'A2', topic: 'routines', prompt: 'What do you call the meal you eat in the morning?', options: ['lunch', 'dinner', 'breakfast', 'snack'], correctIndex: 2 },
  { id: 'v-a2-2', skill: 'vocabulary', cefrLevel: 'A2', topic: 'family', prompt: "Your mother's sister is your ___.", options: ['cousin', 'aunt', 'niece', 'grandmother'], correctIndex: 1 },
  { id: 'v-a2-3', skill: 'vocabulary', cefrLevel: 'A2', topic: 'weather', prompt: "It's raining, so take an ___ with you.", options: ['umbrella', 'oven', 'engine', 'instrument'], correctIndex: 0 },

  // B1
  { id: 'g-b1-1', skill: 'grammar', cefrLevel: 'B1', topic: 'present_perfect', prompt: 'I ___ this movie three times already.', options: ['watch', 'watched', 'have watched', 'was watching'], correctIndex: 2 },
  { id: 'g-b1-2', skill: 'grammar', cefrLevel: 'B1', topic: 'first_conditional', prompt: 'If it rains tomorrow, we ___ the picnic.', options: ['cancel', 'will cancel', 'would cancel', 'canceled'], correctIndex: 1 },
  { id: 'g-b1-3', skill: 'grammar', cefrLevel: 'B1', topic: 'modal_verbs', prompt: "You ___ smoke in the hospital — it's not allowed.", options: ["can't", "mustn't", "don't have to", "shouldn't"], correctIndex: 1 },
  { id: 'v-b1-1', skill: 'vocabulary', cefrLevel: 'B1', topic: 'phrasal_verbs', prompt: "Could you please ___ the volume? I can't hear the TV.", options: ['turn up', 'turn off', 'turn into', 'turn out'], correctIndex: 0 },
  { id: 'v-b1-2', skill: 'vocabulary', cefrLevel: 'B1', topic: 'work_vocab', prompt: 'She works as a ___ at a law firm.', options: ['patient', 'lawyer', 'passenger', 'tenant'], correctIndex: 1 },
  { id: 'v-b1-3', skill: 'vocabulary', cefrLevel: 'B1', topic: 'adjectives', prompt: 'The exam was really ___ — I finished it in ten minutes.', options: ['straightforward', 'reluctant', 'tedious', 'ambiguous'], correctIndex: 0 },

  // B2
  { id: 'g-b2-1', skill: 'grammar', cefrLevel: 'B2', topic: 'past_perfect', prompt: 'By the time we arrived, the movie ___ already ___.', options: ['has / started', 'had / started', 'was / starting', 'has / start'], correctIndex: 1 },
  { id: 'g-b2-2', skill: 'grammar', cefrLevel: 'B2', topic: 'passive_voice', prompt: 'The bridge ___ in 1920.', options: ['built', 'was built', 'has built', 'building'], correctIndex: 1 },
  { id: 'g-b2-3', skill: 'grammar', cefrLevel: 'B2', topic: 'second_conditional', prompt: 'If I ___ more time, I would travel the world.', options: ['have', 'had', 'will have', 'would have'], correctIndex: 1 },
  { id: 'v-b2-1', skill: 'vocabulary', cefrLevel: 'B2', topic: 'collocations', prompt: "It's important to ___ a decision before the deadline.", options: ['make', 'do', 'take', 'have'], correctIndex: 0 },
  { id: 'v-b2-2', skill: 'vocabulary', cefrLevel: 'B2', topic: 'idioms', prompt: 'He decided to ___ the towel after failing the exam twice.', options: ['throw in', 'pick up', 'hang on', 'give away'], correctIndex: 0 },
  { id: 'v-b2-3', skill: 'vocabulary', cefrLevel: 'B2', topic: 'nuanced_adjectives', prompt: "Her explanation was ___ — I still don't fully understand it.", options: ['vague', 'precise', 'concise', 'thorough'], correctIndex: 0 },

  // C1
  { id: 'g-c1-1', skill: 'grammar', cefrLevel: 'C1', topic: 'third_conditional', prompt: "If she ___ earlier, she wouldn't have missed the flight.", options: ['left', 'had left', 'would leave', 'has left'], correctIndex: 1 },
  { id: 'g-c1-2', skill: 'grammar', cefrLevel: 'C1', topic: 'inversion', prompt: '___ had I arrived than the phone rang.', options: ['No sooner', 'Not only', 'Hardly ever', 'Such'], correctIndex: 0 },
  { id: 'g-c1-3', skill: 'grammar', cefrLevel: 'C1', topic: 'subjunctive', prompt: 'The manager insisted that he ___ present at the meeting.', options: ['is', 'was', 'be', 'been'], correctIndex: 2 },
  { id: 'v-c1-1', skill: 'vocabulary', cefrLevel: 'C1', topic: 'advanced_collocations', prompt: 'The committee reached a ___ decision after hours of debate.', options: ['unanimous', 'unaware', 'unfamiliar', 'unruly'], correctIndex: 0 },
  { id: 'v-c1-2', skill: 'vocabulary', cefrLevel: 'C1', topic: 'formal_register', prompt: 'The report ___ several key issues that need addressing.', options: ['highlights', 'shows up', 'points at', 'brings up'], correctIndex: 0 },
  { id: 'v-c1-3', skill: 'vocabulary', cefrLevel: 'C1', topic: 'nuance', prompt: 'His remarks were seen as somewhat ___, causing unnecessary offense.', options: ['tactless', 'meticulous', 'candid', 'diplomatic'], correctIndex: 0 },

  // C2
  { id: 'g-c2-1', skill: 'grammar', cefrLevel: 'C2', topic: 'cleft_sentences', prompt: '___ that truly surprised me was his sudden resignation.', options: ['It was', 'What', 'There', 'This'], correctIndex: 1 },
  { id: 'g-c2-2', skill: 'grammar', cefrLevel: 'C2', topic: 'advanced_inversion', prompt: 'Rarely ___ such a compelling argument.', options: ['I have heard', 'have I heard', 'I heard', 'did I heard'], correctIndex: 1 },
  { id: 'g-c2-3', skill: 'grammar', cefrLevel: 'C2', topic: 'nuanced_modality', prompt: 'Given her experience, she ___ have been aware of the risks.', options: ['must', 'should', 'can', 'would'], correctIndex: 0 },
  { id: 'v-c2-1', skill: 'vocabulary', cefrLevel: 'C2', topic: 'rare_vocabulary', prompt: 'His ___ for detail made him an excellent editor.', options: ['penchant', 'dislike', 'neglect', 'avoidance'], correctIndex: 0 },
  { id: 'v-c2-2', skill: 'vocabulary', cefrLevel: 'C2', topic: 'subtle_synonyms', prompt: 'The negotiations were marked by a ___ tension beneath the polite exchanges.', options: ['palpable', 'negligible', 'superficial', 'absent'], correctIndex: 0 },
  { id: 'v-c2-3', skill: 'vocabulary', cefrLevel: 'C2', topic: 'idiomatic_nuance', prompt: 'Her argument, while eloquent, was ultimately ___ — all style, no substance.', options: ['specious', 'substantive', 'cogent', 'rigorous'], correctIndex: 0 },
]

export const OPEN_DIALOGUE_PROMPTS = [
  'Tell me about your typical weekend. What do you usually do?',
  'Describe a challenge you have faced (at work, in life, or while learning English) and how you dealt with it.',
]

export function getPlacementQuestion(id: string): PlacementQuestion | undefined {
  return PLACEMENT_QUESTIONS.find(q => q.id === id)
}
