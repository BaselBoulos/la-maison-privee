<template>
  <div class="member-detail-page" v-if="member">
    <div class="page-header">
      <button class="back-button" @click="$router.push({ name: 'members' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Members
      </button>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showEditModal = true">Edit Member</button>
        <button class="btn btn-danger" @click="deleteMember">Delete Member</button>
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
  </div>
  <div v-else class="loading-state">
    <p>Loading member...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, type Member, type Event } from '../services/api'
import MemberTierBadge from '../components/MemberTierBadge.vue'

const route = useRoute()
const router = useRouter()
const member = ref<Member | null>(null)
const events = ref<Event[]>([])
const showEditModal = ref(false)

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

const deleteMember = async () => {
  if (confirm('Are you sure you want to delete this member?')) {
    if (member.value) {
      await api.deleteMember(member.value.id)
      router.push({ name: 'members' })
    }
  }
}

onMounted(async () => {
  const memberId = route.params.id as string
  member.value = await api.getMember(memberId)
  events.value = await api.getEvents()
})
</script>

<style scoped>
.member-detail-page {
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
</style>

