import fs from 'fs'
import path from 'path'
import { InvitationCode, Club } from './mockData'

type RuntimeAdmin = {
  id: number
  email: string
  password: string
  name: string
  role: 'super' | 'club'
  clubId?: number
  allowedClubIds?: number[]
}

type RuntimeData = {
  invitationCodes: InvitationCode[]
  clubs: Club[]
  admins: RuntimeAdmin[]
}

const RUNTIME_PATH = path.join(__dirname, 'runtimeData.json')

const defaultData: RuntimeData = {
  invitationCodes: [],
  clubs: [],
  admins: []
}

export const loadRuntimeData = (): RuntimeData => {
  try {
    if (fs.existsSync(RUNTIME_PATH)) {
      const raw = fs.readFileSync(RUNTIME_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      // Ensure all arrays exist, defaulting to empty arrays if missing
      return {
        invitationCodes: parsed.invitationCodes || [],
        clubs: parsed.clubs || [],
        admins: parsed.admins || []
      }
    }
  } catch (e) {
    // Fall back to defaults if file is unreadable
  }
  return { ...defaultData }
}

export const saveRuntimeData = (data: RuntimeData) => {
  try {
    fs.writeFileSync(RUNTIME_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    // In a future version, log this error to an application logger
  }
}

const runtimeData: RuntimeData = (() => {
  const loaded = loadRuntimeData()
  // Ensure all arrays are initialized
  return {
    invitationCodes: Array.isArray(loaded.invitationCodes) ? loaded.invitationCodes : [],
    clubs: Array.isArray(loaded.clubs) ? loaded.clubs : [],
    admins: Array.isArray(loaded.admins) ? loaded.admins : []
  }
})()

export const getRuntimeData = () => runtimeData

export const upsertInvitationCodes = (codes: InvitationCode[]) => {
  runtimeData.invitationCodes = codes
  saveRuntimeData(runtimeData)
}

export const addRuntimeClub = (club: Club) => {
  if (!runtimeData.clubs) {
    runtimeData.clubs = []
  }
  runtimeData.clubs.push(club)
  saveRuntimeData(runtimeData)
}

export const addRuntimeAdmin = (admin: RuntimeAdmin) => {
  if (!runtimeData.admins) {
    runtimeData.admins = []
  }
  runtimeData.admins.push(admin)
  saveRuntimeData(runtimeData)
}

export const removeRuntimeClub = (clubId: number) => {
  runtimeData.clubs = (runtimeData.clubs || []).filter(c => c.id !== clubId)
  runtimeData.admins = (runtimeData.admins || []).filter(a => a.clubId !== clubId)
  saveRuntimeData(runtimeData)
}

export const updateRuntimeClub = (club: Club) => {
  if (!runtimeData.clubs) {
    runtimeData.clubs = []
  }
  const idx = runtimeData.clubs.findIndex(c => c.id === club.id)
  if (idx >= 0) {
    runtimeData.clubs[idx] = { ...runtimeData.clubs[idx], ...club }
  } else {
    runtimeData.clubs.push(club)
  }
  saveRuntimeData(runtimeData)
}

export const mergedClubs = (seed: Club[]) => {
  const existingIds = new Set(seed.map(c => c.id))
  const runtimeClubs = runtimeData.clubs || []
  const additions = runtimeClubs.filter(c => !existingIds.has(c.id))
  return [...seed, ...additions]
}

export const mergedAdmins = <T extends { id: number }>(seed: T[]) => {
  const existingIds = new Set(seed.map(a => a.id))
  const runtimeAdmins = runtimeData.admins || []
  const additions = runtimeAdmins.filter(a => !existingIds.has(a.id))
  return [...seed, ...additions] as Array<T | RuntimeAdmin>
}

export const mergedInvitationCodes = (seed: InvitationCode[]) => {
  const baseIds = new Set(seed.map(c => c.id))
  const runtimeCodes = runtimeData.invitationCodes || []
  const additions = runtimeCodes.filter(c => !baseIds.has(c.id))
  return [...seed, ...additions]
}

