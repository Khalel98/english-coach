import { getOrAssignCurrentMission } from '../../services/missionCurrent'

export default defineEventHandler(() => getOrAssignCurrentMission())
