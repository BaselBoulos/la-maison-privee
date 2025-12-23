import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { mockClubs } from '../data/mockData'
import {
  addRuntimeAdmin,
  addRuntimeClub,
  mergedAdmins,
  mergedClubs,
  getRuntimeData,
  saveRuntimeData
} from '../data/runtimeStore'

type AdminRole = 'super' | 'club'

const generateToken = (adminId: number, role: AdminRole, clubId?: number, allowedClubIds?: number[]): string => {
  return jwt.sign({ adminId, role, clubId, allowedClubIds }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  })
}

// Mock admins for demo purposes
const MOCK_ADMINS: Array<{
  id: number
  email: string
  password: string
  name: string
  role: AdminRole
  clubId?: number
  allowedClubIds?: number[]
}> = [
  {
    id: 1,
    email: 'super@lamaisonprivee.com',
    password: 'admin123',
    name: 'Super Admin',
    role: 'super',
    allowedClubIds: [1, 2, 3]
  },
  {
    id: 2,
    email: 'lmp.admin@lamaisonprivee.com',
    password: 'admin123',
    name: 'LMP Admin',
    role: 'club',
    clubId: 1,
    allowedClubIds: [1]
  },
  {
    id: 3,
    email: 'dxb.admin@gulfprivee.com',
    password: 'admin123',
    name: 'Gulf Privée Admin',
    role: 'club',
    clubId: 2,
    allowedClubIds: [2, 3]
  }
]

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    // Check against mock admins
    const admins = mergedAdmins(MOCK_ADMINS)
    const clubs = mergedClubs(mockClubs)

    const adminMatch = admins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
    if (!adminMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    const superAdminAllowed = adminMatch.role === 'super' ? clubs.map(c => c.id) : adminMatch.allowedClubIds
    const token = generateToken(adminMatch.id, adminMatch.role, adminMatch.clubId, superAdminAllowed)
    const club = adminMatch.clubId ? clubs.find(c => c.id === (adminMatch.clubId as number)) : undefined
    
    res.json({
      token,
      admin: {
        id: adminMatch.id,
        email: adminMatch.email,
        name: adminMatch.name,
        role: adminMatch.role,
        clubId: adminMatch.clubId,
        allowedClubIds: superAdminAllowed
      },
      club
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, clubName, clubSlug } = req.body
    
    if (!email || !password || !name || !clubName) {
      return res.status(400).json({ message: 'Name, email, password, and clubName are required' })
    }
    
    const admins = mergedAdmins(MOCK_ADMINS)
    const clubs = mergedClubs(mockClubs)
    
    if (admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Admin already exists' })
    }
    
    const nextClubId = Math.max(...clubs.map(c => c.id), 0) + 1
    const slug = (clubSlug || clubName || 'club')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `club-${nextClubId}`

    const newClub = {
      id: nextClubId,
      name: clubName,
      slug,
      theme: { primary: '#d4af37', accent: '#8b2635', logo: '' },
      locale: 'en-IL',
      currency: 'ILS'
    }
    addRuntimeClub(newClub)

    const nextAdminId = Math.max(...admins.map(a => a.id), 0) + 1
    const newAdmin = {
      id: nextAdminId,
      email,
      password,
      name,
      role: 'club' as AdminRole,
      clubId: nextClubId,
      allowedClubIds: [nextClubId]
    }
    addRuntimeAdmin(newAdmin)

    const superAdminAllowed = mergedClubs(mockClubs).map(c => c.id)
    // Update runtime super admins allowed list for future logins
    const runtime = getRuntimeData()
    if (runtime.admins && Array.isArray(runtime.admins)) {
      runtime.admins = runtime.admins.map(a =>
        a.role === 'super' ? { ...a, allowedClubIds: superAdminAllowed } : a
      )
      saveRuntimeData(runtime)
    }
    
    const token = generateToken(newAdmin.id, newAdmin.role, newAdmin.clubId, newAdmin.allowedClubIds)
    
    res.status(201).json({
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        clubId: newAdmin.clubId,
        allowedClubIds: newAdmin.allowedClubIds
      },
      club: newClub,
      onboardingRequired: false
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

