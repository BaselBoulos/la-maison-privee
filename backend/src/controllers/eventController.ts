import { Request, Response } from 'express'
import { mockEvents, mockMembers } from '../data/mockData'

export const getEvents = async (req: Request, res: Response) => {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset time to compare dates only
    
    // Sort events: upcoming first, then past events
    const sortedEvents = [...mockEvents].sort((a, b) => {
      const dateA = new Date(a.date)
      dateA.setHours(0, 0, 0, 0)
      const dateB = new Date(b.date)
      dateB.setHours(0, 0, 0, 0)
      
      const isAUpcoming = dateA >= now
      const isBUpcoming = dateB >= now
      
      // If both are upcoming or both are past, sort by date ascending
      if (isAUpcoming === isBUpcoming) {
        return dateA.getTime() - dateB.getTime()
      }
      
      // Upcoming events come first
      return isAUpcoming ? -1 : 1
    })
    
    res.json(sortedEvents)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = mockEvents.find(e => e.id === req.params.id)
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    res.json(event)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const createEvent = async (req: Request, res: Response) => {
  try {
    const newEvent = {
      id: String(mockEvents.length + 1),
      ...req.body,
      rsvps: {
        yes: [],
        no: [],
        maybe: []
      },
      waitlist: []
    }
    
    mockEvents.push(newEvent)
    
    res.status(201).json(newEvent)
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventIndex = mockEvents.findIndex(e => e.id === req.params.id)
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...req.body }
    
    res.json(mockEvents[eventIndex])
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventIndex = mockEvents.findIndex(e => e.id === req.params.id)
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    mockEvents.splice(eventIndex, 1)
    
    res.json({ message: 'Event deleted successfully' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addRSVP = async (req: Request, res: Response) => {
  try {
    const { memberId, response } = req.body // response: 'yes', 'no', or 'maybe'
    
    if (!['yes', 'no', 'maybe'].includes(response)) {
      return res.status(400).json({ message: 'Invalid RSVP response' })
    }
    
    const event = mockEvents.find(e => e.id === req.params.id)
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    // Remove member from all RSVP arrays first
    event.rsvps.yes = event.rsvps.yes.filter(id => id !== memberId)
    event.rsvps.no = event.rsvps.no.filter(id => id !== memberId)
    event.rsvps.maybe = event.rsvps.maybe.filter(id => id !== memberId)
    
    if (event.waitlist) {
      event.waitlist = event.waitlist.filter(id => id !== memberId)
    }
    
    // Add to the correct array
    if (response === 'yes') {
      // Check capacity
      if (event.maxCapacity && event.rsvps.yes.length >= event.maxCapacity) {
        // Add to waitlist if full
        if (!event.waitlist) event.waitlist = []
        event.waitlist.push(memberId)
      } else {
        event.rsvps.yes.push(memberId)
      }
    } else {
      event.rsvps[response as 'no' | 'maybe'].push(memberId)
    }
    
    res.json(event)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const addToWaitlist = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.body
    
    const event = mockEvents.find(e => e.id === req.params.id)
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    if (!event.waitlist) {
      event.waitlist = []
    }
    
    if (!event.waitlist.includes(memberId)) {
      event.waitlist.push(memberId)
    }
    
    res.json(event)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const removeFromWaitlist = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params
    
    const event = mockEvents.find(e => e.id === req.params.id)
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    if (event.waitlist) {
      event.waitlist = event.waitlist.filter(id => id !== memberId)
    }
    
    res.json(event)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Mark member as attended
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { memberId, status } = req.body // status: 'attended' or 'noShow'
    
    if (!['attended', 'noShow'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "attended" or "noShow".' })
    }
    
    const event = mockEvents.find(e => e.id === req.params.id)
    
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
    
    // Remove from both arrays first
    event.attendance.attended = event.attendance.attended.filter(id => id !== memberId)
    event.attendance.noShow = event.attendance.noShow.filter(id => id !== memberId)
    
    // Add to the correct array
    if (status === 'attended') {
      event.attendance.attended.push(memberId)
    } else {
      event.attendance.noShow.push(memberId)
    }
    
    res.json(event)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Bulk mark attendance
export const bulkMarkAttendance = async (req: Request, res: Response) => {
  try {
    const { memberIds, status } = req.body // status: 'attended' or 'noShow'
    
    if (!Array.isArray(memberIds) || !['attended', 'noShow'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request. memberIds must be an array and status must be "attended" or "noShow".' })
    }
    
    const event = mockEvents.find(e => e.id === req.params.id)
    
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
    
    memberIds.forEach((memberId: string) => {
      // Remove from both arrays first
      event.attendance!.attended = event.attendance!.attended.filter(id => id !== memberId)
      event.attendance!.noShow = event.attendance!.noShow.filter(id => id !== memberId)
      
      // Add to the correct array
      if (status === 'attended') {
        event.attendance!.attended.push(memberId)
      } else {
        event.attendance!.noShow.push(memberId)
      }
    })
    
    res.json({
      success: true,
      updated: memberIds.length,
      event
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get attendance for an event
export const getEventAttendance = async (req: Request, res: Response) => {
  try {
    const event = mockEvents.find(e => e.id === req.params.id)
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }
    
    res.json({
      eventId: event.id,
      eventTitle: event.title,
      attendance: event.attendance || {
        attended: [],
        noShow: []
      },
      rsvps: {
        yes: event.rsvps.yes.length,
        no: event.rsvps.no.length,
        maybe: event.rsvps.maybe.length
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
