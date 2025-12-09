<template>
  <div class="event-detail-page" v-if="event">
    <div class="page-header">
      <button class="back-button" @click="$router.push({ name: 'events' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Events
      </button>
      <div class="header-actions">
        <span v-if="isPastEvent" class="past-event-badge">Past Event</span>
        <button v-if="!isPastEvent" class="btn btn-secondary" @click="showEditModal = true">Edit Event</button>
        <button v-if="!isPastEvent" class="btn btn-danger" @click="deleteEvent">Delete Event</button>
      </div>
    </div>

    <div class="event-detail-content">
      <!-- Event Image & Basic Info -->
      <div class="event-hero">
        <div class="event-image-large">
          <img v-if="event.image" :src="event.image" :alt="event.title" />
          <div v-else class="image-placeholder-large">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>
        <div class="event-info-card">
          <div class="title-row">
            <h1 class="event-title">{{ event.title }}</h1>
            <span v-if="isPastEvent" class="past-event-label">Past Event</span>
          </div>
          <div class="event-meta">
            <div class="meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ formatDate(event.date) }} at {{ event.time }}</span>
            </div>
            <div class="meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ event.location }}</span>
            </div>
            <div class="meta-item" v-if="event.price">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>${{ event.price }}</span>
            </div>
            <div class="meta-item" v-if="event.maxCapacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>{{ event.rsvps.yes.length }}/{{ event.maxCapacity }} capacity</span>
            </div>
          </div>
          <div class="event-description">
            <p>{{ event.description }}</p>
          </div>
        </div>
      </div>

      <!-- RSVP Management -->
      <div class="rsvp-section">
        <div class="section-header">
          <h2>RSVP Management</h2>
          <span v-if="isPastEvent" class="past-event-notice">View Only - Past Event</span>
          <div class="rsvp-stats">
            <div class="stat-badge yes">
              <span class="stat-label">Yes</span>
              <span class="stat-value">{{ event.rsvps.yes.length }}</span>
            </div>
            <div class="stat-badge no">
              <span class="stat-label">No</span>
              <span class="stat-value">{{ event.rsvps.no.length }}</span>
            </div>
            <div class="stat-badge maybe">
              <span class="stat-label">Maybe</span>
              <span class="stat-value">{{ event.rsvps.maybe.length }}</span>
            </div>
            <div class="stat-badge waitlist" v-if="event.waitlist && event.waitlist.length > 0">
              <span class="stat-label">Waitlist</span>
              <span class="stat-value">{{ event.waitlist.length }}</span>
            </div>
          </div>
        </div>

        <div class="rsvp-tabs">
          <button 
            :class="['tab', { active: activeTab === 'yes' }]"
            @click="activeTab = 'yes'"
          >
            Yes ({{ event.rsvps.yes.length }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'no' }]"
            @click="activeTab = 'no'"
          >
            No ({{ event.rsvps.no.length }})
          </button>
          <button 
            :class="['tab', { active: activeTab === 'maybe' }]"
            @click="activeTab = 'maybe'"
          >
            Maybe ({{ event.rsvps.maybe.length }})
          </button>
          <button 
            v-if="event.waitlist && event.waitlist.length > 0"
            :class="['tab', { active: activeTab === 'waitlist' }]"
            @click="activeTab = 'waitlist'"
          >
            Waitlist ({{ event.waitlist.length }})
          </button>
        </div>

        <div class="rsvp-list">
          <div v-if="currentRSVPList.length === 0" class="empty-state">
            <p>No members in this category</p>
          </div>
          <div v-for="memberId in currentRSVPList" :key="memberId" class="rsvp-item">
            <div class="member-info">
              <div class="member-avatar">{{ getMemberInitials(memberId) }}</div>
              <div class="member-details">
                <div class="member-name">{{ getMemberName(memberId) }}</div>
                <div class="member-email">{{ getMemberEmail(memberId) }}</div>
              </div>
            </div>
            <div class="rsvp-actions">
              <select 
                :value="getMemberRSVP(memberId)" 
                @change="updateMemberRSVP(memberId, $event.target.value)"
                :disabled="isPastEvent"
                class="rsvp-select"
                :class="{ 'disabled': isPastEvent }"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
                <option value="waitlist" v-if="event.maxCapacity">Waitlist</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Tracking -->
      <div class="attendance-section" v-if="isPastEvent || event.attendance">
        <div class="section-header">
          <h2>Attendance Tracking</h2>
          <div class="attendance-stats">
            <div class="stat-badge attended">
              <span class="stat-label">Attended</span>
              <span class="stat-value">{{ event.attendance?.attended?.length || 0 }}</span>
            </div>
            <div class="stat-badge no-show">
              <span class="stat-label">No Show</span>
              <span class="stat-value">{{ event.attendance?.noShow?.length || 0 }}</span>
            </div>
            <div class="stat-badge rsvp-yes">
              <span class="stat-label">RSVP Yes</span>
              <span class="stat-value">{{ event.rsvps.yes.length }}</span>
            </div>
          </div>
        </div>

        <div class="attendance-tabs">
          <button 
            :class="['tab', { active: attendanceTab === 'attended' }]"
            @click="attendanceTab = 'attended'"
          >
            Attended ({{ event.attendance?.attended?.length || 0 }})
          </button>
          <button 
            :class="['tab', { active: attendanceTab === 'noShow' }]"
            @click="attendanceTab = 'noShow'"
          >
            No Show ({{ event.attendance?.noShow?.length || 0 }})
          </button>
          <button 
            :class="['tab', { active: attendanceTab === 'notMarked' }]"
            @click="attendanceTab = 'notMarked'"
          >
            Not Marked ({{ notMarkedCount }})
          </button>
        </div>

        <div class="attendance-list">
          <div v-if="currentAttendanceList.length === 0" class="empty-state">
            <p>No members in this category</p>
          </div>
          <div v-for="memberId in currentAttendanceList" :key="memberId" class="attendance-item">
            <div class="member-info">
              <div class="member-avatar">{{ getMemberInitials(memberId) }}</div>
              <div class="member-details">
                <div class="member-name">{{ getMemberName(memberId) }}</div>
                <div class="member-email">{{ getMemberEmail(memberId) }}</div>
              </div>
            </div>
            <div class="attendance-actions">
              <button 
                class="btn btn-sm btn-success" 
                @click="markAttendance(memberId, 'attended')"
                :disabled="attendanceTab === 'attended'"
              >
                Mark Attended
              </button>
              <button 
                class="btn btn-sm btn-warning" 
                @click="markAttendance(memberId, 'noShow')"
                :disabled="attendanceTab === 'noShow'"
              >
                Mark No Show
              </button>
            </div>
          </div>
        </div>

        <div v-if="event.rsvps.yes.length > 0" class="bulk-attendance-actions">
          <button class="btn btn-secondary" @click="showBulkAttendanceModal = true">
            Bulk Mark Attendance
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Attendance Modal -->
    <div v-if="showBulkAttendanceModal" class="modal-overlay" @click.self="showBulkAttendanceModal = false">
      <div class="modal-content modal-attendance">
        <div class="modal-header">
          <h3>Bulk Mark Attendance</h3>
          <button class="modal-close" @click="showBulkAttendanceModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="attendance-modal-stats">
            <div class="stat-item">
              <span class="stat-label">Total RSVP'd</span>
              <span class="stat-value">{{ event.rsvps.yes.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Selected</span>
              <span class="stat-value highlight">{{ bulkAttendanceMembers.length }}</span>
            </div>
          </div>

          <div class="modal-form">
            <div class="form-group">
              <div class="form-header">
                <label>Select Members</label>
                <div class="select-actions">
                  <button 
                    type="button" 
                    class="btn-link" 
                    @click="selectAllMembers"
                    v-if="bulkAttendanceMembers.length < availableMembers.length"
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    class="btn-link" 
                    @click="clearAllMembers"
                    v-if="bulkAttendanceMembers.length > 0"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div class="search-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                  v-model="memberSearchQuery"
                  type="text" 
                  class="search-input"
                  placeholder="Search members by name or email..."
                />
              </div>

              <div class="members-checkboxes">
                <div 
                  v-for="memberId in filteredMembersForAttendance" 
                  :key="memberId" 
                  class="member-checkbox-item"
                  :class="{ selected: bulkAttendanceMembers.includes(memberId) }"
                >
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      :value="memberId" 
                      v-model="bulkAttendanceMembers"
                      @change="updateSelectedCount"
                    />
                    <div class="member-avatar-small">
                      {{ getMemberInitials(memberId) }}
                    </div>
                    <div class="member-info-small">
                      <div class="member-name-small">{{ getMemberName(memberId) }}</div>
                      <div class="member-email-small">{{ getMemberEmail(memberId) }}</div>
                    </div>
                  </label>
                </div>
                <div v-if="filteredMembersForAttendance.length === 0" class="empty-search">
                  <p>No members found matching "{{ memberSearchQuery }}"</p>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Attendance Status</label>
              <div class="status-options">
                <button 
                  :class="['status-option', 'status-attended', { active: bulkAttendanceStatus === 'attended' }]"
                  @click="bulkAttendanceStatus = 'attended'"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Attended</span>
                </button>
                <button 
                  :class="['status-option', 'status-noShow', { active: bulkAttendanceStatus === 'noShow' }]"
                  @click="bulkAttendanceStatus = 'noShow'"
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>No Show</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeBulkAttendanceModal">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="handleBulkAttendance" 
            :disabled="bulkAttendanceMembers.length === 0"
          >
            <span v-if="bulkAttendanceMembers.length > 0">
              Mark {{ bulkAttendanceMembers.length }} as {{ bulkAttendanceStatus === 'attended' ? 'Attended' : 'No Show' }}
            </span>
            <span v-else>Select Members</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="confirm-modal">
        <div class="confirm-modal-header">
          <div class="confirm-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            </svg>
          </div>
          <h2 class="confirm-title">Delete Event</h2>
          <p class="confirm-message">Are you sure you want to delete <strong>"{{ event?.title }}"</strong>? This action cannot be undone.</p>
        </div>
        <div class="confirm-modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="confirmDelete">Delete Event</button>
        </div>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Event</h2>
          <button class="modal-close" @click="closeEditModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body" v-if="event">
          <div class="event-form">
            <div class="form-row">
              <div class="form-group">
                <label>Event Title *</label>
                <input v-model="editForm.title" type="text" class="form-input" placeholder="Enter event title" />
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input v-model="editForm.date" type="date" class="form-input" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Time *</label>
                <input v-model="editForm.time" type="time" class="form-input" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <input v-model="editForm.location" type="text" class="form-input" placeholder="Enter location" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Max Capacity</label>
                <input v-model.number="editForm.maxCapacity" type="number" class="form-input" placeholder="Optional" />
              </div>
              <div class="form-group">
                <label>Price</label>
                <input v-model.number="editForm.price" type="number" class="form-input" placeholder="Optional" />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Description *</label>
              <textarea v-model="editForm.description" class="form-textarea" rows="4" placeholder="Enter event description"></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="updateEvent" :disabled="isUpdating">
            {{ isUpdating ? 'Updating...' : 'Update Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <p>Loading event...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Event, type Member } from '../services/api'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const event = ref<Event | null>(null)
const members = ref<Member[]>([])
const activeTab = ref<'yes' | 'no' | 'maybe' | 'waitlist'>('yes')
const attendanceTab = ref<'attended' | 'noShow' | 'notMarked'>('attended')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showBulkAttendanceModal = ref(false)
const isUpdating = ref(false)
const bulkAttendanceMembers = ref<string[]>([])
const bulkAttendanceStatus = ref<'attended' | 'noShow'>('attended')
const memberSearchQuery = ref('')

const editForm = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  maxCapacity: undefined as number | undefined,
  price: undefined as number | undefined,
  description: ''
})

const isPastEvent = computed(() => {
  if (!event.value) return false
  const eventDate = new Date(event.value.date)
  eventDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate < today
})

const currentRSVPList = computed(() => {
  if (!event.value) return []
  
  switch (activeTab.value) {
    case 'yes':
      return event.value.rsvps.yes
    case 'no':
      return event.value.rsvps.no
    case 'maybe':
      return event.value.rsvps.maybe
    case 'waitlist':
      return event.value.waitlist || []
    default:
      return []
  }
})

const currentAttendanceList = computed(() => {
  if (!event.value) return []
  
  switch (attendanceTab.value) {
    case 'attended':
      return event.value.attendance?.attended || []
    case 'noShow':
      return event.value.attendance?.noShow || []
    case 'notMarked':
      // Members who RSVP'd yes but haven't been marked as attended or no-show
      const rsvpYes = event.value.rsvps.yes || []
      const attended = event.value.attendance?.attended || []
      const noShow = event.value.attendance?.noShow || []
      return rsvpYes.filter(id => !attended.includes(id) && !noShow.includes(id))
    default:
      return []
  }
})

const notMarkedCount = computed(() => {
  if (!event.value) return 0
  const rsvpYes = event.value.rsvps.yes || []
  const attended = event.value.attendance?.attended || []
  const noShow = event.value.attendance?.noShow || []
  return rsvpYes.filter(id => !attended.includes(id) && !noShow.includes(id)).length
})

const availableMembers = computed(() => {
  if (!event.value) return []
  return event.value.rsvps.yes || []
})

const filteredMembersForAttendance = computed(() => {
  if (!memberSearchQuery.value.trim()) {
    return availableMembers.value
  }
  
  const query = memberSearchQuery.value.toLowerCase()
  return availableMembers.value.filter(memberId => {
    const name = getMemberName(memberId).toLowerCase()
    const email = getMemberEmail(memberId).toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

const selectAllMembers = () => {
  bulkAttendanceMembers.value = [...filteredMembersForAttendance.value]
}

const clearAllMembers = () => {
  bulkAttendanceMembers.value = []
}

const updateSelectedCount = () => {
  // This is just for reactivity, the computed will handle it
}

const closeBulkAttendanceModal = () => {
  showBulkAttendanceModal.value = false
  bulkAttendanceMembers.value = []
  memberSearchQuery.value = ''
  bulkAttendanceStatus.value = 'attended'
}

const getMemberName = (id: string): string => {
  const member = members.value.find(m => m.id === id)
  return member?.name || 'Unknown Member'
}

const getMemberEmail = (id: string): string => {
  const member = members.value.find(m => m.id === id)
  return member?.email || ''
}

const getMemberInitials = (id: string): string => {
  const name = getMemberName(id)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getMemberRSVP = (id: string): string => {
  if (!event.value) return 'no'
  if (event.value.rsvps.yes.includes(id)) return 'yes'
  if (event.value.rsvps.no.includes(id)) return 'no'
  if (event.value.rsvps.maybe.includes(id)) return 'maybe'
  if (event.value.waitlist?.includes(id)) return 'waitlist'
  return 'no'
}

const updateMemberRSVP = async (memberId: string, response: string) => {
  if (!event.value) return
  
  // Prevent updates for past events
  if (isPastEvent.value) {
    toast.showToast('Cannot modify RSVPs for past events', 'error')
    return
  }
  
  try {
    if (response === 'waitlist') {
      await api.addMemberToWaitlist(event.value.id, memberId)
      toast.showToast('Member added to waitlist successfully', 'success')
    } else {
      await api.updateEventRSVP(event.value.id, memberId, response as 'yes' | 'no' | 'maybe')
      toast.showToast('RSVP updated successfully', 'success')
    }
    
    // Reload event
    event.value = await api.getEvent(event.value.id) || null
  } catch (error) {
    toast.showToast('Failed to update RSVP. Please try again.', 'error')
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const deleteEvent = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!event.value) return
  
  try {
    await api.deleteEvent(event.value.id)
    toast.showToast('Event deleted successfully', 'success')
    router.push({ name: 'events' })
  } catch (error) {
    toast.showToast('Failed to delete event. Please try again.', 'error')
    showDeleteModal.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  // Reset form to current event values
  if (event.value) {
    editForm.value = {
      title: event.value.title,
      date: event.value.date,
      time: event.value.time,
      location: event.value.location,
      maxCapacity: event.value.maxCapacity,
      price: event.value.price,
      description: event.value.description
    }
  }
}

const markAttendance = async (memberId: string, status: 'attended' | 'noShow') => {
  if (!event.value) return
  
  try {
    await api.markAttendance(event.value.id, memberId, status)
    toast.showToast(`Member marked as ${status === 'attended' ? 'attended' : 'no-show'}`, 'success')
    // Reload event
    event.value = await api.getEvent(event.value.id) || null
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to mark attendance', 'error')
  }
}

const handleBulkAttendance = async () => {
  if (!event.value || bulkAttendanceMembers.value.length === 0) return
  
  try {
    await api.bulkMarkAttendance(event.value.id, bulkAttendanceMembers.value, bulkAttendanceStatus.value)
    toast.showToast(`Attendance marked for ${bulkAttendanceMembers.value.length} members`, 'success')
    closeBulkAttendanceModal()
    // Reload event
    event.value = await api.getEvent(event.value.id) || null
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to mark attendance', 'error')
  }
}

const updateEvent = async () => {
  if (!event.value) return
  
  // Validation
  if (!editForm.value.title || !editForm.value.date || !editForm.value.time || !editForm.value.location || !editForm.value.description) {
    toast.showToast('Please fill in all required fields', 'error')
    return
  }

  isUpdating.value = true
  try {
    await api.updateEvent(event.value.id, {
      title: editForm.value.title,
      date: editForm.value.date,
      time: editForm.value.time,
      location: editForm.value.location,
      maxCapacity: editForm.value.maxCapacity ? Number(editForm.value.maxCapacity) : undefined,
      price: editForm.value.price ? Number(editForm.value.price) : undefined,
      description: editForm.value.description
    })
    
    // Reload event
    event.value = await api.getEvent(event.value.id) || null
    closeEditModal()
    toast.showToast('Event updated successfully', 'success')
  } catch (error) {
    console.error('Error updating event:', error)
    toast.showToast('Failed to update event. Please try again.', 'error')
  } finally {
    isUpdating.value = false
  }
}

onMounted(async () => {
  const eventId = route.params.id as string
  event.value = await api.getEvent(eventId)
  members.value = await api.getMembers()
  
  // Initialize edit form with current event values
  if (event.value) {
    editForm.value = {
      title: event.value.title,
      date: event.value.date,
      time: event.value.time,
      location: event.value.location,
      maxCapacity: event.value.maxCapacity,
      price: event.value.price,
      description: event.value.description
    }
  }
})
</script>

<style scoped>
.event-detail-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #1a1a1a;
  border-color: #d4af37;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  letter-spacing: 0.3px;
  font-family: var(--font-body);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--color-gray);
  color: #ffffff;
  border: 1px solid var(--color-gray-soft);
}

.btn-secondary:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  box-shadow: var(--shadow-md);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.btn-danger:active {
  transform: translateY(0);
}

.event-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  animation: fadeIn var(--transition-slow);
}

.event-hero {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
}

.event-image-large {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray-soft);
  transition: all var(--transition-base);
}

.event-image-large:hover {
  box-shadow: var(--shadow-xl), var(--shadow-gold);
  transform: scale(1.02);
}

.event-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.event-image-large:hover img {
  transform: scale(1.05);
}

.image-placeholder-large {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-gray) 0%, var(--color-gray-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 48px;
}

.event-info-card {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.event-info-card:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.event-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  flex: 1;
  letter-spacing: -0.02em;
}

.past-event-label {
  background: rgba(136, 136, 136, 0.2);
  border: 1px solid rgba(136, 136, 136, 0.4);
  color: #888;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.past-event-badge {
  background: rgba(136, 136, 136, 0.2);
  border: 1px solid rgba(136, 136, 136, 0.4);
  color: #888;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.past-event-notice {
  background: rgba(136, 136, 136, 0.15);
  border: 1px solid rgba(136, 136, 136, 0.3);
  color: #888;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  font-style: italic;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #888;
  font-size: 14px;
}

.meta-item svg {
  color: var(--color-gold);
  filter: drop-shadow(0 0 4px var(--color-gold-glow));
}

.event-description {
  color: #cccccc;
  line-height: 1.6;
  font-size: 15px;
}

.rsvp-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.rsvp-section:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.attendance-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.attendance-section:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.attendance-stats {
  display: flex;
  gap: 12px;
}

.attendance-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-soft);
}

.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: var(--spacing-lg);
}

.attendance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.attendance-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
}

.attendance-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-success {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.btn-success:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.3);
  border-color: #4ade80;
}

.btn-warning {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.btn-warning:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
}

.btn-success:disabled,
.btn-warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bulk-attendance-actions {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-soft);
}

.stat-badge.attended {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.stat-badge.no-show {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.stat-badge.rsvp-yes {
  background: rgba(129, 140, 248, 0.2);
  border: 1px solid rgba(129, 140, 248, 0.3);
  color: #818cf8;
}

/* Bulk Attendance Modal Styles */
.modal-attendance {
  max-width: 700px;
}

.modal-attendance .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-soft);
  margin-bottom: 0;
}

.modal-attendance .modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
}

.modal-close {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.modal-close:hover {
  background: var(--color-gray);
  color: #ffffff;
}

.modal-attendance .modal-body {
  padding: var(--spacing-xl);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.modal-attendance .form-group {
  margin-bottom: var(--spacing-xl);
}

.modal-attendance .form-group:last-child {
  margin-bottom: 0;
}

.attendance-modal-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-soft);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .stat-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-item .stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.stat-item .stat-value.highlight {
  color: var(--color-gold);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.form-header label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.select-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--color-gold);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link:hover {
  color: var(--color-gold-light);
  background: var(--color-gold-subtle);
}

.search-wrapper {
  position: relative;
  margin-bottom: var(--spacing-md);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  padding: 10px 12px 10px 40px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-body);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px var(--color-gold-subtle);
}

.search-input::placeholder {
  color: #666;
}

.members-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  background: var(--color-gray);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-soft);
  margin-bottom: var(--spacing-lg);
}

.member-checkbox-item {
  transition: all var(--transition-base);
}

.member-checkbox-item.selected {
  background: var(--color-gold-subtle);
  border-radius: var(--radius-sm);
}

.member-checkbox-item .checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  width: 100%;
}

.member-checkbox-item .checkbox-label:hover {
  background: var(--color-gray-soft);
}

.member-checkbox-item.selected .checkbox-label {
  background: transparent;
}

.member-checkbox-item .checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-gold);
  flex-shrink: 0;
}

.member-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.member-info-small {
  flex: 1;
  min-width: 0;
}

.member-name-small {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
  font-size: 14px;
}

.member-email-small {
  font-size: 12px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-search {
  padding: var(--spacing-xl);
  text-align: center;
  color: #888;
  font-size: 14px;
}

.status-options {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.status-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-gray);
  border: 2px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  color: #888;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-base);
}

.status-option:hover {
  border-color: var(--color-gold-subtle);
  color: #ffffff;
}

.status-option.active.status-attended {
  background: rgba(74, 222, 128, 0.2);
  border-color: #4ade80;
  color: #4ade80;
}

.status-option.active.status-noShow {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #fbbf24;
}

.status-option svg {
  flex-shrink: 0;
}

.modal-attendance .modal-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-soft);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: auto;
}

/* Responsive Styles for Modal */
@media (max-width: 768px) {
  .modal-attendance {
    max-width: 95vw;
    max-height: 95vh;
  }

  .modal-attendance .modal-header,
  .modal-attendance .modal-body,
  .modal-attendance .modal-footer {
    padding: var(--spacing-lg);
  }

  .attendance-modal-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .status-options {
    flex-direction: column;
  }

  .status-option {
    width: 100%;
  }

  .members-checkboxes {
    max-height: 300px;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .select-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .modal-attendance {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  .member-checkbox-item .checkbox-label {
    padding: var(--spacing-sm);
  }

  .member-avatar-small {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .member-name-small {
    font-size: 13px;
  }

  .member-email-small {
    font-size: 11px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.section-header h2 {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.01em;
}

.rsvp-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.stat-badge.yes {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.stat-badge.no {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.stat-badge.maybe {
  background: rgba(129, 140, 248, 0.1);
  border: 1px solid rgba(129, 140, 248, 0.3);
}

.stat-badge.waitlist {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-top: 4px;
}

.rsvp-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-soft);
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-base);
  position: relative;
  font-family: var(--font-body);
}

.tab::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-gold);
  transform: scaleX(0);
  transition: transform var(--transition-base);
}

.tab:hover {
  color: #ffffff;
  background: var(--color-gray);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tab.active {
  color: var(--color-gold);
  font-weight: 600;
}

.tab.active::after {
  transform: scaleX(1);
}

.rsvp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rsvp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.rsvp-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  transform: translateX(4px);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 2px solid var(--color-gold-subtle);
  box-shadow: 0 0 10px var(--color-gold-subtle);
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.member-email {
  font-size: 12px;
  color: #888;
}

.rsvp-select {
  background: var(--color-dark-soft);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: var(--font-body);
  font-weight: 500;
}

.rsvp-select:hover:not(:disabled) {
  border-color: var(--color-gold-subtle);
  background: var(--color-gray);
}

.rsvp-select:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px var(--color-gold-subtle);
}

.rsvp-select.disabled,
.rsvp-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--color-black-soft);
  color: #666;
  border-color: var(--color-gray);
}

.rsvp-select.disabled:hover,
.rsvp-select:disabled:hover {
  border-color: var(--color-gray);
  transform: none;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: #888;
}

.empty-state::before {
  content: '📋';
  display: block;
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 5, 5, 0.85);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-xl);
  animation: fadeIn var(--transition-base);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(212, 175, 55, 0.1) inset,
    0 0 40px rgba(212, 175, 55, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: slideUp var(--transition-slow);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #2a2a2a;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 30px;
  border-top: 1px solid #2a2a2a;
}

/* Event Form Styles */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.form-input,
.form-textarea {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #d4af37;
  background: #141414;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Confirmation Modal Styles */
.confirm-modal {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.99) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(212, 175, 55, 0.15) inset,
    0 0 50px rgba(212, 175, 55, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: slideUp var(--transition-slow);
  overflow: hidden;
}

.confirm-modal-header {
  padding: 40px 40px 30px;
  text-align: center;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(220, 38, 38, 0.1);
  border: 2px solid rgba(220, 38, 38, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}

.confirm-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
}

.confirm-message {
  font-size: 15px;
  color: #cccccc;
  line-height: 1.6;
  margin: 0;
}

.confirm-message strong {
  color: #ffffff;
  font-weight: 600;
}

.confirm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 40px 40px;
  border-top: 1px solid #2a2a2a;
}

.confirm-modal-footer .btn {
  min-width: 120px;
  padding: 12px 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content,
  .confirm-modal {
    max-width: 100%;
    margin: 0;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer,
  .confirm-modal-header,
  .confirm-modal-footer {
    padding: 20px;
  }
  
  .confirm-icon {
    width: 60px;
    height: 60px;
  }
  
  .confirm-title {
    font-size: 24px;
  }
}

@media (max-width: 968px) {
  .event-hero {
    grid-template-columns: 1fr;
  }
}
</style>

