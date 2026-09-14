import { getAllMistakes } from '../services/memory'
import { getUserProfile } from '../utils/userProfile'
import { buildLearnerModel } from '../services/learnerModel'
import { selectSessionFocus } from '../services/sessionFocus'

export default defineEventHandler(async () => {
  const profile = await getUserProfile()
  const mistakeRows = await getAllMistakes()
  const learnerModel = buildLearnerModel(mistakeRows)
  const focus = selectSessionFocus(learnerModel, profile.preferredDifficulty)

  return { learnerModel, focus }
})
