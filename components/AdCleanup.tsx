'use client'

import { useEffect } from 'react'

export default function AdCleanup() {
  useEffect(() => {
    // Cleanup function to remove any 160x600 sidebar ads
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
      
      // Remove sidebar ad scripts
      const adScriptLeft = document.getElementById('ad-script-left')
      const adScriptRight = document.getElementById('ad-script-right')
      
      if (adScriptLeft) {
        adScriptLeft.remove()
      }
      if (adScriptRight) {
        adScriptRight.remove()
      }
      
      // Remove any elements with 160x600 dimensions that might be ads
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const element = el as HTMLElement
        const styles = window.getComputedStyle(element)
        const width = parseInt(styles.width) || 0
        const height = parseInt(styles.height) || 0
        const minWidth = parseInt(styles.minWidth) || 0
        const minHeight = parseInt(styles.minHeight) || 0
        
        // Check if element has 160x600 dimensions (with some tolerance)
        if (
          ((width >= 155 && width <= 165) && (height >= 595 && height <= 605)) ||
          ((minWidth >= 155 && minWidth <= 165) && (minHeight >= 595 && minHeight <= 605))
        ) {
          // Check if it's positioned as a sidebar ad (fixed, left or right)
          const position = styles.position
          const left = styles.left
          const right = styles.right
          
          if (
            position === 'fixed' &&
            (left !== 'auto' || right !== 'auto') &&
            element.id?.includes('sidebar') || 
            element.id?.includes('ad')
          ) {
            element.remove()
          }
        }
      })
      
      // Remove any iframes with 160x600 dimensions
      const iframes = document.querySelectorAll('iframe')
      iframes.forEach((iframe) => {
        const width = iframe.offsetWidth || 0
        const height = iframe.offsetHeight || 0
        
        if (
          (width >= 155 && width <= 165 && height >= 595 && height <= 605) ||
          (width === 160 && height === 600)
        ) {
          // Check if it's positioned as sidebar ad
          const styles = window.getComputedStyle(iframe)
          const position = styles.position
          const left = styles.left
          const right = styles.right
          
          if (position === 'fixed' && (left !== 'auto' || right !== 'auto')) {
            iframe.remove()
          }
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
    
    // Run cleanup periodically to catch any dynamically injected ads
    const intervalId = setInterval(cleanupSidebarAds, 2000)
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('DOMContentLoaded', cleanupSidebarAds)
    }
  }, [])
  
  return null
}

