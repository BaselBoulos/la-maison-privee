import { Request, Response } from 'express'
import Member from '../models/Member'
import Event from '../models/Event'
import Interest from '../models/Interest'
import InvitationCode from '../models/InvitationCode'
import { calculateTier, calculateAttendanceCount } from '../utils/tierCalculator'
import { getClubId } from '../utils/club'
import mongoose from 'mongoose'

// Helper to convert member document to API format
const formatMember = (member: any, events: any[] = []) => {
  const memberId = member._id.toString()
  const attendanceCount = calculateAttendanceCount(memberId, events)
  const tier = calculateTier(memberId, events)
  
  return {
    id: memberId,
    name: member.name,
    email: member.email,
    phone: member.phone,
    city: member.city,
    interests: (member.interests || []).map((i: any) => 
      typeof i === 'object' ? i.name : i
    ),
    status: member.status,
    joinedDate: member.joinedDate.toISOString().split('T')[0],
    invitationCode: typeof member.invitationCode === 'object' 
      ? member.invitationCode?.code 
      : member.invitationCode,
    profilePhoto: member.profilePhoto,
    tier,
    attendanceCount,
    clubId: member.clubId
  }
}

export const getMembers = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { interests, city, email, name, status } = req.query
    
    // Build query
    const query: any = { clubId }
    
    if (status) {
      query.status = status
    }
    
    if (city) {
      query.city = { $regex: city as string, $options: 'i' }
    }
    
    if (email) {
      query.email = { $regex: email as string, $options: 'i' }
    }
    
    if (name) {
      query.name = { $regex: name as string, $options: 'i' }
    }
    
    // Get all members for the club
    let members = await Member.find(query)
      .populate('interests', 'name icon')
      .populate('invitationCode', 'code')
      .sort({ joinedDate: -1 })
      .lean()
    
    // Filter by interests if provided
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests]
      // Get interest ObjectIds from names
      const interestDocs = await Interest.find({
        name: { $in: interestArray },
        $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
      }).lean()
      
      const interestIds = interestDocs.map(i => i._id)
      
      members = members.filter((m: any) => {
        const memberInterestIds = (m.interests || []).map((i: any) => 
          typeof i === 'object' ? i._id : i
        )
        return interestIds.some(id => memberInterestIds.some((mid: any) => 
          mid.toString() === id.toString()
        ))
      })
    }
    
    // Get events for tier calculation
    const events = await Event.find({ clubId })
      .populate('rsvps.yes', '_id')
      .lean()
    
    // Format events for tier calculator (convert to string IDs)
    const formattedEvents = events.map((e: any) => ({
      id: e._id.toString(),
      date: e.date.toISOString().split('T')[0],
      rsvps: {
        yes: (e.rsvps?.yes || []).map((m: any) => m._id.toString()),
        no: (e.rsvps?.no || []).map((m: any) => m._id.toString()),
        maybe: (e.rsvps?.maybe || []).map((m: any) => m._id.toString())
      }
    }))
    
    // Format members with tier calculation
    const membersWithTier = members.map((member: any) => formatMember(member, formattedEvents))
    
    res.json(membersWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getFilteredMembers = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { interests, cities, status } = req.query
    
    const query: any = { clubId }
    
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status]
      query.status = { $in: statusArray }
    }
    
    if (cities) {
      const cityArray = Array.isArray(cities) ? cities : [cities]
      query.city = { $in: cityArray }
    }
    
    let members = await Member.find(query)
      .populate('interests', 'name icon')
      .lean()
    
    // Filter by interests if provided
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests]
      const interestDocs = await Interest.find({
        name: { $in: interestArray },
        $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
      }).lean()
      
      const interestIds = interestDocs.map(i => i._id)
      
      members = members.filter((m: any) => {
        const memberInterestIds = (m.interests || []).map((i: any) => 
          typeof i === 'object' ? i._id : i
        )
        return interestIds.some(id => memberInterestIds.some((mid: any) => 
          mid.toString() === id.toString()
        ))
      })
    }
    
    // Get events for tier calculation
    const events = await Event.find({ clubId })
      .populate('rsvps.yes', '_id')
      .lean()
    
    const formattedEvents = events.map((e: any) => ({
      id: e._id.toString(),
      date: e.date.toISOString().split('T')[0],
      rsvps: {
        yes: (e.rsvps?.yes || []).map((m: any) => m._id.toString()),
        no: (e.rsvps?.no || []).map((m: any) => m._id.toString()),
        maybe: (e.rsvps?.maybe || []).map((m: any) => m._id.toString())
      }
    }))
    
    const membersWithTier = members.map((member: any) => formatMember(member, formattedEvents))
    
    res.json(membersWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const member = await Member.findOne({
      _id: req.params.id,
      clubId
    })
      .populate('interests', 'name icon')
      .populate('invitationCode', 'code')
      .lean()
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    // Get events for tier calculation
    const events = await Event.find({ clubId })
      .populate('rsvps.yes', '_id')
      .lean()
    
    const formattedEvents = events.map((e: any) => ({
      id: e._id.toString(),
      date: e.date.toISOString().split('T')[0],
      rsvps: {
        yes: (e.rsvps?.yes || []).map((m: any) => m._id.toString()),
        no: (e.rsvps?.no || []).map((m: any) => m._id.toString()),
        maybe: (e.rsvps?.maybe || []).map((m: any) => m._id.toString())
      }
    }))
    
    const memberWithTier = formatMember(member, formattedEvents)
    
    res.json(memberWithTier)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const member = await Member.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    // Handle interests - convert names to ObjectIds
    if (req.body.interests && Array.isArray(req.body.interests)) {
      const interestNames = req.body.interests.filter((i: any) => typeof i === 'string')
      const interestDocs = await Interest.find({
        name: { $in: interestNames },
        $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
      })
      req.body.interests = interestDocs.map(i => i._id)
    }
    
    // Handle invitationCode - convert code to ObjectId
    if (req.body.invitationCode && typeof req.body.invitationCode === 'string') {
      const code = await InvitationCode.findOne({ code: req.body.invitationCode, clubId })
      if (code) {
        req.body.invitationCode = code._id
      }
    }
    
    Object.assign(member, req.body)
    await member.save()
    
    const updated = await Member.findById(member._id)
      .populate('interests', 'name icon')
      .populate('invitationCode', 'code')
      .lean()
    
    // Get events for tier calculation
    const events = await Event.find({ clubId })
      .populate('rsvps.yes', '_id')
      .lean()
    
    const formattedEvents = events.map((e: any) => ({
      id: e._id.toString(),
      date: e.date.toISOString().split('T')[0],
      rsvps: {
        yes: (e.rsvps?.yes || []).map((m: any) => m._id.toString()),
        no: (e.rsvps?.no || []).map((m: any) => m._id.toString()),
        maybe: (e.rsvps?.maybe || []).map((m: any) => m._id.toString())
      }
    }))
    
    res.json(formatMember(updated, formattedEvents))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { name, email, phone, city, interests, status, invitationCode, profilePhoto } = req.body
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' })
    }
    
    // Check if member with same email already exists in this club
    const existingMember = await Member.findOne({ 
      email: email.toLowerCase(), 
      clubId 
    })
    
    if (existingMember) {
      return res.status(400).json({ message: 'Member with this email already exists' })
    }
    
    // Convert interest names to ObjectIds
    let interestIds: mongoose.Types.ObjectId[] = []
    if (interests && Array.isArray(interests)) {
      const interestNames = interests.filter((i: any) => typeof i === 'string')
      const interestDocs = await Interest.find({
        name: { $in: interestNames },
        $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
      })
      interestIds = interestDocs.map(i => i._id)
    }
    
    // Find or create invitation code
    let codeId: mongoose.Types.ObjectId | undefined
    if (invitationCode) {
      const code = await InvitationCode.findOne({ code: invitationCode, clubId })
      if (code) {
        codeId = code._id
      } else {
        // Create new invitation code if it doesn't exist
        const newCode = await InvitationCode.create({
          code: invitationCode,
          status: 'used',
          clubId
        })
        codeId = newCode._id
      }
    } else {
      // Create a default invitation code
      const newCode = await InvitationCode.create({
        code: `CLUB-${Date.now()}`,
        status: 'used',
        clubId
      })
      codeId = newCode._id
    }
    
    const newMember = await Member.create({
      name,
      email: email.toLowerCase(),
      phone,
      city,
      interests: interestIds,
      status: status || 'invited',
      invitationCode: codeId,
      profilePhoto,
      clubId
    })
    
    const member = await Member.findById(newMember._id)
      .populate('interests', 'name icon')
      .populate('invitationCode', 'code')
      .lean()
    
    res.status(201).json(formatMember(member))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const member = await Member.findOneAndDelete({
      _id: req.params.id,
      clubId
    })
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    res.json({ message: 'Member deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
