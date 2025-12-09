import { Request, Response } from 'express'
import { mockInvitationCodes } from '../data/mockData'

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
    const { status } = req.query
    
    let filtered = [...mockInvitationCodes]
    
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
    const code = mockInvitationCodes.find(c => c.id === req.params.id)
    
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
    const { count = 1 } = req.body
    
    if (count < 1 || count > 100) {
      return res.status(400).json({ message: 'Count must be between 1 and 100' })
    }
    
    const newCodes = []
    const baseId = mockInvitationCodes.length
    
    for (let i = 0; i < count; i++) {
      let codeString = generateCode()
      
      // Ensure uniqueness
      while (mockInvitationCodes.some(c => c.code === codeString)) {
        codeString = generateCode()
      }
      
      const newCode = {
        id: String(baseId + i + 1),
        code: codeString,
        status: 'unused' as const,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      newCodes.push(newCode)
      mockInvitationCodes.push(newCode)
    }
    
    res.status(201).json(newCodes)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const revokeInvitationCode = async (req: Request, res: Response) => {
  try {
    const codeIndex = mockInvitationCodes.findIndex(c => c.id === req.params.id)
    
    if (codeIndex === -1) {
      return res.status(404).json({ message: 'Invitation code not found' })
    }
    
    const code = mockInvitationCodes[codeIndex]
    
    if (code.status === 'used') {
      return res.status(400).json({ message: 'Cannot revoke a used code' })
    }
    
    mockInvitationCodes.splice(codeIndex, 1)
    
    res.json({ message: 'Invitation code revoked successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

