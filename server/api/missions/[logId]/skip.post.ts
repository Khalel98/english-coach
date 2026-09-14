import { skipMission, getOrAssignCurrentMission } from '../../../services/missionCurrent'

export default defineEventHandler(async (event) => {
  const logId = Number(getRouterParam(event, 'logId'))
  if (!Number.isInteger(logId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mission log id' })
  }

  await skipMission(logId)
  return getOrAssignCurrentMission()
})
