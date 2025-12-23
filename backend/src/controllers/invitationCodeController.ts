import { Request, Response } from 'express'
import { mockInvitationCodes } from '../data/mockData'
import { loadRuntimeData, saveRuntimeData } from '../data/runtimeStore'
import { getClubId } from '../utils/club'

// Initialize runtime invitation codes (persisted between restarts)
const runtimeData = loadRuntimeData()
const baseMockIds = new Set(mockInvitationCodes.map(c => c.id))
const invitationCodes = [
  ...mockInvitationCodes,
  ...runtimeData.invitationCodes.filter(c => !baseMockIds.has(c.id))
]

const persist = () => {
  const delta = invitationCodes.filter(c => !baseMockIds.has(c.id))
  const currentRuntime = loadRuntimeData()
  saveRuntimeData({
    invitationCodes: delta,
    clubs: currentRuntime.clubs || [],
    admins: currentRuntime.admins || []
  })
}

const generateCode = (): string => {
  const prefix = 'CLUB-'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomPart = Array.from({ length: 5 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
  return `${prefix}${randomPart}`
}

export const getInvitationCodes = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { status } = req.query
    
    let filtered = invitationCodes.filter(c => c.clubId === clubId)
    
    if (status) {
      filtered = filtered.filter(c => c.status === status)
    }
    
    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    res.json(filtered)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getInvitationCode = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const code = invitationCodes.find(c => c.id === req.params.id && c.clubId === clubId)
    
    if (!code) {
      return res.status(404).json({ message: 'Invitation code not found' })
    }
    
    res.json(code)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const generateInvitationCodes = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { count = 1 } = req.body
    
    if (count < 1 || count > 100) {
      return res.status(400).json({ message: 'Count must be between 1 and 100' })
    }
    
    const newCodes = []
    const baseId = invitationCodes.length
    
    for (let i = 0; i < count; i++) {
      let codeString = generateCode()
      
      // Ensure uniqueness
      while (invitationCodes.some(c => c.code === codeString)) {
        codeString = generateCode()
      }
      
      const newCode = {
        id: String(baseId + i + 1),
        code: codeString,
        status: 'unused' as const,
        createdAt: new Date().toISOString().split('T')[0],
        clubId
      }
      
      newCodes.push(newCode)
      invitationCodes.push(newCode)
    }

    persist()
    
    res.status(201).json(newCodes)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const verifyInvitationCode = async (req: Request, res: Response) => {
  try {
    const { code: codeString } = req.body
    
    if (!codeString || typeof codeString !== 'string') {
      return res.status(400).json({ message: 'Invitation code is required' })
    }
    
    // Search for the code (can be across all clubs for user onboarding)
    const code = invitationCodes.find(c => c.code.toUpperCase() === codeString.toUpperCase().trim())
    
    if (!code) {
      return res.status(404).json({ 
        valid: false,
        message: 'Invitation code not found' 
      })
    }
    
    // Check if code is already used
    if (code.status === 'used') {
      return res.status(400).json({ 
        valid: false,
        message: 'This invitation code has already been used',
        code: {
          id: code.id,
          code: code.code,
          status: code.status,
          usedAt: code.usedAt,
          assignedMemberName: code.assignedMemberName
        }
      })
    }
    
    // Check if code has expired
    if (code.expiresAt) {
      const expiresAt = new Date(code.expiresAt)
      const now = new Date()
      
      if (now > expiresAt) {
        return res.status(400).json({ 
          valid: false,
          message: 'This invitation code has expired',
          code: {
            id: code.id,
            code: code.code,
            status: code.status,
            expiresAt: code.expiresAt
          }
        })
      }
    }
    
    // Code is valid
    res.json({
      valid: true,
      message: 'Invitation code is valid',
      code: {
        id: code.id,
        code: code.code,
        status: code.status,
        createdAt: code.createdAt,
        expiresAt: code.expiresAt,
        clubId: code.clubId
      }
    })
  } catch (error: any) {
    res.status(500).json({ 
      valid: false,
      message: error.message 
    })
  }
}

export const revokeInvitationCode = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const codeIndex = invitationCodes.findIndex(c => c.id === req.params.id && c.clubId === clubId)
    
    if (codeIndex === -1) {
      return res.status(404).json({ message: 'Invitation code not found' })
    }
    
    const code = invitationCodes[codeIndex]
    
    if (code.status === 'used') {
      return res.status(400).json({ message: 'Cannot revoke a used code' })
    }
    
    invitationCodes.splice(codeIndex, 1)
    persist()
    
    res.json({ message: 'Invitation code revoked successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

