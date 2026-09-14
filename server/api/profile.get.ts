import { getUserProfile } from '../utils/userProfile'

export default defineEventHandler(async () => {
  const profile = await getUserProfile()
  return { estimatedLevel: profile.estimatedLevel }
})
