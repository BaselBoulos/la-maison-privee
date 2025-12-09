<template>
  <div class="dashboard-layout">
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="mobile-menu-button" @click="toggleSidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="top-bar-center">
        <h1 class="app-title">{{ currentClubName }}</h1>
      </div>
      <div class="top-bar-right">
        <!-- Club Selector (only for super admins or multi-club admins) -->
        <div v-if="showClubSelector" class="club-selector-wrapper" ref="clubSelectorRef" @click.stop="showClubDropdown = !showClubDropdown">
          <button class="club-selector-button" :class="{ active: showClubDropdown }">
            <div class="club-selector-content">
              <div class="club-indicator">
                <span class="club-dot"></span>
                <span class="club-status">Active</span>
              </div>
              <div class="club-name-display">
                <span class="club-label">Club</span>
                <span class="club-value">{{ currentClubName }}</span>
              </div>
              <svg class="club-chevron" :class="{ rotated: showClubDropdown }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
          <Transition name="dropdown">
            <div v-if="showClubDropdown" class="club-dropdown">
              <div class="club-dropdown-header">
                <span class="dropdown-title">Select Club</span>
              </div>
              <div class="club-dropdown-list">
                <button
                  v-for="club in availableClubs"
                  :key="club.id"
                  class="club-option"
                  :class="{ active: selectedClub === club.id }"
                  @click="selectClub(club.id)"
                >
                  <div class="club-option-content">
                    <span class="club-option-dot" :class="{ active: selectedClub === club.id }"></span>
                    <div class="club-option-text">
                      <span class="club-option-name">{{ club.name }}</span>
                      <span v-if="selectedClub === club.id" class="club-option-badge">Current</span>
                    </div>
                  </div>
                  <svg v-if="selectedClub === club.id" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </Transition>
        </div>
        <!-- Club Badge (for club admins - read-only) -->
        <div v-else class="club-badge-readonly">
          <div class="club-badge-content">
            <span class="club-dot"></span>
            <div class="club-badge-text">
              <span class="club-badge-label">Club</span>
              <span class="club-badge-name">{{ currentClubName }}</span>
            </div>
          </div>
        </div>
        <button class="search-button" @click="showSearch = true" title="Search (Ctrl+K)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button class="logout-button" @click="handleLogout" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Global Search -->
    <GlobalSearch :show-search="showSearch" @close="showSearch = false" />

    <div class="dashboard-content">
      <!-- Mobile Overlay -->
      <div v-if="sidebarOpen" class="mobile-overlay" @click="closeSidebar"></div>
      
      <!-- Left Sidebar -->
      <aside :class="['sidebar', { 'sidebar-open': sidebarOpen }]">
        <div class="logo-section">
          <div class="logo-icon">👑</div>
          <div class="logo-text">LA MAISON PRIVÉE</div>
        </div>
        <div class="nav-section-label">Navigation</div>
        <nav class="nav-menu">
          <router-link :to="{ name: 'dashboard' }" class="nav-item" exact-active-class="active" @click="closeSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Dashboard</span>
          </router-link>
          <router-link :to="{ name: 'members' }" class="nav-item" exact-active-class="active" @click="closeSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Members</span>
          </router-link>
          <router-link :to="{ name: 'events' }" class="nav-item" exact-active-class="active" @click="closeSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Events</span>
          </router-link>
          <router-link :to="{ name: 'invitation-codes' }" class="nav-item" exact-active-class="active" @click="closeSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Invitation Codes</span>
          </router-link>
          <router-link :to="{ name: 'settings' }" class="nav-item" exact-active-class="active" @click="closeSidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
            <span>Settings</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main 
        class="main-content"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <router-view />
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
      <router-link :to="{ name: 'dashboard' }" class="mobile-nav-item" exact-active-class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Dashboard</span>
      </router-link>
      <router-link :to="{ name: 'members' }" class="mobile-nav-item" exact-active-class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>Members</span>
      </router-link>
      <router-link :to="{ name: 'events' }" class="mobile-nav-item" exact-active-class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Events</span>
      </router-link>
      <router-link :to="{ name: 'invitation-codes' }" class="mobile-nav-item" exact-active-class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Codes</span>
      </router-link>
      <router-link :to="{ name: 'settings' }" class="mobile-nav-item" exact-active-class="active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
        </svg>
        <span>Settings</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalSearch from '../components/GlobalSearch.vue'
import { api, type Club } from '../services/api'

const router = useRouter()
const sidebarOpen = ref(false)
const showSearch = ref(false)
const showClubDropdown = ref(false)
const clubSelectorRef = ref<HTMLElement | null>(null)
const clubs = ref<Club[]>([])
const defaultClubId = computed(() => clubs.value[0]?.id ?? 1)

// Get user role, clubId, and allowed clubIds from localStorage
const userRole = ref(localStorage.getItem('userRole') || 'club')
const userClubId = ref<number>(Number(localStorage.getItem('clubId')) || defaultClubId.value)

// Initialize allowedClubIds
const getStoredAllowedClubIds = (): number[] => {
  try {
    const stored = localStorage.getItem('allowedClubIds')
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [Number(parsed)]
    }
  } catch (e) {
    // ignore parse errors
  }
  return userClubId.value ? [userClubId.value] : [defaultClubId.value]
}

const allowedClubIds = ref<number[]>(getStoredAllowedClubIds())

// Check if user is super admin
const isSuperAdmin = computed(() => userRole.value === 'super')

// Build available clubs based on role
const availableClubs = computed(() => {
  if (isSuperAdmin.value) return clubs.value
  const allowedSet = new Set(allowedClubIds.value.length ? allowedClubIds.value : [userClubId.value])
  return clubs.value.filter(c => allowedSet.has(c.id))
})

// Show selector for super admins or club admins with multiple clubs
const showClubSelector = computed(() => isSuperAdmin.value || availableClubs.value.length > 1)

// For super admin, allow club selection; for club admin, lock or limited to their allowed clubs
const selectedClub = computed(() => {
  const stored = localStorage.getItem('clubId')
  const storedNum = stored ? Number(stored) : null
  const allowed = availableClubs.value

  if (isSuperAdmin.value) {
    return storedNum || allowed[0]?.id || defaultClubId.value
  }

  if (storedNum && allowed.some(c => c.id === storedNum)) {
    return storedNum
  }

  return allowed[0]?.id || userClubId.value || defaultClubId.value
})

// Get current club name
const currentClubName = computed(() => {
  const club = availableClubs.value.find(c => c.id === selectedClub.value)
  return club?.name || 'Unknown Club'
})

const loadClubs = async () => {
  try {
    const fetched = await api.getClubs()
    clubs.value = fetched
    // If current clubId not in fetched, reset to first
    const exists = fetched.some(c => c.id === userClubId.value)
    if (!exists && fetched.length > 0 && fetched[0]) {
      const newId = fetched[0].id
      userClubId.value = newId
      localStorage.setItem('clubId', String(newId))
    }
  } catch (e) {
    // ignore fetch errors for now
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = true
  }
  if (e.key === 'Escape' && showSearch.value) {
    showSearch.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (clubSelectorRef.value && !clubSelectorRef.value.contains(event.target as Node)) {
    showClubDropdown.value = false
  }
}

onMounted(() => {
  loadClubs()
  window.addEventListener('keydown', handleKeyPress)
  document.addEventListener('click', handleClickOutside)
  
  // Ensure clubId is set correctly based on role/selection
  const current = selectedClub.value
  if (current) {
    localStorage.setItem('clubId', String(current))
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('click', handleClickOutside)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// Swipe gesture handlers
const swipeStartX = ref(0)
const swipeStartY = ref(0)
const swipeThreshold = 50 // Minimum distance to trigger swipe

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches[0]) {
    swipeStartX.value = e.touches[0].clientX
    swipeStartY.value = e.touches[0].clientY
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!e.touches[0] || sidebarOpen.value) return
  
  const deltaX = e.touches[0].clientX - swipeStartX.value
  const deltaY = Math.abs(e.touches[0].clientY - swipeStartY.value)
  
  // Only trigger if horizontal swipe is dominant and from left edge
  if (swipeStartX.value < 20 && deltaX > 0 && deltaX > deltaY && deltaX > swipeThreshold) {
    e.preventDefault()
    sidebarOpen.value = true
  }
}

const handleTouchEnd = () => {
  swipeStartX.value = 0
  swipeStartY.value = 0
}

const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('clubId')
  router.push('/login')
}

const selectClub = (clubId: number) => {
  // Super admins can select any; club admins only within allowed list
  const allowed = availableClubs.value.map(c => c.id)
  if (!allowed.includes(clubId)) return
  localStorage.setItem('clubId', String(clubId))
  showClubDropdown.value = false
  // Refresh current view with new club data (stay on the same route)
  window.location.reload()
}

</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--color-black);
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.02) 0%, transparent 50%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 70px;
  background: radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.12), transparent 35%),
              radial-gradient(circle at 90% 10%, rgba(139, 38, 53, 0.12), transparent 35%),
              linear-gradient(180deg, rgba(10, 10, 10, 0.9) 0%, rgba(7, 7, 7, 0.85) 100%);
  border-bottom: 1px solid var(--color-gray-soft);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--color-gold);
  letter-spacing: 0.5px;
}

.club-selector-wrapper {
  position: relative;
  margin-right: var(--spacing-md);
}

.club-selector-button {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(139, 38, 53, 0.08) 100%);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-lg);
  padding: 0;
  cursor: pointer;
  transition: all var(--transition-base);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.club-selector-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 38, 53, 0.15) 100%);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.club-selector-button:hover {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-gold);
  transform: translateY(-1px);
}

.club-selector-button:hover::before {
  opacity: 1;
}

.club-selector-button.active {
  border-color: var(--color-gold);
  box-shadow: var(--shadow-gold);
}

.club-selector-button.active::before {
  opacity: 1;
}

.club-selector-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  position: relative;
  z-index: 1;
}

.club-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 12px;
  border-right: 1px solid rgba(212, 175, 55, 0.2);
}

.club-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 8px var(--color-gold-glow), 0 0 16px rgba(212, 175, 55, 0.4);
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.club-status {
  font-size: 10px;
  color: var(--color-gold);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-weight: 600;
}

.club-name-display {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.club-label {
  font-size: 9px;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 500;
}

.club-value {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--font-heading);
  letter-spacing: 0.3px;
}

.club-chevron {
  color: var(--color-gold);
  transition: transform var(--transition-base);
  flex-shrink: 0;
  margin-left: 4px;
}

.club-chevron.rotated {
  transform: rotate(180deg);
}

.club-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl), var(--shadow-gold);
  backdrop-filter: blur(20px);
  z-index: 1000;
  overflow: hidden;
}

.club-dropdown-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-gray-soft);
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%);
}

.dropdown-title {
  font-size: 11px;
  color: var(--color-gold);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  font-weight: 600;
}

.club-dropdown-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.club-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  width: 100%;
}

.club-option:hover {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-color: var(--color-gold-subtle);
  transform: translateX(4px);
}

.club-option.active {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(139, 38, 53, 0.1) 100%);
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-sm);
}

.club-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.club-option-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-gray-soft);
  border: 2px solid var(--color-gray-light);
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.club-option-dot.active {
  background: var(--color-gold);
  border-color: var(--color-gold);
  box-shadow: 0 0 8px var(--color-gold-glow);
}

.club-option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.club-option-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  font-family: var(--font-heading);
  letter-spacing: 0.2px;
}

.club-option-badge {
  font-size: 9px;
  color: var(--color-gold);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-weight: 600;
}

.club-option svg {
  color: var(--color-gold);
  flex-shrink: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-base);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Read-only Club Badge (for club admins) */
.club-badge-readonly {
  margin-right: var(--spacing-md);
}

.club-badge-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(139, 38, 53, 0.08) 100%);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
}

.club-badge-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.club-badge-label {
  font-size: 9px;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 500;
}

.club-badge-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--font-heading);
  letter-spacing: 0.3px;
}

.top-bar-right {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.lang-switch select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-soft);
  background: #111;
  color: #fff;
  font-size: 13px;
}

.search-button {
  background: transparent;
  border: 1px solid var(--color-gray-soft);
  color: #888;
  cursor: pointer;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-weight: 500;
  font-size: 13px;
}

.search-button:hover {
  background: var(--color-gray);
  border-color: var(--color-gold-subtle);
  color: var(--color-gold);
  box-shadow: var(--shadow-gold);
}

.icon-button {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.icon-button:hover {
  background: #2a2a2a;
}

.logout-button {
  background: transparent;
  border: 1px solid var(--color-gold-subtle);
  color: var(--color-gold);
  cursor: pointer;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-weight: 500;
  font-size: 14px;
}

.logout-button:hover {
  background: var(--color-gold-subtle);
  border-color: var(--color-gold);
  box-shadow: var(--shadow-gold);
  transform: translateY(-1px);
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 100%;
  padding-top: 70px;
}

.sidebar {
  width: 280px;
  background: linear-gradient(160deg, rgba(20, 20, 20, 0.9) 0%, rgba(6, 6, 6, 0.92) 70%),
              radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.08), transparent 45%),
              radial-gradient(circle at 80% 80%, rgba(139, 38, 53, 0.08), transparent 45%);
  border-right: 1px solid var(--color-gray-soft);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl) 0;
  position: fixed;
  top: 70px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
}

.logo-section {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-soft);
  margin-bottom: var(--spacing-lg);
}

.logo-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 0 10px var(--color-gold-glow));
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 3px;
  text-align: center;
  color: var(--color-gold);
  font-weight: 600;
  text-transform: uppercase;
}

.nav-section-label {
  padding: 0 var(--spacing-xl);
  color: #aaa;
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: #c0c0c0;
  text-decoration: none;
  border-radius: var(--radius-md);
  position: relative;
  transition: transform var(--transition-base), background var(--transition-base), color var(--transition-base), box-shadow var(--transition-base);
  font-size: 14px;
  font-weight: 500;
  margin: 0 var(--spacing-sm);
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--color-gold);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height var(--transition-base);
}

.nav-item:hover {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 100%);
  color: #ffffff;
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-gold-subtle);
}

.nav-item:hover::before {
  height: 60%;
}

.nav-item.active {
  background: linear-gradient(120deg, rgba(212, 175, 55, 0.18) 0%, rgba(139, 38, 53, 0.12) 100%);
  color: var(--color-gold);
  font-weight: 600;
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-gold);
}

.nav-item.active::before {
  height: 100%;
  box-shadow: var(--shadow-gold);
}

.nav-item svg {
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(0,0,0,0.3));
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-2xl);
  animation: fadeIn var(--transition-slow);
  margin-left: 280px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  margin-right: 10px;
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 998;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
  }

  .mobile-menu-button {
    display: block;
  }

  .top-bar-right {
    gap: 5px;
  }

  .app-title {
    font-size: 16px;
  }

  .club-selector-wrapper {
    margin-right: 8px;
  }

  .club-selector-content {
    gap: 8px;
    padding: 8px 12px;
  }

  .club-indicator {
    padding-right: 8px;
  }

  .club-value {
    font-size: 12px;
  }

  .club-dropdown {
    min-width: 240px;
    right: -10px;
  }

  .dashboard-content {
    position: relative;
    padding-top: 0;
  }

  .mobile-overlay {
    display: block;
  }

  .mobile-overlay {
    top: 70px;
  }

  .sidebar {
    position: fixed;
    top: 70px;
    left: 0;
    bottom: 0;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 250px;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .main-content {
    padding: 15px;
    width: 100%;
    margin-left: 0;
    margin-top: 70px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 0 10px;
    height: 50px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
  }

  .mobile-overlay {
    top: 50px;
  }

  .sidebar {
    top: 50px;
  }

  .app-title {
    font-size: 14px;
  }

  .club-selector-content {
    padding: 6px 10px;
    gap: 6px;
  }

  .club-name-display {
    display: none;
  }

  .club-indicator {
    border-right: none;
    padding-right: 0;
  }

  .club-dropdown {
    min-width: 200px;
  }

  .main-content {
    padding: 10px;
    margin-top: 50px;
  }
}

/* Mobile Bottom Navigation */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.98) 0%, rgba(7, 7, 7, 0.95) 100%);
  border-top: 1px solid var(--color-gray-soft);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  color: #888;
  text-decoration: none;
  flex: 1;
  min-height: 44px;
  transition: all var(--transition-base);
  border-radius: var(--radius-md);
  margin: 0 4px;
  position: relative;
}

.mobile-nav-item span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.mobile-nav-item svg {
  width: 22px;
  height: 22px;
  transition: all var(--transition-base);
}

.mobile-nav-item:hover {
  color: var(--color-gold);
  background: rgba(212, 175, 55, 0.05);
}

.mobile-nav-item.active {
  color: var(--color-gold);
  background: rgba(212, 175, 55, 0.1);
}

.mobile-nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--color-gold);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 0 8px var(--color-gold-glow);
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }

  .main-content {
    padding-bottom: 15px;
  }
}
</style>

