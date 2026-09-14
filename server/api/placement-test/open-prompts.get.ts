import { OPEN_DIALOGUE_PROMPTS } from '../../data/placementQuestions'

export default defineEventHandler(() => {
  return { prompts: OPEN_DIALOGUE_PROMPTS }
})
