<template>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>
    
    <div class="settings-sections">
      <div class="settings-section">
        <div class="section-header" @click="toggleInterestsExpanded">
          <div class="header-left">
            <button class="collapse-button">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                :class="{ rotated: interestsExpanded }"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <h2 class="section-title">Interests Management</h2>
            <div class="interests-count">{{ filteredInterests.length }} interest{{ filteredInterests.length !== 1 ? 's' : '' }}</div>
          </div>
        </div>
        
        <div v-show="interestsExpanded" class="interests-content">
          <!-- Search and Filter -->
          <div class="interests-controls">
            <div class="search-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                v-model="searchQuery"
                type="text" 
                class="search-input"
                placeholder="Search interests..."
              />
            </div>
            <div class="filter-tabs">
              <button 
                :class="['filter-tab', { active: statusFilter === '' }]"
                @click="statusFilter = ''"
              >
                All
              </button>
              <button 
                :class="['filter-tab', { active: statusFilter === 'enabled' }]"
                @click="statusFilter = 'enabled'"
              >
                Enabled
              </button>
              <button 
                :class="['filter-tab', { active: statusFilter === 'disabled' }]"
                @click="statusFilter = 'disabled'"
              >
                Disabled
              </button>
            </div>
          </div>
          
          <!-- Scrollable Interests List -->
          <div class="interests-list-container">
            <div class="interests-list">
              <div 
                v-for="interest in filteredInterests" 
                :key="interest.id" 
                :class="['interest-item', { disabled: !interest.enabled }]"
              >
                <input 
                  v-model="interest.name" 
                  type="text" 
                  class="interest-input"
                  @blur="updateInterest(interest)"
                  :disabled="!interest.enabled"
                />
                <div class="interest-actions">
                  <label class="toggle-switch" :title="interest.enabled ? 'Enabled' : 'Disabled'">
                    <input 
                      type="checkbox" 
                      v-model="interest.enabled"
                      @change="updateInterest(interest)"
                    />
                    <span class="slider"></span>
                  </label>
                  <button 
                    class="btn-icon btn-danger"
                    @click="deleteInterest(interest.id)"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div v-if="filteredInterests.length === 0" class="empty-state">
                <p>No interests found</p>
              </div>
            </div>
          </div>
          
          <!-- Add New Interest -->
          <div class="add-interest">
            <input 
              v-model="newInterestName" 
              type="text" 
              class="interest-input"
              placeholder="Enter new interest name..."
              @keyup.enter="addInterest"
            />
            <button class="btn btn-primary" @click="addInterest" :disabled="!newInterestName.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Interest
            </button>
          </div>
        </div>
      </div>

      <!-- Member Tier Rules Section -->
      <div class="settings-section">
        <div class="section-header" @click="toggleTierRulesExpanded">
          <div class="header-left">
            <button class="collapse-button">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                :class="{ rotated: tierRulesExpanded }"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <h2 class="section-title">Member Tier Rules</h2>
          </div>
        </div>
        
        <div v-show="tierRulesExpanded" class="tier-rules-content">
          <p class="rules-description">
            Member tiers are automatically assigned based on the number of past events they have attended (where they RSVP'd "Yes").
          </p>
          <div class="tier-rules-list">
            <div class="tier-rule-item">
              <div class="tier-rule-badge standard">
                <span class="tier-rule-name">Standard</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">0-2 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge premium">
                <span class="tier-rule-name">Premium</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">3-5 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge platinum">
                <span class="tier-rule-name">Platinum</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">6-10 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge vip">
                <span class="tier-rule-name">VIP</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">11-20 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge founding">
                <span class="tier-rule-name">Founding</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">21+ events attended</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Interest } from '../services/api'

const allInterests = ref<Interest[]>([])
const newInterestName = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const interestsExpanded = ref(false)
const tierRulesExpanded = ref(false)

const filteredInterests = computed(() => {
  let filtered = [...allInterests.value]
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(interest => 
      interest.name.toLowerCase().includes(query)
    )
  }
  
  // Filter by status
  if (statusFilter.value === 'enabled') {
    filtered = filtered.filter(interest => interest.enabled)
  } else if (statusFilter.value === 'disabled') {
    filtered = filtered.filter(interest => !interest.enabled)
  }
  
  // Sort: enabled first, then alphabetically
  return filtered.sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
})

const addInterest = async () => {
  if (!newInterestName.value.trim()) return
  
  await api.createInterest(newInterestName.value.trim())
  allInterests.value = await api.getAllInterests()
  newInterestName.value = ''
}

const updateInterest = async (interest: Interest) => {
  await api.updateInterest(interest.id, {
    name: interest.name,
    enabled: interest.enabled
  })
}

const deleteInterest = async (id: string) => {
  if (confirm('Are you sure you want to delete this interest?')) {
    await api.updateInterest(id, { enabled: false })
    allInterests.value = await api.getAllInterests()
  }
}

const toggleInterestsExpanded = () => {
  interestsExpanded.value = !interestsExpanded.value
}

const toggleTierRulesExpanded = () => {
  tierRulesExpanded.value = !tierRulesExpanded.value
}

onMounted(async () => {
  allInterests.value = await api.getAllInterests()
})
</script>

<style scoped>
.settings-page {
  width: 100%;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-gold);
  margin-bottom: var(--spacing-2xl);
  letter-spacing: -0.02em;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.settings-section:hover {
  border-color: var(--color-gold-subtle);
  box-shadow: var(--shadow-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  cursor: pointer;
  padding: 10px;
  margin: -10px -10px 0 -10px;
  border-radius: 8px 8px 0 0;
  transition: background 0.2s;
}

.section-header:hover {
  background: #1a1a1a;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.collapse-button {
  background: transparent;
  border: none;
  color: #d4af37;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.collapse-button svg {
  transition: transform 0.2s;
}

.collapse-button svg.rotated {
  transform: rotate(180deg);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.01em;
}

.interests-count {
  font-size: 14px;
  color: #888;
  margin-left: auto;
}

.interests-content {
  margin-top: 20px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.interests-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px 10px 36px;
  color: #ffffff;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #d4af37;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.filter-tab.active {
  background: #d4af37;
  border-color: #d4af37;
  color: #000000;
}

.interests-list-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #1a1a1a;
  margin-bottom: 20px;
}

.interests-list-container::-webkit-scrollbar {
  width: 8px;
}

.interests-list-container::-webkit-scrollbar-track {
  background: #141414;
}

.interests-list-container::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 4px;
}

.interests-list-container::-webkit-scrollbar-thumb:hover {
  background: #3a3a3a;
}

.interests-list {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.interest-item:hover {
  background: #141414;
}

.interest-item.disabled {
  opacity: 0.6;
}

.interest-item.disabled .interest-input {
  text-decoration: line-through;
}

.interest-input {
  flex: 1;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 8px 10px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s;
}

.interest-input:focus {
  outline: none;
  background: #141414;
  border-color: #d4af37;
}

.interest-input:disabled {
  cursor: not-allowed;
}

.interest-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2a2a2a;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #d4af37;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.btn-icon {
  padding: 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #888;
}

.btn-icon:hover {
  background: #2a2a2a;
  color: #ffffff;
}

.btn-icon.btn-danger {
  color: #dc2626;
}

.btn-icon.btn-danger:hover {
  background: #3a1a1a;
  color: #f87171;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #888;
}

.tier-rules-content {
  margin-top: 20px;
  animation: slideDown 0.2s ease-out;
}

.rules-description {
  color: #888;
  font-size: 14px;
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.tier-rules-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tier-rule-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.tier-rule-item:hover {
  background: var(--color-gray-soft);
  border-color: var(--color-gold-subtle);
}

.tier-rule-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
  min-width: 100px;
  justify-content: center;
}

.tier-rule-badge.standard {
  background: var(--color-gray);
  border-color: var(--color-gray-soft);
  color: #888;
}

.tier-rule-badge.premium {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-color: var(--color-gold-light);
  color: var(--color-gold-light);
}

.tier-rule-badge.platinum {
  background: linear-gradient(135deg, rgba(229, 228, 226, 0.15) 0%, rgba(229, 228, 226, 0.05) 100%);
  border-color: var(--color-platinum);
  color: var(--color-platinum);
}

.tier-rule-badge.vip {
  background: linear-gradient(135deg, rgba(139, 38, 53, 0.2) 0%, rgba(139, 38, 53, 0.1) 100%);
  border-color: var(--color-burgundy);
  color: #ff6b9d;
}

.tier-rule-badge.founding {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 10px var(--color-gold-glow);
}

.tier-rule-info {
  flex: 1;
}

.tier-rule-range {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.add-interest {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:disabled:hover {
  background: #d4af37;
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
  background: #d4af37;
  color: #000000;
}

.btn-primary:hover {
  background: #c9a030;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
}
</style>

