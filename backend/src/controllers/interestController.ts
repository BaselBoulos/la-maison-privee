import { Request, Response } from 'express'
import { mockInterests, mockMembers } from '../data/mockData'
import { getClubId } from '../utils/club'

export const getInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const enabledInterests = mockInterests
      .filter(i => i.enabled && (!i.clubId || i.clubId === clubId))
      .sort((a, b) => a.name.localeCompare(b.name))
    
    res.json(enabledInterests)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const sortedInterests = mockInterests
      .filter(i => !i.clubId || i.clubId === clubId)
      .sort((a, b) => 
        a.name.localeCompare(b.name)
      )
    
    res.json(sortedInterests)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createInterest = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { name, icon } = req.body
    
    if (!name) {
      return res.status(400).json({ message: 'Interest name is required' })
    }
    
    // Check if interest already exists
    if (mockInterests.some(i => i.name.toLowerCase() === name.toLowerCase() && (!i.clubId || i.clubId === clubId))) {
      return res.status(400).json({ message: 'Interest already exists' })
    }
    
    const newInterest = {
      id: String(mockInterests.length + 1),
      name,
      icon,
      enabled: true,
      clubId
    }
    
    mockInterests.push(newInterest)
    
    res.status(201).json(newInterest)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateInterest = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interestIndex = mockInterests.findIndex(i => i.id === req.params.id && (!i.clubId || i.clubId === clubId))
    
    if (interestIndex === -1) {
      return res.status(404).json({ message: 'Interest not found' })
    }
    
    mockInterests[interestIndex] = { ...mockInterests[interestIndex], ...req.body }
    
    res.json(mockInterests[interestIndex])
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interestIndex = mockInterests.findIndex(i => i.id === req.params.id && (!i.clubId || i.clubId === clubId))
    
    if (interestIndex === -1) {
      return res.status(404).json({ message: 'Interest not found' })
    }
    
    const interestToDelete = mockInterests[interestIndex]
    
    // Check if any member in this club has this interest
    const membersWithInterest = mockMembers.filter(member => {
      if (member.clubId !== clubId) return false
      return member.interests?.some(interest => interest === interestToDelete.name)
    })
    
    if (membersWithInterest.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete interest "${interestToDelete.name}" because ${membersWithInterest.length} member${membersWithInterest.length > 1 ? 's' : ''} ${membersWithInterest.length > 1 ? 'have' : 'has'} this interest assigned.`,
        memberCount: membersWithInterest.length,
        members: membersWithInterest.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email
        }))
      })
    }
    
    // Hard delete for mock data
    const [removed] = mockInterests.splice(interestIndex, 1)
    
    res.json({ message: 'Interest deleted successfully', interest: removed })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Get interests for a specific club (mobile app endpoint)
 * Accepts clubId as path parameter or query parameter
 * Returns only enabled interests
 */
export const getInterestsByClub = async (req: Request, res: Response) => {
  try {
    // Get clubId from path parameter, query parameter, or header
    const clubId = req.params.clubId 
      ? Number(req.params.clubId) 
      : req.query.clubId 
        ? Number(req.query.clubId)
        : getClubId(req)
    
    if (!clubId || isNaN(clubId)) {
      return res.status(400).json({ message: 'Valid clubId is required' })
    }
    
    // Get enabled interests for the specified club
    const interests = mockInterests
      .filter(i => i.enabled && (!i.clubId || i.clubId === clubId))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(i => ({
        id: i.id,
        name: i.name,
        icon: i.icon,
        enabled: i.enabled
      }))
    
    res.json({
      clubId,
      interests,
      count: interests.length
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

