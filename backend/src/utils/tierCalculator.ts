// Event type for tier calculation
export interface Event {
  id: string
  date: string
  rsvps: {
    yes: string[]
    no: string[]
    maybe: string[]
  }
}

export type Tier = 'Standard' | 'Premium' | 'Platinum' | 'VIP' | 'Founding'

/**
 * Tier Badge Rules (based on historical event attendance):
 * - Standard: 0-4 events attended
 * - Premium: 5-9 events attended
 * - Platinum: 10-14 events attended
 * - VIP: 15-24 events attended
 * - Founding: 25+ events attended
 */
export const TIER_RULES = {
  Standard: { min: 0, max: 4, description: '0-4 events attended' },
  Premium: { min: 5, max: 9, description: '5-9 events attended' },
  Platinum: { min: 10, max: 14, description: '10-14 events attended' },
  VIP: { min: 15, max: 24, description: '15-24 events attended' },
  Founding: { min: 25, max: Infinity, description: '25+ events attended' }
} as const

/**
 * Calculate the number of events a member has attended (past events where they RSVP'd "yes")
 */
export const calculateAttendanceCount = (memberId: string, events: Event[]): number => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setMinutes(0, 0, 0)
  now.setSeconds(0, 0)
  now.setMilliseconds(0)
  
  const attendedEvents = events.filter(event => {
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
 * - Standard: 0-4 events
 * - Premium: 5-9 events
 * - Platinum: 10-14 events
 * - VIP: 15-24 events
 * - Founding: 25+ events
 */
export const calculateTier = (memberId: string, events: Event[]): Tier => {
  const attendanceCount = calculateAttendanceCount(memberId, events)
  
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

