import { Request, Response } from 'express'
import Event from '../models/Event'
import Member from '../models/Member'
import Interest from '../models/Interest'
import { getClubId } from '../utils/club'
import mongoose from 'mongoose'

// Helper to format event for API response
const formatEvent = (event: any) => {
  return {
    id: event._id.toString(),
    title: event.title,
    date: event.date.toISOString().split('T')[0],
    time: event.time,
    location: event.location,
    maxCapacity: event.maxCapacity,
    price: event.price,
    description: event.description,
    image: event.image,
    targetInterests: (event.targetInterests || []).map((i: any) => 
      typeof i === 'object' ? i.name : i
    ),
    targetCities: event.targetCities || [],
    invitedMembersIds: event.invitedMembersIds || [],
    rsvps: {
      yes: (event.rsvps?.yes || []).map((m: any) => 
        typeof m === 'object' ? m._id.toString() : m
      ),
      no: (event.rsvps?.no || []).map((m: any) => 
        typeof m === 'object' ? m._id.toString() : m
      ),
      maybe: (event.rsvps?.maybe || []).map((m: any) => 
        typeof m === 'object' ? m._id.toString() : m
      )
    },
    waitlist: event.waitlist || [],
    attendance: event.attendance ? {
      attended: (event.attendance.attended || []).map((m: any) => 
        typeof m === 'object' ? m._id.toString() : m
      ),
      noShow: (event.attendance.noShow || []).map((m: any) => 
        typeof m === 'object' ? m._id.toString() : m
      )
    } : undefined,
    clubId: event.clubId
  }
}

export const getEvents = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const events = await Event.find({ clubId })
      .populate('targetInterests', 'name')
      .populate('rsvps.yes', '_id')
      .populate('rsvps.no', '_id')
      .populate('rsvps.maybe', '_id')
      .populate('attendance.attended', '_id')
      .populate('attendance.noShow', '_id')
      .sort({ date: 1 })
      .lean()
    
    // Sort: upcoming first, then past events
    const sortedEvents = events.sort((a: any, b: any) => {
      const dateA = new Date(a.date)
      dateA.setHours(0, 0, 0, 0)
      const dateB = new Date(b.date)
      dateB.setHours(0, 0, 0, 0)
      
      const isAUpcoming = dateA >= now
      const isBUpcoming = dateB >= now
      
      if (isAUpcoming === isBUpcoming) {
        return dateA.getTime() - dateB.getTime()
      }
      
      return isAUpcoming ? -1 : 1
    })
    
    res.json(sortedEvents.map(formatEvent))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getEvent = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
      .populate('targetInterests', 'name')
      .populate('rsvps.yes', '_id name email')
      .populate('rsvps.no', '_id name email')
      .populate('rsvps.maybe', '_id name email')
      .populate('attendance.attended', '_id name email')
      .populate('attendance.noShow', '_id name email')
      .lean()
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    res.json(formatEvent(event))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    
    // Convert interest names/IDs to ObjectIds
    let targetInterestIds: mongoose.Types.ObjectId[] = []
    if (req.body.targetInterests && Array.isArray(req.body.targetInterests)) {
      const interestNamesOrIds = req.body.targetInterests
      const interestDocs = await Interest.find({
        $and: [
          {
            $or: [
              { name: { $in: interestNamesOrIds } },
              { _id: { $in: interestNamesOrIds.filter((id: any) => mongoose.Types.ObjectId.isValid(id)) } }
            ]
          },
          {
            $or: [{ clubId: clubId }, { clubId: { $exists: false } }]
          }
        ]
      })
      targetInterestIds = interestDocs.map(i => i._id)
    }
    
    // Find members who match the target interests
    const invitedMemberIds: number[] = []
    if (targetInterestIds.length > 0) {
      const matchingMembers = await Member.find({
        clubId,
        interests: { $in: targetInterestIds }
      }).lean()
      // Store as numeric IDs for compatibility (using a simple counter or timestamp-based)
      invitedMemberIds.push(...matchingMembers.map((m, idx) => idx + 1))
    }
    
    const newEvent = await Event.create({
      ...req.body,
      date: new Date(req.body.date),
      targetInterests: targetInterestIds,
      targetCities: req.body.targetCities || [],
      invitedMembersIds: invitedMemberIds,
      rsvps: {
        yes: [],
        no: [],
        maybe: []
      },
      clubId
    })
    
    const event = await Event.findById(newEvent._id)
      .populate('targetInterests', 'name')
      .lean()
    
    res.status(201).json(formatEvent(event))
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Handle targetInterests update
    if (req.body.targetInterests && Array.isArray(req.body.targetInterests)) {
      const interestNamesOrIds = req.body.targetInterests
      const interestDocs = await Interest.find({
        $or: [
          { name: { $in: interestNamesOrIds } },
          { _id: { $in: interestNamesOrIds.filter((id: any) => mongoose.Types.ObjectId.isValid(id)) } }
        ],
        $and: [
          { $or: [{ clubId: clubId }, { clubId: { $exists: false } }] }
        ]
      })
      req.body.targetInterests = interestDocs.map(i => i._id)
      
      // Recalculate invitedMembersIds
      if (req.body.targetInterests.length > 0) {
        const matchingMembers = await Member.find({
          clubId,
          interests: { $in: req.body.targetInterests }
        }).lean()
        req.body.invitedMembersIds = matchingMembers.map((m, idx) => idx + 1)
      }
    }
    
    // Handle date conversion
    if (req.body.date) {
      req.body.date = new Date(req.body.date)
    }
    
    Object.assign(event, req.body)
    await event.save()
    
    const updated = await Event.findById(event._id)
      .populate('targetInterests', 'name')
      .populate('rsvps.yes', '_id')
      .populate('rsvps.no', '_id')
      .populate('rsvps.maybe', '_id')
      .lean()
    
    res.json(formatEvent(updated))
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    res.json({ message: 'Event deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addRSVP = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberId, response } = req.body
    
    if (!['yes', 'no', 'maybe'].includes(response)) {
      return res.status(400).json({ message: 'Invalid RSVP response' })
    }
    
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    const memberObjectId = new mongoose.Types.ObjectId(memberId)
    
    // Remove member from all RSVP arrays
    event.rsvps.yes = event.rsvps.yes.filter((id: any) => id.toString() !== memberId)
    event.rsvps.no = event.rsvps.no.filter((id: any) => id.toString() !== memberId)
    event.rsvps.maybe = event.rsvps.maybe.filter((id: any) => id.toString() !== memberId)
    
    // Add to the correct array
    if (response === 'yes') {
      // Check capacity
      if (event.maxCapacity && event.rsvps.yes.length >= event.maxCapacity) {
        // Add to waitlist if full (waitlist not in schema, skip for now)
      } else {
        event.rsvps.yes.push(memberObjectId)
      }
    } else {
      event.rsvps[response as 'no' | 'maybe'].push(memberObjectId)
    }
    
    await event.save()
    
    const updated = await Event.findById(event._id)
      .populate('targetInterests', 'name')
      .populate('rsvps.yes', '_id')
      .populate('rsvps.no', '_id')
      .populate('rsvps.maybe', '_id')
      .lean()
    
    res.json(formatEvent(updated))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addToWaitlist = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberId } = req.body
    
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Waitlist is not in the schema, so we'll skip this for now
    // You can add a waitlist field to the Event schema if needed
    
    res.json(formatEvent(event))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const removeFromWaitlist = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Waitlist handling (not in schema currently)
    
    const updated = await Event.findById(event._id)
      .populate('targetInterests', 'name')
      .lean()
    
    res.json(formatEvent(updated))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberId, status } = req.body
    
    if (!['attended', 'noShow'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "attended" or "noShow".' })
    }
    
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Initialize attendance if it doesn't exist
    if (!event.attendance) {
      event.attendance = {
        attended: [],
        noShow: []
      }
    }
    
    const memberObjectId = new mongoose.Types.ObjectId(memberId)
    
    // Remove from both arrays
    event.attendance.attended = event.attendance.attended.filter(
      (id: any) => id.toString() !== memberId
    )
    event.attendance.noShow = event.attendance.noShow.filter(
      (id: any) => id.toString() !== memberId
    )
    
    // Add to the correct array
    if (status === 'attended') {
      event.attendance.attended.push(memberObjectId)
    } else {
      event.attendance.noShow.push(memberObjectId)
    }
    
    await event.save()
    
    const updated = await Event.findById(event._id)
      .populate('targetInterests', 'name')
      .populate('rsvps.yes', '_id')
      .populate('attendance.attended', '_id name email')
      .populate('attendance.noShow', '_id name email')
      .lean()
    
    res.json(formatEvent(updated))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const bulkMarkAttendance = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds, status } = req.body
    
    if (!Array.isArray(memberIds) || !['attended', 'noShow'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid request. memberIds must be an array and status must be "attended" or "noShow".' 
      })
    }
    
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Initialize attendance if it doesn't exist
    if (!event.attendance) {
      event.attendance = {
        attended: [],
        noShow: []
      }
    }
    
    const memberObjectIds = memberIds.map((id: string) => new mongoose.Types.ObjectId(id))
    
    // Remove all from both arrays
    event.attendance.attended = event.attendance.attended.filter(
      (id: any) => !memberIds.includes(id.toString())
    )
    event.attendance.noShow = event.attendance.noShow.filter(
      (id: any) => !memberIds.includes(id.toString())
    )
    
    // Add to the correct array
    if (status === 'attended') {
      event.attendance.attended.push(...memberObjectIds)
    } else {
      event.attendance.noShow.push(...memberObjectIds)
    }
    
    await event.save()
    
    const updated = await Event.findById(event._id)
      .populate('targetInterests', 'name')
      .lean()
    
    res.json({
      success: true,
      updated: memberIds.length,
      event: formatEvent(updated)
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getEventAttendance = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const event = await Event.findOne({
      _id: req.params.id,
      clubId
    })
      .populate('attendance.attended', '_id name email')
      .populate('attendance.noShow', '_id name email')
      .lean()
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    res.json({
      eventId: event._id.toString(),
      eventTitle: event.title,
      attendance: event.attendance || {
        attended: [],
        noShow: []
      },
      rsvps: {
        yes: (event.rsvps?.yes || []).length,
        no: (event.rsvps?.no || []).length,
        maybe: (event.rsvps?.maybe || []).length
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
