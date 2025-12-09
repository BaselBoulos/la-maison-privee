<template>
  <div class="invitation-codes-page">
    <div class="page-header">
      <h1 class="page-title">Invitation Codes</h1>
      <div class="header-actions">
        <input 
          v-model="codeCount" 
          type="number" 
          min="1" 
          max="100" 
          class="code-count-input"
          placeholder="Number of codes"
        />
        <button 
          class="btn btn-primary" 
          @click="generateCodes"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Generating...' : 'Generate Codes' }}
        </button>
      </div>
    </div>
    
    <div class="codes-stats">
      <div class="stat-item">
        <span class="stat-label">Total Codes:</span>
        <span class="stat-value">{{ codes.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Used:</span>
        <span class="stat-value used">{{ usedCodes }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Unused:</span>
        <span class="stat-value unused">{{ unusedCodes }}</span>
      </div>
    </div>
    
    <div class="codes-table-container">
      <table class="codes-table">
        <thead>
          <tr>
            <th class="sortable" @click="sortCodes('code')">
              Code
              <span class="sort-icon" v-if="sortColumn === 'code'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="sortable" @click="sortCodes('status')">
              Status
              <span class="sort-icon" v-if="sortColumn === 'status'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="sortable" @click="sortCodes('assignedMember')">
              Assigned Member
              <span class="sort-icon" v-if="sortColumn === 'assignedMember'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="sortable" @click="sortCodes('createdAt')">
              Created At
              <span class="sort-icon" v-if="sortColumn === 'createdAt'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="sortable" @click="sortCodes('usedAt')">
              Used At
              <span class="sort-icon" v-if="sortColumn === 'usedAt'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="code in paginatedCodes" :key="code.id">
            <td class="code-cell">
              <code>{{ code.code }}</code>
            </td>
            <td>
              <span :class="['status-badge', code.status]">
                {{ code.status }}
              </span>
            </td>
            <td>{{ code.assignedMemberName || '-' }}</td>
            <td>{{ formatDate(code.createdAt) }}</td>
            <td>{{ code.usedAt ? formatDate(code.usedAt) : '-' }}</td>
            <td>
              <button 
                v-if="code.status === 'unused'"
                class="btn-small btn-danger"
                @click="revokeCode(code.id)"
              >
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type InvitationCode } from '../services/api'

const codes = ref<InvitationCode[]>([])
const codeCount = ref(5)
const isLoading = ref(false)
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const usedCodes = computed(() => codes.value.filter(c => c.status === 'used').length)
const unusedCodes = computed(() => codes.value.filter(c => c.status === 'unused').length)

const sortedCodes = computed(() => {
  if (!sortColumn.value) {
    return codes.value
  }
  
  const sorted = [...codes.value]
  sorted.sort((a, b) => {
    let aVal: any
    let bVal: any
    
    switch (sortColumn.value) {
      case 'code':
        aVal = a.code.toLowerCase()
        bVal = b.code.toLowerCase()
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'assignedMember':
        aVal = (a.assignedMemberName || '').toLowerCase()
        bVal = (b.assignedMemberName || '').toLowerCase()
        break
      case 'createdAt':
        aVal = new Date(a.createdAt).getTime()
        bVal = new Date(b.createdAt).getTime()
        break
      case 'usedAt':
        aVal = a.usedAt ? new Date(a.usedAt).getTime() : 0
        bVal = b.usedAt ? new Date(b.usedAt).getTime() : 0
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

const sortCodes = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Pagination
const totalPages = computed(() => Math.ceil(sortedCodes.value.length / itemsPerPage.value))
const paginatedCodes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedCodes.value.slice(start, end)
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const generateCodes = async () => {
  if (codeCount.value < 1 || codeCount.value > 100) {
    alert('Please enter a number between 1 and 100')
    return
  }
  
  isLoading.value = true
  try {
    const newCodes = await api.generateInvitationCodes(codeCount.value)
    // Immediately refresh the list to show new codes
    const allCodes = await api.getInvitationCodes()
    // Sort by created date, newest first
    codes.value = [...allCodes].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    codeCount.value = 5
    
    // Notify other views (e.g., Overview Activity tab) to refresh
    window.dispatchEvent(new CustomEvent('codes-updated'))
    
    console.log(`Successfully generated ${newCodes.length} invitation codes`)
  } catch (error) {
    console.error('Error generating codes:', error)
    alert('Failed to generate codes. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const revokeCode = async (id: string) => {
  if (confirm('Are you sure you want to revoke this code?')) {
    await api.revokeInvitationCode(id)
    await loadCodes()
  }
}

const loadCodes = async () => {
  const allCodes = await api.getInvitationCodes()
  codes.value = [...allCodes]
  // Set default sort to newest first by createdAt if no sort is active
  if (!sortColumn.value) {
    sortColumn.value = 'createdAt'
    sortDirection.value = 'desc'
  }
}

onMounted(async () => {
  await loadCodes()
})
</script>

<style scoped>
.invitation-codes-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-gold);
  margin: 0;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.code-count-input {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
  width: 120px;
}

.code-count-input:focus {
  outline: none;
  border-color: #d4af37;
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
  letter-spacing: 0.5px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
}

.btn-danger:hover {
  background: #b91c1c;
}

.codes-stats {
  display: flex;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-gold);
  text-shadow: 0 0 10px var(--color-gold-glow);
}

.stat-value.used {
  color: #4ade80;
}

.stat-value.unused {
  color: #818cf8;
}

.codes-table-container {
  background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.codes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.codes-table thead {
  background: var(--color-black-soft);
  border-bottom: 2px solid var(--color-gray-soft);
}

.codes-table th {
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

.codes-table th.sortable {
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  padding-right: 32px;
}

.codes-table th.sortable:hover {
  color: var(--color-gold);
  background: var(--color-gray);
}

.codes-table .sort-icon {
  position: absolute;
  right: 12px;
  color: var(--color-gold);
  font-size: 14px;
  font-weight: 700;
}

.codes-table tbody tr {
  transition: all var(--transition-base);
  border-bottom: 1px solid var(--color-gray);
}

.codes-table tbody tr:nth-child(even) {
  background: rgba(20, 20, 20, 0.3);
}

.codes-table tbody tr:hover {
  background: var(--color-gold-subtle);
  transform: translateX(4px);
}

.codes-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 14px;
  color: #ffffff;
}

.code-cell code {
  background: var(--color-gray);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  color: var(--color-gold);
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--color-gold-subtle);
  box-shadow: 0 0 10px var(--color-gold-subtle);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: capitalize;
}

.status-badge.unused {
  background: #1a3a1a;
  color: #4ade80;
}

.status-badge.used {
  background: #3a1a1a;
  color: #f87171;
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
</style>

