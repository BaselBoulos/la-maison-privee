import { Request, Response } from 'express'
import { mockMembers } from '../data/mockData'

// Bulk update member status
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { memberIds, status } = req.body
    
    if (!Array.isArray(memberIds) || !status) {
      return res.status(400).json({ message: 'Invalid request. memberIds must be an array and status is required.' })
    }
    
    if (!['active', 'inactive', 'invited'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active, inactive, or invited.' })
    }
    
    const updatedMembers = []
    const notFound = []
    
    memberIds.forEach((id: string) => {
      const memberIndex = mockMembers.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        mockMembers[memberIndex].status = status as 'active' | 'inactive' | 'invited'
        updatedMembers.push(mockMembers[memberIndex])
      } else {
        notFound.push(id)
      }
    })
    
    res.json({
      success: true,
      updated: updatedMembers.length,
      updatedMembers,
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk assign interests
export const bulkAssignInterests = async (req: Request, res: Response) => {
  try {
    const { memberIds, interests } = req.body
    
    if (!Array.isArray(memberIds) || !Array.isArray(interests)) {
      return res.status(400).json({ message: 'Invalid request. memberIds and interests must be arrays.' })
    }
    
    const updatedMembers = []
    const notFound = []
    
    memberIds.forEach((id: string) => {
      const memberIndex = mockMembers.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        // Merge interests, avoiding duplicates
        const existingInterests = mockMembers[memberIndex].interests || []
        const newInterests = [...new Set([...existingInterests, ...interests])]
        mockMembers[memberIndex].interests = newInterests
        updatedMembers.push(mockMembers[memberIndex])
      } else {
        notFound.push(id)
      }
    })
    
    res.json({
      success: true,
      updated: updatedMembers.length,
      updatedMembers,
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk remove interests
export const bulkRemoveInterests = async (req: Request, res: Response) => {
  try {
    const { memberIds, interests } = req.body
    
    if (!Array.isArray(memberIds) || !Array.isArray(interests)) {
      return res.status(400).json({ message: 'Invalid request. memberIds and interests must be arrays.' })
    }
    
    const updatedMembers = []
    const notFound = []
    
    memberIds.forEach((id: string) => {
      const memberIndex = mockMembers.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        mockMembers[memberIndex].interests = mockMembers[memberIndex].interests.filter(
          i => !interests.includes(i)
        )
        updatedMembers.push(mockMembers[memberIndex])
      } else {
        notFound.push(id)
      }
    })
    
    res.json({
      success: true,
      updated: updatedMembers.length,
      updatedMembers,
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk delete members
export const bulkDeleteMembers = async (req: Request, res: Response) => {
  try {
    const { memberIds } = req.body
    
    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'Invalid request. memberIds must be an array.' })
    }
    
    const deleted = []
    const notFound = []
    
    memberIds.forEach((id: string) => {
      const memberIndex = mockMembers.findIndex(m => m.id === id)
      if (memberIndex !== -1) {
        mockMembers.splice(memberIndex, 1)
        deleted.push(id)
      } else {
        notFound.push(id)
      }
    })
    
    res.json({
      success: true,
      deleted: deleted.length,
      deletedIds: deleted,
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

