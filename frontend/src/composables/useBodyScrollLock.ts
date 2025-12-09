import { watch, watchEffect, onUnmounted, type Ref, type ComputedRef } from 'vue'

/**
 * Composable to lock/unlock body scroll when modals are open
 * Prevents background scrolling when any modal is visible
 */
export function useBodyScrollLock(isOpen: Ref<boolean> | ComputedRef<boolean> | (() => boolean)) {
  let scrollbarWidth = 0
  let originalBodyOverflow = ''
  let originalBodyPaddingRight = ''
  let originalHtmlOverflow = ''
  let originalMainContentOverflow = ''

  const lockBodyScroll = () => {
    if (typeof document === 'undefined') return

    const body = document.body
    const html = document.documentElement
    
    // Find the main content element (the actual scrollable container)
    const mainContentElement = document.querySelector('.main-content') as HTMLElement

    // Calculate scrollbar width to prevent layout shift
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Save original styles
    originalBodyOverflow = body.style.overflow || ''
    originalBodyPaddingRight = body.style.paddingRight || ''
    originalHtmlOverflow = html.style.overflow || ''
    if (mainContentElement) {
      originalMainContentOverflow = mainContentElement.style.overflow || ''
    }

    // Lock scroll on body and html
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
    
    // Lock scroll on main content element (the actual scrollable container)
    if (mainContentElement) {
      mainContentElement.style.overflow = 'hidden'
    }
  }

  const unlockBodyScroll = () => {
    if (typeof document === 'undefined') return

    const body = document.body
    const html = document.documentElement
    
    // Find the main content element again (in case DOM changed)
    const mainContentElement = document.querySelector('.main-content') as HTMLElement

    // Restore original styles
    body.style.overflow = originalBodyOverflow
    body.style.paddingRight = originalBodyPaddingRight
    html.style.overflow = originalHtmlOverflow
    
    // Restore main content element scroll
    if (mainContentElement) {
      mainContentElement.style.overflow = originalMainContentOverflow
    }
  }

  // Watch for changes in modal state
  // If it's a function, use watchEffect, otherwise watch the ref/computed directly
  if (typeof isOpen === 'function') {
    watchEffect(() => {
      const open = isOpen()
      if (open) {
        lockBodyScroll()
      } else {
        unlockBodyScroll()
      }
    })
  } else {
    watch(
      isOpen,
      (open) => {
        if (open) {
          lockBodyScroll()
        } else {
          unlockBodyScroll()
        }
      },
      { immediate: true }
    )
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unlockBodyScroll()
  })

  return {
    lockBodyScroll,
    unlockBodyScroll
  }
}

