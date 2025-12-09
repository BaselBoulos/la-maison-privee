<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-overlay"></div>
    </div>
    
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <div class="logo-icon">👑</div>
          <h1 class="club-name">La Maison Privée</h1>
          <p class="club-tagline">Exclusive Membership Portal</p>
        </div>
        
        <form @submit.prevent="isRegistering ? handleRegister() : handleLogin()" class="login-form">
          <div v-if="isRegistering" class="form-group">
            <label for="name">Full Name</label>
            <div class="input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                id="name"
                v-model="name"
                type="text"
                class="form-input"
                placeholder="Your full name"
                required
                autocomplete="name"
              />
            </div>
          </div>
          
          <div v-if="isRegistering" class="form-group">
            <label for="clubName">Club Name</label>
            <div class="input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <input
                id="clubName"
                v-model="clubName"
                type="text"
                class="form-input"
                placeholder="Your club name"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                required
                autocomplete="email"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-input"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
            </div>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="!isLoading">{{ isRegistering ? 'Create Account' : 'Access Dashboard' }}</span>
            <span v-else class="loading">
              <span class="spinner"></span>
              {{ isRegistering ? 'Creating...' : 'Authenticating...' }}
            </span>
          </button>
        </form>
        
        <div class="login-footer">
          <p class="footer-text">Private & Confidential</p>
          <div class="auth-toggle">
            <span>{{ isRegistering ? 'Already have an account?' : 'New here?' }}</span>
            <button class="link-button" type="button" @click="toggleMode">
              {{ isRegistering ? 'Sign in' : 'Create an account' }}
            </button>
          </div>
          <div class="demo-credentials" v-if="!isRegistering">
            <p class="demo-label">Demo Credentials:</p>
            <p class="demo-info">Email: <code>super@lamaisonprivee.com</code></p>
            <p class="demo-info">Password: <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isRegistering = ref(false)
const email = ref('super@lamaisonprivee.com')
const password = ref('admin123')
const name = ref('')
const clubName = ref('')
const error = ref('')
const isLoading = ref(false)

const toggleMode = () => {
  error.value = ''
  isRegistering.value = !isRegistering.value
  if (isRegistering.value) {
    email.value = ''
    password.value = ''
  } else {
    email.value = 'super@lamaisonprivee.com'
    password.value = 'admin123'
  }
}

const persistAuth = (data: any) => {
  localStorage.setItem('authToken', data.token)
  localStorage.setItem('userEmail', data.admin.email)
  localStorage.setItem('userRole', data.admin.role || 'club')

  const allowedClubIds: number[] = data.admin.allowedClubIds?.length
    ? data.admin.allowedClubIds.map((id: any) => Number(id))
    : data.admin.clubId
      ? [Number(data.admin.clubId)]
      : []
  localStorage.setItem('allowedClubIds', JSON.stringify(allowedClubIds))

  if (data.admin.clubId) {
    localStorage.setItem('clubId', String(data.admin.clubId))
  } else if (allowedClubIds.length > 0) {
    localStorage.setItem('clubId', String(allowedClubIds[0]))
  } else if (data.club) {
    localStorage.setItem('clubId', String(data.club.id))
  } else {
    localStorage.setItem('clubId', '1')
  }

  localStorage.removeItem('onboardingRequired')
  localStorage.removeItem('onboardingComplete')
}

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }))
      throw new Error(errorData.message || 'Invalid credentials')
    }

    const data = await response.json()
    
    persistAuth(data)
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    error.value = err.message || 'Invalid credentials. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  error.value = ''
  isLoading.value = true
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        name: name.value,
        clubName: clubName.value
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
      throw new Error(errorData.message || 'Registration failed')
    }

    const data = await response.json()
    persistAuth(data)
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
  padding: var(--spacing-md);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #141414 100%);
  z-index: 0;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(212, 175, 55, 0.03) 2px,
      rgba(212, 175, 55, 0.03) 4px
    );
  z-index: 1;
}

.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  max-height: 100vh;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.login-card {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 24px;
  padding: var(--spacing-2xl) var(--spacing-xl);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(212, 175, 55, 0.1) inset,
    0 0 40px rgba(212, 175, 55, 0.05);
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.3));
}

.club-name {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-gold);
  margin: 0 0 4px 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 20px var(--color-gold-glow);
}

.club-tagline {
  font-size: 11px;
  color: #888;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  font-weight: 300;
}

.login-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 11px;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #888;
  z-index: 1;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-md);
  padding: 12px 14px 12px 44px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input::placeholder {
  color: #555;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(26, 26, 26, 1);
  box-shadow: 
    0 0 0 3px rgba(212, 175, 55, 0.1),
    0 0 20px rgba(212, 175, 55, 0.1);
}

.error-message {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: #f87171;
  font-size: 13px;
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #c9a030 100%);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px;
  color: #000000;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 4px 15px rgba(212, 175, 55, 0.3),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(212, 175, 55, 0.4),
    0 0 0 1px rgba(212, 175, 55, 0.3) inset;
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

.footer-text {
  font-size: 10px;
  color: #555;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 var(--spacing-sm) 0;
}

.demo-credentials {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-md);
  text-align: left;
}

.demo-label {
  font-size: 10px;
  color: #d4af37;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 6px 0;
  font-weight: 600;
}

.demo-info {
  font-size: 11px;
  color: #888;
  margin: 2px 0;
  font-family: 'Courier New', monospace;
}

.demo-info code {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.auth-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  margin-top: 12px;
  color: #ccc;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-gold);
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    padding: 36px 28px;
    border-radius: 20px;
  }
  
  .club-name {
    font-size: 28px;
  }
  
  .logo-icon {
    font-size: 48px;
  }
}
</style>

