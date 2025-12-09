<template>
  <div class="events-page">
    <div class="page-header">
      <h1 class="page-title">Events</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">
        Create New Event
      </button>
    </div>
    
    <div class="events-list">
      <div v-if="events.length === 0" class="empty-state">
        <p>No events created yet.</p>
        <button class="btn btn-primary" @click="showCreateModal = true">
          Create Your First Event
        </button>
      </div>
      
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-image-container">
          <img 
            v-if="event.image" 
            :src="event.image" 
            :alt="event.title"
            class="event-image"
          />
          <div v-else class="event-image-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>
          <div class="event-details">
          <h3>{{ event.title }}</h3>
          <p class="event-date">{{ formatDate(event.date) }} at {{ event.time }}</p>
          <p class="event-location">{{ event.location }}</p>
          <div class="event-info">
            <span v-if="event.price" class="event-price">${{ event.price }}</span>
            <span v-if="event.maxCapacity" class="event-capacity">
              {{ event.rsvps.yes.length }}/{{ event.maxCapacity }} capacity
            </span>
          </div>
          <div class="event-stats">
            <span>RSVPs: {{ event.rsvps.yes.length }} Yes, {{ event.rsvps.no.length }} No, {{ event.rsvps.maybe.length }} Maybe</span>
            <span v-if="event.waitlist && event.waitlist.length > 0" class="waitlist-badge">
              {{ event.waitlist.length }} on waitlist
            </span>
          </div>
          <div class="event-actions">
            <button class="btn btn-primary btn-small" @click.stop="$router.push({ name: 'event-detail', params: { id: event.id } })">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New Event</h2>
          <button class="modal-close" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="event-form">
            <div class="form-row">
              <div class="form-group">
                <label>Event Title *</label>
                <input v-model="eventForm.title" type="text" class="form-input" placeholder="Enter event title" />
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input v-model="eventForm.date" type="date" class="form-input" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Time *</label>
                <input v-model="eventForm.time" type="time" class="form-input" />
              </div>
              <div class="form-group">
                <label>Location *</label>
                <input v-model="eventForm.location" type="text" class="form-input" placeholder="Enter location" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Max Capacity</label>
                <input v-model.number="eventForm.maxCapacity" type="number" class="form-input" placeholder="Optional" />
              </div>
              <div class="form-group">
                <label>Price</label>
                <input v-model.number="eventForm.price" type="number" class="form-input" placeholder="Optional" />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Description *</label>
              <textarea v-model="eventForm.description" class="form-textarea" rows="4" placeholder="Enter event description"></textarea>
            </div>

            <div class="form-group full-width">
              <label>Target Interests</label>
              <div class="interests-grid">
                <div 
                  v-for="interest in interests" 
                  :key="interest.id"
                  :class="['interest-chip', { selected: selectedInterests.includes(interest.name) }]"
                  @click="toggleInterest(interest.name)"
                >
                  <span class="interest-icon">{{ getInterestIcon(interest.name) }}</span>
                  <span class="interest-name">{{ interest.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" @click="createEvent" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type Event, type Interest } from '../services/api'
import { useToast } from '../composables/useToast'

const toast = useToast()

const events = ref<Event[]>([])
const interests = ref<Interest[]>([])
const showCreateModal = ref(false)
const isSubmitting = ref(false)

const eventForm = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  maxCapacity: undefined as number | undefined,
  price: undefined as number | undefined,
  description: ''
})

const selectedInterests = ref<string[]>([])

const getInterestIcon = (name: string): string => {
  const icons: Record<string, string> = {
    'Wine Tasting': '🍷',
    'Fine Dining': '🍽️',
    'Cigar Tasting': '🚬',
    'Whisky / Spirits': '🥃',
    'Live Music': '🎵',
    'Art & Culture': '🎨',
    'Craft Cocktails': '🍸',
    'Luxury Travel': '✈️'
  }
  return icons[name] || '●'
}

const toggleInterest = (interest: string) => {
  const index = selectedInterests.value.indexOf(interest)
  if (index > -1) {
    selectedInterests.value.splice(index, 1)
  } else {
    selectedInterests.value.push(interest)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  // Reset form
  eventForm.value = {
    title: '',
    date: '',
    time: '',
    location: '',
    maxCapacity: undefined,
    price: undefined,
    description: ''
  }
  selectedInterests.value = []
}

const createEvent = async () => {
  // Validation
  if (!eventForm.value.title || !eventForm.value.date || !eventForm.value.time || !eventForm.value.location || !eventForm.value.description) {
    toast.showToast('Please fill in all required fields', 'error')
    return
  }

  isSubmitting.value = true
  try {
    // Get interest IDs from names
    const interestIds = interests.value
      .filter(i => selectedInterests.value.includes(i.name))
      .map(i => i.id)

    const newEvent = await api.createEvent({
      title: eventForm.value.title,
      date: eventForm.value.date,
      time: eventForm.value.time,
      location: eventForm.value.location,
      maxCapacity: eventForm.value.maxCapacity ? Number(eventForm.value.maxCapacity) : undefined,
      price: eventForm.value.price ? Number(eventForm.value.price) : undefined,
      description: eventForm.value.description,
      targetInterests: interestIds,
      targetCities: []
    })

    // Refresh events list
    events.value = await api.getEvents()
    closeModal()
    toast.showToast('Event created successfully!', 'success')
  } catch (error) {
    console.error('Error creating event:', error)
    toast.showToast('Failed to create event. Please try again.', 'error')
  } finally {
    isSubmitting.value = false
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

onMounted(async () => {
  events.value = await api.getEvents()
  interests.value = await api.getInterests()
})
</script>

<style scoped>
.events-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  border: none;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  color: #888;
}

.empty-state::before {
  content: '📅';
  display: block;
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.event-card {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-2xl);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.event-card:hover {
  border-color: var(--color-gold-subtle);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl), var(--shadow-gold);
}

.event-card:hover::before {
  opacity: 1;
}

.event-image-container {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-image-placeholder {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 10px 0;
}

.event-date {
  color: #d4af37;
  font-size: 14px;
  margin: 0 0 5px 0;
}

.event-location {
  color: #888;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.event-info {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.event-price {
  color: #d4af37;
  font-size: 14px;
  font-weight: 600;
}

.event-capacity {
  color: #888;
  font-size: 14px;
}

.event-stats {
  color: #888;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.waitlist-badge {
  color: #d4af37;
  font-size: 11px;
  font-weight: 600;
}

.event-actions {
  margin-top: 12px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
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
  overflow: hidden;
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
  padding: 24px;
  border-bottom: 1px solid #2a2a2a;
}

.modal-header h2 {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.01em;
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
  color: #ffffff;
  background: #2a2a2a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #2a2a2a;
}

.btn-secondary {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #2a2a2a;
}

.btn-secondary:hover {
  background: #2a2a2a;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.form-input,
.form-textarea {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #d4af37;
}

.form-textarea {
  resize: vertical;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.interest-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.interest-chip:hover {
  background: #2a2a2a;
}

.interest-chip.selected {
  background: #2a2a1a;
  border-color: #d4af37;
}

.interest-icon {
  font-size: 20px;
}

.interest-name {
  font-size: 13px;
  color: #ffffff;
}
</style>

