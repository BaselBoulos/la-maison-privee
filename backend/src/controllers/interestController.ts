import { Request, Response } from 'express'
import Interest from '../models/Interest'
import Member from '../models/Member'
import { getClubId } from '../utils/club'

export const getInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interests = await Interest.find({
      enabled: true,
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
      .sort({ name: 1 })
      .lean()
    
    // Convert to API format
    const formatted = interests.map(i => ({
      id: i._id.toString(),
      name: i.name,
      icon: i.icon,
      enabled: i.enabled,
      clubId: i.clubId
    }))
    
    res.json(formatted)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interests = await Interest.find({
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
      .sort({ name: 1 })
      .lean()
    
    // Convert to API format
    const formatted = interests.map(i => ({
      id: i._id.toString(),
      name: i.name,
      icon: i.icon,
      enabled: i.enabled,
      clubId: i.clubId
    }))
    
    res.json(formatted)
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
    const existing = await Interest.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
    
    if (existing) {
      return res.status(400).json({ message: 'Interest already exists' })
    }
    
    const newInterest = await Interest.create({
      name,
      icon,
      enabled: true,
      clubId
    })
    
    res.status(201).json({
      id: newInterest._id.toString(),
      name: newInterest.name,
      icon: newInterest.icon,
      enabled: newInterest.enabled,
      clubId: newInterest.clubId
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateInterest = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interest = await Interest.findOne({
      _id: req.params.id,
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
    
    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }
    
    Object.assign(interest, req.body)
    await interest.save()
    
    res.json({
      id: interest._id.toString(),
      name: interest.name,
      icon: interest.icon,
      enabled: interest.enabled,
      clubId: interest.clubId
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteInterest = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const interest = await Interest.findOne({
      _id: req.params.id,
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
    
    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' })
    }
    
    // Check if any member in this club has this interest
    const membersWithInterest = await Member.find({
      clubId,
      interests: interest._id
    }).lean()
    
    if (membersWithInterest.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete interest "${interest.name}" because ${membersWithInterest.length} member${membersWithInterest.length > 1 ? 's' : ''} ${membersWithInterest.length > 1 ? 'have' : 'has'} this interest assigned.`,
        memberCount: membersWithInterest.length,
        members: membersWithInterest.map(m => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email
        }))
      })
    }
    
    await Interest.findByIdAndDelete(interest._id)
    
    res.json({ message: 'Interest deleted successfully', interest: {
      id: interest._id.toString(),
      name: interest.name
    }})
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
    const interests = await Interest.find({
      enabled: true,
      $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
    })
      .sort({ name: 1 })
      .lean()
    
    const formatted = interests.map(i => ({
      id: i._id.toString(),
      name: i.name,
      icon: i.icon,
      enabled: i.enabled
    }))
    
    res.json({
      clubId,
      interests: formatted,
      count: formatted.length
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
