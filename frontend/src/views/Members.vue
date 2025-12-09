<template>
  <div class="members-page">
    <div class="members-container">
      <!-- Member Management -->
      <div class="left-section">
        <h2 class="section-title">Member Management</h2>
        
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Filter by Interest</label>
              <select v-model="filters.interest" class="filter-input">
                <option value="">All Interests</option>
                <option v-for="interest in interests" :key="interest.id" :value="interest.name">
                  {{ interest.name }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label>Search by Name</label>
              <input 
                v-model="filters.name" 
                type="text" 
                class="filter-input"
                placeholder="Enter member name"
              />
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <label>Search by Email</label>
              <input 
                v-model="filters.email" 
                type="text" 
                class="filter-input"
                placeholder="Enter email address"
              />
            </div>
            <div class="filter-group">
              <label>Search by City</label>
              <input 
                v-model="filters.city" 
                type="text" 
                class="filter-input"
                placeholder="Enter city name"
              />
            </div>
          </div>
          
          <div class="filter-row">
            <div class="filter-group">
              <label>Filter by Status</label>
              <select v-model="filters.status" class="filter-input">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="invited">Invited</option>
              </select>
            </div>
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-secondary" @click="resetFilters">Clear Filters</button>
            <button class="btn btn-primary" @click="applyFilters">Apply Filters</button>
          </div>
        </div>

        <div class="interests-section">
          <div class="section-header">
            <h2 class="section-title">Your Interests</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="showAddMemberModal = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Member
              </button>
              <div v-if="selectedMembers.length > 0" class="bulk-actions-toolbar">
                <span class="selected-count">{{ selectedMembers.length }} selected</span>
                <button class="btn btn-sm btn-secondary" @click="showBulkStatusModal = true">Update Status</button>
                <button class="btn btn-sm btn-secondary" @click="showBulkInterestsModal = true">Assign Interests</button>
                <button class="btn btn-sm btn-primary" @click="showBulkEmailModal = true">Send Email</button>
                <button class="btn btn-sm btn-danger" @click="showBulkDeleteModal = true">Delete</button>
                <button class="btn btn-sm btn-secondary" @click="clearSelection">Clear</button>
              </div>
            </div>
          </div>
          <div class="table-container">
            <table class="members-table">
              <thead>
                <tr>
                  <th class="checkbox-column">
                    <input 
                      type="checkbox" 
                      :checked="allSelected" 
                      @change="toggleSelectAll"
                      @click.stop
                    />
                  </th>
                  <th class="sortable" @click="sortMembers('name')">
                    Member
                    <span class="sort-icon" v-if="sortColumn === 'name'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortMembers('email')">
                    Email
                    <span class="sort-icon" v-if="sortColumn === 'email'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortMembers('city')">
                    City
                    <span class="sort-icon" v-if="sortColumn === 'city'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortMembers('interests')">
                    Interests
                    <span class="sort-icon" v-if="sortColumn === 'interests'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th class="sortable" @click="sortMembers('status')">
                    Status
                    <span class="sort-icon" v-if="sortColumn === 'status'">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th>Invitation</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(member, index) in paginatedMembers" 
                  :key="member.id" 
                  class="member-row"
                  :class="{ selected: selectedMembers.includes(member.id) }"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                >
                  <td class="checkbox-column" @click.stop>
                    <input 
                      type="checkbox" 
                      :checked="selectedMembers.includes(member.id)"
                      @change="toggleMemberSelection(member.id)"
                    />
                  </td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">
                    <div class="member-cell">
                      <div class="member-avatar-small">
                        <img v-if="member.profilePhoto" :src="member.profilePhoto" :alt="member.name" />
                        <span v-else>{{ getInitials(member.name) }}</span>
                      </div>
                      <div class="member-info">
                        <div class="member-name-row">
                          <span class="member-name">{{ member.name }}</span>
                          <MemberTierBadge v-if="member.tier" :tier="member.tier" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">{{ member.email }}</td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">{{ member.city || '-' }}</td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">
                    <div class="interests-cell">
                      <span v-for="interest in member.interests.slice(0, 2)" :key="interest" class="interest-tag-small">
                        {{ interest }}
                      </span>
                      <span v-if="member.interests.length > 2" class="interest-more">
                        +{{ member.interests.length - 2 }}
                      </span>
                    </div>
                  </td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">
                    <span :class="['status-badge', member.status]">
                      {{ member.status }}
                    </span>
                  </td>
                  <td @click="$router.push({ name: 'member-detail', params: { id: member.id } })">
                    <span class="invited-badge" v-if="member.invitationCode">
                      {{ member.invitationCode }}
                    </span>
                    <span v-else class="no-code">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button class="pagination-btn" @click="prevPage" :disabled="currentPage === 1">
              Previous
            </button>
            <div class="pagination-pages">
              <button
                v-for="page in totalPages"
                :key="page"
                :class="['pagination-page', { active: currentPage === page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button class="pagination-btn" @click="nextPage" :disabled="currentPage === totalPages">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Status Update Modal -->
    <div v-if="showBulkStatusModal" class="modal-overlay" @click.self="showBulkStatusModal = false">
      <div class="modal-content">
        <h3>Update Status for {{ selectedMembers.length }} Members</h3>
        <div class="modal-form">
          <label>New Status</label>
          <select v-model="bulkStatusValue" class="form-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="invited">Invited</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showBulkStatusModal = false">Cancel</button>
          <button class="btn btn-primary" @click="handleBulkStatusUpdate">Update</button>
        </div>
      </div>
    </div>

    <!-- Bulk Interests Modal -->
    <div v-if="showBulkInterestsModal" class="modal-overlay" @click.self="showBulkInterestsModal = false">
      <div class="modal-content">
        <h3>Assign Interests to {{ selectedMembers.length }} Members</h3>
        <div class="modal-form">
          <label>Select Interests</label>
          <div class="interests-checkboxes">
            <label v-for="interest in interests" :key="interest.id" class="checkbox-label">
              <input 
                type="checkbox" 
                :value="interest.name" 
                v-model="bulkInterestsValue"
              />
              {{ interest.name }}
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showBulkInterestsModal = false">Cancel</button>
          <button class="btn btn-primary" @click="handleBulkAssignInterests">Assign</button>
        </div>
      </div>
    </div>

    <!-- Bulk Email Modal -->
    <div v-if="showBulkEmailModal" class="modal-overlay" @click.self="showBulkEmailModal = false">
      <div class="modal-content modal-large">
        <h3>Send Email to {{ selectedMembers.length }} Members</h3>
        <div class="modal-form">
          <label>Subject</label>
          <input v-model="emailSubject" type="text" class="form-input" placeholder="Email subject" />
          <label>Message</label>
          <textarea v-model="emailBody" class="form-textarea" rows="8" placeholder="Email message"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showBulkEmailModal = false">Cancel</button>
          <button class="btn btn-primary" @click="handleBulkEmail" :disabled="!emailSubject || !emailBody">Send</button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteModal" class="modal-overlay" @click.self="showBulkDeleteModal = false">
      <div class="modal-content">
        <h3>Delete {{ selectedMembers.length }} Members?</h3>
        <p class="warning-text">This action cannot be undone. Are you sure you want to delete these members?</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showBulkDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="handleBulkDelete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="modal-overlay" @click.self="closeAddMemberModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Add New Member</h3>
          <button class="modal-close" @click="closeAddMemberModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Name *</label>
                <input 
                  v-model="newMember.name" 
                  type="text" 
                  :class="['form-input', { 'input-error': errors.name }]"
                  placeholder="Full name"
                  @input="clearError('name')"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input 
                  v-model="newMember.email" 
                  type="email" 
                  :class="['form-input', { 'input-error': errors.email }]"
                  placeholder="email@example.com"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone *</label>
                <input 
                  v-model="newMember.phone" 
                  type="tel" 
                  :class="['form-input', { 'input-error': errors.phone }]"
                  placeholder="+1 234 567 8900"
                  @input="clearError('phone')"
                />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>
              <div class="form-group">
                <label>City</label>
                <input 
                  v-model="newMember.city" 
                  type="text" 
                  class="form-input" 
                  placeholder="City name"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status</label>
                <select v-model="newMember.status" class="form-input">
                  <option value="invited">Invited</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="form-group">
                <label>Invitation Code</label>
                <input 
                  v-model="newMember.invitationCode" 
                  type="text" 
                  class="form-input" 
                  placeholder="Optional"
                />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Interests</label>
              <div class="interests-chips-container">
                <div 
                  v-for="interest in interests" 
                  :key="interest.id"
                  :class="['interest-chip-selectable', { selected: newMember.interests.includes(interest.name) }]"
                  @click="toggleInterest(interest.name)"
                >
                  <svg 
                    v-if="newMember.interests.includes(interest.name)"
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                    class="chip-check-icon"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span class="chip-text">{{ interest.name }}</span>
                </div>
                <div v-if="interests.length === 0" class="no-interests-message">
                  <p>No interests available. Add interests in Settings.</p>
                </div>
              </div>
              <div v-if="newMember.interests.length > 0" class="selected-interests-summary">
                <span class="summary-text">{{ newMember.interests.length }} selected</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeAddMemberModal">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="handleAddMember"
            :disabled="isAddingMember"
          >
            {{ isAddingMember ? 'Adding...' : 'Add Member' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type Member, type Interest } from '../services/api'
import MemberTierBadge from '../components/MemberTierBadge.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()

const members = ref<Member[]>([])
const interests = ref<Interest[]>([])
const filteredMembers = ref<Member[]>([])
const selectedMembers = ref<string[]>([])

// Add member modal
const showAddMemberModal = ref(false)
const isAddingMember = ref(false)
const newMember = ref({
  name: '',
  email: '',
  phone: '',
  city: '',
  interests: [] as string[],
  status: 'invited' as 'active' | 'inactive' | 'invited',
  invitationCode: ''
})
const errors = ref<{
  name?: string
  email?: string
  phone?: string
}>({})

// Bulk operation modals
const showBulkStatusModal = ref(false)
const showBulkInterestsModal = ref(false)
const showBulkEmailModal = ref(false)
const showBulkDeleteModal = ref(false)

// Bulk operation values
const bulkStatusValue = ref<'active' | 'inactive' | 'invited'>('active')
const bulkInterestsValue = ref<string[]>([])
const emailSubject = ref('')
const emailBody = ref('')

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const filters = ref({
  interest: '',
  name: '',
  email: '',
  city: '',
  status: ''
})

const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const sortedMembers = computed(() => {
  if (!sortColumn.value) {
    return filteredMembers.value
  }
  
  const sorted = [...filteredMembers.value]
  sorted.sort((a, b) => {
    let aVal: any
    let bVal: any
    
    switch (sortColumn.value) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'email':
        aVal = a.email.toLowerCase()
        bVal = b.email.toLowerCase()
        break
      case 'city':
        aVal = (a.city || '').toLowerCase()
        bVal = (b.city || '').toLowerCase()
        break
      case 'interests':
        aVal = a.interests.join(', ').toLowerCase()
        bVal = b.interests.join(', ').toLowerCase()
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      default:
        return 0
    }
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
})

const sortMembers = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Pagination
const totalPages = computed(() => Math.ceil(sortedMembers.value.length / itemsPerPage.value))
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedMembers.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const applyFilters = async () => {
  const filterParams: any = {}
  
  if (filters.value.interest) {
    filterParams.interests = [filters.value.interest]
  }
  if (filters.value.name) {
    filterParams.name = filters.value.name
  }
  if (filters.value.email) {
    filterParams.email = filters.value.email
  }
  if (filters.value.city) {
    filterParams.city = filters.value.city
  }
  if (filters.value.status) {
    filterParams.status = filters.value.status
  }
  
  filteredMembers.value = await api.getMembers(filterParams)
}

const resetFilters = () => {
  filters.value = {
    interest: '',
    name: '',
    email: '',
    city: '',
    status: ''
  }
  filteredMembers.value = [...members.value]
}

// Selection management
const toggleMemberSelection = (memberId: string) => {
  const index = selectedMembers.value.indexOf(memberId)
  if (index > -1) {
    selectedMembers.value.splice(index, 1)
  } else {
    selectedMembers.value.push(memberId)
  }
}

const toggleSelectAll = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    selectedMembers.value = paginatedMembers.value.map(m => m.id)
  } else {
    selectedMembers.value = []
  }
}

const clearSelection = () => {
  selectedMembers.value = []
}

const allSelected = computed(() => {
  return paginatedMembers.value.length > 0 && 
         paginatedMembers.value.every(m => selectedMembers.value.includes(m.id))
})

// Bulk operations
const handleBulkStatusUpdate = async () => {
  try {
    await api.bulkUpdateMemberStatus(selectedMembers.value, bulkStatusValue.value)
    toast.showToast(`Status updated for ${selectedMembers.value.length} members`, 'success')
    showBulkStatusModal.value = false
    selectedMembers.value = []
    await applyFilters()
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to update status', 'error')
  }
}

const handleBulkAssignInterests = async () => {
  if (bulkInterestsValue.value.length === 0) {
    toast.showToast('Please select at least one interest', 'error')
    return
  }
  try {
    await api.bulkAssignInterests(selectedMembers.value, bulkInterestsValue.value)
    toast.showToast(`Interests assigned to ${selectedMembers.value.length} members`, 'success')
    showBulkInterestsModal.value = false
    bulkInterestsValue.value = []
    selectedMembers.value = []
    await applyFilters()
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to assign interests', 'error')
  }
}

const handleBulkEmail = async () => {
  if (!emailSubject.value || !emailBody.value) {
    toast.showToast('Please fill in both subject and message', 'error')
    return
  }
  try {
    await api.sendBulkEmails(selectedMembers.value, emailSubject.value, emailBody.value)
    toast.showToast(`Email sent to ${selectedMembers.value.length} members`, 'success')
    showBulkEmailModal.value = false
    emailSubject.value = ''
    emailBody.value = ''
    selectedMembers.value = []
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to send emails', 'error')
  }
}

const handleBulkDelete = async () => {
  try {
    await api.bulkDeleteMembers(selectedMembers.value)
    toast.showToast(`Deleted ${selectedMembers.value.length} members`, 'success')
    showBulkDeleteModal.value = false
    selectedMembers.value = []
    await applyFilters()
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to delete members', 'error')
  }
}

const validateMemberForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validate name
  if (!newMember.value.name || newMember.value.name.trim() === '') {
    errors.value.name = 'Name is required'
    isValid = false
  }

  // Validate email
  if (!newMember.value.email || newMember.value.email.trim() === '') {
    errors.value.email = 'Email is required'
    isValid = false
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMember.value.email)) {
      errors.value.email = 'Please enter a valid email address'
      isValid = false
    }
  }

  // Validate phone
  if (!newMember.value.phone || newMember.value.phone.trim() === '') {
    errors.value.phone = 'Phone is required'
    isValid = false
  }

  return isValid
}

const clearError = (field: 'name' | 'email' | 'phone') => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const handleAddMember = async () => {
  // Validate form
  if (!validateMemberForm()) {
    toast.showToast('Please fill in all required fields correctly', 'error')
    return
  }
  
  isAddingMember.value = true
  try {
    const created = await api.createMember({
      name: newMember.value.name.trim(),
      email: newMember.value.email.trim(),
      phone: newMember.value.phone.trim(),
      city: newMember.value.city?.trim() || undefined,
      interests: newMember.value.interests,
      status: newMember.value.status,
      invitationCode: newMember.value.invitationCode?.trim() || undefined
    })
    toast.showToast(`Member "${created.name}" added successfully`, 'success')
    closeAddMemberModal()
    // Refresh members list
    members.value = await api.getMembers()
    filteredMembers.value = [...members.value]
  } catch (error: any) {
    toast.showToast(error.message || 'Failed to add member', 'error')
  } finally {
    isAddingMember.value = false
  }
}

const toggleInterest = (interestName: string) => {
  const index = newMember.value.interests.indexOf(interestName)
  if (index > -1) {
    newMember.value.interests.splice(index, 1)
  } else {
    newMember.value.interests.push(interestName)
  }
}

const closeAddMemberModal = () => {
  showAddMemberModal.value = false
  errors.value = {}
  newMember.value = {
    name: '',
    email: '',
    phone: '',
    city: '',
    interests: [],
    status: 'invited',
    invitationCode: ''
  }
}

onMounted(async () => {
  members.value = await api.getMembers()
  filteredMembers.value = [...members.value]
  interests.value = await api.getInterests()
})
</script>

<style scoped>
.members-page {
  width: 100%;
}

.members-container {
  width: 100%;
}

.page-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--color-gold);
  margin: 0 0 var(--spacing-xl) 0;
  font-weight: 600;
  text-transform: uppercase;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.filters-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
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

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
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

.btn-secondary {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #2a2a2a;
}

.btn-secondary:hover {
  background: #2a2a2a;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #000000;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-large {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 20px;
}

.interests-section {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
}

.table-container {
  overflow-x: auto;
}

.members-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.members-table thead {
  border-bottom: 2px solid var(--color-gray-soft);
  background: var(--color-black-soft);
}

.members-table th {
  text-align: left;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  user-select: none;
  font-family: var(--font-body);
}

.members-table th.sortable {
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  padding-right: 32px;
}

.members-table th.sortable:hover {
  color: var(--color-gold);
  background: var(--color-gray);
}

.sort-icon {
  position: absolute;
  right: 12px;
  color: var(--color-gold);
  font-size: 14px;
  font-weight: 700;
}

.members-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 14px;
  color: #ffffff;
  border-bottom: 1px solid var(--color-gray);
}

.member-row {
  cursor: pointer;
  transition: all var(--transition-base);
  animation: fadeInRow 0.4s ease-out backwards;
}

@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.member-row:hover {
  background: var(--color-gold-subtle);
  transform: translateX(4px);
}

.member-row:nth-child(even) {
  background: rgba(20, 20, 20, 0.3);
}

.member-row:nth-child(even):hover {
  background: var(--color-gold-subtle);
}

.member-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.member-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--color-gold-subtle);
  background: var(--color-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-gold);
}

.member-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.member-name {
  font-weight: 600;
  color: #ffffff;
}

.interests-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.interest-tag-small {
  padding: 2px 8px;
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: #888;
}

.interest-more {
  font-size: 11px;
  color: var(--color-gold);
  font-weight: 500;
}

.no-code {
  color: #666;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 20px;
}

.pagination-btn {
  padding: 8px 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #2a2a2a;
  border-color: #d4af37;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 5px;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-page:hover {
  background: #2a2a2a;
  border-color: #d4af37;
}

.pagination-page.active {
  background: #d4af37;
  border-color: #d4af37;
  color: #000000;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: capitalize;
}

.status-badge.active {
  background: #1a3a1a;
  color: #4ade80;
}

.status-badge.inactive {
  background: #3a1a1a;
  color: #f87171;
}

.status-badge.invited {
  background: #1a1a3a;
  color: #818cf8;
}

.invited-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
}

.badge-icon {
  color: #d4af37;
  font-size: 8px;
}

/* Bulk Operations Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
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

.bulk-actions-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold);
  border-radius: var(--radius-md);
}

.selected-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gold);
  margin-right: var(--spacing-sm);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.btn-danger:hover {
  background: rgba(248, 113, 113, 0.3);
  border-color: #f87171;
}

.checkbox-column {
  width: 40px;
  padding: var(--spacing-md) !important;
  text-align: center;
}

.checkbox-column input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-gold);
}

.member-row.selected {
  background: var(--color-gold-subtle);
  border-left: 3px solid var(--color-gold);
}

.member-row.selected:hover {
  background: var(--color-gold-subtle);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-xl);
}

.modal-content {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-soft);
}

.modal-header h3 {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
}

.modal-close {
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
}

.modal-close:hover {
  background: var(--color-gray);
  color: #ffffff;
}

.modal-body {
  margin-bottom: var(--spacing-xl);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.modal-form label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.form-input,
.form-textarea {
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
  font-family: var(--font-body);
  width: 100%;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 2px var(--color-gold-subtle);
}

.form-input.input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-input.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  font-weight: 500;
  animation: slideDown 0.2s ease-out;
}

.error-message::before {
  content: '⚠';
  font-size: 14px;
  flex-shrink: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.interests-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-gray);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  align-content: flex-start;
}

.interest-chip-selectable {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 8px 14px;
  background: var(--color-dark-soft);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: #ffffff;
  cursor: pointer;
  transition: all var(--transition-base);
  user-select: none;
  font-weight: 500;
}

.interest-chip-selectable:hover {
  background: var(--color-gray);
  border-color: var(--color-gold-subtle);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.interest-chip-selectable.selected {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 0 2px var(--color-gold-subtle);
}

.interest-chip-selectable.selected:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.15) 100%);
  box-shadow: 0 0 0 2px var(--color-gold-subtle), var(--shadow-gold);
}

.chip-check-icon {
  flex-shrink: 0;
  color: var(--color-gold);
}

.chip-text {
  white-space: nowrap;
}

.no-interests-message {
  width: 100%;
  text-align: center;
  padding: var(--spacing-xl);
  color: #888;
  font-size: 14px;
}

.no-interests-message p {
  margin: 0;
}

.selected-interests-summary {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-gold-subtle);
  border: 1px solid var(--color-gold-subtle);
  border-radius: var(--radius-sm);
  display: inline-block;
}

.summary-text {
  font-size: 12px;
  color: var(--color-gold);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.warning-text {
  color: #f87171;
  font-size: 14px;
  margin: var(--spacing-md) 0;
  line-height: 1.5;
}

</style>

