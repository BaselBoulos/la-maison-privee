<template>
  <div class="events-page">
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
    <!-- Filter Section -->
    <div class="section-header-mobile">
      <h2 class="section-title">Events</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Event
        </button>
        <div class="filter-buttons">
          <button 
            class="filter-toggle-button" 
            @click="toggleFilters"
            :class="{ 'active': filtersVisible }"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>{{ filtersVisible ? 'Hide' : 'Show' }} Filters</span>
          </button>
          <button 
            class="mobile-filter-button" 
            @click="showFilterDrawer = true" 
            v-if="showFilterDrawer === false"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Filters</span>
          </button>
        </div>
      </div>
    </div>

    <div 
      class="filters-section" 
      :class="{ 
        'mobile-hidden': showFilterDrawer === false,
        'filters-hidden': !filtersVisible && showFilterDrawer !== true
      }"
    >
      <div class="filter-row">
        <div class="filter-group">
          <label>Filter by Month</label>
          <select v-model="selectedMonth" class="filter-input">
            <option value="">All Months</option>
            <option v-for="(month, index) in months" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Filter by Year</label>
          <select v-model="selectedYear" class="filter-input">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="filter-actions">
        <button class="btn btn-secondary" @click="clearFilters">Clear Filters</button>
        <button class="btn btn-primary" @click="applyFilters">Apply Filters</button>
      </div>
    </div>
    
    <div class="events-list">
      <div v-if="filteredEvents.length === 0" class="empty-state">
        <p v-if="selectedMonth || selectedYear">No events match the selected filters.</p>
        <p v-else>No events yet.</p>
        <button v-if="!selectedMonth && !selectedYear" class="btn btn-primary" @click="showCreateModal = true">
          Create your first event
        </button>
        <button v-else class="btn btn-secondary" @click="clearFilters">
          Clear Filters
        </button>
      </div>
      
      <div v-for="event in filteredEvents" :key="event.id" class="event-card">
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
            <span v-if="event.price" class="event-price">₪{{ event.price }}</span>
            <span v-if="event.maxCapacity" class="event-capacity">
              {{ event.rsvps.yes.length }}/{{ event.maxCapacity }} capacity
            </span>
          </div>
          <div class="event-stats">
            <span>RSVPs: Yes {{ event.rsvps.yes.length }}, No {{ event.rsvps.no.length }}, Maybe {{ event.rsvps.maybe.length }}</span>
            <span>
              Attendance: {{ getAttendanceCounts(event).attended }} attended, {{ getAttendanceCounts(event).noShow }} no-show
            </span>
            <span v-if="event.waitlist && event.waitlist.length > 0" class="waitlist-badge">
              Waitlist: {{ event.waitlist.length }}
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
          <h2>Create Event</h2>
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
                <label>Title *</label>
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
                <label>Capacity</label>
                <input v-model.number="eventForm.maxCapacity" type="number" class="form-input" placeholder="Optional" />
              </div>
              <div class="form-group">
                <label>Price</label>
                <input v-model.number="eventForm.price" type="number" class="form-input" placeholder="Optional" />
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Description *</label>
              <textarea v-model="eventForm.description" class="form-textarea" rows="4" placeholder="Describe the event"></textarea>
            </div>

            <div class="form-group full-width">
              <label>Event Image</label>
              <div class="image-upload-container">
                <div v-if="eventImagePreview" class="image-preview">
                  <img :src="eventImagePreview" alt="Event preview" />
                  <button type="button" class="remove-image-btn" @click="removeEventImage">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <label v-else class="image-upload-label">
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleEventImageSelect"
                    class="image-upload-input"
                  />
                  <div class="image-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Click to upload image</span>
                    <small>JPEG, PNG, GIF, or WebP (max 5MB)</small>
                  </div>
                </label>
              </div>
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

    <!-- Mobile Filter Drawer -->
    <div v-if="showFilterDrawer === true" class="filter-drawer-overlay" @click.self="showFilterDrawer = false">
      <div class="filter-drawer">
        <div class="filter-drawer-header">
          <h3>Filters</h3>
          <button class="filter-drawer-close" @click="showFilterDrawer = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="filter-drawer-content">
          <div class="filter-group">
            <label>Filter by Month</label>
            <select v-model="selectedMonth" class="filter-input">
              <option value="">All Months</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Filter by Year</label>
            <select v-model="selectedYear" class="filter-input">
              <option value="">All Years</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
        <div class="filter-drawer-actions">
          <button class="btn btn-secondary" @click="clearFilters">Clear Filters</button>
          <button class="btn btn-primary" @click="applyFiltersAndClose">Apply Filters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Event, type Interest } from '../services/api'
import { useToast } from '../composables/useToast'
import { usePullToRefresh } from '../composables/usePullToRefresh'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const toast = useToast()

const events = ref<Event[]>([])
const interests = ref<Interest[]>([])
const showCreateModal = ref(false)
const isSubmitting = ref(false)

// Body scroll lock - lock when modal is open
useBodyScrollLock(showCreateModal)

// Mobile features
const showFilterDrawer = ref<boolean | null>(null) // null = auto (desktop visible, mobile drawer)
const filtersVisible = ref(false) // Desktop: filters hidden by default

const selectedMonth = ref<number | ''>('')
const selectedYear = ref<number | ''>('')

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const availableYears = computed(() => {
  const years = new Set<number>()
  events.value.forEach(event => {
    const year = new Date(event.date).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a) // Most recent first
})

const filteredEvents = computed(() => {
  let filtered = [...events.value]

  // Filter by month
  if (selectedMonth.value) {
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getMonth() + 1 === selectedMonth.value
    })
  }

  // Filter by year
  if (selectedYear.value) {
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === selectedYear.value
    })
  }

  // Sort by date: most recent first (descending)
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // Most recent first
  })
})

const clearFilters = () => {
  selectedMonth.value = ''
  selectedYear.value = ''
}

const applyFilters = () => {
  // Filters are already applied via computed property
  // This function is for consistency with Members page
}

const applyFiltersAndClose = () => {
  applyFilters()
  showFilterDrawer.value = false
}

const toggleFilters = () => {
  filtersVisible.value = !filtersVisible.value
}

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
const eventImageFile = ref<File | null>(null)
const eventImagePreview = ref<string | null>(null)

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

const handleEventImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.showToast('Please select an image file', 'error')
      return
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.showToast('Image size must be less than 5MB', 'error')
      return
    }
    eventImageFile.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      eventImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeEventImage = () => {
  eventImageFile.value = null
  eventImagePreview.value = null
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
  eventImageFile.value = null
  eventImagePreview.value = null
}

const createEvent = async () => {
  // Validation
  if (!eventForm.value.title || !eventForm.value.date || !eventForm.value.time || !eventForm.value.location || !eventForm.value.description) {
    toast.showToast('Please fill in all required fields', 'error')
    return
  }

  isSubmitting.value = true
  try {
    // Upload image if selected
    let imageUrl: string | undefined
    if (eventImageFile.value) {
      try {
        const uploadResult = await api.uploadImage(eventImageFile.value)
        imageUrl = uploadResult.path
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.showToast('Failed to upload image. Please try again.', 'error')
        isSubmitting.value = false
        return
      }
    }

    // Get interest IDs from names
    const interestIds = interests.value
      .filter(i => selectedInterests.value.includes(i.name))
      .map(i => i.id)

    await api.createEvent({
      title: eventForm.value.title,
      date: eventForm.value.date,
      time: eventForm.value.time,
      location: eventForm.value.location,
      maxCapacity: eventForm.value.maxCapacity ? Number(eventForm.value.maxCapacity) : undefined,
      price: eventForm.value.price ? Number(eventForm.value.price) : undefined,
      description: eventForm.value.description,
      image: imageUrl,
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

const getAttendanceCounts = (event: Event) => {
  const attended = (event.attendance?.attended || []).filter(id => {
    const lower = id.toLowerCase()
    return lower !== 'unknown member' && lower !== 'unknown'
  }).length
  const noShow = (event.attendance?.noShow || []).filter(id => {
    const lower = id.toLowerCase()
    return lower !== 'unknown member' && lower !== 'unknown'
  }).length
  return { attended, noShow }
}

const refreshData = async () => {
  try {
    const allEvents = await api.getEvents()
    // Sort events by date: most recent first
    events.value = allEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA // Most recent first
    })
    interests.value = await api.getInterests()
  } catch (error: any) {
    toast.showToast('Failed to refresh data', 'error')
  }
}

// Pull to refresh
const { isRefreshing, pullToRefreshDistance } = usePullToRefresh(refreshData)

onMounted(async () => {
  // Set initial filter drawer state based on screen size
  const updateFilterDrawerState = () => {
    showFilterDrawer.value = window.innerWidth <= 768 ? false : null
  }
  updateFilterDrawerState()
  window.addEventListener('resize', updateFilterDrawerState)
  
  await refreshData()
})
</script>

<style scoped>
.events-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.section-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.header-actions .btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filters-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  overflow: hidden;
  margin-bottom: var(--spacing-2xl);
}

.filters-section.filters-hidden {
  display: none;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
}

.filter-input:focus {
  outline: none;
  border-color: #d4af37;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-small {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 13px;
}

.btn-secondary {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  color: #ffffff;
}

.btn-secondary:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  color: var(--color-gold);
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
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled,
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary:disabled:hover,
.btn-disabled:hover {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  box-shadow: var(--shadow-md);
  transform: none !important;
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
  max-width: 100%;
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
  overflow: hidden;
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
  position: relative;
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
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  border-top: 1px solid #2a2a2a;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
}

.btn-secondary {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #2a2a2a;
}

.btn-secondary:hover {
  background: #2a2a2a;
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

.form-input[type="date"],
.form-input[type="time"] {
  color-scheme: dark;
}

.form-input[type="date"]::-webkit-calendar-picker-indicator,
.form-input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(74%) sepia(38%) saturate(640%) hue-rotate(10deg) brightness(1.05);
  opacity: 0.9;
}

.form-input[type="date"]:focus::-webkit-calendar-picker-indicator,
.form-input[type="time"]:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
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

/* Image Upload Styles */
.image-upload-container {
  margin-top: 10px;
}

.image-upload-label {
  display: block;
  cursor: pointer;
}

.image-upload-input {
  display: none;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  background: #1a1a1a;
  border: 2px dashed #2a2a2a;
  border-radius: 8px;
  transition: all 0.2s;
  color: #888;
}

.image-upload-placeholder:hover {
  border-color: #d4af37;
  background: #2a2a2a;
  color: #d4af37;
}

.image-upload-placeholder svg {
  opacity: 0.6;
}

.image-upload-placeholder span {
  font-size: 14px;
  font-weight: 500;
}

.image-upload-placeholder small {
  font-size: 12px;
  opacity: 0.7;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 300px;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 0.9);
  transform: scale(1.1);
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
  }

  .section-header-mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .header-actions .btn {
    min-height: 44px;
    flex: 1;
    min-width: calc(50% - var(--spacing-xs));
  }

  /* Mobile Modals - Full Screen */
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
    overflow: hidden;
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
    overflow: hidden;
  }

  .modal-header {
    padding: var(--spacing-lg);
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-gray-soft);
  }

  .modal-body {
    padding: var(--spacing-lg);
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--spacing-md);
  }

  .modal-footer {
    padding: var(--spacing-lg);
    padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
    flex-shrink: 0;
    border-top: 1px solid var(--color-gray-soft);
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .modal-actions .btn,
  .modal-footer .btn {
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

  .event-card {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
  }

  .event-image-container {
    width: 100%;
    max-width: 100%;
    height: 200px;
  }

  .section-header-mobile {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .filter-toggle-button {
    display: none;
  }

  .mobile-filter-button {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .filters-section.mobile-hidden {
    display: none;
  }

  .filters-section {
    display: block;
    padding: var(--spacing-lg);
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .filter-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .filter-actions .btn {
    width: 100%;
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 20px;
  }

  .section-header-mobile {
    margin-bottom: var(--spacing-md);
  }

  .header-actions .btn {
    min-width: 100%;
    flex: 1 1 100%;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .event-card {
    padding: var(--spacing-md);
    width: 100%;
    max-width: 100%;
  }

  .event-image-container {
    width: 100%;
    max-width: 100%;
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

/* Filter Toggle Button */
.filter-toggle-button {
  display: flex;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 44px;
}

.filter-toggle-button:hover {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.filter-toggle-button.active {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
}

.filter-toggle-button svg {
  width: 20px;
  height: 20px;
}

.mobile-filter-button {
  display: none;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 44px;
}

.mobile-filter-button svg {
  width: 20px;
  height: 20px;
}

/* Filter Drawer */
.filter-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  animation: fadeIn var(--transition-base);
}

.filter-drawer {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border-top: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-base);
}

.filter-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-soft);
}

.filter-drawer-header h3 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
}

.filter-drawer-close {
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
  min-width: 44px;
  min-height: 44px;
}

.filter-drawer-close:hover {
  background: var(--color-gray);
  color: #ffffff;
}

.filter-drawer-content {
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  -webkit-overflow-scrolling: touch;
}

.filter-drawer-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-soft);
}

.filter-drawer-actions .btn {
  flex: 1;
  min-height: 44px;
}

@media (max-width: 768px) {
  .filter-drawer-header {
    padding: var(--spacing-lg);
  }

  .filter-drawer-content {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
  }

  .filter-drawer-actions {
    padding: var(--spacing-lg);
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .filter-drawer-actions .btn {
    width: 100%;
  }
}
</style>

