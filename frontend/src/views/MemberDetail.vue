<template>
  <div class="member-detail-page" v-if="member">
    <!-- Pull to Refresh Indicator -->
    <div v-if="pullToRefreshDistance > 0" class="pull-to-refresh" :style="{ height: `${Math.min(pullToRefreshDistance, 60)}px` }">
      <div class="pull-to-refresh-content">
        <svg v-if="!isRefreshing" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        <div v-else class="spinner"></div>
        <span>{{ isRefreshing ? 'Refreshing...' : 'Pull to refresh' }}</span>
      </div>
    </div>
    <div class="page-header">
      <button class="back-button" @click="$router.push({ name: 'members' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Members
      </button>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="openEditModal">Edit Member</button>
        <button class="btn btn-danger" @click="showDeleteModal = true">Delete Member</button>
      </div>
    </div>

    <div class="member-detail-content">
      <!-- Member Profile Card -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="member-avatar-large">
            <img v-if="member.profilePhoto" :src="member.profilePhoto" :alt="member.name" />
            <span v-else>{{ getInitials(member.name) }}</span>
          </div>
          <div class="profile-info">
            <div class="member-name-row">
              <h1 class="member-name-large">{{ member.name }}</h1>
              <MemberTierBadge v-if="member.tier" :tier="member.tier" />
            </div>
            <p class="member-email-large">{{ member.email }}</p>
            <div class="member-status-badge" :class="member.status">
              {{ member.status }}
            </div>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">Phone</span>
            <span class="detail-value">{{ member.phone || 'Not provided' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">City</span>
            <span class="detail-value">{{ member.city || 'Not provided' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Joined Date</span>
            <span class="detail-value">{{ formatDate(member.joinedDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Invitation Code</span>
            <span class="detail-value">{{ member.invitationCode || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Interests Section -->
      <div class="interests-card">
        <h2 class="card-title">Interests</h2>
        <div class="interests-list">
          <span 
            v-for="interest in member.interests" 
            :key="interest"
            class="interest-tag"
          >
            {{ interest }}
          </span>
          <span v-if="member.interests.length === 0" class="no-interests">No interests selected</span>
        </div>
      </div>

      <!-- Event History -->
      <div class="events-card">
        <h2 class="card-title">Event History</h2>
        <div class="events-list">
          <div v-if="memberEvents.length === 0" class="empty-state">
            <p>No event history</p>
          </div>
          <div 
            v-for="event in memberEvents" 
            :key="event.id"
            class="event-item"
            @click="$router.push({ name: 'event-detail', params: { id: event.id } })"
          >
            <div class="event-info">
              <h3 class="event-title-small">{{ event.title }}</h3>
              <p class="event-date-small">{{ formatDate(event.date) }} at {{ event.time }}</p>
            </div>
            <div class="event-rsvp">
              <span :class="['rsvp-badge', getMemberRSVPStatus(event.id)]">
                {{ getMemberRSVPStatus(event.id) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Edit Member</h3>
          <button class="modal-close" @click="closeEditModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Name *</label>
                <input 
                  v-model="editForm.name" 
                  type="text" 
                  :class="['form-input', { 'input-error': editErrors.name }]"
                  placeholder="Full name"
                  @input="clearEditError('name')"
                />
                <span v-if="editErrors.name" class="error-message">{{ editErrors.name }}</span>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input 
                  v-model="editForm.email" 
                  type="email" 
                  :class="['form-input', { 'input-error': editErrors.email }]"
                  placeholder="email@example.com"
                  @input="clearEditError('email')"
                />
                <span v-if="editErrors.email" class="error-message">{{ editErrors.email }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone *</label>
                <input 
                  v-model="editForm.phone" 
                  type="tel" 
                  :class="['form-input', { 'input-error': editErrors.phone }]"
                  placeholder="+1 234 567 8900"
                  @input="clearEditError('phone')"
                />
                <span v-if="editErrors.phone" class="error-message">{{ editErrors.phone }}</span>
              </div>
              <div class="form-group">
                <label>City</label>
                <input 
                  v-model="editForm.city" 
                  type="text" 
                  class="form-input" 
                  placeholder="City name"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status</label>
                <select v-model="editForm.status" class="form-select form-select-readonly" disabled>
                  <option value="invited">Invited</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="form-group">
                <label>Invitation Code</label>
                <input 
                  v-model="editForm.invitationCode" 
                  type="text" 
                  class="form-input form-input-readonly" 
                  placeholder="N/A"
                  readonly
                  disabled
                />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Interests</label>
              <div class="interests-chips-container">
                <div 
                  v-for="interest in availableInterests" 
                  :key="interest.id"
                  :class="['interest-chip-selectable', { selected: editForm.interests.includes(interest.name) }]"
                  @click="toggleEditInterest(interest.name)"
                >
                  <svg 
                    v-if="editForm.interests.includes(interest.name)"
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                    class="chip-check-icon"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span class="chip-text">{{ interest.name }}</span>
                </div>
                <div v-if="availableInterests.length === 0" class="no-interests-message">
                  <p>No interests available. Add interests in Settings.</p>
                </div>
              </div>
              <div v-if="editForm.interests.length > 0" class="selected-interests-summary">
                <span class="summary-text">{{ editForm.interests.length }} selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="handleUpdateMember"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Updating...' : 'Update Member' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Member Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content delete-modal">
        <div class="delete-modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="delete-modal-content">
          <h3 class="delete-modal-title">Delete Member</h3>
          <p class="delete-modal-message">
            Are you sure you want to delete <strong>{{ member?.name }}</strong>?
          </p>
          <p class="delete-modal-warning">
            This action cannot be undone. All member data, event history, and associated records will be permanently removed.
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="confirmDeleteMember" :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete Member' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <SkeletonLoader type="card" style="height: 300px; margin-bottom: 24px;" />
    <SkeletonLoader type="card" style="height: 400px; margin-bottom: 24px;" />
    <SkeletonLoader type="card" style="height: 200px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Member, type Event, type Interest } from '../services/api'
import MemberTierBadge from '../components/MemberTierBadge.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { useToast } from '../composables/useToast'
import { usePullToRefresh } from '../composables/usePullToRefresh'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const member = ref<Member | null>(null)
const events = ref<Event[]>([])
const availableInterests = ref<Interest[]>([])
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const isUpdating = ref(false)

// Body scroll lock - lock when any modal is open
const isAnyModalOpen = computed(() => 
  showEditModal.value || 
  showDeleteModal.value
)
useBodyScrollLock(isAnyModalOpen)
const editForm = ref({
  name: '',
  email: '',
  phone: '',
  city: '',
  interests: [] as string[],
  status: 'invited' as 'active' | 'inactive' | 'invited',
  invitationCode: ''
})
const editErrors = ref<{
  name?: string
  email?: string
  phone?: string
}>({})

const memberEvents = computed(() => {
  if (!member.value) return []
  
  return events.value.filter(event => {
    return event.rsvps.yes.includes(member.value!.id) ||
           event.rsvps.no.includes(member.value!.id) ||
           event.rsvps.maybe.includes(member.value!.id) ||
           event.waitlist?.includes(member.value!.id)
  })
})

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getMemberRSVPStatus = (eventId: string): string => {
  if (!member.value) return 'no'
  const event = events.value.find(e => e.id === eventId)
  if (!event) return 'no'
  
  if (event.rsvps.yes.includes(member.value.id)) return 'yes'
  if (event.rsvps.no.includes(member.value.id)) return 'no'
  if (event.rsvps.maybe.includes(member.value.id)) return 'maybe'
  if (event.waitlist?.includes(member.value.id)) return 'waitlist'
  return 'no'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const openEditModal = () => {
  if (!member.value) return
  editForm.value = {
    name: member.value.name,
    email: member.value.email,
    phone: member.value.phone || '',
    city: member.value.city || '',
    interests: [...(member.value.interests || [])],
    status: member.value.status,
    invitationCode: member.value.invitationCode || ''
  }
  editErrors.value = {}
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editErrors.value = {}
}

const validateEditForm = (): boolean => {
  editErrors.value = {}
  let isValid = true

  // Validate name
  if (!editForm.value.name || editForm.value.name.trim() === '') {
    editErrors.value.name = 'Name is required'
    isValid = false
  }

  // Validate email
  if (!editForm.value.email || editForm.value.email.trim() === '') {
    editErrors.value.email = 'Email is required'
    isValid = false
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.value.email)) {
      editErrors.value.email = 'Please enter a valid email address'
      isValid = false
    }
  }

  // Validate phone
  if (!editForm.value.phone || editForm.value.phone.trim() === '') {
    editErrors.value.phone = 'Phone is required'
    isValid = false
  }

  return isValid
}

const clearEditError = (field: 'name' | 'email' | 'phone') => {
  if (editErrors.value[field]) {
    delete editErrors.value[field]
  }
}

const toggleEditInterest = (interestName: string) => {
  const index = editForm.value.interests.indexOf(interestName)
  if (index > -1) {
    editForm.value.interests.splice(index, 1)
  } else {
    editForm.value.interests.push(interestName)
  }
}

const handleUpdateMember = async () => {
  if (!member.value) return

  // Validate form
  if (!validateEditForm()) {
    toast.showToast('Please fill in all required fields correctly', 'error')
    return
  }

  isUpdating.value = true
  try {
    const updated = await api.updateMember(member.value.id, {
      name: editForm.value.name.trim(),
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim(),
      city: editForm.value.city?.trim() || undefined,
      interests: editForm.value.interests
      // Note: invitationCode and status are not editable, so we don't send them
    })
    member.value = updated
    toast.showToast('Member updated successfully', 'success')
    closeEditModal()
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to update member', 'error')
  } finally {
    isUpdating.value = false
  }
}

const confirmDeleteMember = async () => {
  if (!member.value) return
  
  isDeleting.value = true
  try {
    await api.deleteMember(member.value.id)
    toast.showToast('Member deleted successfully', 'success')
    router.push({ name: 'members' })
  } catch (error: any) {
    console.error('Failed to delete member:', error)
    toast.showToast('Failed to delete member. Please try again.', 'error')
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

const loadMember = async () => {
  try {
    const memberId = route.params.id as string
    member.value = await api.getMember(memberId)
    if (!member.value) {
      toast.showToast('Member not found', 'error')
      router.push({ name: 'members' })
      return
    }
    
    // Populate edit form
    editForm.value = {
      name: member.value.name,
      email: member.value.email,
      phone: member.value.phone || '',
      city: member.value.city || '',
      status: member.value.status,
      interests: [...member.value.interests],
      invitationCode: member.value.invitationCode || ''
    }
    
    events.value = await api.getEvents()
    availableInterests.value = await api.getInterests()
  } catch (error: any) {
    // Silent refresh - no toast
  }
}

const refreshData = async () => {
  await loadMember()
}

// Pull to refresh
const { isRefreshing, pullToRefreshDistance } = usePullToRefresh(refreshData)

onMounted(async () => {
  await loadMember()
})
</script>

<style scoped>
.member-detail-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
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
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #2a2a2a;
}

.btn-secondary:hover {
  background: #2a2a2a;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
}

.btn-danger:hover {
  background: #b91c1c;
}

.member-detail-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-card,
.interests-card,
.events-card {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.profile-card:hover,
.interests-card:hover,
.events-card:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #2a2a2a;
}

.member-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 40px;
  border: 4px solid var(--color-gold-subtle);
  box-shadow: var(--shadow-gold);
  overflow: hidden;
  position: relative;
}

.member-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar-large span {
  position: relative;
  z-index: 1;
}

.profile-info {
  flex: 1;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-sm);
}

.member-name-large {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.member-email-large {
  font-size: 16px;
  color: #888;
  margin: 0 0 12px 0;
}

.member-status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.member-status-badge.active {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.member-status-badge.inactive {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.member-status-badge.invited {
  background: rgba(129, 140, 248, 0.2);
  color: #818cf8;
  border: 1px solid rgba(129, 140, 248, 0.3);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #1a1a1a;
}

.detail-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-value {
  font-size: 14px;
  color: #ffffff;
}

.card-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0 0 var(--spacing-xl) 0;
  letter-spacing: -0.01em;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-tag {
  padding: 8px 16px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  color: #d4af37;
  font-size: 14px;
}

.no-interests {
  color: #888;
  font-style: italic;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item:hover {
  background: #2a2a2a;
  border-color: #d4af37;
}

.event-info {
  flex: 1;
}

.event-title-small {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.event-date-small {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.rsvp-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.rsvp-badge.yes {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.rsvp-badge.no {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.rsvp-badge.maybe {
  background: rgba(129, 140, 248, 0.2);
  color: #818cf8;
}

.rsvp-badge.waitlist {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
}

/* Delete Modal Styles */
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
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: 0;
  max-width: 500px;
  width: 100%;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(212, 175, 55, 0.15) inset;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: slideDown var(--transition-slow);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delete-modal {
  max-width: 500px;
  text-align: center;
}

.delete-modal-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-full);
  color: #ef4444;
}

.delete-modal-content {
  margin-bottom: var(--spacing-xl);
}

.delete-modal-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 var(--spacing-md) 0;
}

.delete-modal-message {
  font-size: 16px;
  color: #ffffff;
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.6;
}

.delete-modal-message strong {
  color: var(--color-gold);
  font-weight: 600;
}

.delete-modal-warning {
  font-size: 14px;
  color: #888;
  margin: var(--spacing-lg) 0 0 0;
  line-height: 1.6;
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  padding: var(--spacing-2xl);
  flex-shrink: 0;
  border-top: 1px solid var(--color-gray-soft);
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
}

.modal-content.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2xl);
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-gray-soft);
}

.modal-header h3 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: var(--spacing-xs);
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

.modal-body {
  padding: var(--spacing-2xl);
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.form-input {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-body);
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px var(--color-gold-subtle);
}

.form-input.input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-input.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.form-input-readonly,
.form-input:read-only,
.form-input:disabled {
  background: var(--color-black-soft);
  border-color: var(--color-gray);
  color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input-readonly:focus,
.form-input:read-only:focus,
.form-input:disabled:focus {
  border-color: var(--color-gray);
  box-shadow: none;
}

.form-select-readonly,
.form-select:disabled,
select:disabled {
  background: var(--color-black-soft);
  border-color: var(--color-gray);
  color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-select-readonly:focus,
.form-select:disabled:focus,
select:disabled:focus {
  border-color: var(--color-gray);
  box-shadow: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  font-weight: 500;
  animation: slideDown 0.2s ease-out;
}

.error-message::before {
  content: '⚠';
  font-size: 14px;
  flex-shrink: 0;
}

.interests-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  align-content: flex-start;
}

.interest-chip-selectable {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 8px 14px;
  background: var(--color-dark-soft);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: #ffffff;
  cursor: pointer;
  transition: all var(--transition-base);
  user-select: none;
  font-weight: 500;
}

.interest-chip-selectable:hover {
  background: var(--color-gray);
  border-color: var(--color-gold-subtle);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.interest-chip-selectable.selected {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 0 2px var(--color-gold-subtle);
}

.interest-chip-selectable.selected:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%);
  box-shadow: 0 0 0 2px var(--color-gold-subtle), var(--shadow-gold);
}

.chip-check-icon {
  flex-shrink: 0;
  color: var(--color-gold);
}

.chip-text {
  white-space: nowrap;
}

.no-interests-message {
  width: 100%;
  text-align: center;
  padding: var(--spacing-xl);
  color: #888;
  font-size: 14px;
}

.no-interests-message p {
  margin: 0;
}

.selected-interests-summary {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-sm);
  display: inline-block;
}

.summary-text {
  font-size: 12px;
  color: var(--color-gold);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  /* Mobile Modals - Full Screen */
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal-content {
    max-width: 100%;
    width: 100%;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .delete-modal {
    max-width: 100%;
  }

  .modal-header {
    padding: var(--spacing-lg);
    flex-shrink: 0;
  }

  .modal-body {
    padding: var(--spacing-lg);
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
  }

  .modal-actions {
    padding: var(--spacing-lg);
    flex-direction: column;
    gap: var(--spacing-sm);
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  .modal-actions .btn {
    width: 100%;
    min-height: 44px;
  }

  /* Mobile Forms */
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-input,
  .form-textarea {
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
  }

  /* Touch Targets */
  .btn {
    min-height: 44px;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .modal-content h3 {
    font-size: 18px;
  }
}

/* Pull to Refresh */
.pull-to-refresh {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border-bottom: 1px solid var(--color-gray-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: height var(--transition-base);
  overflow: hidden;
}

.pull-to-refresh-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-gold);
  font-size: 14px;
  font-weight: 500;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gold-subtle);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

