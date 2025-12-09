import { Request, Response } from 'express'
import { mockMembers, mockEvents } from '../data/mockData'
import { calculateTier, calculateAttendanceCount } from '../utils/tierCalculator'
import { getClubId } from '../utils/club'

export const getMembers = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { interests, city, email, name, status } = req.query
    
    // Scope by club
    let filtered = mockMembers.filter(m => m.clubId === clubId)
    const events = mockEvents.filter(e => e.clubId === clubId)
    
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests]
      filtered = filtered.filter(m => 
        m.interests.some(i => interestArray.includes(i))
      )
    }
    
    if (city) {
      filtered = filtered.filter(m => 
        m.city?.toLowerCase().includes((city as string).toLowerCase())
      )
    }
    
    if (email) {
      filtered = filtered.filter(m => 
        m.email.toLowerCase().includes((email as string).toLowerCase())
      )
    }
    
    if (name) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes((name as string).toLowerCase())
      )
    }
    
    if (status) {
      filtered = filtered.filter(m => m.status === status)
    }
    
    // Calculate tier based on attendance for each member
    const membersWithTier = filtered.map(member => {
      const attendanceCount = calculateAttendanceCount(member.id, events)
      const tier = calculateTier(member.id, events)
      return {
        ...member,
        tier,
        attendanceCount // Include for debugging
      }
    })
    
    // Sort by joinedDate descending
    membersWithTier.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
    
    res.json(membersWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getFilteredMembers = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { interests, cities, status } = req.query
    
    let filtered = mockMembers.filter(m => m.clubId === clubId)
    const events = mockEvents.filter(e => e.clubId === clubId)
    
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests]
      filtered = filtered.filter(m => 
        m.interests.some(i => interestArray.includes(i))
      )
    }
    
    if (cities) {
      const cityArray = Array.isArray(cities) ? cities : [cities]
      filtered = filtered.filter(m => 
        m.city && cityArray.includes(m.city)
      )
    }
    
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status]
      filtered = filtered.filter(m => statusArray.includes(m.status))
    }
    
    // Calculate tier based on attendance for each member
    const membersWithTier = filtered.map(member => ({
      ...member,
      tier: calculateTier(member.id, events)
    }))
    
    res.json(membersWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const member = mockMembers.find(m => m.id === req.params.id && m.clubId === clubId)
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    // Calculate tier based on attendance
    const memberWithTier = {
      ...member,
      tier: calculateTier(member.id, mockEvents.filter(e => e.clubId === clubId))
    }
    
    res.json(memberWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const memberIndex = mockMembers.findIndex(m => m.id === req.params.id && m.clubId === clubId)
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    mockMembers[memberIndex] = { ...mockMembers[memberIndex], ...req.body }
    
    res.json(mockMembers[memberIndex])
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const memberIndex = mockMembers.findIndex(m => m.id === req.params.id && m.clubId === clubId)
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    mockMembers.splice(memberIndex, 1)
    
    res.json({ message: 'Member deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

