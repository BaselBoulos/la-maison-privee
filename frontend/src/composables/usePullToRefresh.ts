import { ref, onMounted, onUnmounted } from 'vue'

export function usePullToRefresh(refreshCallback: () => Promise<void>) {
  const isRefreshing = ref(false)
  const pullToRefreshStartY = ref(0)
  const pullToRefreshDistance = ref(0)

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
      pullToRefreshStartY.value = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0] && window.scrollY === 0) {
      const deltaY = e.touches[0].clientY - pullToRefreshStartY.value
      if (deltaY > 0 && deltaY < 100) {
        pullToRefreshDistance.value = deltaY
        isRefreshing.value = deltaY > 50
      }
    }
  }

  const handleTouchEnd = async () => {
    if (isRefreshing.value && pullToRefreshDistance.value > 50) {
      await refreshCallback()
    }
    pullToRefreshDistance.value = 0
    isRefreshing.value = false
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isRefreshing,
    pullToRefreshDistance
  }
}

