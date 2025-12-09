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
        <h1 class="app-title">La Maison Privée</h1>
      </div>
      <div class="top-bar-right">
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
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalSearch from '../components/GlobalSearch.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const showSearch = ref(false)

const handleKeyPress = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = true
  }
  if (e.key === 'Escape' && showSearch.value) {
    showSearch.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userEmail')
  router.push('/login')
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
  background: linear-gradient(180deg, var(--color-dark) 0%, var(--color-dark-soft) 100%);
  border-bottom: 1px solid var(--color-gray-soft);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
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

.top-bar-right {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
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
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border-right: 1px solid var(--color-gray-soft);
  box-shadow: var(--shadow-lg);
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
  padding: 0 var(--spacing-xl) var(--spacing-2xl);
  border-bottom: 1px solid var(--color-gray-soft);
  margin-bottom: var(--spacing-xl);
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
  color: #888;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-size: 14px;
  font-weight: 500;
  margin: 0 var(--spacing-sm);
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--color-gold);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height var(--transition-base);
}

.nav-item:hover {
  background: var(--color-gray);
  color: #ffffff;
  transform: translateX(4px);
}

.nav-item:hover::before {
  height: 60%;
}

.nav-item.active {
  background: linear-gradient(90deg, var(--color-gold-subtle) 0%, transparent 100%);
  color: var(--color-gold);
  font-weight: 600;
}

.nav-item.active::before {
  height: 100%;
  box-shadow: var(--shadow-gold);
}

.nav-item svg {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2xl);
  animation: fadeIn var(--transition-slow);
  margin-left: 280px;
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
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 998;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: block;
  }

  .top-bar-right {
    gap: 5px;
  }

  .app-title {
    font-size: 16px;
  }

  .dashboard-content {
    position: relative;
  }

  .mobile-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 60px;
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
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 0 10px;
    height: 50px;
  }

  .app-title {
    font-size: 14px;
  }

  .main-content {
    padding: 10px;
  }
}
</style>

