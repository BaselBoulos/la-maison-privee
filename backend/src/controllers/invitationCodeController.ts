import { Request, Response } from 'express'
import InvitationCode from '../models/InvitationCode'
import { getClubId } from '../utils/club'

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
    
    const query: any = { clubId }
    
    if (status) {
      query.status = status
    }
    
    const codes = await InvitationCode.find(query)
      .populate('assignedMember', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    
    const formatted = codes.map((c: any) => ({
      id: c._id.toString(),
      code: c.code,
      status: c.status,
      createdAt: c.createdAt.toISOString().split('T')[0],
      usedAt: c.usedAt ? c.usedAt.toISOString().split('T')[0] : undefined,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString().split('T')[0] : undefined,
      assignedMember: c.assignedMember ? {
        id: c.assignedMember._id.toString(),
        name: c.assignedMember.name,
        email: c.assignedMember.email
      } : undefined,
      assignedMemberName: c.assignedMember ? c.assignedMember.name : undefined,
      clubId: c.clubId
    }))
    
    res.json(formatted)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getInvitationCode = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const code = await InvitationCode.findOne({
      _id: req.params.id,
      clubId
    })
      .populate('assignedMember', 'name email')
      .lean()
    
    if (!code) {
      return res.status(404).json({ message: 'Invitation code not found' })
    }
    
    res.json({
      id: code._id.toString(),
      code: code.code,
      status: code.status,
      createdAt: code.createdAt.toISOString().split('T')[0],
      usedAt: code.usedAt ? code.usedAt.toISOString().split('T')[0] : undefined,
      expiresAt: code.expiresAt ? code.expiresAt.toISOString().split('T')[0] : undefined,
      assignedMember: code.assignedMember && typeof code.assignedMember === 'object' && 'name' in code.assignedMember ? {
        id: (code.assignedMember as any)._id.toString(),
        name: (code.assignedMember as any).name,
        email: (code.assignedMember as any).email
      } : undefined,
      clubId: code.clubId
    })
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
    
    for (let i = 0; i < count; i++) {
      let codeString = generateCode()
      
      // Ensure uniqueness
      let existing = await InvitationCode.findOne({ code: codeString })
      while (existing) {
        codeString = generateCode()
        existing = await InvitationCode.findOne({ code: codeString })
      }
      
      const newCode = await InvitationCode.create({
        code: codeString,
        status: 'unused',
        clubId
      })
      
      newCodes.push({
        id: newCode._id.toString(),
        code: newCode.code,
        status: newCode.status,
        createdAt: newCode.createdAt.toISOString().split('T')[0],
        clubId: newCode.clubId
      })
    }
    
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
    const code = await InvitationCode.findOne({
      code: codeString.toUpperCase().trim()
    }).lean()
    
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
          id: code._id.toString(),
          code: code.code,
          status: code.status,
          usedAt: code.usedAt ? code.usedAt.toISOString().split('T')[0] : undefined
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
            id: code._id.toString(),
            code: code.code,
            status: code.status,
            expiresAt: code.expiresAt.toISOString().split('T')[0]
          }
        })
      }
    }
    
    // Code is valid
    res.json({
      valid: true,
      message: 'Invitation code is valid',
      code: {
        id: code._id.toString(),
        code: code.code,
        status: code.status,
        createdAt: code.createdAt.toISOString().split('T')[0],
        expiresAt: code.expiresAt ? code.expiresAt.toISOString().split('T')[0] : undefined,
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
    const code = await InvitationCode.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!code) {
      return res.status(404).json({ message: 'Invitation code not found' })
    }
    
    if (code.status === 'used') {
      return res.status(400).json({ message: 'Cannot revoke a used code' })
    }
    
    await InvitationCode.findByIdAndDelete(code._id)
    
    res.json({ message: 'Invitation code revoked successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
