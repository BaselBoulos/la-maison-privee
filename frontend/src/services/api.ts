// API Service - Calls backend API endpoints
// Use relative path when no env var is set (for same-domain deployments like Render)
// Or use absolute URL from env var (for separate frontend/backend deployments)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const getClubId = () => {
  const stored = localStorage.getItem('clubId')
  return stored ? Number(stored) : 1
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken')
  const clubId = getClubId()

  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)
  if (clubId && !url.searchParams.has('clubId')) {
    url.searchParams.set('clubId', String(clubId))
  }
  
  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(clubId && { 'X-Club-Id': String(clubId) }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    const errorObj = new Error(error.message || `HTTP error! status: ${response.status}`) as any
    errorObj.response = { data: error, status: response.status }
    throw errorObj
  }

  return response.json()
}

// Upload file function
async function uploadFile(file: File): Promise<{ path: string; filename: string }> {
  const token = localStorage.getItem('authToken')
  const clubId = getClubId()
  const formData = new FormData()
  formData.append('image', file)

  const url = new URL(`${API_BASE_URL}/upload/image`, window.location.origin)
  if (clubId) {
    url.searchParams.set('clubId', String(clubId))
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(clubId && { 'X-Club-Id': String(clubId) }),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(error.message || `Upload failed: ${response.status}`)
  }

  const result = await response.json()
  // Return full URL path - use the path from server which is relative to uploads root
  // If API_BASE_URL is relative (/api), baseUrl will be empty (root)
  // If API_BASE_URL is absolute (http://...), extract the origin
  let baseUrl = ''
  if (API_BASE_URL.startsWith('http')) {
    try {
      const apiUrl = new URL(API_BASE_URL)
      baseUrl = apiUrl.origin
    } catch {
      baseUrl = ''
    }
  }
  // The server returns path like /uploads/images/filename.jpg
  return {
    path: `${baseUrl}${result.path}`,
    filename: result.filename
  }
}

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  interests: string[]
  status: 'active' | 'inactive' | 'invited'
  joinedDate: string
  invitationCode?: string
  profilePhoto?: string
  tier?: 'Standard' | 'Premium' | 'Platinum' | 'VIP' | 'Founding'
  clubId?: string
  addedManually?: boolean
}

export interface Interest {
  id: string
  name: string
  icon?: string
  enabled: boolean
  clubId?: string
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  maxCapacity?: number
  price?: number
  description: string
  image?: string
  targetInterests: string[]
  targetCities: string[]
  invitedMembersIds?: number[] // IDs of members who were actually invited to this event
  rsvps: {
    yes: string[]
    no: string[]
    maybe: string[]
  }
  waitlist?: string[]
  attendance?: {
    attended: string[]
    noShow: string[]
  }
  clubId?: string
}

export interface InvitationCode {
  id: string
  code: string
  status: 'unused' | 'used'
  assignedMemberId?: string
  assignedMemberName?: string
  createdAt: string
  usedAt?: string
  expiresAt?: string
  clubId?: string
}

export interface Club {
  id: number
  name: string
  slug: string
  theme: {
    primary: string
    accent: string
    logo?: string
  }
  locale: string
  currency: string
}

// API Functions
export const api = {
  // Members
  async getMembers(filters?: {
    interests?: string[]
    city?: string
    email?: string
    name?: string
    status?: string
  }): Promise<Member[]> {
    const params = new URLSearchParams()
    
    if (filters?.interests?.length) {
      filters.interests.forEach(i => params.append('interests', i))
    }
    if (filters?.city) params.append('city', filters.city)
    if (filters?.email) params.append('email', filters.email)
    if (filters?.name) params.append('name', filters.name)
    if (filters?.status) params.append('status', filters.status)
    
    const queryString = params.toString()
    return apiRequest<Member[]>(`/members${queryString ? `?${queryString}` : ''}`)
  },

  async getMember(id: string): Promise<Member | null> {
    return apiRequest<Member>(`/members/${id}`)
  },

  async createMember(data: Omit<Member, 'id' | 'joinedDate' | 'tier'>): Promise<Member> {
    return apiRequest<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    return apiRequest<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteMember(id: string): Promise<void> {
    return apiRequest<void>(`/members/${id}`, {
      method: 'DELETE',
    })
  },

  // Interests
  async getInterests(): Promise<Interest[]> {
    return apiRequest<Interest[]>('/interests')
  },

  async getAllInterests(): Promise<Interest[]> {
    return apiRequest<Interest[]>('/interests/all')
  },

  async createInterest(name: string): Promise<Interest> {
    return apiRequest<Interest>('/interests', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  async updateInterest(id: string, data: Partial<Interest>): Promise<Interest> {
    return apiRequest<Interest>(`/interests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteInterest(id: string): Promise<void> {
    return apiRequest<void>(`/interests/${id}`, {
      method: 'DELETE'
    })
  },

  // Events
  async getEvents(): Promise<Event[]> {
    return apiRequest<Event[]>('/events')
  },

  async createEvent(event: Omit<Event, 'id' | 'rsvps' | 'waitlist'>): Promise<Event> {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    })
  },

  async getEvent(id: string): Promise<Event | null> {
    return apiRequest<Event>(`/events/${id}`)
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteEvent(id: string): Promise<void> {
    return apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
    })
  },

  async updateEventRSVP(eventId: string, memberId: string, response: 'yes' | 'no' | 'maybe'): Promise<Event> {
    return apiRequest<Event>(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ memberId, response }),
    })
  },

  async addMemberToWaitlist(eventId: string, memberId: string): Promise<Event> {
    return apiRequest<Event>(`/events/${eventId}/waitlist`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    })
  },

  async removeMemberFromWaitlist(eventId: string, memberId: string): Promise<Event> {
    return apiRequest<Event>(`/events/${eventId}/waitlist/${memberId}`, {
      method: 'DELETE',
    })
  },

  async getFilteredMembers(filters: {
    interests?: string[]
    cities?: string[]
    status?: string[]
  }): Promise<Member[]> {
    const params = new URLSearchParams()
    
    if (filters.interests?.length) {
      filters.interests.forEach(i => params.append('interests', i))
    }
    if (filters.cities?.length) {
      filters.cities.forEach(c => params.append('cities', c))
    }
    if (filters.status?.length) {
      filters.status.forEach(s => params.append('status', s))
    }
    
    const queryString = params.toString()
    return apiRequest<Member[]>(`/members/filtered${queryString ? `?${queryString}` : ''}`)
  },

  // Invitation Codes
  async getInvitationCodes(): Promise<InvitationCode[]> {
    return apiRequest<InvitationCode[]>('/invitation-codes')
  },

  async generateInvitationCodes(count: number): Promise<InvitationCode[]> {
    return apiRequest<InvitationCode[]>('/invitation-codes/generate', {
      method: 'POST',
      body: JSON.stringify({ count }),
    })
  },

  async revokeInvitationCode(id: string): Promise<void> {
    return apiRequest<void>(`/invitation-codes/${id}`, {
      method: 'DELETE',
    })
  },

  // Clubs
  async getClubs(): Promise<Club[]> {
    return apiRequest<Club[]>('/clubs')
  },

  async getCurrentClub(): Promise<Club> {
    return apiRequest<Club>('/clubs/current')
  },

  async updateCurrentClub(payload: Partial<Club>): Promise<Club> {
    return apiRequest<Club>('/clubs/current', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  async deleteClub(clubId: number): Promise<void> {
    return apiRequest<void>(`/clubs/${clubId}`, { method: 'DELETE' })
  },

  // Bulk Operations
  async bulkUpdateMemberStatus(memberIds: string[], status: 'active' | 'inactive' | 'invited'): Promise<any> {
    return apiRequest('/bulk/members/status', {
      method: 'POST',
      body: JSON.stringify({ memberIds, status }),
    })
  },

  async bulkAssignInterests(memberIds: string[], interests: string[]): Promise<any> {
    return apiRequest('/bulk/members/interests/assign', {
      method: 'POST',
      body: JSON.stringify({ memberIds, interests }),
    })
  },

  async bulkRemoveInterests(memberIds: string[], interests: string[]): Promise<any> {
    return apiRequest('/bulk/members/interests/remove', {
      method: 'POST',
      body: JSON.stringify({ memberIds, interests }),
    })
  },

  async bulkDeleteMembers(memberIds: string[]): Promise<any> {
    return apiRequest('/bulk/members/delete', {
      method: 'POST',
      body: JSON.stringify({ memberIds }),
    })
  },

  // Communication
  async sendEmailToMember(memberId: string, subject: string, body: string): Promise<any> {
    return apiRequest('/communication/email/member', {
      method: 'POST',
      body: JSON.stringify({ memberId, subject, body }),
    })
  },

  async sendBulkEmails(memberIds: string[], subject: string, body: string): Promise<any> {
    return apiRequest('/communication/email/bulk', {
      method: 'POST',
      body: JSON.stringify({ memberIds, subject, body }),
    })
  },

  async sendFilteredEmails(subject: string, body: string, filters?: {
    interests?: string[]
    cities?: string[]
    status?: string[]
    tiers?: string[]
  }): Promise<any> {
    return apiRequest('/communication/email/filtered', {
      method: 'POST',
      body: JSON.stringify({ subject, body, filters }),
    })
  },

  async getMemberEmailHistory(memberId: string): Promise<any[]> {
    return apiRequest(`/communication/email/history/member/${memberId}`)
  },

  async getAllEmailHistory(): Promise<any[]> {
    return apiRequest('/communication/email/history')
  },

  // Attendance Tracking
  async markAttendance(eventId: string, memberId: string, status: 'attended' | 'noShow'): Promise<Event> {
    return apiRequest<Event>(`/events/${eventId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ memberId, status }),
    })
  },

  async bulkMarkAttendance(eventId: string, memberIds: string[], status: 'attended' | 'noShow'): Promise<any> {
    return apiRequest(`/events/${eventId}/attendance/bulk`, {
      method: 'POST',
      body: JSON.stringify({ memberIds, status }),
    })
  },

  async getEventAttendance(eventId: string): Promise<any> {
    return apiRequest(`/events/${eventId}/attendance`)
  },

  // File Upload
  async uploadImage(file: File): Promise<{ path: string; filename: string }> {
    return uploadFile(file)
  }
}
