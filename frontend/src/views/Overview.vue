<template>
  <div class="dashboard-page">
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

      <!-- Activity Tab -->
      <div v-show="activeTab === 'activity'" class="tab-panel">
        <div class="dashboard-card">
          <h2 class="card-title">Recent Activity</h2>
          <div class="activity-list">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="activity.id" 
              class="activity-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="activity-icon" :class="activity.type">
                {{ activity.icon }}
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="empty-state">
              <div class="empty-icon">📋</div>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Event, type Member, type InvitationCode } from '../services/api'
import MemberChart from '../components/MemberChart.vue'

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'activity', label: 'Activity' }
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

const recentActivities = computed(() => {
  const activities: any[] = []
  
  // Recent member joins
  const recentMembers = [...members.value]
    .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
    .slice(0, 3)
  
  recentMembers.forEach(member => {
    activities.push({
      id: `member-${member.id}`,
      type: 'member',
      icon: '👤',
      text: `${member.name} joined the club`,
      time: getTimeAgo(member.joinedDate)
    })
  })
  
  // Recent event RSVPs
  events.value.forEach(event => {
    const yesCount = event.rsvps.yes.length
    if (yesCount > 0) {
      activities.push({
        id: `event-${event.id}`,
        type: 'event',
        icon: '📅',
        text: `${yesCount} confirmed for "${event.title}"`,
        time: getTimeAgo(event.date)
      })
    }
  })
  
  // Recent code generations
  const recentCodes = [...codes.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
  
  recentCodes.forEach(code => {
    if (code.status === 'unused') {
      activities.push({
        id: `code-${code.id}`,
        type: 'code',
        icon: '🎫',
        text: `New invitation code generated: ${code.code}`,
        time: getTimeAgo(code.createdAt)
      })
    }
  })
  
  return activities
    .sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeB - timeA
    })
    .slice(0, 8)
})

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

onMounted(async () => {
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
  
  codes.value = await api.getInvitationCodes()
  unusedCodes.value = codes.value.filter(c => c.status === 'unused').length
  totalCodes.value = codes.value.length
  
  events.value = await api.getEvents()
  totalEvents.value = events.value.length
  upcomingEvents.value = upcomingEventsList.value.length
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
</style>
