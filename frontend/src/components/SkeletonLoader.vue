<template>
  <div class="skeleton-loader" :class="type">
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'text' | 'card' | 'avatar' | 'table' | 'image'
}>()
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  background: var(--color-gray);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton-loader.text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-loader.text:last-child {
  width: 60%;
}

.skeleton-loader.card {
  height: 200px;
  width: 100%;
}

.skeleton-loader.avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
}

.skeleton-loader.image {
  width: 100%;
  height: 300px;
  border-radius: var(--radius-lg);
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>

