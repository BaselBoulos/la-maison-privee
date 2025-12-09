import express from 'express'
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, addRSVP, addToWaitlist, removeFromWaitlist, markAttendance, bulkMarkAttendance, getEventAttendance } from '../controllers/eventController'

const router = express.Router()

// Get all events
router.get('/', getEvents)

// Get single event
router.get('/:id', getEvent)

// Create event
router.post('/', createEvent)

// Update event
router.put('/:id', updateEvent)

// Delete event
router.delete('/:id', deleteEvent)

// Add RSVP
router.post('/:id/rsvp', addRSVP)

// Add to waitlist
router.post('/:id/waitlist', addToWaitlist)

// Remove from waitlist
router.delete('/:id/waitlist/:memberId', removeFromWaitlist)

// Attendance tracking
router.post('/:id/attendance', markAttendance)
router.post('/:id/attendance/bulk', bulkMarkAttendance)
router.get('/:id/attendance', getEventAttendance)

export default router

