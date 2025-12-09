<template>
  <router-view />
  
  <!-- Toast Notifications -->
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click.stop="removeToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from './composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style>
.toast-container {
  position: fixed;
  top: 90px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: calc(100vw - 48px);
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%);
  border: 1px solid var(--color-gray-soft);
  border-radius: var(--radius-lg);
  min-width: 320px;
  max-width: 450px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(212, 175, 55, 0.1) inset;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(212, 175, 55, 0.2) inset,
    0 0 20px rgba(212, 175, 55, 0.1);
  border-color: var(--color-gold-subtle);
}

.toast-success {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 20, 20, 0.98) 100%);
}

.toast-error {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(20, 20, 20, 0.98) 100%);
}

.toast-info {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(20, 20, 20, 0.98) 100%);
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #888;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #ffffff;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: 100%;
  }
}
</style>
