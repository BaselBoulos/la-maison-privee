<template>
  <div v-if="showSearch" class="search-overlay" @click.self="closeSearch">
    <div class="search-modal">
      <div class="search-header">
        <div class="search-input-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search members, events, codes..."
            @keyup.esc="closeSearch"
            @keyup.enter="handleSearch"
          />
        </div>
        <button class="search-close" @click="closeSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="search-results" v-if="searchQuery">
        <div v-if="isSearching" class="search-loading">
          <SkeletonLoader type="card" style="height: 60px; margin-bottom: 8px;" />
          <SkeletonLoader type="card" style="height: 60px; margin-bottom: 8px;" />
          <SkeletonLoader type="card" style="height: 60px;" />
        </div>
        <div v-else-if="searchResults.length > 0" class="results-list">
          <div 
            v-for="result in searchResults" 
            :key="result.id"
            class="result-item"
            @click="navigateToResult(result)"
          >
            <div class="result-icon">{{ result.icon }}</div>
            <div class="result-content">
              <div class="result-title">{{ result.title }}</div>
              <div class="result-subtitle">{{ result.subtitle }}</div>
            </div>
            <div class="result-type">{{ result.type }}</div>
          </div>
        </div>
        <div v-else class="no-results">
          <div class="no-results-icon">🔍</div>
          <p>No results found</p>
        </div>
      </div>
      
      <div v-else class="search-suggestions">
        <div class="suggestion-title">Quick Actions</div>
        <div class="suggestions-list">
          <div class="suggestion-item" @click="navigateTo('members')">
            <span class="suggestion-icon">👥</span>
            <span>View All Members</span>
          </div>
          <div class="suggestion-item" @click="navigateTo('events')">
            <span class="suggestion-icon">📅</span>
            <span>View All Events</span>
          </div>
          <div class="suggestion-item" @click="navigateTo('invitation-codes')">
            <span class="suggestion-icon">🎫</span>
            <span>Invitation Codes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api, type Member, type Event } from '../services/api'
import SkeletonLoader from './SkeletonLoader.vue'

const props = defineProps<{
  showSearch: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const isSearching = ref(false)
const searchResults = ref<any[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.showSearch, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchQuery.value = ''
    searchResults.value = []
  }
})

watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (!newQuery.trim()) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    await performSearch(newQuery)
    isSearching.value = false
  }, 300)
})

const performSearch = async (query: string) => {
  const results: any[] = []
  const lowerQuery = query.toLowerCase()
  
  try {
    // Search members
    const members = await api.getMembers()
    members.forEach(member => {
      if (
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery) ||
        member.city?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `member-${member.id}`,
          type: 'member',
          icon: '👤',
          title: member.name,
          subtitle: member.email,
          route: { name: 'member-detail', params: { id: member.id } }
        })
      }
    })
    
    // Search events
    const events = await api.getEvents()
    events.forEach(event => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: `event-${event.id}`,
          type: 'event',
          icon: '📅',
          title: event.title,
          subtitle: `${event.location} • ${new Date(event.date).toLocaleDateString()}`,
          route: { name: 'event-detail', params: { id: event.id } }
        })
      }
    })
    
    // Search invitation codes
    const codes = await api.getInvitationCodes()
    codes.forEach(code => {
      if (code.code.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `code-${code.id}`,
          type: 'code',
          icon: '🎫',
          title: code.code,
          subtitle: code.status === 'used' ? `Used by ${code.assignedMemberName || 'Unknown'}` : 'Unused',
          route: { name: 'invitation-codes' }
        })
      }
    })
    
    searchResults.value = results.slice(0, 10)
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  }
}

const navigateToResult = (result: any) => {
  router.push(result.route)
  closeSearch()
}

const navigateTo = (route: string) => {
  router.push({ name: route })
  closeSearch()
}

const handleSearch = () => {
  if (searchResults.value.length > 0) {
    navigateToResult(searchResults.value[0])
  }
}

const closeSearch = () => {
  emit('close')
}
</script>

<style scoped>
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 5, 5, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  animation: fadeIn var(--transition-base);
}

.search-modal {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.99) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 700px;
  max-height: 70vh;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(212, 175, 55, 0.15) inset,
    0 0 50px rgba(212, 175, 55, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: slideDown var(--transition-slow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.search-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-soft);
}

.search-input-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 48px;
  color: #ffffff;
  font-size: 16px;
  font-family: var(--font-body);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  background: var(--color-dark-soft);
  box-shadow: 0 0 0 3px var(--color-gold-subtle);
}

.search-close {
  background: transparent;
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  color: #888;
  cursor: pointer;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.search-close:hover {
  background: var(--color-gray);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.search-results,
.search-suggestions {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-3xl);
  color: #888;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-soft);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.result-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
  transform: translateX(4px);
}

.result-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.result-subtitle {
  font-size: 12px;
  color: #888;
}

.result-type {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-gold);
  font-weight: 600;
  padding: 4px 8px;
  background: var(--color-gold-subtle);
  border-radius: var(--radius-sm);
}

.no-results {
  text-align: center;
  padding: var(--spacing-3xl);
  color: #888;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.suggestion-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.suggestion-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
}

.suggestion-icon {
  font-size: 20px;
}
</style>

