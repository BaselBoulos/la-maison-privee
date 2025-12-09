import { mockEvents } from '../data/mockData'

export type Tier = 'Standard' | 'Premium' | 'Platinum' | 'VIP' | 'Founding'

/**
 * Tier Badge Rules (based on historical event attendance):
 * - Standard: 0-2 events attended
 * - Premium: 3-5 events attended
 * - Platinum: 6-10 events attended
 * - VIP: 11-20 events attended
 * - Founding: 21+ events attended
 */
export const TIER_RULES = {
  Standard: { min: 0, max: 2, description: '0-2 events attended' },
  Premium: { min: 3, max: 5, description: '3-5 events attended' },
  Platinum: { min: 6, max: 10, description: '6-10 events attended' },
  VIP: { min: 11, max: 20, description: '11-20 events attended' },
  Founding: { min: 21, max: Infinity, description: '21+ events attended' }
} as const

/**
 * Calculate the number of events a member has attended (past events where they RSVP'd "yes")
 */
export const calculateAttendanceCount = (memberId: string): number => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setMinutes(0, 0, 0)
  now.setSeconds(0, 0)
  now.setMilliseconds(0)
  
  const attendedEvents = mockEvents.filter(event => {
    // Parse date string (format: 'YYYY-MM-DD')
    // Add time component to ensure consistent parsing
    const dateStr = event.date.includes('T') ? event.date : event.date + 'T00:00:00'
    const eventDate = new Date(dateStr)
    eventDate.setHours(0, 0, 0, 0)
    eventDate.setMinutes(0, 0, 0)
    eventDate.setSeconds(0, 0)
    eventDate.setMilliseconds(0)
    
    // Only count past events where member RSVP'd "yes"
    // Consider events from today or earlier as "past" for attendance purposes
    const isPastEvent = eventDate <= now
    const hasRSVPYes = event.rsvps.yes.includes(memberId)
    
    return isPastEvent && hasRSVPYes
  })
  
  return attendedEvents.length
}

/**
 * Calculate member tier based on attendance count
 * Rules:
 * - Standard: 0-2 events
 * - Premium: 3-5 events
 * - Platinum: 6-10 events
 * - VIP: 11-20 events
 * - Founding: 21+ events
 */
export const calculateTier = (memberId: string): Tier => {
  const attendanceCount = calculateAttendanceCount(memberId)
  
  if (attendanceCount >= TIER_RULES.Founding.min) {
    return 'Founding'
  } else if (attendanceCount >= TIER_RULES.VIP.min) {
    return 'VIP'
  } else if (attendanceCount >= TIER_RULES.Platinum.min) {
    return 'Platinum'
  } else if (attendanceCount >= TIER_RULES.Premium.min) {
    return 'Premium'
  } else {
    return 'Standard'
  }
}

/**
 * Get tier information for a given attendance count
 */
export const getTierInfo = (attendanceCount: number): { tier: Tier; description: string; nextTier?: Tier; eventsNeeded?: number } => {
  const tier = calculateTierFromCount(attendanceCount)
  const tierInfo = TIER_RULES[tier]
  const description = tierInfo.description
  
  // Calculate next tier if not already at highest
  let nextTier: Tier | undefined
  let eventsNeeded: number | undefined
  
  if (tier !== 'Founding') {
    if (tier === 'Standard') {
      nextTier = 'Premium'
      eventsNeeded = TIER_RULES.Premium.min - attendanceCount
    } else if (tier === 'Premium') {
      nextTier = 'Platinum'
      eventsNeeded = TIER_RULES.Platinum.min - attendanceCount
    } else if (tier === 'Platinum') {
      nextTier = 'VIP'
      eventsNeeded = TIER_RULES.VIP.min - attendanceCount
    } else if (tier === 'VIP') {
      nextTier = 'Founding'
      eventsNeeded = TIER_RULES.Founding.min - attendanceCount
    }
  }
  
  return { tier, description, nextTier, eventsNeeded }
}

/**
 * Calculate tier from attendance count (helper function)
 */
const calculateTierFromCount = (attendanceCount: number): Tier => {
  if (attendanceCount >= TIER_RULES.Founding.min) {
    return 'Founding'
  } else if (attendanceCount >= TIER_RULES.VIP.min) {
    return 'VIP'
  } else if (attendanceCount >= TIER_RULES.Platinum.min) {
    return 'Platinum'
  } else if (attendanceCount >= TIER_RULES.Premium.min) {
    return 'Premium'
  } else {
    return 'Standard'
  }
}

