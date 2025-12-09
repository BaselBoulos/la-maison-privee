import { Request, Response } from 'express'
import { mockInterests } from '../data/mockData'

export const getInterests = async (req: Request, res: Response) => {
  try {
    const enabledInterests = mockInterests
      .filter(i => i.enabled)
      .sort((a, b) => a.name.localeCompare(b.name))
    
    res.json(enabledInterests)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const sortedInterests = [...mockInterests].sort((a, b) => 
      a.name.localeCompare(b.name)
    )
    
    res.json(sortedInterests)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createInterest = async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body
    
    if (!name) {
      return res.status(400).json({ message: 'Interest name is required' })
    }
    
    // Check if interest already exists
    if (mockInterests.some(i => i.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ message: 'Interest already exists' })
    }
    
    const newInterest = {
      id: String(mockInterests.length + 1),
      name,
      icon,
      enabled: true
    }
    
    mockInterests.push(newInterest)
    
    res.status(201).json(newInterest)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateInterest = async (req: Request, res: Response) => {
  try {
    const interestIndex = mockInterests.findIndex(i => i.id === req.params.id)
    
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
    const interestIndex = mockInterests.findIndex(i => i.id === req.params.id)
    
    if (interestIndex === -1) {
      return res.status(404).json({ message: 'Interest not found' })
    }
    
    // Soft delete by disabling
    mockInterests[interestIndex].enabled = false
    
    res.json({ message: 'Interest disabled successfully', interest: mockInterests[interestIndex] })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

