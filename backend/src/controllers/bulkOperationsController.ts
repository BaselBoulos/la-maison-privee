import { Request, Response } from 'express'
import Member from '../models/Member'
import Interest from '../models/Interest'
import { getClubId } from '../utils/club'
import mongoose from 'mongoose'

// Bulk update member status
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds, status } = req.body
    
    if (!Array.isArray(memberIds) || !status) {
      return res.status(400).json({ message: 'Invalid request. memberIds must be an array and status is required.' })
    }
    
    if (!['active', 'inactive', 'invited'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active, inactive, or invited.' })
    }
    
    const validIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    
    const result = await Member.updateMany(
      {
        _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
        clubId
      },
      {
        $set: { status }
      }
    )
    
    const updatedMembers = await Member.find({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
      clubId
    })
      .populate('interests', 'name icon')
      .lean()
    
    const notFound = memberIds.filter(id => 
      !validIds.includes(id) || !updatedMembers.some(m => m._id.toString() === id)
    )
    
    res.json({
      success: true,
      updated: result.modifiedCount,
      updatedMembers: updatedMembers.map(m => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        status: m.status
      })),
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk assign interests
export const bulkAssignInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds, interests } = req.body
    
    if (!Array.isArray(memberIds) || !Array.isArray(interests)) {
      return res.status(400).json({ message: 'Invalid request. memberIds and interests must be arrays.' })
    }
    
    // Convert interest names to ObjectIds
    const interestDocs = await Interest.find({
      name: { $in: interests },
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
    const interestIds = interestDocs.map(i => i._id)
    
    if (interestIds.length === 0) {
      return res.status(400).json({ message: 'No valid interests found' })
    }
    
    const validIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    
    // Get current members and update their interests
    const members = await Member.find({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
      clubId
    })
    
    const updatedMembers: any[] = []
    for (const member of members) {
      // Merge interests, avoiding duplicates
      const existingInterestIds = member.interests.map(id => id.toString())
      const newInterestIds = interestIds
        .filter(id => !existingInterestIds.includes(id.toString()))
        .map(id => id)
      
      if (newInterestIds.length > 0) {
        member.interests.push(...newInterestIds)
        await member.save()
      }
      
      const updated = await Member.findById(member._id)
        .populate('interests', 'name icon')
        .lean()
      
      updatedMembers.push(updated)
    }
    
    const notFound = memberIds.filter(id => 
      !validIds.includes(id) || !updatedMembers.some(m => m!._id.toString() === id)
    )
    
    res.json({
      success: true,
      updated: updatedMembers.length,
      updatedMembers: updatedMembers.map(m => ({
        id: m!._id.toString(),
        name: m!.name,
        email: m!.email,
        interests: (m!.interests || []).map((i: any) => 
          typeof i === 'object' ? i.name : i
        )
      })),
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk remove interests
export const bulkRemoveInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds, interests } = req.body
    
    if (!Array.isArray(memberIds) || !Array.isArray(interests)) {
      return res.status(400).json({ message: 'Invalid request. memberIds and interests must be arrays.' })
    }
    
    // Convert interest names to ObjectIds
    const interestDocs = await Interest.find({
      name: { $in: interests },
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
    const interestIds = interestDocs.map(i => i._id.toString())
    
    const validIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    
    // Get current members and remove interests
    const members = await Member.find({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
      clubId
    })
    
    const updatedMembers: any[] = []
    for (const member of members) {
      member.interests = member.interests.filter(
        (id: any) => !interestIds.includes(id.toString())
      )
      await member.save()
      
      const updated = await Member.findById(member._id)
        .populate('interests', 'name icon')
        .lean()
      
      updatedMembers.push(updated)
    }
    
    const notFound = memberIds.filter(id => 
      !validIds.includes(id) || !updatedMembers.some(m => m!._id.toString() === id)
    )
    
    res.json({
      success: true,
      updated: updatedMembers.length,
      updatedMembers: updatedMembers.map(m => ({
        id: m!._id.toString(),
        name: m!.name,
        email: m!.email,
        interests: (m!.interests || []).map((i: any) => 
          typeof i === 'object' ? i.name : i
        )
      })),
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk delete members
export const bulkDeleteMembers = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds } = req.body
    
    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'Invalid request. memberIds must be an array.' })
    }
    
    const validIds = memberIds.filter(id => mongoose.Types.ObjectId.isValid(id))
    
    const result = await Member.deleteMany({
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) },
      clubId
    })
    
    const notFound = memberIds.filter(id => !validIds.includes(id))
    
    res.json({
      success: true,
      deleted: result.deletedCount,
      deletedIds: validIds,
      notFound: notFound.length > 0 ? notFound : undefined
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
