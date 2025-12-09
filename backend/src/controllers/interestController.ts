import { Request, Response } from 'express'
import { mockInterests } from '../data/mockData'
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
    
    // Hard delete for mock data
    const [removed] = mockInterests.splice(interestIndex, 1)
    
    res.json({ message: 'Interest deleted successfully', interest: removed })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

