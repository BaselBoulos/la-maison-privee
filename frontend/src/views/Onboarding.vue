<template>
  <div class="onboarding-page">
    <div class="onboarding-header">
      <div>
        <h1 class="title">Onboarding</h1>
        <p class="subtitle">Set up your club in a few steps.</p>
      </div>
    </div>

    <div class="steps">
      <div
        v-for="(s, i) in steps"
        :key="s.id"
        :class="['step', { active: i === stepIndex, done: i < stepIndex }]"
      >
        <span class="step-index">{{ i + 1 }}</span>
        <span class="step-label">{{ s.label }}</span>
      </div>
    </div>

    <div class="card">
      <div v-if="loadError" class="error-banner">{{ loadError }}</div>

      <!-- Club Step -->
      <div v-if="currentStepId === 'club'" class="step-body">
        <h2>Club Details</h2>
        <div class="form-grid">
          <label>
            Club name
            <input v-model="form.clubName" @blur="validateClub" />
            <span class="error" v-if="errors.clubName">{{ errors.clubName }}</span>
          </label>
          <label>
            Club slug (used in URLs)
            <input v-model="form.slug" @blur="validateClub" />
            <span class="error" v-if="errors.slug">{{ errors.slug }}</span>
          </label>
        </div>
      </div>

      <!-- Admin Step -->
      <div v-else-if="currentStepId === 'admin'" class="step-body">
        <h2>Admin Account</h2>
        <div class="form-grid">
          <label>
            Full name
            <input v-model="form.admin.name" @blur="validateAdmin" />
            <span class="error" v-if="errors.adminName">{{ errors.adminName }}</span>
          </label>
          <label>
            Email
            <input type="email" v-model="form.admin.email" @blur="validateAdmin" />
            <span class="error" v-if="errors.adminEmail">{{ errors.adminEmail }}</span>
          </label>
          <label>
            Password
            <input type="password" v-model="form.admin.password" @blur="validateAdmin" />
            <span class="error" v-if="errors.adminPassword">{{ errors.adminPassword }}</span>
          </label>
        </div>
      </div>

      <!-- Interests Step -->
      <div v-else-if="currentStepId === 'interests'" class="step-body">
        <h2>Key Interests</h2>
        <p class="helper-text">Pick from quick options or add your own.</p>
        <div class="quick-interests">
          <button
            v-for="interest in suggestedInterests"
            :key="interest"
            type="button"
            class="chip-button"
            :class="{ selected: form.interests.includes(interest) }"
            @click="toggleInterest(interest)"
          >
            {{ interest }}
          </button>
        </div>
        <div class="chip-input">
          <input
            v-model="interestInput"
            @keyup.enter="addInterest"
            placeholder="Type an interest and press Enter"
          />
          <button class="btn secondary" @click="addInterest">+</button>
        </div>
        <div class="chips">
          <span v-for="interest in form.interests" :key="interest" class="chip">
            {{ interest }}
            <button @click="removeInterest(interest)">×</button>
          </span>
        </div>
      </div>

      <!-- Review Step -->
      <div v-else class="step-body">
        <h2>Review</h2>
        <div class="review-grid">
          <div>
            <h3>Club</h3>
            <p>{{ form.clubName }} ({{ form.slug }})</p>
          </div>
          <div>
            <h3>Branding</h3>
            <p>No branding set</p>
          </div>
          <div>
            <h3>Admin</h3>
            <p>{{ form.admin.name }} — {{ form.admin.email }}</p>
          </div>
          <div>
            <h3>Interests</h3>
            <p>{{ form.interests.join(', ') || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="actions">
        <button v-if="stepIndex > 0" @click="prevStep" class="btn secondary" :disabled="loading">
          Back
        </button>
        <button
          v-if="stepIndex < steps.length - 1"
          @click="nextStep"
          class="btn primary"
          :disabled="loading"
        >
          Next
        </button>
        <button v-else @click="completeOnboarding" class="btn primary" :disabled="loading">
          Finish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, type Club } from '../services/api'

const router = useRouter()

const steps = [
  { id: 'club', label: 'Club' },
  { id: 'admin', label: 'Admin' },
  { id: 'interests', label: 'Interests' },
  { id: 'review', label: 'Review' }
]

const stepIndex = ref(0)
const currentStepId = computed(() => steps[stepIndex.value]?.id || 'club')
const form = ref({
  clubName: '',
  slug: '',
  admin: { name: '', email: '', password: '' },
  interests: [] as string[]
})
const errors = ref<Record<string, string>>({})
const loading = ref(false)
const loadError = ref('')
const interestInput = ref('')
const suggestedInterests = ref<string[]>([
  'Wine Tasting',
  'Fine Dining',
  'Cigar Tasting',
  'Whisky / Spirits',
  'Live Music',
  'Art & Culture',
  'Craft Cocktails',
  'Luxury Travel'
])

const validateClub = () => {
  const errs: Record<string, string> = {}
  if (!form.value.clubName.trim()) errs.clubName = 'Club name is required'
  if (!form.value.slug.trim()) errs.slug = 'Slug is required'
  errors.value = { ...errors.value, ...errs }
  return Object.keys(errs).length === 0
}

const validateAdmin = () => {
  const errs: Record<string, string> = {}
  if (!form.value.admin.name.trim()) errs.adminName = 'Name is required'
  if (!form.value.admin.email.trim()) errs.adminEmail = 'Email is required'
  if (!form.value.admin.password.trim()) errs.adminPassword = 'Password is required'
  errors.value = { ...errors.value, ...errs }
  return Object.keys(errs).length === 0
}

const addInterest = () => {
  const val = interestInput.value.trim()
  if (!val) return
  if (!form.value.interests.includes(val)) {
    form.value.interests.push(val)
  }
  interestInput.value = ''
}

const removeInterest = (val: string) => {
  form.value.interests = form.value.interests.filter(i => i !== val)
}

const toggleInterest = (val: string) => {
  if (form.value.interests.includes(val)) {
    form.value.interests = form.value.interests.filter(i => i !== val)
  } else {
    form.value.interests.push(val)
  }
}

const nextStep = () => {
  if (currentStepId.value === 'club' && !validateClub()) return
  if (currentStepId.value === 'admin' && !validateAdmin()) return
  if (stepIndex.value < steps.length - 1) stepIndex.value++
}
const prevStep = () => {
  if (stepIndex.value > 0) stepIndex.value--
}

const loadCurrentClub = async () => {
  try {
    loading.value = true
    const club = await api.getCurrentClub()
    form.value.clubName = club.name || form.value.clubName
    form.value.slug = club.slug || form.value.slug
    // Prefill admin email from localStorage if available
    const storedEmail = localStorage.getItem('userEmail') || ''
    form.value.admin.email = storedEmail
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load club details'
  } finally {
    loading.value = false
  }
}

const completeOnboarding = async () => {
  try {
    loading.value = true
    await api.updateCurrentClub({
      name: form.value.clubName,
      slug: form.value.slug
    } as Partial<Club>)

    localStorage.setItem('onboardingComplete', 'true')
    localStorage.removeItem('onboardingRequired')
    router.push('/')
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to save onboarding'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCurrentClub()
})

</script>

<style scoped>
.onboarding-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.onboarding-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 28px;
  color: var(--color-gold);
}
.subtitle { margin: 4px 0 0 0; color: #888; }
.lang-switch { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
.lang-switch select { padding: 8px; background: #111; color: #fff; border: 1px solid #2a2a2a; border-radius: 6px; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.step { background: #111; border: 1px solid #222; border-radius: 8px; padding: 10px; display: flex; align-items: center; gap: 10px; color: #888; }
.step.active { border-color: var(--color-gold); color: #fff; }
.step.done { border-color: #2ecc71; color: #2ecc71; }
.step-index { width: 28px; height: 28px; border-radius: 50%; background: #222; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
.card { background: linear-gradient(135deg, var(--color-dark-soft) 0%, var(--color-black-soft) 100%); border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; box-shadow: var(--shadow-md); }
.step-body { display: flex; flex-direction: column; gap: 12px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; color: #ccc; font-size: 14px; }
.form-grid input, .form-grid select { padding: 10px; border-radius: 8px; border: 1px solid #2a2a2a; background: #111; color: #fff; }
.form-grid .full { grid-column: 1 / -1; }
.chip-input { display: flex; gap: 8px; }
.chip-input input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #2a2a2a; background: #111; color: #fff; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: #1f1f1f; border: 1px solid #2a2a2a; padding: 6px 10px; border-radius: 999px; display: inline-flex; gap: 6px; align-items: center; color: #fff; }
.chip button { background: transparent; border: none; color: #888; cursor: pointer; }
.review-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; color: #ccc; }
.helper-text { color: #888; margin: 0 0 10px 0; }
.quick-interests { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 12px; }
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
.chip-button:hover { border-color: rgba(212, 175, 55, 0.55); transform: translateY(-1px); }
.chip-button.selected { 
  border-color: rgba(212, 175, 55, 0.9); 
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(139, 38, 53, 0.18));
  box-shadow: 0 8px 18px rgba(0,0,0,0.35);
}
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
.btn.primary { background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%); color: #000; }
.btn.secondary { background: #222; color: #fff; border: 1px solid #2a2a2a; }
.error { color: #ff6b6b; font-size: 12px; }

@media (max-width: 640px) {
  .onboarding-header { flex-direction: column; align-items: flex-start; }
  .actions { flex-direction: column; }
  .btn { width: 100%; text-align: center; }
  .steps { grid-template-columns: 1fr; }
}
</style>

