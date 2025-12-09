<template>
  <div class="dashboard-page">
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
    <h1 class="page-title">Dashboard</h1>
    
    <!-- Tabs -->
    <div class="dashboard-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-show="activeTab === 'overview'" class="tab-panel">
        <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalMembers }}</div>
        <div class="stat-label">Total Members</div>
        <div class="stat-change positive">+{{ newMembersThisMonth }} this month</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeMembers }}</div>
        <div class="stat-label">Active Members</div>
        <div class="stat-change">{{ Math.round((activeMembers / totalMembers) * 100) || 0 }}% of total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ upcomingEvents }}</div>
        <div class="stat-label">Upcoming Events</div>
        <div class="stat-change">{{ totalEvents }} total events</div>
      </div>
    </div>

        <!-- Upcoming Events -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">Upcoming Events</h2>
            <router-link :to="{ name: 'events' }" class="view-all-link">View All</router-link>
          </div>
          <div class="events-list">
            <div 
              v-for="event in upcomingEventsList" 
              :key="event.id"
              class="event-item-small"
              @click="$router.push({ name: 'event-detail', params: { id: event.id } })"
            >
              <div class="event-image-small">
                <img v-if="event.image" :src="event.image" :alt="event.title" />
                <div v-else class="image-placeholder-small"></div>
              </div>
              <div class="event-info-small">
                <h3 class="event-title-small">{{ event.title }}</h3>
                <p class="event-date-small">{{ formatDate(event.date) }} at {{ event.time }}</p>
                <div class="event-rsvp-small">
                  <span class="rsvp-count">{{ event.rsvps.yes.length }} confirmed</span>
                  <span v-if="event.waitlist && event.waitlist.length > 0" class="waitlist-count">
                    {{ event.waitlist.length }} waitlist
                  </span>
                </div>
              </div>
            </div>
            <div v-if="upcomingEventsList.length === 0" class="empty-state">
              <p>No upcoming events</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-show="activeTab === 'analytics'" class="tab-panel">
        <div class="dashboard-grid">
          <div class="dashboard-card chart-card">
            <h2 class="card-title">Member Growth</h2>
            <MemberChart 
              :data="memberGrowthData.data" 
              :labels="memberGrowthData.labels"
              type="line"
            />
          </div>
          <div class="dashboard-card chart-card">
            <h2 class="card-title">Monthly Profit</h2>
            <MemberChart 
              :data="profitData.data" 
              :labels="profitData.labels"
              type="bar"
              label="Profit"
              @month-click="handleMonthClick"
            />
          </div>
          <div class="dashboard-card">
            <h2 class="card-title">Event Statistics</h2>
            <div class="analytics-stats">
              <div class="analytics-stat-item">
                <div class="analytics-stat-label">Total Events</div>
                <div class="analytics-stat-value">{{ totalEvents }}</div>
              </div>
              <div class="analytics-stat-item">
                <div class="analytics-stat-label">Upcoming Events</div>
                <div class="analytics-stat-value">{{ upcomingEvents }}</div>
              </div>
              <div class="analytics-stat-item">
                <div class="analytics-stat-label">Average RSVPs per Event</div>
                <div class="analytics-stat-value">{{ averageRSVPs }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Profit Breakdown Modal -->
    <div v-if="showProfitModal" class="modal-overlay" @click="closeProfitModal">
      <div class="modal-content profit-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <h2 class="modal-title">Profit Breakdown</h2>
            <p class="modal-subtitle">{{ selectedMonth }} {{ new Date().getFullYear() }}</p>
          </div>
          <button class="modal-close" @click="closeProfitModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="monthEventBreakdown.length === 0" class="empty-state">
            <div class="empty-icon">📊</div>
            <p>No events with attendance data for this month</p>
          </div>
          <div v-else>
            <!-- Summary Stats -->
            <div class="profit-summary">
              <div class="summary-card">
                <div class="summary-icon">📅</div>
                <div class="summary-content">
                  <div class="summary-label">Total Events</div>
                  <div class="summary-value">{{ monthEventBreakdown.length }}</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">👥</div>
                <div class="summary-content">
                  <div class="summary-label">Total Attendees</div>
                  <div class="summary-value">{{ monthEventBreakdown.reduce((sum, e) => sum + e.attendeeCount, 0) }}</div>
                </div>
              </div>
              <div class="summary-card highlight">
                <div class="summary-icon">💰</div>
                <div class="summary-content">
                  <div class="summary-label">Total Profit</div>
                  <div class="summary-value">₪{{ totalMonthProfit.toLocaleString() }}</div>
                </div>
              </div>
            </div>

            <!-- Events List -->
            <div class="breakdown-list">
              <div 
                v-for="(event, index) in monthEventBreakdown" 
                :key="event.id"
                class="breakdown-item"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div class="breakdown-event-header">
                  <div class="breakdown-event-info">
                    <h3 class="breakdown-event-title">{{ event.title }}</h3>
                    <div class="breakdown-event-meta">
                      <span class="breakdown-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {{ formatDate(event.date) }} at {{ event.time }}
                      </span>
                      <span class="breakdown-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {{ event.location }}
                      </span>
                    </div>
                  </div>
                  <div class="breakdown-event-profit-badge">
                    <span class="profit-badge-label">Profit</span>
                    <span class="profit-badge-value">₪{{ event.totalProfit.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="breakdown-event-stats">
                  <div class="breakdown-stat">
                    <span class="breakdown-stat-icon">📨</span>
                    <div class="breakdown-stat-content">
                      <span class="breakdown-stat-label">Invited</span>
                      <span class="breakdown-stat-value">{{ event.invitedCount }}</span>
                    </div>
                  </div>
                  <div class="breakdown-stat">
                    <span class="breakdown-stat-icon">✅</span>
                    <div class="breakdown-stat-content">
                      <span class="breakdown-stat-label">Attended</span>
                      <span class="breakdown-stat-value">{{ event.attendeeCount }}</span>
                    </div>
                  </div>
                  <div class="breakdown-stat">
                    <span class="breakdown-stat-icon">❌</span>
                    <div class="breakdown-stat-content">
                      <span class="breakdown-stat-label">No Show</span>
                      <span class="breakdown-stat-value">{{ event.noShowCount }}</span>
                    </div>
                  </div>
                  <div class="breakdown-stat">
                    <span class="breakdown-stat-icon">💵</span>
                    <div class="breakdown-stat-content">
                      <span class="breakdown-stat-label">Price per Person</span>
                      <span class="breakdown-stat-value">₪{{ event.price.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api, type Event, type Member, type InvitationCode } from '../services/api'
import MemberChart from '../components/MemberChart.vue'
import { usePullToRefresh } from '../composables/usePullToRefresh'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' }
]

const totalMembers = ref(0)
const activeMembers = ref(0)
const upcomingEvents = ref(0)
const totalEvents = ref(0)
const unusedCodes = ref(0)
const totalCodes = ref(0)
const newMembersThisMonth = ref(0)
const events = ref<Event[]>([])
const members = ref<Member[]>([])
const codes = ref<InvitationCode[]>([])
const showProfitModal = ref(false)
const selectedMonth = ref('')

// Body scroll lock - lock when modal is open
useBodyScrollLock(showProfitModal)
const selectedMonthIndex = ref(-1)

const upcomingEventsList = computed(() => {
  const now = new Date()
  return events.value
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
})

const memberGrowthData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const data = new Array(12).fill(0)
  
  members.value.forEach(member => {
    const joinDate = new Date(member.joinedDate)
    if (joinDate.getFullYear() === currentYear) {
      const month = joinDate.getMonth()
      data[month]++
    }
  })
  
  return {
    labels: months,
    data: data
  }
})

const profitData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const profitByMonth = new Array(12).fill(0)
  
  // Calculate profit for each event
  events.value.forEach(event => {
    // Only process events with attendance data and a price
    if (event.attendance && event.attendance.attended && event.price) {
      const eventDate = new Date(event.date)
      
      // Only process events from current year
      if (eventDate.getFullYear() === currentYear) {
        // Filter out "unknown member" from attendance
        const validAttendees = event.attendance.attended.filter(
          memberId => memberId.toLowerCase() !== 'unknown member' && memberId !== 'unknown'
        )
        
        // Calculate profit: number of valid attendees × event price
        const eventProfit = validAttendees.length * event.price
        const month = eventDate.getMonth()
        profitByMonth[month] += eventProfit
      }
    }
  })
  
  return {
    labels: months,
    data: profitByMonth
  }
})

const monthEventBreakdown = computed(() => {
  if (selectedMonthIndex.value === -1) return []
  
  const currentYear = new Date().getFullYear()
  const monthEvents: Array<{
    id: string
    title: string
    date: string
    time: string
    location: string
    price: number
    attendeeCount: number
    noShowCount: number
    invitedCount: number
    totalProfit: number
  }> = []
  
  events.value.forEach(event => {
    if (event.attendance && event.attendance.attended && event.price) {
      const eventDate = new Date(event.date)
      
      if (eventDate.getFullYear() === currentYear && eventDate.getMonth() === selectedMonthIndex.value) {
        // Filter out "unknown member" from attendance
        const validAttendees = event.attendance.attended.filter(
          memberId => memberId.toLowerCase() !== 'unknown member' && memberId !== 'unknown'
        )
        const validNoShows = (event.attendance.noShow || []).filter(
          memberId => memberId.toLowerCase() !== 'unknown member' && memberId !== 'unknown'
        )
        
        const attendeeCount = validAttendees.length
        const noShowCount = validNoShows.length
        const invitedCount = event.invitedMembersIds?.length || 0
        const totalProfit = attendeeCount * event.price
        
        monthEvents.push({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          price: event.price,
          attendeeCount,
          invitedCount,
          noShowCount,
          totalProfit
        })
      }
    }
  })
  
  // Sort by date
  return monthEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

const totalMonthProfit = computed(() => {
  return monthEventBreakdown.value.reduce((sum, event) => sum + event.totalProfit, 0)
})

const handleMonthClick = (monthIndex: number, monthLabel: string) => {
  selectedMonthIndex.value = monthIndex
  selectedMonth.value = monthLabel
  showProfitModal.value = true
}

const closeProfitModal = () => {
  showProfitModal.value = false
  selectedMonthIndex.value = -1
  selectedMonth.value = ''
}

const averageRSVPs = computed(() => {
  if (events.value.length === 0) return 0
  const totalRSVPs = events.value.reduce((sum, event) => {
    return sum + event.rsvps.yes.length + event.rsvps.no.length + event.rsvps.maybe.length
  }, 0)
  return Math.round(totalRSVPs / events.value.length)
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const refreshCodes = async () => {
  const fetchedCodes = await api.getInvitationCodes()
  codes.value = fetchedCodes
  unusedCodes.value = codes.value.filter(c => c.status === 'unused').length
  totalCodes.value = codes.value.length
}

const refreshData = async () => {
  try {
    members.value = await api.getMembers()
    totalMembers.value = members.value.length
    activeMembers.value = members.value.filter(m => m.status === 'active').length
    
    // Calculate new members this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    newMembersThisMonth.value = members.value.filter(m => {
      const joinDate = new Date(m.joinedDate)
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
    }).length
    
    await refreshCodes()
    
    events.value = await api.getEvents()
    totalEvents.value = events.value.length
    upcomingEvents.value = upcomingEventsList.value.length
  } catch (error: any) {
    // Silent refresh - no toast
  }
}

// Pull to refresh
const { isRefreshing, pullToRefreshDistance } = usePullToRefresh(refreshData)

onMounted(async () => {
  await refreshData()
  // Listen for invitation code updates from other views
  window.addEventListener('codes-updated', refreshCodes)
})

onUnmounted(() => {
  window.removeEventListener('codes-updated', refreshCodes)
})
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  animation: fadeIn var(--transition-slow);
}

.dashboard-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xl);
  border-bottom: 2px solid var(--color-gray-soft);
  padding-bottom: var(--spacing-sm);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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

.tab-button::after {
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

.tab-button:hover {
  color: #ffffff;
  background: var(--color-gray);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tab-button.active {
  color: var(--color-gold);
  font-weight: 600;
}

.tab-button.active::after {
  transform: scaleX(1);
}

.tab-label {
  font-size: 14px;
}

.tab-content {
  width: 100%;
}

.tab-panel {
  animation: fadeIn var(--transition-base);
}

.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 600;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-gold);
  letter-spacing: -0.02em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  position: relative;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.stat-card::before {
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

.stat-card:hover {
  border-color: var(--color-gold);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl), var(--shadow-gold);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 48px;
  font-weight: 700;
  color: var(--color-gold);
  margin-bottom: var(--spacing-sm);
  line-height: 1;
  text-shadow: 0 0 20px var(--color-gold-glow);
}

.stat-label {
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.stat-change {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--color-success);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.dashboard-card {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.dashboard-card:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.chart-card {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.01em;
}

.view-all-link {
  font-size: 14px;
  color: #d4af37;
  text-decoration: none;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #c9a030;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: var(--spacing-xl);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  animation: slideInRight 0.4s ease-out backwards;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.activity-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-subtle);
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 12px;
  color: #888;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item-small {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item-small:hover {
  background: #2a2a2a;
  border-color: #d4af37;
}

.event-image-small {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.event-image-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder-small {
  width: 100%;
  height: 100%;
  background: #2a2a2a;
}

.event-info-small {
  flex: 1;
  min-width: 0;
}

.event-title-small {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-date-small {
  font-size: 12px;
  color: #888;
  margin: 0 0 6px 0;
}

.event-rsvp-small {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.rsvp-count {
  color: #4ade80;
}

.waitlist-count {
  color: #d4af37;
}

.quick-actions {
  margin-top: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  transition: all 0.2s;
  text-align: center;
}

.action-card:hover {
  border-color: #d4af37;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.action-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.analytics-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
}

.analytics-stat-item {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.analytics-stat-item:hover {
  border-color: var(--color-gold-subtle);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.analytics-stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.analytics-stat-value {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-gold);
  text-shadow: 0 0 10px var(--color-gold-glow);
}

@media (max-width: 968px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-base);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
}

.modal-content {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl), var(--shadow-gold), 0 0 40px rgba(212, 175, 55, 0.2);
  animation: slideUp 0.3s ease-out;
}

.profit-modal {
  max-width: 900px;
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
  align-items: flex-start;
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-gray-soft);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
  flex-shrink: 0;
}

.modal-header-content {
  flex: 1;
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-gold);
  margin: 0 0 var(--spacing-xs) 0;
  letter-spacing: -0.02em;
  text-shadow: 0 0 20px var(--color-gold-glow);
}

.modal-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.modal-close {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  color: #888;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.modal-close:hover {
  color: var(--color-gold);
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  transform: rotate(90deg);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: var(--spacing-2xl);
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

/* Profit Summary */
.profit-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.summary-card {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-base);
}

.summary-card:hover {
  border-color: var(--color-gold-subtle);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.summary-card.highlight {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-color: var(--color-gold-subtle);
}

.summary-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.summary-value {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-gold);
  text-shadow: 0 0 10px var(--color-gold-glow);
}

.summary-card.highlight .summary-value {
  font-size: 28px;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.breakdown-item {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  transition: all var(--transition-base);
  animation: slideInRight 0.4s ease-out backwards;
  animation-fill-mode: forwards;
  position: relative;
  overflow: hidden;
}

.breakdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-gold);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.breakdown-item:hover {
  border-color: var(--color-gold-subtle);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.breakdown-item:hover::before {
  opacity: 1;
}

.breakdown-event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.breakdown-event-info {
  flex: 1;
}

.breakdown-event-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.3;
}

.breakdown-event-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.breakdown-meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 13px;
  color: #888;
}

.breakdown-meta-item svg {
  flex-shrink: 0;
  opacity: 0.6;
}

.breakdown-event-profit-badge {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: center;
  flex-shrink: 0;
}

.profit-badge-label {
  display: block;
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  font-weight: 500;
}

.profit-badge-value {
  display: block;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gold);
  text-shadow: 0 0 10px var(--color-gold-glow);
}

.breakdown-event-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.breakdown-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-dark-soft);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.breakdown-stat:hover {
  border-color: var(--color-gold-subtle);
  background: rgba(212, 175, 55, 0.05);
}

.breakdown-stat-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.breakdown-stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.breakdown-stat-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
  font-weight: 500;
}

.breakdown-stat-value {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-gold);
  text-shadow: 0 0 8px var(--color-gold-glow);
  line-height: 1.2;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .profit-summary {
    grid-template-columns: 1fr;
  }

  .breakdown-event-header {
    flex-direction: column;
  }

  .breakdown-event-stats {
    grid-template-columns: 1fr;
  }

  .breakdown-event-meta {
    flex-direction: row;
    flex-wrap: wrap;
  }

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
    border-top: 1px solid var(--color-gray-soft);
    background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  .modal-actions .btn {
    width: 100%;
    min-height: 44px;
  }

  /* Touch Targets */
  .btn {
    min-height: 44px;
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }

  .modal-title {
    font-size: 22px;
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
