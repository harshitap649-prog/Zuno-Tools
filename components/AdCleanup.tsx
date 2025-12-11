'use client'

import { useEffect } from 'react'

export default function AdCleanup() {
  useEffect(() => {
    // Aggressive cleanup function to remove ALL 160x600 sidebar ads
    const cleanupSidebarAds = () => {
      // Remove sidebar ad containers by ID
      const sidebarAdLeft = document.getElementById('sidebar-ad-left')
      const sidebarAdRight = document.getElementById('sidebar-ad-right')
      
      if (sidebarAdLeft) {
        sidebarAdLeft.remove()
      }
      if (sidebarAdRight) {
        sidebarAdRight.remove()
      }
      
      // Remove ALL sidebar ad scripts (check all possible IDs)
      const adScriptIds = ['ad-script-left', 'ad-script-right', 'ad-script-sidebar-left', 'ad-script-sidebar-right']
      adScriptIds.forEach(id => {
        const script = document.getElementById(id)
        if (script) {
          script.remove()
        }
      })
      
      // Remove scripts from head that might load 160x600 ads
      const allScripts = document.querySelectorAll('script')
      allScripts.forEach((script) => {
        const src = script.getAttribute('src') || ''
        const id = script.id || ''
        
        // Remove scripts that might be loading sidebar ads
        if (
          id.includes('sidebar') ||
          id.includes('ad-script') ||
          (src.includes('highperformanceformat') && (id.includes('left') || id.includes('right')))
        ) {
          // Check if this script sets 160x600 dimensions
          const dataAdKey = script.getAttribute('data-ad-key')
          if (dataAdKey) {
            script.remove()
          }
        }
      })
      
      // Block atOptions from setting 160x600 dimensions
      if (typeof window !== 'undefined' && (window as any).atOptions) {
        const atOptions = (window as any).atOptions
        if (atOptions.height === 600 && atOptions.width === 160) {
          delete (window as any).atOptions
        }
      }
      
      // Remove ANY element with 160x600 dimensions (more aggressive)
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const element = el as HTMLElement
        if (!element || !element.parentNode) return
        
        const styles = window.getComputedStyle(element)
        const width = parseInt(styles.width) || 0
        const height = parseInt(styles.height) || 0
        const minWidth = parseInt(styles.minWidth) || 0
        const minHeight = parseInt(styles.minHeight) || 0
        const offsetWidth = element.offsetWidth || 0
        const offsetHeight = element.offsetHeight || 0
        
        // Check if element has 160x600 dimensions (with tolerance)
        const is160x600 = (
          ((width >= 155 && width <= 165) && (height >= 595 && height <= 605)) ||
          ((minWidth >= 155 && minWidth <= 165) && (minHeight >= 595 && minHeight <= 605)) ||
          ((offsetWidth >= 155 && offsetWidth <= 165) && (offsetHeight >= 595 && offsetHeight <= 605))
        )
        
        if (is160x600) {
          // Remove if it's positioned fixed (sidebar ad)
          const position = styles.position
          const left = styles.left
          const right = styles.right
          const zIndex = parseInt(styles.zIndex) || 0
          
          // More aggressive: remove if fixed AND (on left/right OR has ad-related ID/class)
          if (
            position === 'fixed' &&
            (
              (left !== 'auto' && parseFloat(left) < 200) ||
              (right !== 'auto' && parseFloat(right) < 200) ||
              element.id?.includes('sidebar') ||
              element.id?.includes('ad') ||
              element.className?.includes('sidebar') ||
              element.className?.includes('ad') ||
              zIndex > 30
            )
          ) {
            element.remove()
          }
        }
      })
      
      // Remove ALL iframes with 160x600 dimensions (more aggressive)
      const iframes = document.querySelectorAll('iframe')
      iframes.forEach((iframe) => {
        const width = iframe.offsetWidth || 0
        const height = iframe.offsetHeight || 0
        const styles = window.getComputedStyle(iframe)
        const position = styles.position
        
        // Remove if 160x600 and positioned fixed
        if (
          (width >= 155 && width <= 165 && height >= 595 && height <= 605) ||
          (width === 160 && height === 600)
        ) {
          if (position === 'fixed') {
            iframe.remove()
          }
          // Also remove if it's on the sides
          const left = styles.left
          const right = styles.right
          if (
            (left !== 'auto' && parseFloat(left) < 200) ||
            (right !== 'auto' && parseFloat(right) < 200)
          ) {
            iframe.remove()
          }
        }
      })
      
      // Remove any divs with w-[160px] h-[600px] classes (Tailwind classes)
      const tailwindSidebarAds = document.querySelectorAll('[class*="w-[160px]"][class*="h-[600px]"]')
      tailwindSidebarAds.forEach(el => el.remove())
      
      // Remove any elements with inline styles containing 160px and 600px
      const elementsWithInlineStyles = document.querySelectorAll('[style*="160px"][style*="600px"]')
      elementsWithInlineStyles.forEach(el => {
        const styles = window.getComputedStyle(el)
        if (styles.position === 'fixed') {
          el.remove()
        }
      })
    }
    
    // Run cleanup immediately
    cleanupSidebarAds()
    
    // Run cleanup after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanupSidebarAds)
    } else {
      cleanupSidebarAds()
    }
    
    // Run cleanup after window load
    window.addEventListener('load', cleanupSidebarAds)
    
    // Run cleanup more frequently to catch dynamically injected ads
    const intervalId = setInterval(cleanupSidebarAds, 500) // Every 500ms
    
    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            cleanupSidebarAds()
          }
        })
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
      observer.disconnect()
      window.removeEventListener('load', cleanupSidebarAds)
      document.removeEventListener('DOMContentLoaded', cleanupSidebarAds)
    }
  }, [])
  
  return null
}
