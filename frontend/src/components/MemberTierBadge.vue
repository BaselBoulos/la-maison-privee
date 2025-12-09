<template>
  <span :class="['tier-badge', `tier-${tier?.toLowerCase()}`]">
    <span class="tier-icon">{{ getTierIcon(tier) }}</span>
    <span class="tier-text">{{ tier || 'Standard' }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  tier?: 'Standard' | 'Premium' | 'Platinum' | 'VIP' | 'Founding'
}>()

const getTierIcon = (tier?: string) => {
  const icons: Record<string, string> = {
    'Founding': '👑',
    'VIP': '💎',
    'Platinum': '⭐',
    'Premium': '✨',
    'Standard': '•'
  }
  return icons[tier || 'Standard'] || '•'
}
</script>

<style scoped>
.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid;
}

.tier-founding {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 10px var(--color-gold-glow);
}

.tier-vip {
  background: linear-gradient(135deg, rgba(139, 38, 53, 0.2) 0%, rgba(139, 38, 53, 0.1) 100%);
  border-color: var(--color-burgundy);
  color: #ff6b9d;
  box-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
}

.tier-platinum {
  background: linear-gradient(135deg, rgba(229, 228, 226, 0.15) 0%, rgba(229, 228, 226, 0.05) 100%);
  border-color: var(--color-platinum);
  color: var(--color-platinum);
}

.tier-premium {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  border-color: var(--color-gold-light);
  color: var(--color-gold-light);
}

.tier-standard {
  background: var(--color-gray);
  border-color: var(--color-gray-soft);
  color: #888;
}

.tier-icon {
  font-size: 12px;
}

.tier-text {
  font-size: 10px;
}
</style>

