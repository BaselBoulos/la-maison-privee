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
            <h2 class="section-title">Interests</h2>
            <div class="interests-count">{{ filteredInterests.length }} interests</div>
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
                placeholder="Search interests"
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
                <div class="interest-name">{{ interest.name }}</div>
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
                    @click="promptDeleteInterest(interest)"
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
                <p>No interests found.</p>
              </div>
            </div>
          </div>
          
          <!-- Add New Interest -->
          <div class="add-interest">
            <div class="new-interest-field">
              <label for="new-interest">Add New Interest</label>
              <div class="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <input 
                  id="new-interest"
                  v-model="newInterestName" 
                  type="text" 
                  class="interest-input"
                  placeholder="e.g., Rare Wines"
                  @keyup.enter="addInterest"
                />
              </div>
            </div>
            <button class="btn btn-primary" @click="addInterest" :disabled="!newInterestName.trim()">
              Add Interest
            </button>
          </div>
          
          <div class="quick-interests">
            <p class="helper-text">Quick add:</p>
            <div class="chip-grid">
              <button
                v-for="interest in suggestedInterests"
                :key="interest"
                type="button"
                class="chip-button"
                :class="{ selected: newInterestName === interest }"
                @click="selectSuggested(interest)"
              >
                {{ interest }}
              </button>
            </div>
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
            <h2 class="section-title">Membership Tier Rules</h2>
          </div>
        </div>
        
        <div v-show="tierRulesExpanded" class="tier-rules-content">
          <p class="rules-description">
            Suggested thresholds for member tiers based on number of events attended.
          </p>
          <div class="tier-rules-list">
            <div class="tier-rule-item">
              <div class="tier-rule-badge standard">
                <span class="tier-rule-name">Standard</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">0 - 4 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge premium">
                <span class="tier-rule-name">Premium</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">5 - 9 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge platinum">
                <span class="tier-rule-name">Platinum</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">10 - 14 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge vip">
                <span class="tier-rule-name">VIP</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">15 - 24 events attended</span>
              </div>
            </div>
            <div class="tier-rule-item">
              <div class="tier-rule-badge founding">
                <span class="tier-rule-name">Founding Member</span>
              </div>
              <div class="tier-rule-info">
                <span class="tier-rule-range">25+ events attended</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Super Admin Club Management -->
      <div v-if="userRole === 'super'" class="settings-section">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">Club Management</h2>
          </div>
        </div>
        <div class="club-management">
          <div class="club-select">
            <label>Select club to delete</label>
            <select v-model.number="selectedClubId">
              <option v-for="club in clubs" :key="club.id" :value="club.id">
                {{ club.name }} (ID: {{ club.id }})
              </option>
            </select>
            <p class="helper-text">Seed clubs (IDs 1-3) cannot be deleted.</p>
          </div>
          <div class="club-actions">
            <button class="btn btn-danger" :disabled="deletingClub || !selectedClubId" @click="deleteClub">
              <span v-if="!deletingClub">Delete Club</span>
              <span v-else class="loading-inline">Deleting...</span>
            </button>
            <p v-if="deleteError" class="error-text">{{ deleteError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Interest Confirmation Modal -->
  <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <h3>Delete Interest</h3>
        <button class="modal-close" @click="closeDeleteModal">×</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>? This cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="btn secondary" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" @click="confirmDelete" :disabled="deletingInterest">
          <span v-if="!deletingInterest">Delete</span>
          <span v-else class="loading-inline">Deleting...</span>
        </button>
      </div>
      <p v-if="deleteError" class="error-text">{{ deleteError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Interest, type Club } from '../services/api'
const allInterests = ref<Interest[]>([])
const newInterestName = ref('')
const searchQuery = ref('')
const statusFilter = ref('')
const interestsExpanded = ref(false)
const tierRulesExpanded = ref(false)
const suggestedInterests = [
  'Wine Tasting',
  'Fine Dining',
  'Cigar Tasting',
  'Whisky / Spirits',
  'Live Music',
  'Art & Culture',
  'Craft Cocktails',
  'Luxury Travel'
]
const userRole = ref(localStorage.getItem('userRole') || 'club')
const clubs = ref<Club[]>([])
const selectedClubId = ref<number | null>(null)
const deletingClub = ref(false)
const deleteError = ref('')
const showDeleteModal = ref(false)
const deleteTarget = ref<Interest | null>(null)
const deletingInterest = ref(false)

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

const selectSuggested = (name: string) => {
  newInterestName.value = name
}

const promptDeleteInterest = (interest: Interest) => {
  deleteTarget.value = interest
  showDeleteModal.value = true
  deleteError.value = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteTarget.value = null
  deletingInterest.value = false
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  deletingInterest.value = true
  try {
    await api.deleteInterest(deleteTarget.value.id)
    allInterests.value = await api.getAllInterests()
    closeDeleteModal()
  } catch (e: any) {
    deleteError.value = e?.message || 'Failed to delete interest'
    deletingInterest.value = false
  }
}

const loadClubs = async () => {
  try {
    const list = await api.getClubs()
    clubs.value = list
    if (!selectedClubId.value && list.length) {
      selectedClubId.value = list[0].id
    }
  } catch (e: any) {
    deleteError.value = e?.message || 'Failed to load clubs'
  }
}

const deleteClub = async () => {
  if (!selectedClubId.value) return
  if (selectedClubId.value <= 3) {
    deleteError.value = 'Seed clubs cannot be deleted.'
    return
  }
  deleteError.value = ''
  deletingClub.value = true
  try {
    await api.deleteClub(selectedClubId.value)
    clubs.value = clubs.value.filter(c => c.id !== selectedClubId.value)
    selectedClubId.value = clubs.value[0]?.id || null
  } catch (e: any) {
    deleteError.value = e?.message || 'Failed to delete club'
  } finally {
    deletingClub.value = false
  }
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
  if (userRole.value === 'super') {
    loadClubs()
  }
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
  transition: background 0.2s, border-color 0.2s;
  border: 1px solid transparent;
}

.interest-item:hover {
  background: #141414;
  border-color: rgba(212, 175, 55, 0.25);
}

.interest-item.disabled {
  opacity: 0.6;
}

.interest-name {
  flex: 1;
  color: #fff;
  font-weight: 600;
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
  align-items: flex-end;
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

.quick-interests {
  margin-top: 14px;
}
.helper-text {
  color: #aaa;
  font-size: 12px;
  margin: 0 0 6px 0;
}
.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.chip-button {
  border: 1px solid rgba(212, 175, 55, 0.25);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(139, 38, 53, 0.08));
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}
.chip-button:hover {
  border-color: rgba(212, 175, 55, 0.55);
  transform: translateY(-1px);
}
.chip-button.selected {
  border-color: rgba(212, 175, 55, 0.9);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(139, 38, 53, 0.18));
  box-shadow: 0 8px 18px rgba(0,0,0,0.35);
}

.new-interest-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.new-interest-field label {
  font-size: 12px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.input-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-with-icon:hover {
  border-color: rgba(212, 175, 55, 0.3);
}
.input-with-icon input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
}
.input-with-icon input:focus {
  outline: none;
}

.club-management {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
.club-select label {
  display: block;
  color: #aaa;
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.club-select select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #2a2a2a;
  background: #111;
  color: #fff;
}
.club-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-danger {
  background: linear-gradient(135deg, #8b2635, #5c0f1f);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.btn-danger:hover { background: linear-gradient(135deg, #a22d3f, #701428); }
.loading-inline { font-size: 12px; color: #ccc; }
.error-text { color: #ff6b6b; margin-top: 8px; }

.confirm-modal {
  max-width: 420px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  background: linear-gradient(135deg, #0f0f0f, #0a0a0a);
  border: 1px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 520px;
  color: #fff;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-close {
  background: transparent;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  margin-bottom: 16px;
  color: #ddd;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

